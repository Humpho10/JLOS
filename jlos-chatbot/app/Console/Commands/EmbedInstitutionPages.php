<?php

namespace App\Console\Commands;

use App\Models\Institution;
use App\Services\InstitutionEmbedderService;
use Illuminate\Console\Command;

class EmbedInstitutionPages extends Command
{
    protected $signature = 'embed:institution {slug}';

    protected $description = 'Chunk each scraped page for an institution and generate embeddings';

    public function handle(InstitutionEmbedderService $embedder): int
    {
        $slug = $this->argument('slug');
        $institution = Institution::where('slug', $slug)->first();

        if (! $institution) {
            $this->error("No institution found with slug [{$slug}].");

            return self::FAILURE;
        }

        $result = $embedder->embed($institution, fn (string $line) => $this->line($line));

        $this->info("Done: {$result['embedded']} embedded, {$result['unchanged']} unchanged, {$result['failed']} failed.");

        return self::SUCCESS;
    }
}
