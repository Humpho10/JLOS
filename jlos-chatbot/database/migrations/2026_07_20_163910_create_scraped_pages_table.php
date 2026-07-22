<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::create('scraped_pages', function (Blueprint $table) {
        $table->id();
        $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
        $table->string('url');
        $table->string('title')->nullable();
        $table->string('content_type')->nullable(); // e.g. 'about', 'service', 'faq', 'publication'
        $table->longText('cleaned_text')->nullable();
        $table->string('content_hash')->nullable(); // detects page changes between scrapes
        $table->timestamp('last_scraped_at')->nullable();
        $table->timestamps();

        $table->unique(['institution_id', 'url']);
    });
}

public function down(): void
{
    Schema::dropIfExists('scraped_pages');
}
};
