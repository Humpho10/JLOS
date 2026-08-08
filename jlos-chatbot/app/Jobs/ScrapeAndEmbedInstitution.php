<?php

namespace App\Jobs;

use App\Models\InstitutionScrapeRun;
use App\Services\InstitutionEmbedderService;
use App\Services\InstitutionScraperService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

/**
 * Runs scrape then embed for one institution in the background, so the
 * admin's "Scrape & Embed" click doesn't have to hang an HTTP request for
 * however long fetching every configured page (with a polite pause between
 * each) actually takes. Progress is written to the run record as it goes,
 * which is what the admin UI polls.
 */
class ScrapeAndEmbedInstitution implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // Scraping+embedding a large institution (many pages, each with a
    // 1s pause, plus retries on failures) can genuinely take several
    // minutes — the default 60s job timeout would kill it mid-run.
    public int $timeout = 900;

    public function __construct(protected int $runId)
    {
    }

    public function handle(InstitutionScraperService $scraper, InstitutionEmbedderService $embedder): void
    {
        $run = InstitutionScrapeRun::with('institution')->find($this->runId);

        if (! $run) {
            return;
        }

        $run->update(['status' => 'running', 'started_at' => now()]);

        try {
            $run->appendLog('Scraping...');
            $scrapeResult = $scraper->scrape($run->institution, fn (string $line) => $run->appendLog($line));
            $run->appendLog("Scrape done: {$scrapeResult['scraped']} scraped, {$scrapeResult['unchanged']} unchanged, {$scrapeResult['failed']} failed.");

            $run->appendLog('Embedding...');
            $embedResult = $embedder->embed($run->institution, fn (string $line) => $run->appendLog($line));
            $run->appendLog("Embed done: {$embedResult['embedded']} embedded, {$embedResult['unchanged']} unchanged, {$embedResult['failed']} failed.");

            $run->update(['status' => 'completed', 'finished_at' => now()]);
        } catch (Throwable $e) {
            report($e);
            $run->appendLog('Failed: '.$e->getMessage());
            $run->update(['status' => 'failed', 'finished_at' => now()]);
        }
    }
}
