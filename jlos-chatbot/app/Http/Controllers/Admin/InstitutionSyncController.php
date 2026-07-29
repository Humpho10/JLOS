<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\EmbedInstitutionPagesJob;
use App\Jobs\ScrapeInstitutionJob;
use App\Models\Institution;
use Illuminate\Support\Facades\Bus;

class InstitutionSyncController extends Controller
{
    public function sync(Institution $institution)
    {
        abort_if($institution->pages()->count() === 0, 422, 'Add at least one page to sync first.');

        Bus::chain([
            new ScrapeInstitutionJob($institution),
            new EmbedInstitutionPagesJob($institution),
        ])->dispatch();

        return response()->json(['status' => 'queued'], 202);
    }

    public function status(Institution $institution)
    {
        return response()->json([
            'sync_status' => $institution->sync_status,
            'last_synced_at' => $institution->last_synced_at,
            'last_sync_error' => $institution->last_sync_error,
            'pages' => $institution->pages()->orderBy('label')->get(['id', 'label', 'path', 'last_status', 'last_error', 'last_synced_at']),
        ]);
    }
}
