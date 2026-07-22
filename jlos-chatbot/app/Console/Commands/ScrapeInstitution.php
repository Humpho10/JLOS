<?php

namespace App\Console\Commands;

use App\Models\Institution;
use App\Models\ScrapedPage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
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

            $crawler = new Crawler($response->body());

            $title = $crawler->filter('title')->count()
                ? trim($crawler->filter('title')->text())
                : $path;

            // Strip elements that repeat on every page and pollute the text.
            foreach ($crawler->filter('script, style, nav, header, footer') as $node) {
                $node->parentNode?->removeChild($node);
            }

            $contentNode = $crawler->filter('main')->count() > 0
                ? $crawler->filter('main')
                : $crawler->filter('body');

            $rawText = $contentNode->count() > 0 ? $contentNode->text('') : '';
            $cleanedText = trim(preg_replace('/\s+/', ' ', $rawText));

            if ($cleanedText === '') {
                $this->warn("  No content extracted, skipping.");
                continue;
            }

            $hash = hash('sha256', $cleanedText);

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
}

//