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

            // PDFs linked from the /publications page.
            // uhrc.ug migrated from Drupal to WordPress at some point, so the
            // old /sites/default/files/... paths below now 301 to the
            // homepage instead of 404ing — Http::get() follows the redirect,
            // so the "PDF" body PdfParser chokes on is actually that
            // homepage's HTML. Current files are served through the WP
            // Download Manager plugin at /download/{slug}/?wpdmdl={id}
            // instead; each mapping here was re-verified against the live
            // site's Content-Disposition filename.
            'publications_human_rights_health_advisory_october_revised' => '/download/human-rights-health-advisory-october/?wpdmdl=953',
            'publications_advisory_on_education_5th_august_2020' => '/download/advisory-on-education/?wpdmdl=950',
            'publications_advisory_elections_final_1st_august_2020' => '/download/advisory-elections/?wpdmdl=948',
            'publications_equal_opportunities_commission_act_2007' => '/download/equal-opportunity-commission-act/?wpdmdl=1215',
            'publications_human_rights_enforcement_act_2019' => '/download/human-rights-enforcement-act-2019/?wpdmdl=1150',
            // 'publications_anti_pornography_act_2014' => '/download/anti-pornography-act/?wpdmdl=1211', // scanned/image PDF, no extractable text
            // 'publications_public_order_management_act_2013' => '/download/public-order-management-act-2013/?wpdmdl=499', // scanned/image PDF, no extractable text
            // 'publications_prevention_and_prohibition_of_torture_act_2012' => '/download/prevention-and-prohibition-of-torture-act-2012/?wpdmdl=498', // scanned/image PDF, no extractable text
            'publications_advisory_on_places_of_detention_september_2020' => '/download/advisory-on-places-of-detention/?wpdmdl=949',
            'publications_3rd_national_escr_conference_call_for_papers_ab' => '/download/3rd-national-escr-conference-call-for-papers-abstracts/?wpdmdl=492',
            'publications_complaints_rocedures_manual_ii_3' => '/download/complaints-handling-procedures-manual-2015/?wpdmdl=1062',
            // 'publications_investigators_hand_book' — no longer published on the site; the slug and every guessed variant now redirect to the homepage.
            'publications_uhrc_handbook_on_migration_and_human_rights_giz' => '/download/uhrc-handbook-on-migration-and-human-rights/?wpdmdl=2241',
            'publications_uhrc_clients_charter' => '/download/uhrc-clients-charter/?wpdmdl=520',
            'publications_brief_on_ihrd_2020' => '/download/brief-on-ihrd-2020-website/?wpdmdl=1207',
            'publications_a_pocketbook_for_police_on_basic_human_rights_s' => '/download/a-pocketbook-for-police-on-basic-human-rights-standards/?wpdmdl=515',

            // PDFs linked from /uhrc-reports/ (the old /reports page path also
            // 301s to the homepage now). The old 6th/7th/13th/19th annual
            // reports are no longer published on the redesigned site — using
            // the most recent four instead, which is more useful for a
            // chatbot anyway.
            'reports_uhrc_28th_annual_report' => '/download/uhrc-28th-annual-report/?wpdmdl=2988',
            'reports_uhrc_27th_annual_report' => '/download/the-27th-uhrc-annual-report-on-the-state-of-human-rights-and-freedoms-in-uganda-in-2024/?wpdmdl=2499',
            'reports_uhrc_26th_annual_report' => '/download/uhrc-26th-annual-report-2023/?wpdmdl=2286',
            'reports_uhrc_25th_annual_report' => '/download/25th-uhrc-annual-report/?wpdmdl=1946',
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

            // Some CMSes (e.g. WordPress' Download Manager plugin, which
            // UHRC's PDFs now go through) serve the file from a URL whose
            // path doesn't end in .pdf at all — the real file id lives in
            // the query string. The Content-Type header is what the server
            // actually says the body is, so trust that first and only fall
            // back to the URL's extension if the header is missing/generic.
            $contentType = strtolower($response->header('Content-Type') ?? '');
            $isPdf = str_contains($contentType, 'application/pdf')
                || (! $contentType && str_ends_with(strtolower(parse_url($url, PHP_URL_PATH) ?? ''), '.pdf'));

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