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

        Institution::updateOrCreate(
            ['slug' => 'moj'],
            [
                'name' => 'Ministry of Justice and Constitutional Affairs',
                'base_url' => 'https://justice.go.ug',
            ]
        );

        Institution::updateOrCreate(
            ['slug' => 'tat'],
            [
                'name' => 'Tax Appeals Tribunal',
                'base_url' => 'https://tat.go.ug',
            ]
        );

        Institution::updateOrCreate(
            ['slug' => 'jsc'],
            [
                'name' => 'Judicial Service Commission',
                'base_url' => 'https://www.jsc.go.ug',
            ]
        );
    }
}
