<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            // Guests have no account — their conversation is keyed by this
            // instead: a random token the browser generates once and remembers.
            $table->string('guest_token')->nullable();
            $table->foreignId('institution_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title')->nullable();
            $table->timestamps();

            $table->index('guest_token');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
