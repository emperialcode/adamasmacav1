<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Word;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['slug' => 'hayvanlar', 'name' => 'Hayvanlar', 'symbol' => '🐢'],
            ['slug' => 'doga', 'name' => 'Doğa', 'symbol' => '🌿'],
            ['slug' => 'sehirler', 'name' => 'Şehirler', 'symbol' => '🏙️'],
            ['slug' => 'bilim', 'name' => 'Bilim', 'symbol' => '🔭'],
            ['slug' => 'yiyecekler', 'name' => 'Yiyecekler', 'symbol' => '🍉'],
            ['slug' => 'nesneler', 'name' => 'Nesneler', 'symbol' => '🧩'],
        ];

        foreach ($categories as $position => $category) {
            Category::updateOrCreate(['slug' => $category['slug']], [
                'name' => $category['name'],
                'symbol' => $category['symbol'],
                'sort_order' => $position,
                'is_active' => true,
            ]);
        }

        // Curated starter content only. An admin/editor review flow comes in Sprint 02.
        $entries = [
            ['hayvanlar', 'KEDİ', 'easy', 'Miyavlayan evcil bir hayvan.'],
            ['hayvanlar', 'KÖPEK', 'easy', 'Sadık bir evcil dost.'],
            ['hayvanlar', 'KAPLUMBAĞA', 'medium', 'Sırtında kabuk taşıyan canlı.'],
            ['hayvanlar', 'BUKALEMUN', 'hard', 'Bazı türleri renk değiştirebilir.'],
            ['doga', 'DENİZ', 'easy', 'Tuzlu su kütlesi.'],
            ['doga', 'ORMAN', 'easy', 'Ağaçlarla kaplı geniş bir alan.'],
            ['doga', 'ŞELALE', 'medium', 'Yüksekten dökülen su.'],
            ['doga', 'BUZUL', 'hard', 'Uzun yıllarda biriken büyük buz kütlesi.'],
            ['sehirler', 'VAN', 'easy', 'Doğuda gölüyle ünlü il.'],
            ['sehirler', 'İZMİR', 'easy', 'Ege Bölgesi’nin büyük kıyı şehri.'],
            ['sehirler', 'İSTANBUL', 'medium', 'İki kıtaya yayılan şehir.'],
            ['sehirler', 'ÇANAKKALE', 'hard', 'Boğazı ve tarihî olaylarıyla bilinir.'],
            ['bilim', 'AY', 'easy', 'Dünya’nın doğal uydusu.'],
            ['bilim', 'ATOM', 'easy', 'Maddenin kimyasal yapı taşı.'],
            ['bilim', 'GEZEGEN', 'medium', 'Bir yıldızın çevresinde dönen gök cismi.'],
            ['bilim', 'KÜTLEÇEKİM', 'hard', 'Kütleleri birbirine çeken etkileşim.'],
            ['yiyecekler', 'ELMA', 'easy', 'Kırmızı veya yeşil olabilen meyve.'],
            ['yiyecekler', 'PEYNİR', 'easy', 'Sütten yapılan yiyecek.'],
            ['yiyecekler', 'MANTAR', 'medium', 'Yenilebilir bazı türleri vardır.'],
            ['yiyecekler', 'ENGİNAR', 'hard', 'Akdeniz mutfağında pişirilen sebze.'],
            ['nesneler', 'MASA', 'easy', 'Üzerine eşya konulan mobilya.'],
            ['nesneler', 'SAAT', 'easy', 'Zamanı gösteren araç.'],
            ['nesneler', 'PUSULA', 'medium', 'Yön bulmaya yarar.'],
            ['nesneler', 'TELESKOP', 'hard', 'Uzak gök cisimlerini gözlemlemek için.'],
        ];

        foreach ($entries as [$slug, $word, $difficulty, $hint]) {
            $categoryId = Category::where('slug', $slug)->value('id');
            Word::updateOrCreate(
                ['category_id' => $categoryId, 'locale' => 'tr', 'word' => $word],
                [
                    'difficulty' => $difficulty,
                    'hint' => $hint,
                    'description' => null,
                    'status' => 'published',
                    'is_child_safe' => true,
                ],
            );
        }
    }
}
