<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstitutionPage extends Model
{
    protected $fillable = ['institution_id', 'label', 'path', 'last_status', 'last_error', 'last_synced_at'];

    protected function casts(): array
    {
        return [
            'last_synced_at' => 'datetime',
        ];
    }

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }
}
