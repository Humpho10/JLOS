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
                'code' => 'ODPP',
                'short_name' => 'ODPP',
                'sub_heading' => 'Criminal prosecutions',
                'color' => '#C79A2E',
                'icon' => 'briefcase',
                'phone' => '0800 100 004',
                'website' => 'https://dpp.go.ug/',
                'logo_url' => '/resources/images/institutions/dpp.png',
                'services' => ['Case perusal & sanctioning', 'Criminal proceedings', 'Criminal investigations', 'Private prosecutions'],
                'status' => 'published',
            ]
        );

        Institution::updateOrCreate(
            ['slug' => 'uhrc'],
            [
                'name' => 'Uganda Human Rights Commission',
                'base_url' => 'https://uhrc.ug',
                'code' => 'UHRC',
                'short_name' => 'UHRC',
                'sub_heading' => 'Human rights protection',
                'color' => '#7C2333',
                'icon' => 'heart',
                'phone' => '0800 100 003',
                'website' => 'https://uhrc.ug/',
                'logo_url' => '/resources/images/institutions/uhrc.png',
                'services' => ['Complaints', 'Press / media relations', 'Inquiries', 'Clearance requests'],
                'status' => 'published',
            ]
        );

        Institution::updateOrCreate(
            ['slug' => 'moj'],
            [
                'name' => 'Ministry of Justice and Constitutional Affairs',
                'base_url' => 'https://justice.go.ug',
                'code' => 'MOJ',
                'short_name' => 'Justice',
                'sub_heading' => 'Legal services & regulation',
                'color' => '#0E2A47',
                'icon' => 'scale',
                'phone' => '0800 100 001',
                'website' => 'https://justice.go.ug/',
                'logo_url' => '/resources/images/institutions/moj.png',
                'services' => ['Inspection of chambers', 'Disciplinary committee', 'Filing a complaint', 'Seeing a state attorney', 'Legal education', 'Legal aid'],
                'status' => 'published',
            ]
        );

        Institution::updateOrCreate(
            ['slug' => 'tat'],
            [
                'name' => 'Tax Appeals Tribunal',
                'base_url' => 'https://tat.go.ug',
                'code' => 'TAT',
                'short_name' => 'TAT',
                'sub_heading' => 'Tax dispute resolution',
                'color' => '#1F8A57',
                'icon' => 'receipt',
                'phone' => '0800 100 005',
                'website' => 'https://tat.go.ug/',
                'logo_url' => '/resources/images/institutions/tat.png',
                'services' => ['Filing', 'Hearings (online)', 'Consultation', 'Follow-up on cases'],
                'status' => 'published',
            ]
        );

        Institution::updateOrCreate(
            ['slug' => 'jsc'],
            [
                'name' => 'Judicial Service Commission',
                'base_url' => 'https://www.jsc.go.ug',
                'code' => 'JSC',
                'short_name' => 'JSC',
                'sub_heading' => 'Judicial appointments & discipline',
                'color' => '#123A61',
                'icon' => 'landmark',
                'phone' => '0800 100 006',
                'website' => 'https://www.jsc.go.ug/',
                'logo_url' => '/resources/images/institutions/jsc.png',
                'services' => ['Judicial appointments', 'Complaints against judicial officers', 'Case status lookup', 'Court schedules'],
                'status' => 'published',
            ]
        );
    }
}
