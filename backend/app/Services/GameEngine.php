<?php

namespace App\Services;

use App\Models\GameSession;
use App\Models\Guess;
use App\Models\Word;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class GameEngine
{
    public function start(?int $categoryId, string $difficulty): array
    {
        $query = Word::query()
            ->with('category')
            ->whereHas('category', fn ($query) => $query->where('is_active', true))
            ->where('status', 'published')
            ->where('is_child_safe', true)
            ->where('locale', 'tr')
            ->where('difficulty', $difficulty);

        if ($categoryId !== null) {
            $query->where('category_id', $categoryId);
        }

        $word = $query->inRandomOrder()->first();

        if (! $word) {
            throw ValidationException::withMessages([
                'category_id' => ['Bu kategori ve zorluk için yayımlanmış kelime bulunamadı.'],
            ]);
        }

        $plainToken = bin2hex(random_bytes(32));
        $game = GameSession::create([
            'public_id' => (string) Str::uuid(),
            'access_token_hash' => hash('sha256', $plainToken),
            'word_id' => $word->id,
            'category_id' => $word->category_id,
            'difficulty' => $difficulty,
            'guessed_letters' => [],
            'wrong_guesses' => 0,
            'hint_used' => false,
            'score' => 0,
            'status' => 'playing',
            'rule_snapshot' => [
                'max_wrong' => (int) config('game.max_wrong', 6),
                'wrong_penalty' => (int) config('game.wrong_penalty', 20),
                'hint_penalty' => (int) config('game.hint_penalty', 30),
                'base_points' => (array) config('game.base_points', []),
            ],
            'started_at' => now(),
        ]);

        $game->setRelation('word', $word);

        return ['data' => $this->view($game), 'access_token' => $plainToken];
    }

    public function show(string $publicId, ?string $token): array
    {
        return $this->view($this->authenticatedGame($publicId, $token));
    }

    public function guess(string $publicId, ?string $token, string $input, string $requestId): array
    {
        $letter = $this->normalizeLetter($input);

        return DB::transaction(function () use ($publicId, $token, $letter, $requestId): array {
            $game = $this->authenticatedGame($publicId, $token, true);

            if ($game->status !== 'playing') {
                return $this->view($game);
            }

            // Both request-id and letter replay are idempotent.
            $guessed = $game->guessed_letters ?? [];
            if (in_array($letter, $guessed, true)
                || Guess::query()->where('game_session_id', $game->id)->where('request_id', $requestId)->exists()) {
                return $this->view($game);
            }

            $word = $game->word->word;
            $correct = str_contains($word, $letter);
            $guessed[] = $letter;
            $game->guessed_letters = $guessed;
            $game->wrong_guesses += $correct ? 0 : 1;

            $rules = $game->rule_snapshot;
            $maxWrong = (int) $rules['max_wrong'];
            if ($game->wrong_guesses >= $maxWrong) {
                $game->status = 'lost';
                $game->finished_at = now();
            } elseif ($this->allLettersGuessed($word, $guessed)) {
                $game->status = 'won';
                $game->score = max(0,
                    (int) $rules['base_points'][$game->difficulty]
                    - $game->wrong_guesses * (int) $rules['wrong_penalty']
                    - ($game->hint_used ? (int) $rules['hint_penalty'] : 0)
                );
                $game->finished_at = now();
            }

            $game->save();

            Guess::create([
                'game_session_id' => $game->id,
                'letter' => $letter,
                'request_id' => $requestId,
                'was_correct' => $correct,
            ]);

            return $this->view($game);
        }, 3);
    }

    public function hint(string $publicId, ?string $token): array
    {
        return DB::transaction(function () use ($publicId, $token): array {
            $game = $this->authenticatedGame($publicId, $token, true);
            if ($game->status === 'playing' && ! $game->hint_used) {
                $game->hint_used = true;
                $game->save();
            }

            return $this->view($game);
        }, 3);
    }

    private function authenticatedGame(string $publicId, ?string $token, bool $lock = false): GameSession
    {
        $query = GameSession::query()->with('word.category')->where('public_id', $publicId);
        $game = ($lock ? $query->lockForUpdate() : $query)->firstOrFail();

        if (! $token || ! hash_equals($game->access_token_hash, hash('sha256', $token))) {
            abort(404);
        }

        return $game;
    }

    private function normalizeLetter(string $input): string
    {
        // mb_strtoupper alone maps lowercase Turkish i to I, so preserve the distinction first.
        $letter = mb_strtoupper(str_replace(['i', 'ı'], ['İ', 'I'], trim($input)), 'UTF-8');

        if (mb_strlen($letter, 'UTF-8') !== 1 || preg_match('/^[A-ZÇĞİÖŞÜ]$/u', $letter) !== 1) {
            throw ValidationException::withMessages(['letter' => ['Geçerli bir Türkçe harf seçin.']]);
        }

        return $letter;
    }

    private function allLettersGuessed(string $word, array $guessed): bool
    {
        foreach ($this->letters($word) as $letter) {
            if (! in_array($letter, $guessed, true)) {
                return false;
            }
        }

        return true;
    }

    private function letters(string $word): array
    {
        return preg_split('//u', $word, -1, PREG_SPLIT_NO_EMPTY) ?: [];
    }

    private function view(GameSession $game): array
    {
        $game->loadMissing('word.category');
        $word = $game->word;
        $guessed = $game->guessed_letters ?? [];
        $masked = array_map(
            fn (string $letter): string => in_array($letter, $guessed, true) ? $letter : '',
            $this->letters($word->word),
        );

        $result = [
            'id' => $game->public_id,
            'category' => $word->category->name,
            'difficulty' => $game->difficulty,
            'masked' => $masked,
            'guessed' => $guessed,
            'wrong' => $game->wrong_guesses,
            'max_wrong' => (int) $game->rule_snapshot['max_wrong'],
            'hint_used' => $game->hint_used,
            'status' => $game->status,
            'score' => $game->status === 'won' ? $game->score : 0,
        ];

        if ($game->hint_used) {
            $result['hint'] = $word->hint;
        }

        if ($game->status !== 'playing') {
            $result['answer'] = $word->word;
            $result['description'] = $word->description;
        }

        return $result;
    }
}
