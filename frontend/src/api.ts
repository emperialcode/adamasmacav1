import type { Difficulty, GameView } from './engine';
import { demo } from './demo';

export type Category = { id: number; name: string; symbol?: string };
const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const SESSION = 'adamasmaca-server-session-v1';
export const demoMode = !base;

type ApiView = {
  id: string; category: string; difficulty: Difficulty; masked: string[]; guessed: string[];
  wrong: number; max_wrong: number; hint_used: boolean; hint?: string;
  status: GameView['status']; score: number; answer?: string; description?: string;
};

function toView(v: ApiView): GameView {
  return { id:v.id, category:v.category, difficulty:v.difficulty, masked:v.masked,
    guessed:v.guessed, wrong:v.wrong, maxWrong:v.max_wrong, hintUsed:v.hint_used,
    hint:v.hint, status:v.status, score:v.score, answer:v.answer, description:v.description };
}

async function request(path: string, method = 'GET', body?: unknown, token?: string) {
  const response = await fetch(base + path, {
    method,
    headers: { 'Accept':'application/json', 'Content-Type':'application/json', ...(token ? {'X-Game-Token':token} : {}) },
    ...(body === undefined ? {} : {body:JSON.stringify(body)}),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Sunucu isteği başarısız.');
  return json;
}

function saved(): {id:string; token:string} | null {
  try { return JSON.parse(localStorage.getItem(SESSION) || 'null'); }
  catch { return null; }
}

export const games = {
  categories: async (): Promise<Category[]> => demoMode ? demo.categories() : (await request('/categories')).data,
  restore: async (): Promise<GameView | null> => {
    if (demoMode) return demo.restore();
    const s = saved();
    if (!s) return null;
    try {
      const v = toView((await request('/games/' + encodeURIComponent(s.id), 'GET', undefined, s.token)).data);
      if (v.status !== 'playing') {localStorage.removeItem(SESSION); return null;}
      return v;
    } catch {localStorage.removeItem(SESSION); return null;}
  },
  start: async (categoryId: number, difficulty: Difficulty): Promise<GameView> => {
    if (demoMode) return demo.start(categoryId, difficulty);
    const json = await request('/games', 'POST', {category_id:categoryId || null, difficulty});
    localStorage.setItem(SESSION, JSON.stringify({id:json.data.id, token:json.access_token}));
    return toView(json.data);
  },
  guess: async (id: string, letter: string): Promise<GameView> => {
    if (demoMode) return demo.guess(id, letter);
    const s = saved();
    if (!s || s.id !== id) throw new Error('Oyun erişimi bulunamadı.');
    return toView((await request('/games/' + encodeURIComponent(id) + '/guesses','POST',{letter,request_id:crypto.randomUUID()},s.token)).data);
  },
  hint: async (id: string): Promise<GameView> => {
    if (demoMode) return demo.hint(id);
    const s = saved();
    if (!s || s.id !== id) throw new Error('Oyun erişimi bulunamadı.');
    return toView((await request('/games/' + encodeURIComponent(id) + '/hint','POST',{},s.token)).data);
  },
};
