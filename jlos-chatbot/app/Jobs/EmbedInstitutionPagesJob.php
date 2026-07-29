<?php

namespace App\Jobs;

use App\Models\Institution;
use App\Services\InstitutionEmbedder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class EmbedInstitutionPagesJob implements ShouldQueue
{
    use Queueable;

    public function __construct(protected Institution $institution)
    {
    }

    public function handle(InstitutionEmbedder $embedder): void
    {
        $this->institution->update(['sync_status' => 'embedding']);

        try {
            $embedder->run($this->institution);

            $this->institution->update([
                'sync_status' => 'idle',
                'last_synced_at' => now(),
                'last_sync_error' => null,
            ]);
        } catch (\Throwable $e) {
            $this->institution->update([
                'sync_status' => 'failed',
                'last_sync_error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
