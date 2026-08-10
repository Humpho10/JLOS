<?php

namespace App\Services;

use App\Models\Institution;
use App\Models\ScrapedPage;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Smalot\PdfParser\Parser as PdfParser;
use Symfony\Component\DomCrawler\Crawler;

/**
 * The actual "fetch this institution's configured pages and store cleaned
 * text" logic — pulled out of the scrape:institution Artisan command so
 * both that command and the admin-triggered background job call the exact
 * same code. `$log` receives each progress line instead of this class
 * assuming a CLI context ($this->info()/$this->warn()).
 */
class InstitutionScraperService
{
    public function scrape(Institution $institution, callable $log): array
    {
        $pages = $institution->pages()->where('active', true)->get();

        if ($pages->isEmpty()) {
            $log('No active pages configured. Add them via the admin panel first.');

            return ['scraped' => 0, 'unchanged' => 0, 'failed' => 0];
        }

        $scraped = 0;
        $unchanged = 0;
        $failed = 0;

        foreach ($pages as $page) {
            $contentType = $page->content_type;
            $path = $page->path;
            $url = rtrim($institution->base_url, '/').$path;
            $log("Fetching {$url}...");

            try {
                // throw: false — without it, ->retry() throws a RequestException
                // itself once retries are exhausted on any non-2xx status (see
                // PendingRequest::send()), which would skip the $response->failed()
                // check below entirely and crash the whole run on the first
                // 4xx/5xx page instead of just skipping it.
                $response = Http::withHeaders([
                    'User-Agent' => 'JLOS-Chatbot-Prototype/1.0 (contact: your-email-here@example.com)',
                ])->retry(3, 3000, throw: false)->timeout(30)->get($url);
            } catch (ConnectionException $e) {
                $log("  Connection failed ({$e->getMessage()}), skipping.");
                $failed++;

                continue;
            }

            if ($response->failed()) {
                $log("  Failed ({$response->status()}), skipping.");
                $failed++;

                continue;
            }

            $mimeType = strtolower($response->header('Content-Type') ?? '');
            $isPdf = str_contains($mimeType, 'application/pdf')
                || (! $mimeType && str_ends_with(strtolower(parse_url($url, PHP_URL_PATH) ?? ''), '.pdf'));

            [$title, $cleanedText] = $isPdf
                ? $this->extractPdf($response->body(), $path, $log)
                : $this->extractHtml($response->body(), $path);

            $title = $this->sanitizeUtf8($title);
            $cleanedText = $this->sanitizeUtf8($cleanedText);

            if ($cleanedText === '') {
                $log('  No content extracted, skipping.');
                $failed++;

                continue;
            }

            $hash = hash('sha256', $cleanedText);

            $existing = ScrapedPage::where('institution_id', $institution->id)->where('url', $url)->first();

            if ($existing && $existing->content_hash === $hash) {
                $existing->update(['last_scraped_at' => now()]);
                $log('  Unchanged, skipping save.');
                $unchanged++;
                sleep(1);

                continue;
            }

            $saved = ScrapedPage::updateOrCreate(
                ['institution_id' => $institution->id, 'url' => $url],
                [
                    'title' => $title,
                    'content_type' => $contentType,
                    'cleaned_text' => $cleanedText,
                    'content_hash' => $hash,
                    'last_scraped_at' => now(),
                ]
            );

            $log("  Saved [{$contentType}] \"{$saved->title}\" (".strlen($cleanedText).' chars)');
            $scraped++;

            sleep(1); // polite pacing between requests
        }

        return ['scraped' => $scraped, 'unchanged' => $unchanged, 'failed' => $failed];
    }

    protected function extractHtml(string $body, string $fallbackTitle): array
    {
        $crawler = new Crawler($body);

        $title = $crawler->filter('title')->count()
            ? trim($crawler->filter('title')->text())
            : $fallbackTitle;

        foreach ($crawler->filter('script, style, nav, header, footer') as $node) {
            $node->parentNode?->removeChild($node);
        }

        $contentNode = $crawler->filter('main')->count() > 0
            ? $crawler->filter('main')
            : $crawler->filter('body');

        $rawText = $contentNode->count() > 0 ? $contentNode->text('') : '';

        return [$title, trim(preg_replace('/\s+/', ' ', $rawText))];
    }

    // PDFs larger than this are skipped rather than parsed: smalot/pdfparser
    // holds the whole document in memory and can use many times the file size,
    // so a large report (e.g. an annual report) can exhaust PHP's memory limit
    // and take down the entire scrape run with an uncatchable fatal error.
    protected const MAX_PDF_BYTES = 20 * 1024 * 1024; // 20 MB

    protected function extractPdf(string $body, string $fallbackTitle, callable $log): array
    {
        if (strlen($body) > static::MAX_PDF_BYTES) {
            $mb = round(strlen($body) / 1024 / 1024, 1);
            $log("  Skipping oversized PDF ({$mb} MB > 20 MB limit).");

            return [$fallbackTitle, ''];
        }

        // Parsing is memory-hungry; give it headroom and restore afterwards.
        $previousLimit = ini_get('memory_limit');
        ini_set('memory_limit', '512M');

        try {
            $pdf = (new PdfParser())->parseContent($body);
            $details = $pdf->getDetails();
            $title = trim((string) ($details['Title'] ?? '')) ?: $fallbackTitle;
            $rawText = $pdf->getText();
        } catch (\Throwable $e) {
            $log("  Could not parse PDF ({$e->getMessage()}).");

            return [$fallbackTitle, ''];
        } finally {
            ini_set('memory_limit', $previousLimit);
        }

        return [$title, trim(preg_replace('/\s+/', ' ', $rawText))];
    }

    protected function sanitizeUtf8(string $text): string
    {
        return iconv('UTF-8', 'UTF-8//IGNORE', $text) ?: '';
    }
}
