<?php

namespace App\Http\Controllers\Api;

use App\Models\Category;
use App\Services\GameEngine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Validation\Rule;

class GameController extends Controller
{
    public function categories(): JsonResponse
    {
        return response()->json([
            'data' => Category::query()->where('is_active', true)
                ->orderBy('sort_order')->orderBy('name')
                ->get(['id', 'name', 'symbol']),
        ]);
    }

    public function store(Request $request, GameEngine $engine): JsonResponse
    {
        $values = $request->validate([
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'difficulty' => ['required', Rule::in(['easy', 'medium', 'hard'])],
        ]);

        return response()->json($engine->start(
            isset($values['category_id']) ? (int) $values['category_id'] : null,
            $values['difficulty'],
        ), 201);
    }

    public function show(string $game, Request $request, GameEngine $engine): JsonResponse
    {
        return response()->json([
            'data' => $engine->show($game, $request->header('X-Game-Token')),
        ]);
    }

    public function guess(string $game, Request $request, GameEngine $engine): JsonResponse
    {
        $values = $request->validate([
            'letter' => ['required', 'string', 'max:4'],
            'request_id' => ['required', 'uuid'],
        ]);

        return response()->json([
            'data' => $engine->guess(
                $game,
                $request->header('X-Game-Token'),
                $values['letter'],
                $values['request_id'],
            ),
        ]);
    }

    public function hint(string $game, Request $request, GameEngine $engine): JsonResponse
    {
        return response()->json([
            'data' => $engine->hint($game, $request->header('X-Game-Token')),
        ]);
    }
}
