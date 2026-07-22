<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::create('document_chunks', function (Blueprint $table) {
        $table->id();
        $table->foreignId('scraped_page_id')->constrained()->cascadeOnDelete();
        $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
        $table->unsignedInteger('chunk_index');
        $table->text('chunk_text');
        $table->vector('embedding', dimensions: 768)->nullable();
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('document_chunks');
}
};
