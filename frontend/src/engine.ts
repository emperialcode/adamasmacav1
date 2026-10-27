export type Difficulty = 'easy' | 'medium' | 'hard';
export type Status = 'playing' | 'won' | 'lost';

export const LETTERS = [...'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ'];
export const MAX_WRONG = 6;
export const BASE_POINTS: Record<Difficulty, number> = { easy: 100, medium: 150, hard: 220 };

export type PrivateGame = {
  id: string;
  word: string;
  hint: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  guessed: string[];
  wrong: number;
  hintUsed: boolean;
  status: Status;
};

export type GameView = {
  id: string;
  category: string;
  difficulty: Difficulty;
  masked: string[];
  guessed: string[];
  wrong: number;
  maxWrong: number;
  hintUsed: boolean;
  hint?: string;
  status: Status;
  score: number;
  answer?: string;
  description?: string;
};

export function normalizeLetter(input: string): string | null {
  const letter = input.trim().replace(/i/g, 'İ').replace(/ı/g, 'I').toLocaleUpperCase('tr-TR');
  return LETTERS.includes(letter) ? letter : null;
}

export function splitLetters(word: string): string[] {
  return [...word.normalize('NFC')];
}

export function scoreFor(difficulty: Difficulty, wrong: number, hintUsed: boolean): number {
  return Math.max(0, BASE_POINTS[difficulty] - wrong * 20 - (hintUsed ? 30 : 0));
}

export function maskedLetters(game: PrivateGame): string[] {
  return splitLetters(game.word).map(char => game.guessed.includes(char) ? char : '');
}

export function toView(game: PrivateGame): GameView {
  const ended = game.status !== 'playing';
  return {
    id: game.id,
    category: game.category,
    difficulty: game.difficulty,
    masked: maskedLetters(game),
    guessed: [...game.guessed],
    wrong: game.wrong,
    maxWrong: MAX_WRONG,
    hintUsed: game.hintUsed,
    ...(game.hintUsed ? { hint: game.hint } : {}),
    status: game.status,
    score: game.status === 'won' ? scoreFor(game.difficulty, game.wrong, game.hintUsed) : 0,
    ...(ended ? { answer: game.word, description: game.description } : {}),
  };
}

export function guess(game: PrivateGame, input: string): PrivateGame {
  const letter = normalizeLetter(input);
  if (!letter || game.status !== 'playing' || game.guessed.includes(letter)) return game;
  const guessed = [...game.guessed, letter];
  const wrong = game.wrong + (game.word.includes(letter) ? 0 : 1);
  const status: Status = wrong >= MAX_WRONG
    ? 'lost'
    : splitLetters(game.word).every(char => guessed.includes(char)) ? 'won' : 'playing';
  return { ...game, guessed, wrong, status };
}

export function useHint(game: PrivateGame): PrivateGame {
  return game.status === 'playing' && !game.hintUsed ? { ...game, hintUsed: true } : game;
}
