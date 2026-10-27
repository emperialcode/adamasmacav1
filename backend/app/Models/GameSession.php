<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GameSession extends Model
{
    protected $fillable = [
        'public_id', 'access_token_hash', 'word_id', 'category_id', 'difficulty', 'guessed_letters',
        'wrong_guesses', 'hint_used', 'score', 'status', 'rule_snapshot', 'started_at', 'finished_at',
    ];

    protected function casts(): array
    {
        return [
            'guessed_letters' => 'array',
            'rule_snapshot' => 'array',
            'wrong_guesses' => 'integer',
            'hint_used' => 'boolean',
            'score' => 'integer',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    public function word(): BelongsTo
    {
        return $this->belongsTo(Word::class);
    }

    public function guesses(): HasMany
    {
        return $this->hasMany(Guess::class);
    }
}
