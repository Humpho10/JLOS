<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Institution;
use App\Models\InstitutionPage;
use Illuminate\Http\Request;

class InstitutionPageController extends Controller
{
    public function index(Institution $institution)
    {
        return $institution->pages()->orderBy('label')->get();
    }

    public function store(Request $request, Institution $institution)
    {
        $data = $request->validate([
            'label' => ['required', 'string', 'max:255'],
            'path' => ['required', 'string', 'max:2048'],
        ]);

        $page = $institution->pages()->create($data);

        return response()->json($page, 201);
    }

    public function update(Request $request, Institution $institution, InstitutionPage $page)
    {
        abort_unless($page->institution_id === $institution->id, 404);

        $data = $request->validate([
            'label' => ['sometimes', 'string', 'max:255'],
            'path' => ['sometimes', 'string', 'max:2048'],
        ]);

        $page->update($data);

        return $page;
    }

    public function destroy(Institution $institution, InstitutionPage $page)
    {
        abort_unless($page->institution_id === $institution->id, 404);

        $page->delete();

        return response()->noContent();
    }
}
