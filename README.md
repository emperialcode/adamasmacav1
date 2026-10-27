# Adam Asmaca — Modern Klasik

Türkçe kelime tahmin oyunu. Mobile-first, minimal lacivert/mavi arayüz.

## Geliştirme durumu

- \`frontend/\`: React + TypeScript + Vite; hemen oynanabilen **yerel demo** ve test edilen oyun motoru.
- \`backend/\`: Laravel API, MySQL/SQLite veri modeli ve sunucu tarafında oyun doğrulama (Sprint 01).
- Henüz production yayını yapılmadı. \`main\` ile otomatik birleştirme yok.

## Yerel demo

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Aç: http://localhost:5173 — \`VITE_API_URL\` tanımlı değilken uygulama demo kelimelerini tarayıcıda kullanır. **Demo güvenli skor veya gizli kelime koruması sağlamaz** ve gerçek leaderboard için kullanılmamalıdır.

## API modunda

\`\`\`bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
mkdir -p database && touch database/database.sqlite
php artisan migrate --seed
php artisan serve
\`\`\`

Ardından frontend içinde \`cp .env.example .env\` ve \`VITE_API_URL=http://localhost:8000/api/v1\` ayarını yapın. Laravel tarafındaki .env veritabanı bağlantısı için ayarlanmalıdır. Uygulama bu modda server-side puan ve gizli kelime kontrolü kullanır.

## Kalite

\`\`\`bash
cd frontend && npm test && npm run build
cd backend && php artisan test
\`\`\`

Backend için Composer/PHP >=8.3 ve PDO SQLite veya MySQL gerekir. Henüz CI'da doğrulanmamış sürümdür.

Ayrıntılar: [GDD](docs/GDD.md).
