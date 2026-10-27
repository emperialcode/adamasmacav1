<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Word;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class GameApiTest extends TestCase
{
    use RefreshDatabase;

    private function start(string $word = 'İNCİR'): array
    {
        $category = Category::create([
            'name' => 'Yiyecekler', 'slug' => 'yiyecekler', 'symbol' => '🍉',
            'is_active' => true, 'sort_order' => 0,
        ]);
        Word::create([
            'category_id' => $category->id, 'word' => $word,
            'difficulty' => 'medium', 'hint' => 'Meyve', 'description' => 'Açıklama',
            'locale' => 'tr', 'status' => 'published', 'is_child_safe' => true,
        ]);

        $response = $this->postJson('/api/v1/games', ['category_id' => $category->id, 'difficulty' => 'medium'])
            ->assertCreated()
            ->assertJsonMissing(['answer' => $word]);

        return [$response->json('data.id'), $response->json('access_token')];
    }

    private function makeGuess(string $id, string $token, string $letter, ?string $requestId = null): \Illuminate\Testing\TestResponse
    {
        return $this->withHeader('X-Game-Token', $token)->postJson(
            "/api/v1/games/{$id}/guesses",
            ['letter' => $letter, 'request_id' => $requestId ?? (string) Str::uuid()],
        );
    }

    public function test_game_hides_word_and_rejects_another_players_token(): void
    {
        [$id, $token] = $this->start();
        $this->withHeader('X-Game-Token', $token)->getJson("/api/v1/games/{$id}")
            ->assertOk()->assertJsonMissingPath('data.answer')->assertJsonPath('data.max_wrong', 6);

        $this->withHeader('X-Game-Token', str_repeat('f', 64))
            ->getJson("/api/v1/games/{$id}")->assertNotFound();
    }

    public function test_repeated_guess_and_reused_request_id_never_consume_extra_attempts(): void
    {
        [$id, $token] = $this->start();
        $requestId = (string) Str::uuid();
        $this->makeGuess($id, $token, 'A', $requestId)->assertJsonPath('data.wrong', 1);
        $this->makeGuess($id, $token, 'A')->assertJsonPath('data.wrong', 1);
        $this->makeGuess($id, $token, 'B', $requestId)->assertJsonPath('data.wrong', 1);
    }

    public function test_six_incorrect_letters_lose_and_reveal_answer(): void
    {
        [$id, $token] = $this->start();
        foreach (['A','B','D','F','G','H'] as $letter) {
            $result = $this->makeGuess($id, $token, $letter)->assertOk();
        }
        $result->assertJsonPath('data.status', 'lost')
            ->assertJsonPath('data.answer', 'İNCİR')
            ->assertJsonPath('data.score', 0);
        $this->makeGuess($id, $token, 'İ')->assertJsonPath('data.status', 'lost');
    }

    public function test_turkish_dotless_i_is_distinct_and_a_win_gets_points(): void
    {
        [$id, $token] = $this->start('İI');
        $this->makeGuess($id, $token, 'i')->assertJsonPath('data.masked.0', 'İ')
            ->assertJsonPath('data.masked.1', '');
        $this->makeGuess($id, $token, 'ı')->assertJsonPath('data.status', 'won')
            ->assertJsonPath('data.score', 150);
    }

    public function test_hint_is_idempotent_and_deducted_once(): void
    {
        [$id, $token] = $this->start('AY');
        $this->withHeader('X-Game-Token', $token)->postJson("/api/v1/games/{$id}/hint")
            ->assertOk()->assertJsonPath('data.hint', 'Meyve');
        $this->withHeader('X-Game-Token', $token)->postJson("/api/v1/games/{$id}/hint")
            ->assertJsonPath('data.hint_used', true);
        $this->makeGuess($id, $token, 'A')->assertJsonPath('data.status', 'playing');
        $this->makeGuess($id, $token, 'Y')->assertJsonPath('data.status', 'won')
            ->assertJsonPath('data.score', 120);
    }

    public function test_invalid_letter_is_rejected(): void
    {
        [$id, $token] = $this->start();
        $this->makeGuess($id, $token, '1')->assertUnprocessable()->assertJsonValidationErrors('letter');
    }
}
