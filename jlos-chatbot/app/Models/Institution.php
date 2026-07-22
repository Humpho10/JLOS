<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Institution extends Model
{
    protected $fillable = ['name', 'slug', 'base_url'];

public function scrapedPages()
{
    return $this->hasMany(ScrapedPage::class);
}

public function documentChunks()
{
    return $this->hasMany(DocumentChunk::class);
}
}
