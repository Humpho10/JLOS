<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\ScrapeAndEmbedInstitution;
use App\Models\Institution;
use App\Models\InstitutionScrapeRun;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminInstitutionController extends Controller
{
    /**
     * Unlike the public /api/institutions endpoint, this returns every
     * institution regardless of status — the admin needs to see and manage
     * drafts that aren't live yet, not just what the public sees.
     */
    public function index()
    {
        return Institution::query()->orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        // New institutions default to draft — nothing goes live to the
        // public just from being created here, only once explicitly
        // published (normally after its pages are scraped and reviewed).
        $data['status'] = $data['status'] ?? 'draft';

        $institution = Institution::create($data);

        return response()->json($institution, 201);
    }

    public function update(Request $request, Institution $institution)
    {
        $institution->update($this->validated($request, $institution->id));

        return response()->json($institution);
    }

    public function destroy(Institution $institution)
    {
        $institution->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    /**
     * Kicks off a background scrape + embed run for this institution and
     * returns immediately with the queued run record — the admin UI polls
     * latestScrapeRun() for progress rather than waiting on this request.
     */
    public function scrape(Institution $institution)
    {
        $run = InstitutionScrapeRun::create([
            'institution_id' => $institution->id,
            'status' => 'queued',
        ]);

        ScrapeAndEmbedInstitution::dispatch($run->id);

        return response()->json($run, 201);
    }

    public function latestScrapeRun(Institution $institution)
    {
        $run = $institution->scrapeRuns()->latest('id')->first();

        return response()->json($run);
    }

    protected function validated(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('institutions', 'slug')->ignore($ignoreId)],
            'base_url' => 'required|url|max:255',
            'code' => 'nullable|string|max:20',
            'short_name' => 'nullable|string|max:60',
            'sub_heading' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:20',
            'icon' => 'nullable|string|max:30',
            'phone' => 'nullable|string|max:40',
            'website' => 'nullable|url|max:255',
            'logo_url' => 'nullable|string|max:500',
            'services' => 'nullable|array',
            'services.*' => 'string|max:100',
            'status' => 'nullable|in:draft,published',
        ]);
    }
}
