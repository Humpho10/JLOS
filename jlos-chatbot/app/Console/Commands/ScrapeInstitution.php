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
            'news' => '/news/',
        ], //hardcoded targetted array for the pages you want to scrap
        'uhrc' => [
            'about' => '/page/our-mandate',
            'leadership' => '/team',
            'directorate' => '/page/directorates',
            'contact' => '/page/contact-us',
            'service' => '/page/complaint-form',
            'publications' => '/publications',
            'reports' => '/reports',
            'tribunal' => '/page/about-tribunal',
            'administrative_structure' => '/page/administrative-structure',
            'tribunal_decisions' => '/page/tribunal-decisions',
            'cause_list' => '/page/cause-list',
            'newsletters' => '/page/magazines-newsletters',
            'bills' => '/bills',
            'news' => '/news',
            'press' => '/press',
            'constitution' => '/reports/constitution-uganda-1995',
        ],
        'judiciary' => [
            'about' => '/data/smenu/86/1/About%20the%20Judiciary.html',
            'administrative_structure' => '/data/smenu/90/1/Administrative%20Structure.html',
            'judicial_structure' => '/data/smenu/93/Judicial%20Structure.html',
            'finance_administration' => '/data/smenu/94/Finance%20and%20Administration.html',
            'supreme_court' => '/data/smenu/7/1/Supreme%20Court.html',
            'high_court' => '/data/smenu/9/3/High%20Court.html',
            'court_of_appeal' => '/data/smenu/77/3/Court%20of%20Appeal.html',
            'chief_magistrate_courts' => '/data/smenu/21/4/Chief%20Magistrate%20Courts.html',
            'other_courts' => '/data/smenu/11/5/Other%20Courts.html',
            'service' => '/data/smenu/117/1/Inspectorate%20of%20Courts.html',
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
          //for each url you fetch, parse the html using DomCrawler, it strps the <script>,<style>,<nav>,<header>,<footer>
          //and it focuses on the main if it exists
            $crawler = new Crawler($response->body());

            $title = $crawler->filter('title')->count()
                ? trim($crawler->filter('title')->text())
                : $path;

            // Strip elements that repeat on every page and pollute the text.
            foreach ($crawler->filter('script, style, nav, header, footer') as $node) {
                $node->parentNode?->removeChild($node);
            }

            // Prefer a real <main>; some older sites (e.g. Judiciary) have no
            // <main> and instead wrap the article in a #left_section, with a
            // sidebar of unrelated quick-links living in a sibling element —
            // falling straight back to <body> would pull that sidebar in too.
            $contentNode = match (true) {
                $crawler->filter('main')->count() > 0 => $crawler->filter('main'),
                $crawler->filter('#left_section')->count() > 0 => $crawler->filter('#left_section'),
                default => $crawler->filter('body'),
            };

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