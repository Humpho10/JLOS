<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Institution extends Model
{
    protected $fillable = ['name', 'slug', 'base_url', 'sync_status', 'last_synced_at', 'last_sync_error'];

    protected function casts(): array
    {
        return [
            'last_synced_at' => 'datetime',
        ];
    }

public function scrapedPages()
{
    return $this->hasMany(ScrapedPage::class);
}

public function documentChunks()
{
    return $this->hasMany(DocumentChunk::class);
}

public function pages()
{
    return $this->hasMany(InstitutionPage::class);
}
}
