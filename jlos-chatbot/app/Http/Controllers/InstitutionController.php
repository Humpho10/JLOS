<?php

namespace App\Http\Controllers;

use App\Models\Institution;

class InstitutionController extends Controller
{
    /**
     * Public listing — only ever returns published institutions. A draft
     * one (mid-setup in the admin area, not yet scraped/reviewed) stays
     * invisible here even though the row already exists.
     */
    public function index()
    {
        return Institution::query()
            ->where('status', 'published')
            ->orderBy('id')
            ->get([
                'id', 'name', 'slug', 'base_url',
                'code', 'short_name', 'sub_heading', 'color', 'icon', 'phone', 'website', 'logo_url', 'services',
            ]);
    }
}
