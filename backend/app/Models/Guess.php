<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Guess extends Model
{
    protected $fillable = ['game_session_id', 'letter', 'request_id', 'was_correct'];

    protected function casts(): array
    {
        return ['was_correct' => 'boolean'];
    }

    public function gameSession(): BelongsTo
    {
        return $this->belongsTo(GameSession::class);
    }
}
