<?php

namespace App\Jobs;

use App\Models\Institution;
use App\Services\InstitutionScraper;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ScrapeInstitutionJob implements ShouldQueue
{
    use Queueable;

    public function __construct(protected Institution $institution)
    {
    }

    public function handle(InstitutionScraper $scraper): void
    {
        $this->institution->update(['sync_status' => 'scraping', 'last_sync_error' => null]);

        try {
            $scraper->run($this->institution);
        } catch (\Throwable $e) {
            $this->institution->update([
                'sync_status' => 'failed',
                'last_sync_error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
