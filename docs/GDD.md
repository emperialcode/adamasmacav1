# Adam Asmaca V1 — Ürün ve mühendislik kararları

- Tasarım: Modern Klasik; koyu lacivert, mavi, Inter, mobile-first, erişilebilir.
- V1 kapsamı: Türkçe, tek oyunculu, klasik oyun; misafir oynayabilir.
- 6 yanlış tahmin, tek ücretsiz ipucu (-30 puan), süre sınırı yok.
- Doğru harf kelimedeki tüm eşleşmeleri açar; tekrar seçim cezasızdır.
- İzin verilen 29 harf: ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ; Türkçe I ve İ farklıdır.
- Puan yalnızca kazanınca: max(0, temel - yanlış*20 - ipucu*30).
- Kolay 100, orta 150, zor 220 temel puan.
- Oyun devam ederken kurallar dondurulur (snapshot).
- Gizli kelime ve puan hesaplaması sunucuda kalmalıdır. Frontend demo bir ürün doğrulama modudur.
- Yönetim V1 Sprint 02: parola korumalı kelime/kategori CRUD, yayın onayı, csv import, ayar değişikliği, audit.
- Sprint 01: kategori + tur + harf tahmini + ipucu + sonuç; API, frontend, seed ve test.
- Sprint 02: yönetim paneli ve gerçek içerik iş akışı. Demo kelimeleri üretim ortamında kullanılmamalıdır.
- V2: günlük kelime, sıralama, hesap, çoklu dil, rekabet modları.
- Tekrar önleme: V1 demo aynı kelimeyi art arda seçmemeye çalışır; 30 günlük sunucu seviyesinde oyuncu bazlı engelleme gelecek aşamadır.
- Güvenlik: API'de tur erişim anahtarı, idempotent harf tahmini, satır kilidi, hız sınırlama. Misafir token sadece oyun erişimi içindir.
- Admin yönetimi henüz etkin değildir; korumasız CRUD endpoint yayımlanamaz.

## Öngörülen API

- GET /api/v1/categories
- POST /api/v1/games
- GET /api/v1/games/{uuid}
- POST /api/v1/games/{uuid}/guesses
- POST /api/v1/games/{uuid}/hint

Oyun oluşturma dışında tur istekleri \`X-Game-Token\` başlığı gerektirir.

## Kabul testleri

1. 29 Türkçe harf doğru normalize olur, I/İ ayrı kalır.
2. Aynı harf ve aynı \`request_id\` tekrarında hak kaybı olmaz.
3. 6 hatada kaybedilir; doğru kelime yalnız biten oyunlarda açıklanır.
4. İpucu ancak bir kere puan kesintisi uygular.
5. Sayfa yenileme turu devam ettirir.
6. API başka tur anahtarıyla veri vermez.
7. Mobil görünüm yatay taşma yapmaz.
