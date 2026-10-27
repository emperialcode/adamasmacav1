import type { Difficulty } from './engine';

export type WordEntry = {
  word: string;
  categoryId: number;
  difficulty: Difficulty;
  hint: string;
  description: string;
};

export const categories = [
  { id: 1, name: 'Hayvanlar', symbol: '🐢' },
  { id: 2, name: 'Doğa', symbol: '🌿' },
  { id: 3, name: 'Şehirler', symbol: '🏙️' },
  { id: 4, name: 'Bilim', symbol: '🔭' },
  { id: 5, name: 'Yiyecekler', symbol: '🍉' },
  { id: 6, name: 'Nesneler', symbol: '🧩' },
] as const;

export const words: WordEntry[] = [
  { word: 'KEDİ', categoryId: 1, difficulty: 'easy', hint: 'Evlerde beslenebilen, miyavlayan canlı.', description: 'Evcil memeli hayvan.' },
  { word: 'KÖPEK', categoryId: 1, difficulty: 'easy', hint: 'Sadık bir evcil dost.', description: 'İnsanlarla birlikte yaşayan memeli.' },
  { word: 'KAPLUMBAĞA', categoryId: 1, difficulty: 'medium', hint: 'Kabuklu ve yavaş hareket eden bir canlı.', description: 'Sırtında koruyucu kabuk taşıyan sürüngen.' },
  { word: 'BUKALEMUN', categoryId: 1, difficulty: 'hard', hint: 'Bazı türleri renk değiştirebilir.', description: 'Özel gözleri ve renk uyumuyla bilinen kertenkele.' },
  { word: 'DENİZ', categoryId: 2, difficulty: 'easy', hint: 'Tuzlu su kütlesi.', description: 'Okyanusların kıyılarla çevrili bölümü.' },
  { word: 'ORMAN', categoryId: 2, difficulty: 'easy', hint: 'Ağaçların yoğun bulunduğu alan.', description: 'Doğal ağaç topluluğu.' },
  { word: 'ŞELALE', categoryId: 2, difficulty: 'medium', hint: 'Yüksekten dökülen su.', description: 'Akarsuyun ani seviye değişiminde yaptığı dökülme.' },
  { word: 'BUZUL', categoryId: 2, difficulty: 'hard', hint: 'Uzun yıllarda biriken büyük buz kütlesi.', description: 'Kar birikiminin sıkışmasıyla oluşan hareketli buz kütlesi.' },
  { word: 'VAN', categoryId: 3, difficulty: 'easy', hint: 'Türkiye’nin doğusunda, gölüyle ünlü il.', description: 'Türkiye’nin Doğu Anadolu Bölgesi’ndeki şehir.' },
  { word: 'İZMİR', categoryId: 3, difficulty: 'easy', hint: 'Ege Bölgesi’nin büyük kıyı şehri.', description: 'Ege Denizi kıyısındaki büyük şehir.' },
  { word: 'İSTANBUL', categoryId: 3, difficulty: 'medium', hint: 'İki kıtayı birleştiren şehir.', description: 'Boğaziçi’nin iki yakasına yayılan metropol.' },
  { word: 'ÇANAKKALE', categoryId: 3, difficulty: 'hard', hint: 'Bir boğaz ve tarihî savaşlarla anılır.', description: 'Marmara ve Ege arasında yer alan şehir.' },
  { word: 'AY', categoryId: 4, difficulty: 'easy', hint: 'Dünya’nın doğal uydusu.', description: 'Dünya’nın tek kalıcı doğal uydusu.' },
  { word: 'ATOM', categoryId: 4, difficulty: 'easy', hint: 'Maddenin kimyasal yapı taşı.', description: 'Kimyasal elementin özelliklerini koruyan en küçük birim.' },
  { word: 'GEZEGEN', categoryId: 4, difficulty: 'medium', hint: 'Bir yıldızın çevresinde dönebilen gök cismi.', description: 'Bir yıldızın etrafında dolanan büyük gök cismi.' },
  { word: 'KÜTLEÇEKİM', categoryId: 4, difficulty: 'hard', hint: 'Cisimleri birbirine çeken temel etkileşim.', description: 'Kütleler arasındaki çekim etkileşimi.' },
  { word: 'ELMA', categoryId: 5, difficulty: 'easy', hint: 'Çoğu zaman kırmızı veya yeşil bir meyve.', description: 'Elma ağacının yenilebilir meyvesi.' },
  { word: 'PEYNİR', categoryId: 5, difficulty: 'easy', hint: 'Sütten yapılan bir besin.', description: 'Sütün işlenmesiyle elde edilen yiyecek.' },
  { word: 'MANTAR', categoryId: 5, difficulty: 'medium', hint: 'Bazı türleri yemeklerde kullanılır.', description: 'Mantarlar alemine ait canlı; yenilebilir türleri vardır.' },
  { word: 'ENGİNAR', categoryId: 5, difficulty: 'hard', hint: 'Yaprakları ve çanağıyla pişirilen sebze.', description: 'Akdeniz mutfağında kullanılan bitki.' },
  { word: 'MASA', categoryId: 6, difficulty: 'easy', hint: 'Üzerinde yemek yenebilir veya yazı yazılabilir.', description: 'Üstü düz, ayaklı mobilya.' },
  { word: 'SAAT', categoryId: 6, difficulty: 'easy', hint: 'Zamanı gösterir.', description: 'Zaman ölçmeye yarayan araç.' },
  { word: 'PUSULA', categoryId: 6, difficulty: 'medium', hint: 'Yön bulmaya yarar.', description: 'Manyetik kuzeyi gösteren yön bulma aracı.' },
  { word: 'TELESKOP', categoryId: 6, difficulty: 'hard', hint: 'Uzaktaki gök cisimlerini gözlemlemeye yarar.', description: 'Uzak nesneleri gözlemek için kullanılan optik araç.' },
];
