<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstitutionScrapeRun extends Model
{
    protected $fillable = ['institution_id', 'status', 'log', 'started_at', 'finished_at'];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    public function appendLog(string $line): void
    {
        $this->update(['log' => trim(($this->log ?? '')."\n".$line)]);
    }
}
