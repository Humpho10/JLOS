<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('institution_scrape_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['queued', 'running', 'completed', 'failed'])->default('queued');
            // Plain accumulated progress lines, appended to as the job runs
            // — what the admin's "Scrape & Embed" panel polls and displays,
            // the same content that would otherwise only be visible in a
            // terminal running the Artisan commands directly.
            $table->text('log')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('institution_scrape_runs');
    }
};
