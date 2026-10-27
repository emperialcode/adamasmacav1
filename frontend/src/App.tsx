import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, ChartColumn, Check, ChevronRight, CircleHelp, Heart, Lightbulb, RotateCcw, Settings, Sparkles, Trophy, X } from 'lucide-react';
import { categories as offlineCategories } from './words';
import { demoMode, games, type Category } from './api';
import { LETTERS, normalizeLetter, type Difficulty, type GameView } from './engine';

type Screen = 'home' | 'game' | 'stats' | 'rules';
type PlayerStats = { played: number; won: number; points: number; best: number };
const STATS_KEY = 'adamasmaca-stats-v1';
const RECORDED_KEY = 'adamasmaca-recorded-games-v1';
const levelNames: Record<Difficulty,string> = {easy:'Kolay',medium:'Orta',hard:'Zor'};
const scoreBases: Record<Difficulty,number> = {easy:100,medium:150,hard:220};

function getStats(): PlayerStats {
  try {
    const data = JSON.parse(localStorage.getItem(STATS_KEY) || 'null') as PlayerStats | null;
    return data && typeof data.played === 'number' ? data : {played:0,won:0,points:0,best:0};
  } catch {return {played:0,won:0,points:0,best:0};}
}

function Hangman({wrong}:{wrong:number}) {
  const body = [
    <circle key="head" cx="150" cy="79" r="19" />,
    <path key="torso" d="M150 98V147" />,
    <path key="arm-left" d="M150 109L123 133" />,
    <path key="arm-right" d="M150 109L177 133" />,
    <path key="leg-left" d="M150 147L128 176" />,
    <path key="leg-right" d="M150 147L172 176" />,
  ];
  return (
    <svg className="hangman" viewBox="0 0 300 210" role="img" aria-label={'Adam asmaca çizimi, ' + wrong + ' / 6 hata'}>
      <path className="gallows" d="M55 191H206M92 191V22H150V58" />
      {body.map((part, index) => <g key={index} className={index < wrong ? 'body-part visible' : 'body-part'}>{part}</g>)}
    </svg>
  );
}

function recordResult(view: GameView, update:(stats:PlayerStats)=>void) {
  if (view.status === 'playing') return;
  let recorded: string[] = [];
  try {recorded = JSON.parse(localStorage.getItem(RECORDED_KEY) || '[]');} catch {recorded=[];}
  if (recorded.includes(view.id)) return;
  localStorage.setItem(RECORDED_KEY, JSON.stringify([...recorded,view.id].slice(-200)));
  const stats = getStats();
  stats.played += 1;
  if (view.status === 'won') {stats.won += 1; stats.points += view.score; stats.best = Math.max(stats.best,view.score);}
  localStorage.setItem(STATS_KEY,JSON.stringify(stats));
  update({...stats});
}

export default function App() {
  const [screen,setScreen] = useState<Screen>('home');
  const [selectedCategory,setSelectedCategory] = useState(0);
  const [difficulty,setDifficulty] = useState<Difficulty>('easy');
  const [categoryList,setCategoryList] = useState<Category[]>([...offlineCategories]);
  const [game,setGame] = useState<GameView | null>(null);
  const [stats,setStats] = useState<PlayerStats>(getStats);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');

  useEffect(() => {
    games.categories().then(setCategoryList).catch(() => setError('Kategoriler şu anda yüklenemedi.'));
    games.restore().then(restored => {if (restored) {setGame(restored);setScreen('game');}}).catch(()=>{});
  }, []);

  const start = useCallback(async () => {
    if (busy) return;
    setBusy(true); setError('');
    try {const next = await games.start(selectedCategory,difficulty);setGame(next);setScreen('game');}
    catch (e) {setError(e instanceof Error ? e.message : 'Yeni oyun başlatılamadı.');}
    finally {setBusy(false);}
  }, [busy,selectedCategory,difficulty]);

  const submitLetter = useCallback(async (input:string) => {
    if (!game || game.status!=='playing' || busy) return;
    const letter = normalizeLetter(input);
    if (!letter || game.guessed.includes(letter)) return;
    setBusy(true);setError('');
    try {
      const next = await games.guess(game.id,letter);
      setGame(next);recordResult(next,setStats);
    } catch (e) {setError(e instanceof Error ? e.message : 'Tahmin gönderilemedi.');}
    finally {setBusy(false);}
  }, [game,busy]);

  useEffect(() => {
    if (screen !== 'game' || !game || game.status !== 'playing') return;
    const onKey = (event:KeyboardEvent) => {
      if (event.ctrlKey || event.altKey || event.metaKey || event.repeat || event.key.length !== 1) return;
      const letter = normalizeLetter(event.key);
      if (letter) {event.preventDefault(); void submitLetter(letter);}
    };
    window.addEventListener('keydown',onKey);
    return () => window.removeEventListener('keydown',onKey);
  }, [screen,game,submitLetter]);

  const hint = async () => {
    if (!game || game.status !== 'playing' || game.hintUsed || busy) return;
    setBusy(true);setError('');
    try {setGame(await games.hint(game.id));}
    catch (e) {setError(e instanceof Error ? e.message : 'İpucu yüklenemedi.');}
    finally {setBusy(false);}
  };

  const goHome = () => {setScreen('home');setError('');};

  return <div className="app-shell">
    <header className="topbar content-width">
      <button className="brand" onClick={goHome} aria-label="Adam Asmaca ana sayfası">
        <span className="brand-mark"><span>A</span></span>
        <span>ADAM<span className="brand-accent">ASMACA</span><small>MODERN KLASİK</small></span>
      </button>
      <nav className="top-actions" aria-label="Üst menü">
        <button className="icon-button" aria-label="İstatistikler" title="İstatistikler" onClick={()=>setScreen('stats')}><ChartColumn size={19}/></button>
        <button className="icon-button" aria-label="Nasıl oynanır" title="Nasıl oynanır" onClick={()=>setScreen('rules')}><CircleHelp size={19}/></button>
      </nav>
    </header>

    <main className="content-width">
      {error && <div className="error" role="alert">{error}<button aria-label="Uyarıyı kapat" onClick={()=>setError('')}><X size={16}/></button></div>}

      {screen === 'home' && <div className="home-view">
        <div className="eyebrow"><span className="eyebrow-dot"/> TÜRKÇE KELİME OYUNU</div>
        <h1>Bir harf.<br/><em>Altı hak.</em><br/>Sonsuz eğlence.</h1>
        <p className="hero-copy">Kelimeleri keşfet, bilgini sınayıp puan topla. Her tahmin yeni bir heyecan.</p>
        <div className="hero-summary">
          <div><Sparkles size={16}/><span>6 tahmin hakkı</span></div>
          <div><Trophy size={16}/><span>{stats.points.toLocaleString('tr-TR')} puan</span></div>
        </div>
        <div className="selection-panel">
          <div className="panel-head"><div><span className="section-kicker">01 / HAZIRLAN</span><h2>Kategorini seç</h2></div><span className="muted-note">{categoryList.length} kategori</span></div>
          <div className="categories">
            <button className={'category-card ' + (selectedCategory===0?'selected':'')} onClick={()=>setSelectedCategory(0)} aria-pressed={selectedCategory===0}><span className="category-emoji">✦</span><span>Karışık</span>{selectedCategory===0&&<Check size={15}/>}</button>
            {categoryList.map(category=><button key={category.id} className={'category-card ' + (selectedCategory===category.id?'selected':'')} onClick={()=>setSelectedCategory(category.id)} aria-pressed={selectedCategory===category.id}><span className="category-emoji">{category.symbol || '◆'}</span><span>{category.name}</span>{selectedCategory===category.id&&<Check size={15}/>}</button>)}
          </div>
          <div className="section-divider"/>
          <div className="panel-head"><div><span className="section-kicker">02 / SEVİYENİ BELİRLE</span><h2>Zorluk seviyesi</h2></div></div>
          <div className="levels">{(['easy','medium','hard'] as const).map(l=><button key={l} className={'level '+(difficulty===l?'active':'')} aria-pressed={difficulty===l} onClick={()=>setDifficulty(l)}><span>{levelNames[l]}</span><small>{scoreBases[l]} PUAN</small></button>)}</div>
          <button className="primary-button start-button" disabled={busy} onClick={()=>void start()}>{busy?'Hazırlanıyor...':'OYUNA BAŞLA'}<ArrowRight size={19}/></button>
        </div>
        {demoMode&&<p className="demo-note">Şu anda yerel demo modundasın. Gerçek puan güvenliği için backend API kurulmalıdır.</p>}
      </div>}

      {screen === 'game' && game && <div className="game-view">
        <div className="game-toolbar">
          <button className="back-button" onClick={goHome}><ArrowLeft size={17}/> Ana sayfa</button>
          <div className="round-badge">{game.category} <span className="mini-separator">/</span> {levelNames[game.difficulty]}</div>
        </div>
        <div className="game-board">
          <div className="game-board-top"><div><span className="section-kicker">KELİMEYİ TAHMİN ET</span><h2>{game.status==='playing'?'Sıradaki harf senin!':game.status==='won'?'Harika, bildin!':'Bu tur olmadı'}</h2></div><div className="rights"><Heart size={18}/><b>{game.maxWrong-game.wrong}</b><span>hak</span></div></div>
          <div className="art-panel">
            <Hangman wrong={game.wrong}/>
            <div className="progress-row" aria-label={'Kalan hak: '+(game.maxWrong-game.wrong)}>
              {Array.from({length:game.maxWrong},(_,i)=><div key={i} className={'progress-segment '+(i<game.wrong?'used':'')}/>)}
            </div>
            <div className="mistake-caption">{game.wrong} / {game.maxWrong} yanlış tahmin</div>
          </div>
          <div className="word-group" aria-label="Tahmin edilen kelime">{game.masked.map((letter,i)=><div key={i} className={'letter-slot '+(letter?'revealed':'')}><span>{letter || '\u00a0'}</span></div>)}</div>
          <div className="word-meta"><span>{game.masked.length} harf</span><span className="meta-dot">·</span><span>{game.category}</span></div>
          {game.hintUsed&&<p className="hint-reveal"><Lightbulb size={16}/>{game.hint}</p>}
          {game.status==='playing' ? <>
            <div className="keypad-heading"><span>Bir harf seç</span><button disabled={busy || game.hintUsed} onClick={()=>void hint()} className="hint-button"><Lightbulb size={15}/>{game.hintUsed?'İpucu kullanıldı':'İpucu (−30)'}</button></div>
            <div className="keyboard" aria-label="Türkçe harf klavyesi">{LETTERS.map(letter => {
              const used=game.guessed.includes(letter);
              const correct=used&&game.masked.includes(letter);
              return <button key={letter} className={'key '+(used ? (correct?'key-correct':'key-wrong') : '')} disabled={busy || used} onClick={()=>void submitLetter(letter)} aria-label={letter+' harfini seç'}>{letter}</button>;
            })}</div>
          </> : <div className={'result-card '+(game.status==='won'?'success':'failure')} role="status">
            <div className="result-icon">{game.status==='won'?<Trophy size={29}/>:<RotateCcw size={26}/>}</div>
            <h3>{game.status==='won'?'Tebrikler!':'Bir dahaki sefere!'}</h3>
            <p>Doğru kelime: <strong>{game.answer}</strong></p>
            {game.description&&<p className="result-definition">{game.description}</p>}
            <div className="result-score">+{game.score} <span>PUAN</span></div>
            <button className="primary-button" onClick={()=>void start()} disabled={busy}>YENİ KELİME <ChevronRight size={19}/></button>
          </div>}
        </div>
        <div className="game-footnote"><Settings size={15}/> Her yanlış tahmin bir hak eksiltir. İyi düşün, sonra seç.</div>
      </div>}

      {screen === 'stats' && <div className="info-view">
        <button className="back-button" onClick={goHome}><ArrowLeft size={17}/> Ana sayfa</button>
        <span className="section-kicker">OYUNCU İSTATİSTİKLERİ</span><h1>İlerlemeni gör.</h1>
        <p className="hero-copy">İstatistikler bu tarayıcıda tutulur. Üyelik olmadan başka cihazla senkronize edilmez.</p>
        <div className="stats-grid">{[
          {value:stats.played,label:'Toplam oyun'}, {value:stats.won,label:'Kazanılan oyun'},
          {value:stats.played?Math.round(stats.won/stats.played*100)+'%':'0%',label:'Kazanma oranı'},
          {value:stats.points.toLocaleString('tr-TR'),label:'Toplam puan'}, {value:stats.best,label:'En iyi tur'},
        ].map(item=><div className="stat-tile" key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>
        <button className="primary-button" onClick={goHome}>YENİ OYUN <ArrowRight size={18}/></button>
      </div>}

      {screen === 'rules' && <div className="info-view">
        <button className="back-button" onClick={goHome}><ArrowLeft size={17}/> Ana sayfa</button>
        <span className="section-kicker">OYUN REHBERİ</span><h1>Nasıl oynanır?</h1>
        <div className="rules-list">{[
          ['Kategorini seç','Hayvanlar, Doğa, Şehirler ve daha fazlasından bir kelime gelir.'],
          ['Harfleri bul','Türkçe klavyedeki harflere tıkla veya fiziksel klavyeyi kullan.'],
          ['Altı hakkın var','Yanlış harf bir hak götürür; tekrar seçilen harf ceza vermez.'],
          ['Bir ipucun var','İpucu tur başına bir kez açılır ve 30 puan düşürür.'],
          ['Puan topla','Kazandığında seviyeye ve yanlış tahminlerine göre puan alırsın.']
        ].map(([title,detail],i)=><div className="rule" key={title}><span>{String(i+1).padStart(2,'0')}</span><div><h3>{title}</h3><p>{detail}</p></div></div>)}</div>
        <button className="primary-button" onClick={goHome}><BookOpen size={18}/> OYUNA DÖN <ArrowRight size={18}/></button>
      </div>}
    </main>
    <footer className="footer content-width"><span>© Adam Asmaca <span className="footer-dot">·</span> Modern Klasik</span><span>Türkçe kelime oyunu <span className="footer-dot">·</span> V1</span></footer>
  </div>;
}
