<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScrapedPage extends Model
{
    protected $fillable = ['institution_id', 'url', 'title', 'content_type', 'cleaned_text', 'content_hash', 'embedded_hash', 'last_scraped_at'];

public function institution()
{
    return $this->belongsTo(Institution::class);
}

public function chunks()
{
    return $this->hasMany(DocumentChunk::class);
}
}
