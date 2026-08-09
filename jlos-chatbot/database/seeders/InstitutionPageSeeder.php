<?php

namespace Database\Seeders;

use App\Models\Institution;
use App\Models\InstitutionPage;
use Illuminate\Database\Seeder;

class InstitutionPageSeeder extends Seeder
{
    /**
     * One-time migration of the scrape targets that used to be hardcoded in
     * ScrapeInstitution.php's $targets array — copied verbatim so nothing
     * about what gets scraped changes, only where the configuration lives.
     */
    public function run(): void
    {
        $targets = [
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
                'publications_human_rights_health_advisory_october_revised' => '/download/human-rights-health-advisory-october/?wpdmdl=953',
                'publications_advisory_on_education_5th_august_2020' => '/download/advisory-on-education/?wpdmdl=950',
                'publications_advisory_elections_final_1st_august_2020' => '/download/advisory-elections/?wpdmdl=948',
                'publications_equal_opportunities_commission_act_2007' => '/download/equal-opportunity-commission-act/?wpdmdl=1215',
                'publications_human_rights_enforcement_act_2019' => '/download/human-rights-enforcement-act-2019/?wpdmdl=1150',
                'publications_advisory_on_places_of_detention_september_2020' => '/download/advisory-on-places-of-detention/?wpdmdl=949',
                'publications_3rd_national_escr_conference_call_for_papers_ab' => '/download/3rd-national-escr-conference-call-for-papers-abstracts/?wpdmdl=492',
                'publications_complaints_rocedures_manual_ii_3' => '/download/complaints-handling-procedures-manual-2015/?wpdmdl=1062',
                'publications_uhrc_handbook_on_migration_and_human_rights_giz' => '/download/uhrc-handbook-on-migration-and-human-rights/?wpdmdl=2241',
                'publications_uhrc_clients_charter' => '/download/uhrc-clients-charter/?wpdmdl=520',
                'publications_brief_on_ihrd_2020' => '/download/brief-on-ihrd-2020-website/?wpdmdl=1207',
                'publications_a_pocketbook_for_police_on_basic_human_rights_s' => '/download/a-pocketbook-for-police-on-basic-human-rights-standards/?wpdmdl=515',
                'reports_uhrc_28th_annual_report' => '/download/uhrc-28th-annual-report/?wpdmdl=2988',
                'reports_uhrc_27th_annual_report' => '/download/the-27th-uhrc-annual-report-on-the-state-of-human-rights-and-freedoms-in-uganda-in-2024/?wpdmdl=2499',
                'reports_uhrc_26th_annual_report' => '/download/uhrc-26th-annual-report-2023/?wpdmdl=2286',
                'reports_uhrc_25th_annual_report' => '/download/25th-uhrc-annual-report/?wpdmdl=1946',
            ],
            'moj' => [
                'about' => '/about-us/',
                'law_council' => '/law-council/',
                'civil_litigation' => '/directorate-of-civil-litigation/',
                'legal_advisory' => '/legaladvisory/',
                'administrator_general' => '/administratorgeneral/',
                'finance_administration' => '/finance-andadministration/',
                'publications' => '/publications/',
                'reports' => '/reports/',
                'press' => '/press/',
                'contact' => '/connect-with-us/',
            ],
            'tat' => [
                'about' => '/about-us/',
                'history' => '/our-history/',
                'leadership' => '/the-tribunal/',
                'registrars' => '/registrars/',
                'organogram' => '/organogram/',
                'legislation' => '/legislation/',
                'service_how_to_apply' => '/how-to-apply/',
                'case_summaries' => '/tat-case-summaries/',
                'reports' => '/annual-reports/',
                'contact' => '/contact-us/',
            ],
            'jsc' => [
                'about' => '/who-we-are/',
                'mission_vision' => '/mission-vision-objectives/',
                'functions' => '/functions-of-the-commission/',
                'leadership' => '/people/',
                'organogram' => '/who-we-are/organogram/',
                'service_how_to_complain' => '/how-to-file-a-complaint/',
                'service_complaint_form' => '/online-complaint-form/',
                'service_how_to_apply' => '/how-to-apply/',
                'publications' => '/publications/',
                'faqs' => '/faqs/',
                'contact' => '/contact-us/',
            ],
        ];

        foreach ($targets as $slug => $pages) {
            $institution = Institution::where('slug', $slug)->first();
            if (! $institution) {
                continue;
            }

            foreach ($pages as $contentType => $path) {
                InstitutionPage::updateOrCreate(
                    ['institution_id' => $institution->id, 'content_type' => $contentType],
                    ['path' => $path, 'active' => true]
                );
            }
        }
    }
}
