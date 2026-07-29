<?php

namespace App\Services;

use App\Models\Institution;
use App\Models\ScrapedPage;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Smalot\PdfParser\Parser as PdfParser;
use Symfony\Component\DomCrawler\Crawler;

/**
 * Fetches every configured target page for an institution and stores
 * cleaned text. Targets come from the institution's `pages` relation
 * (admin-managed) rather than a hardcoded list, so new institutions
 * added through the admin UI can be scraped without a code change.
 */
class InstitutionScraper
{
    /**
     * @param  callable(string $label, string $status, ?string $error): void|null  $onPageResult
     * @return array<int, array{label: string, status: string, error: ?string}>
     */
    public function run(Institution $institution, ?callable $onPageResult = null): array
    {
        $results = [];

        foreach ($institution->pages as $page) {
            $url = rtrim($institution->base_url, '/').$page->path;

            try {
                [$status, $error] = $this->scrapePage($institution, $page->label, $url);
            } catch (RequestException $e) {
                // Http::retry() throws on a non-2xx response after exhausting
                // retries. A single unreachable/broken page must not abort the
                // rest of the sync — record a clean status code and move on.
                [$status, $error] = ['failed', 'HTTP '.$e->response->status()];
            } catch (\Throwable $e) {
                [$status, $error] = ['failed', Str::limit($e->getMessage(), 300)];
            }

            $page->update([
                'last_status' => $status,
                'last_error' => $error,
                'last_synced_at' => now(),
            ]);

            if ($onPageResult) {
                $onPageResult($page->label, $status, $error);
            }

            $results[] = ['label' => $page->label, 'status' => $status, 'error' => $error];

            sleep(1); // polite pacing between requests
        }

        return $results;
    }

    /**
     * @return array{0: string, 1: ?string} [status, error]
     */
    protected function scrapePage(Institution $institution, string $label, string $url): array
    {
        $response = Http::withHeaders([
            'User-Agent' => 'JLOS-Chatbot-Prototype/1.0 (contact: your-email-here@example.com)',
        ])->retry(3, 3000)->timeout(30)->get($url);

        if ($response->failed()) {
            return ['failed', "HTTP {$response->status()}"];
        }

        $isPdf = str_ends_with(strtolower(parse_url($url, PHP_URL_PATH) ?? ''), '.pdf');

        try {
            [$title, $cleanedText] = $isPdf
                ? $this->extractPdf($response->body(), $label)
                : $this->extractHtml($response->body(), $label);
        } catch (\Throwable $e) {
            return ['failed', 'Could not parse PDF: '.$e->getMessage()];
        }

        $title = $this->sanitizeUtf8($title);
        $cleanedText = $this->sanitizeUtf8($cleanedText);

        if ($cleanedText === '') {
            return ['skipped', 'No content extracted.'];
        }

        $hash = hash('sha256', $cleanedText);

        $existing = ScrapedPage::where('institution_id', $institution->id)->where('url', $url)->first();

        if ($existing && $existing->content_hash === $hash) {
            $existing->update(['last_scraped_at' => now()]);

            return ['ok', null];
        }

        ScrapedPage::updateOrCreate(
            ['institution_id' => $institution->id, 'url' => $url],
            [
                'title' => $title,
                'content_type' => $label,
                'cleaned_text' => $cleanedText,
                'content_hash' => $hash,
                'last_scraped_at' => now(),
            ]
        );

        return ['ok', null];
    }

    protected function extractHtml(string $body, string $fallbackTitle): array
    {
        $crawler = new Crawler($body);

        $title = $crawler->filter('title')->count()
            ? trim($crawler->filter('title')->text())
            : $fallbackTitle;

        // Strip elements that repeat on every page and pollute the text.
        foreach ($crawler->filter('script, style, nav, header, footer') as $node) {
            $node->parentNode?->removeChild($node);
        }

        $contentNode = $crawler->filter('main')->count() > 0
            ? $crawler->filter('main')
            : $crawler->filter('body');

        $rawText = $contentNode->count() > 0 ? $contentNode->text('') : '';

        return [$title, trim(preg_replace('/\s+/', ' ', $rawText))];
    }

    protected function extractPdf(string $body, string $fallbackTitle): array
    {
        $pdf = (new PdfParser())->parseContent($body);
        $details = $pdf->getDetails();
        $title = trim((string) ($details['Title'] ?? '')) ?: $fallbackTitle;
        $rawText = $pdf->getText();

        return [$title, trim(preg_replace('/\s+/', ' ', $rawText))];
    }

    protected function sanitizeUtf8(string $text): string
    {
        return iconv('UTF-8', 'UTF-8//IGNORE', $text) ?: '';
    }
}
