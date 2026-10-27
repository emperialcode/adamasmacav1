import { describe, expect, it } from 'vitest';
import { BASE_POINTS, LETTERS, guess, normalizeLetter, scoreFor, toView, useHint, type PrivateGame } from './engine';

const fresh = (word = 'İNCİR'): PrivateGame => ({
  id: 'test', word, hint: 'Meyve', description: 'Açıklama', category: 'Yiyecekler',
  difficulty: 'medium', guessed: [], wrong: 0, hintUsed: false, status: 'playing',
});

describe('Türkçe oyun motoru', () => {
  it('29 ayrı Türkçe harf kullanır', () => expect(new Set(LETTERS).size).toBe(29));
  it('i ve ı ayrımını korur', () => {
    expect(normalizeLetter('i')).toBe('İ');
    expect(normalizeLetter('ı')).toBe('I');
    expect(normalizeLetter('I')).toBe('I');
    expect(normalizeLetter('İ')).toBe('İ');
    expect(normalizeLetter('ş')).toBe('Ş');
    expect(normalizeLetter('1')).toBeNull();
    expect(normalizeLetter('ii')).toBeNull();
  });
  it('tüm tekrarlı harfleri birlikte açar', () => {
    const result = guess(fresh('ANANAS'), 'a');
    expect(toView(result).masked).toEqual(['A', '', 'A', '', 'A', '']);
    expect(result.wrong).toBe(0);
  });
  it('tekrar tahmini cezalandırmaz', () => {
    const once = guess(fresh(), 'z');
    expect(guess(once, 'z')).toBe(once);
    expect(once.wrong).toBe(1);
  });
  it('altıncı hatada kaybettirir ve cevabı açıklarken puan vermez', () => {
    let game = fresh('İNCİR');
    for (const letter of ['A','B','D','F','G','H']) game = guess(game, letter);
    expect(game.status).toBe('lost');
    expect(toView(game).answer).toBe('İNCİR');
    expect(toView(game).score).toBe(0);
    expect(guess(game,'İ')).toBe(game);
  });
  it('kazanınca puanı hesaplar', () => {
    let game = fresh('İNCİR');
    for (const letter of ['İ','N','C','R']) game = guess(game, letter);
    expect(game.status).toBe('won');
    expect(toView(game).score).toBe(BASE_POINTS.medium);
  });
  it('ipucu yalnız bir kez uygulanır', () => {
    const game = useHint(fresh());
    expect(useHint(game)).toBe(game);
    expect(toView(game).hint).toBe('Meyve');
    expect(scoreFor('medium', 2, true)).toBe(80);
  });
  it('aktif oyunun cevabı istemci görünümünde bulunmaz', () => {
    expect(toView(fresh()).answer).toBeUndefined();
    expect(toView(fresh()).hint).toBeUndefined();
  });
});
