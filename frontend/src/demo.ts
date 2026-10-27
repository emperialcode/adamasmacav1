import { categories, words } from './words';
import { guess, toView, useHint, type Difficulty, type GameView, type PrivateGame } from './engine';

const SESSION = 'adamasmaca-demo-session-v1';
const RECENT = 'adamasmaca-demo-recent-v1';

function load(): PrivateGame | null {
  try {
    const stored = JSON.parse(localStorage.getItem(SESSION) || 'null') as PrivateGame | null;
    return stored && typeof stored.word === 'string' && Array.isArray(stored.guessed)
      && ['playing','won','lost'].includes(stored.status) ? stored : null;
  } catch { return null; }
}

function save(game: PrivateGame): GameView {
  localStorage.setItem(SESSION, JSON.stringify(game));
  return toView(game);
}

export const demo = {
  categories: () => categories.map(({id, name, symbol}) => ({id, name, symbol})),
  restore: (): GameView | null => {
    const game = load();
    return game?.status === 'playing' ? toView(game) : null;
  },
  start: (categoryId: number, difficulty: Difficulty): GameView => {
    const all = words.filter(w => w.difficulty === difficulty && (!categoryId || w.categoryId === categoryId));
    const recent: string[] = JSON.parse(localStorage.getItem(RECENT) || '[]');
    const pool = all.filter(w => !recent.includes(w.word));
    const candidates = pool.length ? pool : all;
    if (!candidates.length) throw new Error('Bu kategoride henüz kelime bulunamadı.');
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    localStorage.setItem(RECENT, JSON.stringify([...recent, chosen.word].slice(-10)));
    return save({
      id: crypto.randomUUID(), word: chosen.word, hint: chosen.hint, description: chosen.description,
      category: categories.find(c => c.id === chosen.categoryId)?.name || 'Karışık',
      difficulty, guessed: [], wrong: 0, hintUsed: false, status: 'playing',
    });
  },
  guess: (id: string, letter: string): GameView => {
    const game = load();
    if (!game || game.id !== id) throw new Error('Oyun oturumu bulunamadı.');
    return save(guess(game, letter));
  },
  hint: (id: string): GameView => {
    const game = load();
    if (!game || game.id !== id) throw new Error('Oyun oturumu bulunamadı.');
    return save(useHint(game));
  },
};
