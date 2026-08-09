<?php

namespace App\Console\Commands;

use App\Models\Institution;
use App\Services\InstitutionScraperService;
use Illuminate\Console\Command;

class ScrapeInstitution extends Command
{
    protected $signature = 'scrape:institution {slug}';

    protected $description = 'Fetch the configured pages for an institution and store cleaned text';

    public function handle(InstitutionScraperService $scraper): int
    {
        $slug = $this->argument('slug');
        $institution = Institution::where('slug', $slug)->first();

        if (! $institution) {
            $this->error("No institution found with slug [{$slug}].");

            return self::FAILURE;
        }

        $result = $scraper->scrape($institution, fn (string $line) => $this->line($line));

        $this->info("Done: {$result['scraped']} scraped, {$result['unchanged']} unchanged, {$result['failed']} failed.");

        return self::SUCCESS;
    }
}
