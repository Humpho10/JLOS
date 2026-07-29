<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Institution;
use Illuminate\Http\Request;

class InstitutionController extends Controller
{
    public function index()
    {
        return Institution::query()->orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', 'unique:institutions,slug'],
            'base_url' => ['required', 'url', 'max:255'],
        ]);

        $institution = Institution::create($data);

        return response()->json($institution, 201);
    }

    public function update(Request $request, Institution $institution)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'alpha_dash', 'unique:institutions,slug,' . $institution->id],
            'base_url' => ['sometimes', 'url', 'max:255'],
        ]);

        $institution->update($data);

        return $institution;
    }
}
