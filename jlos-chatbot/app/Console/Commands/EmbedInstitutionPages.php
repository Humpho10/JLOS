<?php

namespace App\Console\Commands;

use App\Models\Institution;
use App\Services\InstitutionEmbedder;
use Illuminate\Console\Command;

class EmbedInstitutionPages extends Command
{
    protected $signature = 'embed:institution {slug}';

    protected $description = 'Chunk each scraped page for an institution and generate embeddings';

    public function handle(InstitutionEmbedder $embedder): int
    {
        $slug = $this->argument('slug');
        $institution = Institution::where('slug', $slug)->first();

        if (! $institution) {
            $this->error("No institution found with slug [{$slug}].");
            return self::FAILURE;
        }

        if ($institution->scrapedPages->isEmpty()) {
            $this->error("No scraped pages found for [{$slug}]. Run scrape:institution first.");
            return self::FAILURE;
        }

        $embedder->run($institution, function (string $title, string $status) {
            $this->info("[{$status}] {$title}");
        });

        return self::SUCCESS;
    }
}
