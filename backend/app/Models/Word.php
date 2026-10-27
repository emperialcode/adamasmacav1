<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Word extends Model
{
    protected $fillable = [
        'category_id', 'word', 'difficulty', 'hint', 'description', 'locale', 'status', 'is_child_safe',
    ];

    protected function casts(): array
    {
        return ['is_child_safe' => 'boolean'];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
