<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentChunk extends Model
{
    protected $fillable = ['scraped_page_id', 'institution_id', 'chunk_index', 'chunk_text', 'embedding'];

public function scrapedPage()
{
    return $this->belongsTo(ScrapedPage::class);
}

public function institution()
{
    return $this->belongsTo(Institution::class);
}
}
