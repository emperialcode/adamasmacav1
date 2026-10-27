<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('game_sessions', function (Blueprint $table): void {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->char('access_token_hash', 64);
            $table->foreignId('word_id')->constrained('words')->restrictOnDelete();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->string('difficulty', 12);
            $table->json('guessed_letters');
            $table->unsignedTinyInteger('wrong_guesses')->default(0);
            $table->boolean('hint_used')->default(false);
            $table->unsignedInteger('score')->default(0);
            $table->string('status', 12)->default('playing')->index();
            $table->json('rule_snapshot');
            $table->timestamp('started_at');
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
        });

        Schema::create('guesses', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('game_session_id')->constrained()->cascadeOnDelete();
            $table->string('letter', 2);
            $table->uuid('request_id');
            $table->boolean('was_correct');
            $table->timestamps();
            $table->unique(['game_session_id', 'request_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guesses');
        Schema::dropIfExists('game_sessions');
    }
};
