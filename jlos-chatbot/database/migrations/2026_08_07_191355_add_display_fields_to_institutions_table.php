<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('institutions', function (Blueprint $table) {
            // Public-facing display fields — the frontend's Home/Institutions
            // pages currently pull these from a hardcoded JS file instead of
            // the database, which is exactly the gap this column set closes.
            $table->string('code')->nullable()->after('slug');
            $table->string('short_name')->nullable()->after('code');
            $table->string('sub_heading')->nullable()->after('short_name');
            $table->string('color')->nullable()->after('sub_heading');
            $table->string('icon')->nullable()->after('color');
            $table->string('phone')->nullable()->after('icon');
            $table->string('website')->nullable()->after('phone');
            $table->string('logo_url')->nullable()->after('website');
            $table->json('services')->nullable()->after('logo_url');

            // Controls public visibility — a newly admin-created institution
            // starts hidden (draft) until its pages are scraped/embedded and
            // someone deliberately publishes it, so nothing goes live with
            // no real content behind it.
            $table->enum('status', ['draft', 'published'])->default('draft')->after('services');
        });
    }

    public function down(): void
    {
        Schema::table('institutions', function (Blueprint $table) {
            $table->dropColumn(['code', 'short_name', 'sub_heading', 'color', 'icon', 'phone', 'website', 'logo_url', 'services', 'status']);
        });
    }
};
