<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['institution_id', 'name', 'email', 'body', 'status', 'reply_body', 'replied_at'])]
class Message extends Model
{
    protected function casts(): array
    {
        return [
            'replied_at' => 'datetime',
        ];
    }

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }
}
