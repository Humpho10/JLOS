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
        Schema::table('institutions', function (Blueprint $table) {
            $table->string('sync_status')->default('idle')->after('base_url'); // idle | scraping | embedding | failed
            $table->timestamp('last_synced_at')->nullable()->after('sync_status');
            $table->text('last_sync_error')->nullable()->after('last_synced_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('institutions', function (Blueprint $table) {
            $table->dropColumn(['sync_status', 'last_synced_at', 'last_sync_error']);
        });
    }
};
