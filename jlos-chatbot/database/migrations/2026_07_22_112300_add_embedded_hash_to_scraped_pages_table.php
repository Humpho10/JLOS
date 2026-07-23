<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('scraped_pages', function (Blueprint $table) {
            // Tracks which content_hash was last sent for embedding, so embed:institution
            // can skip pages whose content hasn't changed since they were last embedded.
            $table->string('embedded_hash')->nullable()->after('content_hash');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scraped_pages', function (Blueprint $table) {
            $table->dropColumn('embedded_hash');
        });
    }
};
