<?php

namespace Database\Seeders;

use App\Models\Institution;
use Illuminate\Database\Seeder;

/**
 * Migrates the scrape target list that used to be hardcoded in
 * ScrapeInstitution's `$targets` array (see git history) into the
 * database, so the existing institutions keep their curated set of
 * pages after that array was replaced by admin-managed InstitutionPage
 * rows.
 */
class InstitutionPageSeeder extends Seeder
{
    protected array $targets = [
        'dpp' => [
            'about' => '/about/',
            'publications' => '/resource-center/',
            'contact' => '/contact/',
            'service' => '/complaint/',
            'leadership' => '/top-management/',
            'directorate' => '/directorate/',
            'message' => '/message-from-director/',
        ],
        'uhrc' => [
            'about' => '/page/our-mandate',
            'leadership' => '/team',
            'directorate' => '/page/directorates',
            'contact' => '/page/contact-us',
            'service' => '/page/complaint-form',
            'publications' => '/publications',
            'reports' => '/reports',
            'tribunal' => '/page/about-tribunal',

            'publications_human_rights_health_advisory_october_revised' => '/sites/default/files/2026-01/Human%20Rights%20Health%20Advisory%20-%20%20October%20revised.pdf',
            'publications_advisory_on_education_5th_august_2020' => '/sites/default/files/2026-01/Advisory%20on%20Education%20-%20%285th%20August%20%202020%29.pdf',
            'publications_advisory_elections_final_1st_august_2020' => '/sites/default/files/2026-01/ADVISORY%20ELECTIONS%20%20-%20FINAL%20%281st%20%20August%202020%29.pdf',
            'publications_equal_opportunities_commission_act_2007' => '/sites/default/files/2025-11/equal-opportunities-commission-act-2007.pdf',
            'publications_human_rights_enforcement_act_2019' => '/sites/default/files/2026-01/Human%20Rights%20%28Enforcement%29%20Act%2C%202019.pdf',
            'publications_advisory_on_places_of_detention_september_2020' => '/sites/default/files/2025-11/Advisory%20on%20places%20of%20%20detention%20-%20%20September%202020.pdf',
            'publications_3rd_national_escr_conference_call_for_papers_ab' => '/sites/default/files/2025-11/3rd-National-ESCR-Conference-Call-for-Papers-Abstracts.pdf',
            'publications_complaints_rocedures_manual_ii_3' => '/sites/default/files/2026-02/complaints-rocedures-manual%20II%20_3_.pdf',
            'publications_investigators_hand_book' => '/sites/default/files/2026-02/investigators-hand-book.pdf',
            'publications_uhrc_handbook_on_migration_and_human_rights_giz' => '/sites/default/files/2026-02/uhrc-handbook-on-migration-and-human-rights-GIZ-2022.pdf',
            'publications_uhrc_clients_charter' => '/sites/default/files/2026-02/uhrc-clients-charter.pdf',
            'publications_brief_on_ihrd_2020' => '/sites/default/files/2026-02/brief-on-ihrd-2020.pdf',
            'publications_a_pocketbook_for_police_on_basic_human_rights_s' => '/sites/default/files/2025-11/A-Pocketbook-for-Police-on-Basic-Human-Rights-Standards.pdf',

            'reports_uhrc_6th_annual_report' => '/sites/default/files/2026-02/UHRC%206th%20Annual%20Report.pdf',
            'reports_uhrc_7th_annual_report' => '/sites/default/files/2026-02/UHRC%207th%20Annual%20Report.pdf',
            'reports_uhrc_13th_annual_report' => '/sites/default/files/2026-02/UHRC%2013th%20Annual%20Report.pdf',
            'reports_uhrc_19th_annual_report' => '/sites/default/files/2026-02/UHRC%2019th%20Annual%20Report.pdf',
        ],
    ];

    public function run(): void
    {
        foreach ($this->targets as $slug => $pages) {
            $institution = Institution::where('slug', $slug)->first();

            if (! $institution) {
                continue;
            }

            foreach ($pages as $label => $path) {
                $institution->pages()->updateOrCreate(
                    ['label' => $label],
                    ['path' => $path]
                );
            }
        }
    }
}
