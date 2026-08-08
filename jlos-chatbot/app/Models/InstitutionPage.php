<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstitutionPage extends Model
{
    protected $fillable = ['institution_id', 'content_type', 'path', 'active'];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }
}
