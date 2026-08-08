<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Institution extends Model
{
    protected $fillable = [
        'name', 'slug', 'base_url',
        'code', 'short_name', 'sub_heading', 'color', 'icon', 'phone', 'website', 'logo_url', 'services', 'status',
    ];

    protected function casts(): array
    {
        return [
            'services' => 'array',
        ];
    }

public function scrapedPages()
{
    return $this->hasMany(ScrapedPage::class);
}

public function pages()
{
    return $this->hasMany(InstitutionPage::class);
}

public function documentChunks()
{
    return $this->hasMany(DocumentChunk::class);
}

public function scrapeRuns()
{
    return $this->hasMany(InstitutionScrapeRun::class);
}
}
