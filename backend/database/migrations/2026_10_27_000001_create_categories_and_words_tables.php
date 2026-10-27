<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 80);
            $table->string('slug', 100)->unique();
            $table->string('symbol', 12)->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('words', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('word', 80);
            $table->string('difficulty', 12)->index();
            $table->text('hint');
            $table->text('description')->nullable();
            $table->string('locale', 8)->default('tr');
            $table->string('status', 20)->default('draft')->index();
            $table->boolean('is_child_safe')->default(false);
            $table->timestamps();
            $table->unique(['category_id', 'locale', 'word']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('words');
        Schema::dropIfExists('categories');
    }
};
