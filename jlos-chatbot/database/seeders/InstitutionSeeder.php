<?php

namespace Database\Seeders;

use App\Models\Institution;
use Illuminate\Database\Seeder;

class InstitutionSeeder extends Seeder
{
    public function run(): void
    {
        Institution::updateOrCreate(
            ['slug' => 'dpp'],
            [
                'name' => 'Directorate of Public Prosecutions',
                'base_url' => 'https://dpp.go.ug',
            ]
        );

        Institution::updateOrCreate(
            ['slug' => 'uhrc'],
            [
                'name' => 'Uganda Human Rights Commission',
                'base_url' => 'https://uhrc.ug',
            ]
        );
    }
}
