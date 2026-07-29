<?php

namespace App\Console\Commands;

use App\Models\Institution;
use App\Services\InstitutionScraper;
use Illuminate\Console\Command;

class ScrapeInstitution extends Command
{
    protected $signature = 'scrape:institution {slug}';

    protected $description = 'Fetch the configured pages for an institution and store cleaned text';

    public function handle(InstitutionScraper $scraper): int
    {
        $slug = $this->argument('slug');
        $institution = Institution::where('slug', $slug)->first();

        if (! $institution) {
            $this->error("No institution found with slug [{$slug}].");
            return self::FAILURE;
        }

        if ($institution->pages()->count() === 0) {
            $this->error("No target pages configured for [{$slug}]. Add some via the admin panel first.");
            return self::FAILURE;
        }

        $scraper->run($institution, function (string $label, string $status, ?string $error) {
            $this->info("[{$status}] {$label}".($error ? " — {$error}" : ''));
        });

        return self::SUCCESS;
    }
}
