<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Institution;
use App\Models\InstitutionPage;
use App\Models\ScrapedPage;
use Illuminate\Http\Request;

class AdminInstitutionPageController extends Controller
{
    public function index(Institution $institution)
    {
        return $institution->pages()->orderBy('content_type')->get();
    }

    public function store(Request $request, Institution $institution)
    {
        $page = $institution->pages()->create($this->validated($request));

        return response()->json($page, 201);
    }

    public function update(Request $request, Institution $institution, InstitutionPage $page)
    {
        $this->authorizeBelongsTo($institution, $page);

        $data = $this->validated($request);

        // Changing the path points this target at a different URL — the
        // content scraped under the old path no longer corresponds to any
        // active target, so it'd otherwise linger and keep feeding the AI
        // stale answers. Deactivating a page is left alone on purpose: that's
        // a pause, not a removal, so its scraped content stays intact.
        if ($data['path'] !== $page->path) {
            $this->purgeScrapedContent($institution, $page->path);
        }

        $page->update($data);

        return response()->json($page);
    }

    public function destroy(Institution $institution, InstitutionPage $page)
    {
        $this->authorizeBelongsTo($institution, $page);

        $this->purgeScrapedContent($institution, $page->path);
        $page->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    /**
     * Deletes the scraped copy (and, via cascade, its embedded chunks) for a
     * target's URL — so removing or re-pathing a page target doesn't leave
     * orphaned content the scraper will never revisit to clean up itself,
     * and a later re-add starts from a real re-scrape instead of stale data.
     */
    protected function purgeScrapedContent(Institution $institution, string $path): void
    {
        $url = rtrim($institution->base_url, '/').$path;

        ScrapedPage::where('institution_id', $institution->id)->where('url', $url)->delete();
    }

    /**
     * Route model binding resolves {institution} and {page} independently —
     * without this, requesting PUT /institutions/1/pages/{page belonging to
     * institution 2} would silently succeed instead of being rejected.
     */
    protected function authorizeBelongsTo(Institution $institution, InstitutionPage $page): void
    {
        abort_unless($page->institution_id === $institution->id, 404);
    }

    protected function validated(Request $request): array
    {
        return $request->validate([
            'content_type' => 'required|string|max:100',
            'path' => 'required|string|max:1000',
            'active' => 'boolean',
        ]);
    }
}
