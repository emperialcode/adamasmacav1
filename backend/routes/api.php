<?php

use App\Http\Controllers\Api\GameController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('throttle:60,1')->group(function (): void {
    Route::get('categories', [GameController::class, 'categories']);
    Route::post('games', [GameController::class, 'store']);
    Route::get('games/{game}', [GameController::class, 'show'])->whereUuid('game');
    Route::post('games/{game}/guesses', [GameController::class, 'guess'])->whereUuid('game');
    Route::post('games/{game}/hint', [GameController::class, 'hint'])->whereUuid('game');
});
