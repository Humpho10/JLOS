<?php

namespace App\Console\Commands;

use App\Models\Institution;
use App\Models\ScrapedPage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Smalot\PdfParser\Parser as PdfParser;
use Symfony\Component\DomCrawler\Crawler;

class ScrapeInstitution extends Command
{
    protected $signature = 'scrape:institution {slug}';

    protected $description = 'Fetch the configured pages for an institution and store cleaned text';

    /**
     * Hand-picked target pages per institution: content_type => path.
     */
    protected array $targets = [
        'dpp' => [
            'about' => '/about/',
            'publications' => '/resource-center/',
            'contact' => '/contact/',
            'service' => '/complaint/',
            'leadership' => '/top-management/',
            'directorate' => '/directorate/',
            'message' => '/message-from-director/',
        ],
        'uhrc' => [
            'about' => '/page/our-mandate',
            'leadership' => '/team',
            'directorate' => '/page/directorates',
            'contact' => '/page/contact-us',
            'service' => '/page/complaint-form',
            'publications' => '/publications',
            'reports' => '/reports',
            'tribunal' => '/page/about-tribunal',

            // PDFs linked from the /publications page
            'publications_human_rights_health_advisory_october_revised' => '/sites/default/files/2026-01/Human%20Rights%20Health%20Advisory%20-%20%20October%20revised.pdf',
            'publications_advisory_on_education_5th_august_2020' => '/sites/default/files/2026-01/Advisory%20on%20Education%20-%20%285th%20August%20%202020%29.pdf',
            'publications_advisory_elections_final_1st_august_2020' => '/sites/default/files/2026-01/ADVISORY%20ELECTIONS%20%20-%20FINAL%20%281st%20%20August%202020%29.pdf',
            'publications_equal_opportunities_commission_act_2007' => '/sites/default/files/2025-11/equal-opportunities-commission-act-2007.pdf',
            'publications_human_rights_enforcement_act_2019' => '/sites/default/files/2026-01/Human%20Rights%20%28Enforcement%29%20Act%2C%202019.pdf',
            // 'publications_anti_pornography_act_2014' => '/sites/default/files/2026-01/Anti%20Pornography%20Act%202014.pdf', // scanned/image PDF, no extractable text
            // 'publications_public_order_management_act_2013' => '/sites/default/files/2026-01/Public-Order-Management-Act-2013.pdf', // scanned/image PDF, no extractable text
            // 'publications_prevention_and_prohibition_of_torture_act_2012' => '/sites/default/files/2026-01/Prevention-and-Prohibition-of-Torture-Act-2012.pdf', // scanned/image PDF, no extractable text
            'publications_advisory_on_places_of_detention_september_2020' => '/sites/default/files/2025-11/Advisory%20on%20places%20of%20%20detention%20-%20%20September%202020.pdf',
            'publications_3rd_national_escr_conference_call_for_papers_ab' => '/sites/default/files/2025-11/3rd-National-ESCR-Conference-Call-for-Papers-Abstracts.pdf',
            'publications_complaints_rocedures_manual_ii_3' => '/sites/default/files/2026-02/complaints-rocedures-manual%20II%20_3_.pdf',
            'publications_investigators_hand_book' => '/sites/default/files/2026-02/investigators-hand-book.pdf',
            'publications_uhrc_handbook_on_migration_and_human_rights_giz' => '/sites/default/files/2026-02/uhrc-handbook-on-migration-and-human-rights-GIZ-2022.pdf',
            'publications_uhrc_clients_charter' => '/sites/default/files/2026-02/uhrc-clients-charter.pdf',
            'publications_brief_on_ihrd_2020' => '/sites/default/files/2026-02/brief-on-ihrd-2020.pdf',
            'publications_a_pocketbook_for_police_on_basic_human_rights_s' => '/sites/default/files/2025-11/A-Pocketbook-for-Police-on-Basic-Human-Rights-Standards.pdf',

            // PDFs linked from the /reports page
            'reports_uhrc_6th_annual_report' => '/sites/default/files/2026-02/UHRC%206th%20Annual%20Report.pdf',
            'reports_uhrc_7th_annual_report' => '/sites/default/files/2026-02/UHRC%207th%20Annual%20Report.pdf',
            'reports_uhrc_13th_annual_report' => '/sites/default/files/2026-02/UHRC%2013th%20Annual%20Report.pdf',
            'reports_uhrc_19th_annual_report' => '/sites/default/files/2026-02/UHRC%2019th%20Annual%20Report.pdf',
            // 'reports_uhrc_4th_annual_report' => '/sites/default/files/2026-02/UHRC%204th%20Annual%20Report.pdf', // malformed PDF, crashes pdfparser's font handling
            // 'reports_uganda_human_rights_commission_upr_report' => '/sites/default/files/2026-02/uganda-human-rights-commission-UPR-report.pdf', // scanned/image PDF, no extractable text
        ],
    ];

    public function handle(): int
    {
        $slug = $this->argument('slug');
        $institution = Institution::where('slug', $slug)->first();

        if (! $institution) {
            $this->error("No institution found with slug [{$slug}].");
            return self::FAILURE;
        }

        $paths = $this->targets[$slug] ?? [];

        if (empty($paths)) {
            $this->error("No target pages configured for [{$slug}]. Add them to \$targets first.");
            return self::FAILURE;
        }

        foreach ($paths as $contentType => $path) {
            $url = rtrim($institution->base_url, '/').$path;
            $this->info("Fetching {$url}...");

            $response = Http::withHeaders([
            'User-Agent' => 'JLOS-Chatbot-Prototype/1.0 (contact: your-email-here@example.com)',
             ])->retry(3, 3000)->timeout(30)->get($url);

            if ($response->failed()) {
                $this->warn("  Failed ({$response->status()}), skipping.");
                continue;
            }

            $isPdf = str_ends_with(strtolower(parse_url($url, PHP_URL_PATH) ?? ''), '.pdf');

            [$title, $cleanedText] = $isPdf
                ? $this->extractPdf($response->body(), $path)
                : $this->extractHtml($response->body(), $path);

            // PDF text extraction can leave stray non-UTF-8 bytes (e.g. Windows-1252
            // smart quotes) that Postgres' UTF8 encoding rejects on insert.
            $title = $this->sanitizeUtf8($title);
            $cleanedText = $this->sanitizeUtf8($cleanedText);

            if ($cleanedText === '') {
                $this->warn("  No content extracted, skipping.");
                continue;
            }

            $hash = hash('sha256', $cleanedText);

            $existing = ScrapedPage::where('institution_id', $institution->id)->where('url', $url)->first();

            if ($existing && $existing->content_hash === $hash) {
                $existing->update(['last_scraped_at' => now()]);
                $this->info("  Unchanged, skipping save.");
                sleep(1);
                continue;
            }

            $page = ScrapedPage::updateOrCreate(
                ['institution_id' => $institution->id, 'url' => $url],
                [
                    'title' => $title,
                    'content_type' => $contentType,
                    'cleaned_text' => $cleanedText,
                    'content_hash' => $hash,
                    'last_scraped_at' => now(),
                ]
            );

            $this->info("  Saved [{$contentType}] \"{$page->title}\" (".strlen($cleanedText)." chars)");

            sleep(1); // polite pacing between requests
        }

        return self::SUCCESS;
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
        try {
            $pdf = (new PdfParser())->parseContent($body);
            $details = $pdf->getDetails();
            $title = trim((string) ($details['Title'] ?? '')) ?: $fallbackTitle;
            $rawText = $pdf->getText();
        } catch (\Throwable $e) {
            $this->warn("  Could not parse PDF ({$e->getMessage()}).");
            return [$fallbackTitle, ''];
        }

        return [$title, trim(preg_replace('/\s+/', ' ', $rawText))];
    }

    protected function sanitizeUtf8(string $text): string
    {
        return iconv('UTF-8', 'UTF-8//IGNORE', $text) ?: '';
    }
}

//