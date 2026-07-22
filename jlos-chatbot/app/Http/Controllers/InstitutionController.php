<?php

namespace App\Http\Controllers;

use App\Models\Institution;

class InstitutionController extends Controller
{
    public function index()
    {
        return Institution::query()
            ->select(['id', 'name', 'slug', 'base_url'])
            ->orderBy('name')
            ->get();
    }
}
