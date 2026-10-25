/* Ruby & Mimi's Grammar Garden — P.2 Grammar Quiz 1 revision. Vanilla JS, iPad-friendly, natural recorded voice + device voice fallback */
'use strict';

/* ---------------- helpers ---------------- */
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const $ = s => document.querySelector(s);
const LET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = t => esc(t).replace(/_{2,}/g, '<span class="blank"></span>');
/* must match the manifest builder used to make the audio clips */
const clean = s => String(s).replace(/<[^>]+>/g, '').replace(/_{2,}/g, 'blank').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{1F1E6}-\u{1F1FF}]/gu, '').replace(/✓/g, ' yes').replace(/✗/g, ' no').replace(/—/g, ',').replace(/\s+/g, ' ').trim();

const ALL = {};
TOPICS.forEach(t => { t.kind = 'unit'; ALL[t.id] = t; });

/* extra auto questions from word lists */
const WORDS = TOPICS.flatMap(u => (u.words || []).map(w => ({ w: w[0], e: w[1], ex: w[2], u: u.id })));
function listenQ(pool) {
  const x = pick(pool);
  const wrong = shuffle(pool.filter(y => y.w !== x.w)).slice(0, 3);
  return { type: 'mc', listen: x.w, text: 'Listen. Which word do you hear?', answer: `${x.e} ${x.w}`, wrong: wrong.map(y => `${y.e} ${y.w}`), explain: `${x.w}: ${x.ex}`, tag: 'Listening', topic: x.u };
}
function bank(id) {
  const t = ALL[id];
  return t.qs.map(q => ({ ...q, topic: id }));
}



/* ---------------- state ---------------- */
const STORE = 'p2gq1-v1';
let _saved = {}; try { _saved = JSON.parse(window['local' + 'Storage'].getItem(STORE) || '{}'); } catch (e) { }
const S = Object.assign({ stars: 0, best: {}, mistakes: [], sound: true, slow: false, cards: {} }, _saved);
const save = () => { try { window['local' + 'Storage'].setItem(STORE, JSON.stringify(S)); } catch (e) { } };
const STICKERS = ['🎀', '🐱', '🍓', '🌸', '🧁', '💜', '🌈', '🐰', '🍰', '⭐', '🦄', '🍭', '👛', '🌷', '🐼', '🍒', '🦋', '🍩', '🎈', '🐹', '🍦', '💖', '🧸', '👑'];
const stickerAt = i => (i + 1) * 5;

/* ---------------- sound & speech ---------------- */
let AC;
function tone(seq) { if (!S.sound) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); let t = AC.currentTime; for (const [f, d] of seq) { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.16, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d); t += d * .7; } } catch (e) { } }
const sGood = () => tone([[784, .12], [988, .12], [1319, .25]]);
const sBad = () => tone([[330, .18], [262, .25]]);
const sTap = () => tone([[660, .05]]);

let VOICE = null;
function pickVoice() {
  try {
    const vs = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
    const pref = [/premium|enhanced|natural/i, /Serena|Kate|Stephanie|Martha|Daniel/i, /Samantha|Karen|Moira|Tessa/i, /Google UK English Female|Google US English/i];
    for (const p of pref) { const v = vs.find(v => p.test(v.name) && /GB|UK/i.test(v.lang + v.name)) || vs.find(v => p.test(v.name)); if (v) { VOICE = v; return; } }
    VOICE = vs.find(v => /en-GB/i.test(v.lang)) || vs[0] || null;
  } catch (e) { }
}
const player = new Audio(); player.preload = 'auto';
let endCb = null;
function stopSay() { try { player.onended = player.onerror = null; player.pause(); } catch (e) { } try { speechSynthesis.cancel(); } catch (e) { } }
function synth(text, onend) {
  try {
    if (!('speechSynthesis' in window)) { onend && onend(); return; }
    const u = new SpeechSynthesisUtterance(clean(text).replace(/\bblank\b/g, '...'));
    u.lang = 'en-GB'; if (!VOICE) pickVoice(); if (VOICE) u.voice = VOICE;
    u.rate = S.slow ? .7 : .92;
    if (onend) { u.onend = onend; u.onerror = onend; }
    speechSynthesis.speak(u);
  } catch (e) { onend && onend(); }
}
/* say(): uses the recorded natural voice clip when available */
function say(text, onend) {
  stopSay();
  const id = AUDIO[clean(text)];
  if (id) {
    player.src = 'audio/' + id + '.mp3';
    player.playbackRate = S.slow ? .8 : 1;
    try { player.preservesPitch = true; player.webkitPreservesPitch = true; } catch (e) { }
    let fired = false; const done = () => { if (fired) return; fired = true; onend && onend(); };
    player.onended = done;
    player.onerror = () => { if (fired) return; fired = true; synth(text, onend); };
    const p = player.play(); if (p && p.catch) p.catch(() => { if (!fired) { fired = true; synth(text, onend); } });
    return;
  }
  synth(text, onend);
}

function confetti() { const fx = $('#fx'); const cols = ['#8EC9F5', '#FFB3CB', '#B8A6F0', '#9FE0C4', '#FFE08A', '#5AA9E6']; for (let i = 0; i < 28; i++) { const c = document.createElement('i'); c.className = 'conf'; c.style.left = R(0, 100) + 'vw'; c.style.background = pick(cols); c.style.animationDelay = (Math.random() * .3) + 's'; if (Math.random() < .4) c.style.borderRadius = '50%'; fx.appendChild(c); setTimeout(() => c.remove(), 1900); } }
function popText(t) { const p = document.createElement('div'); p.className = 'pop'; p.textContent = t; $('#fx').appendChild(p); setTimeout(() => p.remove(), 1000); }
function updStars(bump) { $('#starCount').textContent = S.stars; if (bump) { const p = $('#starPill'); p.classList.remove('bump'); void p.offsetWidth; p.classList.add('bump'); } }

/* ================= SCREENS ================= */
const app = $('#app');
function view(html) { stopSay(); app.innerHTML = html; window.scrollTo({ top: 0 }); }
function starsOf(id) { const b = S.best[id]; if (b == null) return '☆☆☆'; return b >= 9 ? '★★★' : b >= 7 ? '★★☆' : b >= 4 ? '★☆☆' : '☆☆☆'; }
function daysLeft() { const exam = new Date(2026, 10, 3); const now = new Date(); now.setHours(0, 0, 0, 0); return Math.round((exam - now) / 864e5); }
const card = (t, tag, sub, extra = '') => `<button class="topic-card ${t.col}" data-topic="${t.id}"><div><span class="tag">${tag}</span><h3>${t.title}</h3><p>${sub}</p></div><div class="stars">${extra || starsOf(t.id)}</div><span class="pic emo-badge">${t.emo}</span></button>`;
const CLOUDS = `<div class="sky" aria-hidden="true"><span class="c1">🎀</span><span class="c2">💜</span><span class="c3">🌸</span></div>`;
const GUIDE = { ruby: 'Ruby', mimi: 'Mimi' };

function home() {
  const d = daysLeft();
  const tcard = t => `<button class="topic-card ${t.col}" data-topic="${t.id}"><div><span class="tag">${t.tag}</span><h3>${t.title}</h3><p>${t.sub}</p></div><div class="stars">${starsOf(t.id)}</div><span class="pic guide-pic"><img src="img/${t.guide}-head.webp" alt=""></span></button>`;
  view(`
  <section class="hero">${CLOUDS}
    <div class="hero-duo bob"><img src="img/duo.webp" alt="Ruby and Mimi waving"></div>
    <div class="hero-txt">
      <p class="kicker">Grammar Quiz 1 · P.2</p>
      <h1>Ruby &amp; Mimi's Grammar Garden</h1>
      <p class="sub">Learn, play games and practise for your grammar quiz with Ruby and Mimi.</p>
      ${d > 0 ? `<div class="countdown">Grammar Quiz 1: <b>Tue 3 November</b> (Day 4) · <span>${d}</span> day${d === 1 ? '' : 's'} to go</div>` : d === 0 ? '<div class="countdown">Quiz day today. You can do it!</div>' : '<div class="countdown">Keep practising. Great job!</div>'}
      <div class="voice-note">🔈 Tap the speaker or any sentence to hear it.</div>
    </div>
  </section>
  <div class="section-title"><span class="dot"></span>1 · 2 · 3 Grammar</div>
  <div class="grid g3">${TOPICS.filter(t => !t.words).map(tcard).join('')}</div>
  <div class="section-title"><span class="dot"></span>4 · Spelling: words from P.L.E. 2A / 2B</div>
  <div class="grid g3">${TOPICS.filter(t => t.words).map(tcard).join('')}</div>
  <div class="section-title"><span class="dot"></span>Games &amp; challenges</div>
  <div class="grid g4">
    <button class="topic-card c-butter" id="mockBtn"><div><span class="tag">20 questions</span><h3>Practice quiz</h3><p>Items 1–4 mixed, like the real quiz</p></div><div class="stars">${S.best.mock != null ? 'Best: ' + S.best.mock + ' / 20' : ''}</div><span class="pic emo-badge">🏆</span></button>
    <button class="topic-card c-pink" data-g="swap"><div><span class="tag">Item 1</span><h3>Swap it!</h3><p>Change the words to me, him, her, them…</p></div><div class="stars">${gbest('swap')}</div><span class="pic emo-badge">🔄</span></button>
    <button class="topic-card c-sky" data-g="kitty"><div><span class="tag">Item 2</span><h3>Where is Kitty?</h3><p>in · on · under · behind…</p></div><div class="stars">${gbest('kitty')}</div><span class="pic emo-badge">🐱</span></button>
    <button class="topic-card c-mint" data-g="sort"><div><span class="tag">Item 2</span><h3>at · on · in</h3><p>at the bus stop, on the platform…</p></div><div class="stars">${gbest('sort')}</div><span class="pic emo-badge">🧺</span></button>
    <button class="topic-card c-peach" data-g="light"><div><span class="tag">Item 3</span><h3>Green or red?</h3><p>must or mustn't?</p></div><div class="stars">${gbest('light')}</div><span class="pic emo-badge">🚦</span></button>
    <button class="topic-card c-lav" id="spellBtn"><div><span class="tag">Item 4 · 10 words</span><h3>Spelling bee</h3><p>Listen, then spell with letter tiles</p></div><div class="stars">${S.best.spell != null ? 'Best: ' + S.best.spell + ' / 10' : ''}</div><span class="pic emo-badge">🐝</span></button>
    <button class="topic-card c-pink" id="listenBtn"><div><span class="tag">10 questions</span><h3>Listen &amp; choose</h3><p>Hear a word, pick the right one</p></div><div class="stars">${S.best.listen != null ? 'Best: ' + S.best.listen + ' / 10' : ''}</div><span class="pic emo-badge">👂</span></button>
    <button class="topic-card c-butter" id="mistakeBtn"><div><span class="tag">${S.mistakes.length} question${S.mistakes.length === 1 ? '' : 's'}</span><h3>Mistake book</h3><p>Try your mistakes again</p></div><span class="pic emo-badge">📒</span></button>
  </div>
  <p class="foot">Revision for Grammar Quiz 1 · Grammar Time Units 6, 10, 19 · Workbook 2A Units 1–2 · P.L.E. 2A Units 1–2, 2B Unit 7. Ruby and Mimi are drawn from our own two dolls.</p>`);
  app.querySelectorAll('[data-topic]').forEach(b => b.onclick = () => { sTap(); topic(b.dataset.topic); });
  app.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { sTap(); game(b.dataset.g); });
  $('#mockBtn').onclick = () => startQuiz('mock');
  $('#spellBtn').onclick = () => spelling();
  $('#listenBtn').onclick = () => startQuiz('listen');
  $('#mistakeBtn').onclick = () => S.mistakes.length ? startQuiz('mistakes') : (popText('Your mistake book is empty!'), sGood());
}
const gbest = k => S.best['g_' + k] != null ? 'Best: ' + S.best['g_' + k] + ' / ' + GAME_LEN[k] : '';

function head(t, sub) { return `<button class="back" id="bk">← Home</button><div class="topic-head"><div class="badge ${t.col}"><span class="emo-big">${t.emo}</span></div><div><p>${sub}</p><h2>${t.title}</h2></div></div>${t.hello ? `<div class="guide"><img src="img/${t.guide}-happy.webp" alt="${GUIDE[t.guide]}"><button class="bubble" id="hello"><b>${GUIDE[t.guide]}:</b> ${esc(t.hello)} <span class="spk-mini">🔈</span></button></div>` : ''}`; }

function topic(id, mode) {
  const t = ALL[id];
  if (t.kind === 'reading') return readingPage(t);
  const modes = [];
  if (t.words) modes.push(['cards', '🃏 Words', 'c-mint']);
  if (t.learn) modes.push(['learn', '💡 Learn', 'c-butter']);
  if (t.game) modes.push(['g:' + t.game[0], t.game[1], 'c-sky']);
  if (t.game2) modes.push(['g:' + t.game2[0], t.game2[1], 'c-mint']);
  if (t.words) modes.push(['spell', '🐝 Spell', 'c-lav']);
  modes.push(['quiz', '✏️ Quiz', 'c-pink']);
  mode = mode || modes[0][0];
  view(`${head(t, t.tag)}
  <div class="mode-row" style="--n:${modes.length}">${modes.map(([k, l, c]) => `<button class="mode-btn ${c} ${mode === k ? 'on' : ''}" data-m="${k}">${l}</button>`).join('')}</div>
  <div id="tbody"></div>`);
  $('#bk').onclick = home;
  app.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { sTap(); const m = b.dataset.m; m === 'quiz' ? startQuiz(id) : m === 'spell' ? spelling(id) : m.startsWith('g:') ? game(m.slice(2), id) : topic(id, m); });
  if ($('#hello')) $('#hello').onclick = () => say(t.hello);
  const body = $('#tbody');
  if (mode === 'cards') cardMode(t, body);
  else learnMode(t, body);
}

function learnMode(t, body) {
  body.innerHTML = t.learn.map((c, i) => `<div class="learn-card"><h4><span class="n">${i + 1}</span>${c[0]}</h4><div class="lc">${c[1]}</div></div>`).join('') +
    `<p class="reader-tip center">Tip: tap any example sentence to hear it.</p><div class="center"><button class="pill next" id="goQ">I'm ready, start the quiz →</button></div>`;
  body.querySelectorAll('.lc .eg').forEach(eg => {
    // split examples into tappable sentences
    eg.innerHTML = eg.innerHTML.split(/<br\s*\/?>/).map(line => line.split('·').map(s => s.trim()).filter(Boolean).map(s => `<span class="tap">${s}</span>`).join(' · ')).join('<br>');
  });
  if (t.game) body.insertAdjacentHTML('beforeend', `<div class="center"><button class="pill c-sky" id="goG">Play ${t.game[1]} →</button></div>`);
  if ($('#goG')) $('#goG').onclick = () => game(t.game[0], t.id);
  body.querySelectorAll('.tap, .lc td, .preps > div').forEach(el => el.onclick = () => { body.querySelectorAll('.on').forEach(x => x.classList.remove('on')); el.classList.add('on'); say(el.textContent.replace(/^[A-B]:\s*/, '')); });
  $('#goQ').onclick = () => startQuiz(t.id);
}

/* ---- Read with highlight ---- */
function readerHTML(blocks) {
  let k = 0; const segs = [];
  const html = blocks.map(b => `<div class="ptext ${/Poem/.test(b.type || '') ? 'poem' : ''}">
    <div class="ptype">${b.type || ''}</div><h3>${esc(b.title)}${b.sub ? `<small>${esc(b.sub)}</small>` : ''}</h3>
    ${b.lines.map(s => { segs.push(s); return `<p class="pl"><span class="seg" data-k="${k++}">${esc(s)}</span></p>`; }).join('')}</div>`).join('');
  return { html, segs };
}
function wireReader(root, segs) {
  let playing = false;
  const hl = i => root.querySelectorAll('.seg').forEach(e => e.classList.toggle('on', +e.dataset.k === i));
  const playFrom = i => { if (!playing || i >= segs.length) { playing = false; hl(-1); return; } hl(i); const el = root.querySelector(`.seg[data-k="${i}"]`); el && el.scrollIntoView({ behavior: 'smooth', block: 'center' }); say(segs[i], () => setTimeout(() => playFrom(i + 1), 300)); };
  root.querySelectorAll('.seg').forEach(e => e.onclick = () => { playing = false; const i = +e.dataset.k; hl(i); say(segs[i], () => { if (!playing) hl(-1); }); });
  $('#playAll').onclick = () => { playing = true; playFrom(0); };
  $('#stopAll').onclick = () => { playing = false; stopSay(); hl(-1); };
  const sb = $('#slowBtn'); if (sb) sb.onclick = () => { S.slow = !S.slow; save(); sb.textContent = S.slow ? '🐢 Slow' : '🐇 Normal'; };
}
const readerBar = () => `<div class="reader-bar"><button class="pill next" id="playAll">▶ Read all</button><button class="pill" id="stopAll">■ Stop</button><button class="pill" id="slowBtn">${S.slow ? '🐢 Slow' : '🐇 Normal'}</button></div>`;
function textMode(t, body) {
  const { html, segs } = readerHTML(t.texts);
  body.innerHTML = `<div class="reader">${readerBar()}<p class="reader-tip">Tap a sentence to hear it. Tap <b>Read all</b> to listen to everything.</p>${html}</div>
  <div class="center"><button class="pill next" id="goC">Next: word cards →</button></div>`;
  wireReader(body, segs);
  $('#goC').onclick = () => topic(t.id, 'cards');
}

/* ---- Word cards ---- */
function cardMode(t, body) {
  const ws = t.words; let i = 0, flipped = false;
  const known = S.cards[t.id] = S.cards[t.id] || [];
  const draw = () => {
    const [w, e, ex] = ws[i];
    body.innerHTML = `<div class="cards">
      <div class="card-top"><span class="cnt">${i + 1} / ${ws.length} · I know ${known.length}</span></div>
      <button class="flash ${flipped ? 'flip' : ''}" id="flash" aria-label="Flip the card">
        <div class="face front"><div class="femo">${e}</div><div class="fw">${esc(w)}</div><div class="ftip">Tap to flip</div></div>
        <div class="face back"><div class="femo sm">${e}</div><div class="fw sm">${esc(w)}</div><div class="fm">${esc(ex).replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), m => `<span class="hl">${m}</span>`)}</div></div>
      </button>
      <div class="card-ctrl">
        <button class="pill" id="prev">◀ Back</button>
        <button class="pill c-sky" id="hear">🔈 Hear</button>
        <button class="pill ${known.includes(w) ? 'c-mint' : ''}" id="know">${known.includes(w) ? '✓ I know it' : 'I know it'}</button>
        <button class="pill next" id="nxt">Next ▶</button>
      </div>
      <div class="word-strip">${ws.map(([x], k) => `<button class="wchip ${k === i ? 'on' : ''} ${known.includes(x) ? 'ok' : ''}" data-k="${k}">${esc(x)}</button>`).join('')}</div>
    </div>
    <div class="center"><button class="pill next" id="goQ">Start the quiz →</button></div>`;
    $('#flash').onclick = () => { flipped = !flipped; $('#flash').classList.toggle('flip', flipped); sTap(); say(flipped ? ex : w); };
    $('#hear').onclick = () => say(w);
    $('#prev').onclick = () => { i = (i - 1 + ws.length) % ws.length; flipped = false; draw(); say(ws[i][0]); };
    $('#nxt').onclick = () => { i = (i + 1) % ws.length; flipped = false; draw(); say(ws[i][0]); };
    $('#know').onclick = () => { const k = known.indexOf(w); if (k >= 0) known.splice(k, 1); else { known.push(w); sGood(); popText('Great!'); } save(); draw(); };
    body.querySelectorAll('.wchip').forEach(b => b.onclick = () => { i = +b.dataset.k; flipped = false; draw(); say(ws[i][0]); });
    $('#goQ').onclick = () => startQuiz(t.id);
  };
  draw();
}

/* ---- Comprehension ---- */
function readingPage(t) {
  const { html, segs } = readerHTML([{ title: t.title, type: t.type, lines: t.text }]);
  view(`${head(t, t.tag)}
  <div class="skill"><b>Exam skill: ${t.skill}</b><p>${t.tip}</p></div>
  <div class="reader">${readerBar()}<p class="reader-tip">Read carefully first. You can open the text again while you answer.</p>${html}</div>
  <div class="center"><button class="pill next" id="goQ">Answer the questions (${t.qs.length}) →</button></div>`);
  $('#bk').onclick = home;
  wireReader(app, segs);
  $('#goQ').onclick = () => startQuiz(t.id);
}

/* ================= WRITING ================= */
/* ================= GAMES ================= */
const GAME_LEN = { swap: 10, kitty: 10, sort: 12, light: 10 };
const GAME_INFO = {
  swap: { title: 'Swap it!', tag: 'Item 1 · Object pronouns', guide: 'mimi', topic: 'op', how: 'Swap the pink words for ONE little word: me, us, you, him, her, it or them.' },
  kitty: { title: 'Where is Kitty?', tag: 'Item 2 · Prepositions', guide: 'ruby', topic: 'pp', how: 'Look at the picture. Where is it? Tap the right word.' },
  sort: { title: 'at · on · in', tag: 'Item 2 · Prepositions for places', guide: 'ruby', topic: 'pp', how: 'Put each place in the right basket: at, on or in.' },
  light: { title: 'Green or red?', tag: "Item 3 · must and mustn't", guide: 'mimi', topic: 'mm', how: "Is it a good thing to do? Green for must, red for mustn't!" },
};
const PETS = ['🐱', '🐶', '🐰', '🧸', '⚽', '🐹'];
const PET_NAME = { '🐱': 'Kitty', '🐶': 'the puppy', '🐰': 'the bunny', '🧸': 'the teddy', '⚽': 'the ball', '🐹': 'the hamster' };
const PV = { in: 'in', on: 'on', under: 'under', behind: 'behind', 'in front of': 'front', 'next to': 'next', between: 'between', near: 'near' };
function makeRounds(kind) {
  if (kind === 'swap') return shuffle(SWAP).slice(0, 10).map(([a, n, b, p]) => {
    const ch = shuffle([p, ...shuffle(['me', 'us', 'you', 'him', 'her', 'it', 'them'].filter(x => x !== p)).slice(0, 3)]);
    return { show: `<div class="swap-s">${esc(a)} <span class="swap-n">${esc(n)}</span>${esc(b)}</div>`, q: `${a} ${n}${b}`, choices: ch, answer: p, done: `${a} ${p}${b}`, why: `${n} → ${p}` };
  });
  if (kind === 'kitty') return shuffle([...KITTY, ...shuffle(KITTY).slice(0, 3)]).map(prp => {
    const pet = pick(PETS), nm = PET_NAME[pet], Nm = nm[0].toUpperCase() + nm.slice(1);
    const obj = prp === 'between' ? 'the two boxes' : 'the box';
    const ch = shuffle([prp, ...shuffle(KITTY.filter(x => x !== prp)).slice(0, 3)]);
    return { show: `<span class="pv big ${PV[prp]}"><i class="bx"></i>${prp === 'between' ? '<i class="bx b2"></i>' : ''}<i class="bl">${pet}</i></span>`, q: `Where is ${nm}?`, choices: ch, answer: prp, done: `${Nm} is ${prp} ${obj}.`, why: '' };
  });
  if (kind === 'sort') {
    const all = Object.entries(PLACE_SORT).flatMap(([k, ps]) => ps.map(p => [k, p]));
    const pickN = [...shuffle(all.filter(x => x[0] === 'at')).slice(0, 3), ...shuffle(all.filter(x => x[0] === 'on')).slice(0, 4), ...shuffle(all.filter(x => x[0] === 'in')).slice(0, 5)];
    return shuffle(pickN).map(([k, p]) => ({ show: `<div class="place-card">___ ${esc(p)}</div>`, q: p, choices: ['at', 'on', 'in'], answer: k, done: `${k} ${p}`, why: k === 'on' ? 'floors, buses, trains, platforms → on' : k === 'at' ? 'a spot or a place we go to → at' : 'inside a place → in', basket: true }));
  }
  if (kind === 'light') return shuffle(LIGHTS).slice(0, 10).map(l => ({ show: `<div class="light-emo">${l[0]}</div><div class="swap-s">We ___ ${esc(l[1])} ${esc(l[2])}.</div>`, q: `Must or mustn't? We ... ${l[1]} ${l[2]}.`, choices: ['must', "mustn't"], answer: l[3] ? 'must' : "mustn't", done: lightSentence(l), why: l[4], light: true }));
}
function game(kind, from) {
  const info = GAME_INFO[kind]; const G = { kind, rounds: makeRounds(kind), i: 0, score: 0, from };
  const back = () => from ? topic(from) : home();
  const show = () => {
    const r = G.rounds[G.i]; let tries = 0, done = false;
    const btns = r.light ? `<div class="lights">${r.choices.map((c, k) => `<button class="lightbtn ${c === 'must' ? 'go' : 'stop'}" data-c="${k}"><span class="lamp"></span>${c === 'must' ? '✅' : '⛔'} ${c}</button>`).join('')}</div>`
      : r.basket ? `<div class="baskets">${r.choices.map((c, k) => `<button class="basket b-${c}" data-c="${k}"><span class="bk-ic">🧺</span><b>${c}</b></button>`).join('')}</div>`
      : `<div class="choices">${r.choices.map((c, k) => `<button class="choice" data-c="${k}"><span class="lt">${LET[k]}</span><span>${esc(c)}</span></button>`).join('')}</div>`;
    view(`<div class="quiz-top"><button class="back" id="qx">✕ ${info.title}</button><div class="progress"><i style="width:${G.i / G.rounds.length * 100}%"></i></div><div class="qcount">${G.i + 1}/${G.rounds.length}</div></div>
    <div class="qcard game-card">
      <span class="qtag">${info.tag}</span>
      <div class="game-how"><img src="img/${info.guide}-happy.webp" alt=""><p>${esc(info.how)}</p><button class="speak" id="spk" aria-label="Hear it">🔈</button></div>
      <div class="stage">${r.show}</div>
      ${kind === 'kitty' ? `<p class="qtext center">${esc(r.q)} It is ${fmt('___')} ${r.answer === 'between' ? 'the two boxes' : 'the box'}.</p>` : ''}
      ${btns}
      <div id="fb"></div>
      <div class="qbar"><button class="pill next" id="nx" style="display:none">Next →</button></div>
    </div>`);
    $('#qx').onclick = back;
    $('#spk').onclick = () => say(r.q);
    $('.game-how p').onclick = () => say(info.how);
    setTimeout(() => say(r.q), 300);
    app.querySelectorAll('[data-c]').forEach(b => b.onclick = () => {
      if (done || b.disabled) return; const c = r.choices[+b.dataset.c]; tries++;
      if (c === r.answer) {
        done = true; b.classList.add('right'); if (tries === 1) { G.score++; S.stars++; updStars(true); confetti(); checkSticker(); save(); }
        sGood(); popText(pick(['Brilliant!', 'Well done!', 'Super!', 'Great job!', 'Yay!']));
        const st = $('.stage'); if (kind === 'swap') st.innerHTML = `<div class="swap-s">${fmtDone(r)}</div>`; if (kind === 'sort') st.innerHTML = `<div class="place-card ok">${esc(r.done)}</div>`; if (kind === 'light') st.innerHTML = `<div class="light-emo">${r.done.includes("mustn't") ? '⛔' : '✅'}</div><div class="swap-s">${esc(r.done)}</div>`;
        $('#fb').innerHTML = `<div class="feedback good">${MASCOT.wink}<div>${tries === 1 ? 'Correct! +1 ★' : 'Correct!'}<div class="exp">${esc(kind === 'kitty' ? r.done : r.why)}</div></div></div>`;
        say(r.done);
        $('#nx').style.display = '';
      } else {
        sBad(); b.classList.add('wrong'); b.disabled = true;
        if (tries >= 2) {
          done = true; app.querySelectorAll('[data-c]').forEach(x => { if (r.choices[+x.dataset.c] === r.answer) x.classList.add('right'); });
          $('#fb').innerHTML = `<div class="feedback bad">${MASCOT.sad}<div>It's <span class="hl">${esc(r.answer)}</span>: ${esc(r.done)}<div class="exp">${esc(r.why)}</div></div></div>`;
          say(r.done); $('#nx').style.display = '';
        } else $('#fb').innerHTML = `<div class="feedback hint">${MASCOT.happy}<div>Nearly! Try again.<div class="exp">${esc(kind === 'swap' ? 'Is it a boy, a girl, a thing, more than one, or you and me?' : kind === 'light' ? 'Is it safe, kind and clean? Then we must!' : kind === 'sort' ? 'Floors, buses and trains use on.' : 'Look carefully at the picture.')}</div></div></div>`;
      }
    });
    $('#nx').onclick = () => { G.i++; if (G.i >= G.rounds.length) gameResult(G); else show(); };
  };
  show();
}
const fmtDone = r => esc(r.done).replace(new RegExp(`\\b${r.answer}\\b(?=[^\\w]*$|[ .!?])`), m => `<span class="swap-p">${m}</span>`);
function gameResult(G) {
  const info = GAME_INFO[G.kind]; const n = G.rounds.length, r = G.score / n;
  S.best['g_' + G.kind] = Math.max(S.best['g_' + G.kind] || 0, G.score); save();
  view(`<div class="result"><div class="center"><span class="bob res-pup">${r >= .7 ? MASCOT.star : MASCOT.happy}</span></div>
  <h2>${r >= .9 ? 'Amazing!' : r >= .7 ? 'Well done!' : 'Good try! Play again!'}</h2><div class="score">${G.score} / ${n}</div>
  <div class="review"><h3>Read them again:</h3><div class="wlist">${G.rounds.map(x => `<button class="wchip tapw" data-s="${esc(x.done)}">${esc(x.done)}</button>`).join('')}</div></div>
  <div class="btns"><button class="pill next" id="again">Play again</button><button class="pill" id="tp">📖 ${esc(ALL[info.topic].title)}</button><button class="pill" id="hm">Home</button></div></div>`);
  if (r >= .7) { confetti(); setTimeout(confetti, 500); sGood(); }
  app.querySelectorAll('.tapw').forEach(b => b.onclick = () => say(b.dataset.s));
  $('#again').onclick = () => game(G.kind, G.from); $('#tp').onclick = () => topic(info.topic); $('#hm').onclick = home;
}


/* ================= SPELLING BEE ================= */
const SPELL_POOL = () => WORDS.filter(x => /^[a-z]{3,11}$/i.test(x.w));
function spelling(unit) {
  let pool = SPELL_POOL(); if (unit) pool = pool.filter(x => x.u === unit);
  const list = shuffle(pool).slice(0, 10);
  const G = { list, i: 0, score: 0, unit };
  const show = () => {
    const x = G.list[G.i]; const word = x.w.toLowerCase();
    const extra = shuffle('aeioustrnlm'.split('').filter(c => !word.includes(c))).slice(0, 2);
    const tiles = shuffle([...word.split(''), ...extra].map((c, k) => ({ c, k })));
    let built = [], tries = 0, done = false;
    view(`<div class="quiz-top"><button class="back" id="qx">✕ Spelling bee</button><div class="progress"><i style="width:${G.i / G.list.length * 100}%"></i></div><div class="qcount">${G.i + 1}/${G.list.length}</div></div>
    <div class="qcard">
      <span class="qtag">🐝 Listen and spell</span>
      <div class="qvis"><button class="big-ear" id="ear">🔈<small>Hear it again</small></button><div class="spell-pic">${x.e}</div></div>
      <div class="build spell" id="build"></div>
      <div class="tiles" id="tiles"></div>
      <div id="fb"></div>
      <div class="qbar"><button class="pill" id="sent">💬 Hear a sentence</button><button class="pill" id="clr">↺ Clear</button><button class="pill next" id="ok">Check</button><button class="pill next" id="nx" style="display:none">Next →</button></div>
    </div>`);
    const drawT = () => {
      $('#build').innerHTML = word.split('').map((_, k) => built[k] ? `<button class="tile in" data-b="${k}">${built[k].c}</button>` : '<span class="slot"></span>').join('');
      $('#tiles').innerHTML = tiles.map((o, k) => built.includes(o) ? `<span class="tile ghost">${o.c}</span>` : `<button class="tile" data-p="${k}">${o.c}</button>`).join('');
      app.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { if (done || built.length >= word.length) return; sTap(); built.push(tiles[+b.dataset.p]); drawT(); });
      app.querySelectorAll('[data-b]').forEach(b => b.onclick = () => { if (done) return; built.splice(+b.dataset.b, 1); drawT(); });
    };
    drawT();
    $('#qx').onclick = () => unit ? topic(unit) : home();
    $('#ear').onclick = () => say(x.w);
    $('#sent').onclick = () => say(x.ex);
    $('#clr').onclick = () => { if (done) return; built = []; drawT(); };
    setTimeout(() => say(x.w), 350);
    $('#ok').onclick = () => {
      if (done) return;
      if (built.length < word.length) return popText('Use more letters!');
      const s = built.map(o => o.c).join(''); tries++;
      if (s === word) {
        done = true; if (tries === 1) { G.score++; S.stars++; updStars(true); confetti(); checkSticker(); save(); }
        sGood(); popText(pick(['Brilliant!', 'Well done!', 'Super!', 'Great job!']));
        $('#build').classList.add('right');
        $('#fb').innerHTML = `<div class="feedback good">${MASCOT.wink}<div>${tries === 1 ? 'Correct! +1 ★' : 'Correct!'}<div class="exp">${esc(x.ex)}</div></div></div>`;
        say(x.ex);
        $('#ok').style.display = 'none'; $('#nx').style.display = '';
      } else {
        sBad(); const b = $('#build'); b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong');
        if (tries >= 2) {
          done = true;
          $('#fb').innerHTML = `<div class="feedback bad">${MASCOT.sad}<div>The spelling is <span class="hl">${word}</span>. Let's practise it again later!<div class="exp">${esc(x.ex)}</div></div></div>`;
          say(x.w);
          $('#ok').style.display = 'none'; $('#nx').style.display = '';
        } else {
          const firstWrong = s.split('').findIndex((c, k) => c !== word[k]);
          $('#fb').innerHTML = `<div class="feedback hint">${MASCOT.happy}<div>Nearly! Try again.<div class="exp">Hint: it starts with <b>${word.slice(0, Math.max(1, firstWrong))}</b>…</div></div></div>`;
          setTimeout(() => { built = []; drawT(); $('#build').classList.remove('wrong'); }, 700);
        }
      }
    };
    $('#nx').onclick = () => { G.i++; if (G.i >= G.list.length) { if (!unit) S.best.spell = Math.max(S.best.spell || 0, G.score); save(); spellResult(G); } else show(); };
  };
  show();
}
function spellResult(G) {
  const r = G.score / G.list.length;
  view(`<div class="result"><div class="center"><span class="bob res-pup">${r >= .7 ? MASCOT.star : MASCOT.happy}</span></div>
  <h2>${r >= .9 ? 'Super speller!' : r >= .7 ? 'Well done!' : 'Good try! Keep practising!'}</h2><div class="score">${G.score} / ${G.list.length}</div>
  <div class="review"><h3>Words to remember:</h3><div class="wlist">${G.list.map(x => `<button class="wchip tapw" data-w="${esc(x.w)}">${x.e} ${esc(x.w)}</button>`).join('')}</div></div>
  <div class="btns"><button class="pill next" id="again">Play again</button><button class="pill" id="hm">Home</button></div></div>`);
  if (r >= .7) { confetti(); sGood(); }
  app.querySelectorAll('.tapw').forEach(b => b.onclick = () => say(b.dataset.w));
  $('#again').onclick = () => spelling(G.unit); $('#hm').onclick = home;
}

/* ================= QUIZ ENGINE ================= */
let Q = null;
function prep(q) {
  q = { ...q };
  if (q.type === 'mc') q.choices = shuffle([q.answer, ...q.wrong.filter(x => x !== q.answer)].slice(0, 4));
  if (q.type === 'multi') q.choices = shuffle([...q.answers, ...q.wrong]);
  if (q.type === 'order') { let s; let g = 0; do { s = shuffle(q.tiles.map((x, i) => ({ x, i }))); } while (g++ < 10 && s.map(o => o.x).join(' ') === q.answer); q.pool = s; }
  return q;
}
const keyOf = q => (q.listen ? 'L:' + q.listen : q.text + '|' + (q.answer || ''));
const QSETS = {};
function buildSet(mode) {
  const qs = []; const seen = new Set();
  const push = q => { if (!q) return false; const k = keyOf(q); if (seen.has(k)) return false; seen.add(k); qs.push(q); return true; };
  if (mode === 'mock') {
    [['op', 5], ['pp', 6], ['mm', 5]].forEach(([id, n]) => { let g = 0; const b = shuffle(bank(id)); while (qs.filter(q => q.topic === id).length < n && g < b.length) push(b[g++]); });
    shuffle(['sp1', 'sp2', 'sp3', 'sp1', 'sp2', 'sp3']).slice(0, 4).forEach(id => { const b = shuffle(bank(id)); for (const q of b) if (push(q)) break; });
    return qs.map(prep);
  }
  if (mode === 'listen') { let g = 0; while (qs.length < 10 && g++ < 200) push(listenQ(WORDS)); return qs.map(prep); }
  if (mode === 'mistakes') return shuffle(S.mistakes).slice(0, 10).map(q => prep({ ...q, fromMist: 1 }));
  if (QSETS[mode]) return shuffle(QSETS[mode]).slice(0, /fix/.test(mode) ? 12 : 10).map(q => prep({ ...q, topic: mode }));
  const t = ALL[mode];
  const b = shuffle(bank(mode));
  b.slice(0, t.words ? 9 : 10).forEach(push);
  if (t.words) push(listenQ(WORDS.filter(x => x.u === mode)));
  return qs.map(prep);
}
const WT = {};
const topicTitle = id => WT[id] || (ALL[id] ? ALL[id].title : '');
function title(mode) { return mode === 'mock' ? 'Practice quiz' : mode === 'listen' ? 'Listen & choose' : mode === 'mistakes' ? 'Mistake book' : topicTitle(mode); }

function startQuiz(mode) {
  sTap();
  Q = { mode, qs: buildSet(mode), i: 0, score: 0, tries: 0, log: [], exam: mode === 'mock' };
  if (!Q.qs.length) return home();
  showQ();
}
const HINT = q => q.type === 'fix' ? 'Read it aloud slowly. Look for a spelling mistake or a wrong small word (in / on / at, -s, -ing, a capital letter).' : q.type === 'order' ? 'Start with the person or "Don\'t". A sentence starts with a capital letter and ends with a full stop.' : q.type === 'multi' ? 'There is more than one answer.' : 'Put each answer into the sentence and read it aloud. Which one sounds right?';

function showQ() {
  const q = Q.qs[Q.i]; Q.tries = 0; Q.done = false; Q.sel = new Set(); Q.built = [];
  const rd = ALL[q.topic] && ALL[q.topic].kind === 'reading' ? ALL[q.topic] : null;
  const long = q.choices && q.choices.some(c => c.length > 22);
  let area = '';
  if (q.type === 'mc') area = `${q.listen ? `<div class="qvis"><button class="big-ear" id="ear">🔈<small>Hear it again</small></button></div>` : ''}<div class="choices ${long ? 'long' : ''}">${q.choices.map((c, i) => `<button class="choice" data-c="${i}"><span class="lt">${LET[i]}</span><span>${esc(c)}</span></button>`).join('')}</div>`;
  if (q.type === 'multi') area = `<p class="multi-tip">Choose ALL the right answers, then tap Check.</p><div class="choices multi ${long ? 'long' : ''}">${q.choices.map((c, i) => `<button class="choice" data-c="${i}"><span class="lt">${LET[i]}</span><span>${esc(c)}</span></button>`).join('')}</div><div class="qbar"><button class="pill next" id="okMulti">Check</button></div>`;
  if (q.type === 'order') area = `<p class="multi-tip">Tap the word cards in the right order. Tap a card at the top to put it back.</p><div class="build" id="build"></div><div class="tiles" id="tiles"></div><div class="qbar"><button class="pill" id="clr">↺ Clear</button><button class="pill next" id="okOrder">Check</button></div>`;
  if (q.type === 'fix') area = `<p class="multi-tip">Read the sentence. One word is wrong. Tap it!</p><div class="fixrow" id="fixrow">${q.words.map((w, i) => `<button class="fword" data-f="${i}">${esc(w)}</button>`).join('')}</div>`;
  view(`
  <div class="quiz-top"><button class="back" id="qx">✕ ${title(Q.mode)}</button><div class="progress"><i style="width:${(Q.i / Q.qs.length) * 100}%"></i></div><div class="qcount">${Q.i + 1}/${Q.qs.length}</div></div>
  <div class="qcard">
    <span class="qtag">${topicTitle(q.topic)}${q.tag ? ' · ' + q.tag : ''}</span>
    ${rd ? `<details class="passage"><summary>📄 Look at the text: ${esc(rd.title)}</summary>${rd.text.map(s => `<p>${esc(s)}</p>`).join('')}</details>` : ''}
    <div class="qhead">${q.pic ? `<div class="qpic">${q.pic}</div>` : ''}<div class="qtext">${fmt(q.text)}</div><button class="speak" id="spk" aria-label="Hear the question">🔈</button></div>
    ${area}
    <div id="fb"></div>
    <div class="qbar">${!Q.exam ? '<button class="pill" id="hintBtn">💡 Hint</button>' : ''}<button class="pill next" id="nextBtn" style="display:none">Next →</button></div>
  </div>`);
  $('#qx').onclick = () => (ALL[Q.mode] ? topic(Q.mode) : home());
  $('#spk').onclick = () => q.listen ? say(q.listen) : q.say ? say(q.say) : say(q.text);
  if (q.listen) { $('#ear').onclick = () => say(q.listen); setTimeout(() => say(q.listen), 350); }
  if ($('#hintBtn')) $('#hintBtn').onclick = () => { $('#fb').innerHTML = `<div class="feedback hint">${MASCOT.happy}<div>Hint: ${q.hint || HINT(q)}</div></div>`; };
  $('#nextBtn').onclick = next;
  if (q.type === 'mc') app.querySelectorAll('.choice').forEach(b => b.onclick = () => answer(q.choices[+b.dataset.c] === q.answer, b, q.choices[+b.dataset.c]));
  if (q.type === 'multi') {
    app.querySelectorAll('.choice').forEach(b => b.onclick = () => { if (Q.done) return; sTap(); const i = +b.dataset.c; Q.sel.has(i) ? Q.sel.delete(i) : Q.sel.add(i); b.classList.toggle('sel'); });
    $('#okMulti').onclick = () => { if (Q.done || !Q.sel.size) return; const picked = [...Q.sel].map(i => q.choices[i]); const ok = picked.length === q.answers.length && picked.every(p => q.answers.includes(p)); answer(ok, null, picked.join(', ')); };
  }
  if (q.type === 'fix') app.querySelectorAll('.fword').forEach(b => b.onclick = () => { if (Q.done || b.disabled) return; answer(+b.dataset.f === q.bad, b, b.textContent); });
  if (q.type === 'order') {
    const drawT = () => {
      $('#build').innerHTML = Q.built.length ? Q.built.map((o, k) => `<button class="tile in" data-b="${k}">${esc(o.x)}</button>`).join('') : '<span class="ph">Tap the word cards below…</span>';
      $('#tiles').innerHTML = q.pool.map((o, k) => Q.built.includes(o) ? `<span class="tile ghost">${esc(o.x)}</span>` : `<button class="tile" data-p="${k}">${esc(o.x)}</button>`).join('');
      app.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { if (Q.done) return; sTap(); Q.built.push(q.pool[+b.dataset.p]); drawT(); });
      app.querySelectorAll('[data-b]').forEach(b => b.onclick = () => { if (Q.done) return; Q.built.splice(+b.dataset.b, 1); drawT(); });
    };
    drawT();
    $('#clr').onclick = () => { if (Q.done) return; Q.built = []; drawT(); };
    $('#okOrder').onclick = () => { if (Q.done) return; if (Q.built.length < q.tiles.length) { popText('Use all the cards!'); return; } const s = Q.built.map(o => o.x).join(' '); answer(s === q.answer, null, s); };
  }
}
function showFixed(q) {
  app.querySelectorAll('.fword').forEach(b => { b.disabled = true; if (+b.dataset.f === q.bad) { b.classList.remove('wrong'); b.classList.add('right'); b.innerHTML = `<s>${esc(q.words[q.bad])}</s> ${esc(q.fix)}`; } });
  const r = $('#fixrow'); r && r.insertAdjacentHTML('afterend', `<p class="fixed">✓ ${q.words.map((w, i) => i === q.bad ? `<mark>${esc(q.fix)}</mark>` : esc(w)).join(' ')}</p>`);
  if (!Q.exam) synth(q.answer);
}
const correctText = q => q.type === 'multi' ? q.answers.join(', ') : q.answer;

function answer(ok, btn, given) {
  if (Q.done) return;
  const q = Q.qs[Q.i]; Q.tries++;
  const fb = $('#fb');
  setTimeout(() => { const f = $('#fb'); if (f && f.firstChild) f.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 50);
  if (ok) {
    Q.done = true; const first = Q.tries === 1;
    if (first) { Q.score++; S.stars++; updStars(true); }
    if (btn) btn.classList.add('right');
    if (q.type === 'mc') app.querySelectorAll('.choice').forEach(c => { if (c !== btn) c.classList.add('dim'); });
    if (q.type === 'multi') app.querySelectorAll('.choice').forEach(c => c.classList.add(q.answers.includes(q.choices[+c.dataset.c]) ? 'right' : 'dim'));
    if (q.type === 'order') $('#build').classList.add('right');
    if (q.type === 'fix') showFixed(q);
    sGood(); if (first) confetti();
    popText(pick(['Well done!', 'Great job!', 'Super!', 'Brilliant!', 'Correct!']));
    fb.innerHTML = Q.exam ? '' : `<div class="feedback good">${MASCOT.wink}<div>${first ? 'Correct! +1 ★' : 'Correct! Next time, first try!'}${q.explain ? `<div class="exp">${esc(q.explain)}</div>` : ''}</div></div>`;
    if (!Q.exam && q.type === 'order') synth(q.answer);
    Q.log.push({ q, ok: first });
    if (q.fromMist && first) S.mistakes = S.mistakes.filter(m => keyOf(m) !== keyOf(q));
    checkSticker(); save();
    if (Q.exam) setTimeout(next, 900); else $('#nextBtn').style.display = '';
  } else {
    sBad();
    if (btn) btn.classList.add('wrong');
    if (q.type === 'order') { const b = $('#build'); b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong'); }
    if (Q.exam || Q.tries >= 2) {
      Q.done = true;
      if (!q.fromMist && !S.mistakes.some(m => keyOf(m) === keyOf(q))) { const { fromMist, choices, pool, ...c } = q; S.mistakes.push(c); if (S.mistakes.length > 80) S.mistakes.shift(); }
      save();
      Q.log.push({ q, ok: false, given });
      if (Q.exam) { setTimeout(next, 700); return; }
      if (q.type === 'mc') app.querySelectorAll('.choice').forEach(c => { if (q.choices[+c.dataset.c] === q.answer) c.classList.add('right'); else if (c !== btn) c.classList.add('dim'); });
      if (q.type === 'multi') app.querySelectorAll('.choice').forEach(c => { c.classList.remove('sel'); c.classList.add(q.answers.includes(q.choices[+c.dataset.c]) ? 'right' : 'dim'); });
      if (q.type === 'fix') showFixed(q);
      fb.innerHTML = `<div class="feedback bad">${MASCOT.sad}<div>The answer is <span class="hl">${esc(correctText(q))}</span>${/[.!?]$/.test(correctText(q)) ? '' : '.'} It's in your mistake book now, so you can try again later!${q.explain ? `<div class="exp">${esc(q.explain)}</div>` : ''}</div></div>`;
      $('#nextBtn').style.display = '';
    } else {
      fb.innerHTML = `<div class="feedback hint">${MASCOT.happy}<div>Nearly! Try again.<div class="exp">Hint: ${q.hint || HINT(q)}</div></div></div>`;
      if (btn) btn.disabled = true;
      if (q.type === 'multi') { Q.sel.clear(); app.querySelectorAll('.choice').forEach(c => c.classList.remove('sel')); }
      if (q.type === 'order') setTimeout(() => { const c = $('#clr'); c && c.onclick(); const b = $('#build'); b && b.classList.remove('wrong'); }, 700);
    }
  }
}
function next() { Q.i++; if (Q.i >= Q.qs.length) result(); else showQ(); }
function checkSticker() { const n = STICKERS.findIndex((_, i) => S.stars === stickerAt(i)); if (n >= 0) setTimeout(() => { popText('New sticker! ' + STICKERS[n]); tone([[523, .1], [659, .1], [784, .1], [1047, .3]]); }, 900); }

function result() {
  const total = Q.qs.length, sc = Q.score;
  if (ALL[Q.mode] || QSETS[Q.mode]) S.best[Q.mode] = Math.max(S.best[Q.mode] || 0, Math.round(sc / total * 10));
  if (Q.mode === 'mock') S.best.mock = Math.max(S.best.mock || 0, sc);
  if (Q.mode === 'listen') S.best.listen = Math.max(S.best.listen || 0, sc);
  save();
  const ratio = sc / total; const st = ratio >= .9 ? '★★★' : ratio >= .7 ? '★★☆' : ratio >= .4 ? '★☆☆' : '☆☆☆';
  const wrong = Q.log.filter(l => !l.ok);
  let breakdown = '';
  if (Q.mode === 'mock') { const by = {}; Q.log.forEach(l => { const t = topicTitle(l.q.topic); by[t] = by[t] || [0, 0]; by[t][1]++; if (l.ok) by[t][0]++; }); breakdown = `<div class="topic-break">${Object.entries(by).map(([t, [a, b]]) => `<div>${a === b ? '🌟' : '💪'} ${t}: ${a}/${b}</div>`).join('')}</div>`; }
  view(`<div class="result">
    <div class="center"><span class="bob res-pup">${ratio >= .7 ? MASCOT.star : MASCOT.happy}</span></div>
    <h2>${ratio >= .9 ? 'Amazing!' : ratio >= .7 ? 'Well done!' : ratio >= .4 ? 'Good work! Keep going!' : 'Take your time and try again!'}</h2>
    <div class="score">${sc} / ${total}</div><div class="bigstars">${st}</div>
    ${breakdown}
    ${wrong.length ? `<div class="review"><h3>Let's look at the mistakes:</h3>${wrong.map(l => `<div class="item">${l.q.listen ? '🔈 ' + esc(l.q.listen) : fmt(l.q.text)}<br>Answer: <b>${esc(correctText(l.q))}</b>${l.q.explain ? ' — ' + esc(l.q.explain) : ''}</div>`).join('')}</div>` : ''}
    <div class="btns"><button class="pill next" id="again">Try again</button><button class="pill" id="hm">Home</button>${ALL[Q.mode] || QSETS[Q.mode] ? '<button class="pill" id="lrn">📖 Back to the topic</button>' : ''}</div>
  </div>`);
  if (ratio >= .7) { confetti(); setTimeout(confetti, 500); sGood(); }
  $('#again').onclick = () => startQuiz(Q.mode);
  $('#hm').onclick = home;
  if ($('#lrn')) $('#lrn').onclick = () => topic(Q.mode);
}

function stickers() {
  view(`<button class="back" id="bk">← Home</button>
  <div class="topic-head"><div class="badge c-sky">${MASCOT.star}</div><div><p>Get a sticker for every 5 stars (first-try answers)</p><h2>My sticker book</h2></div></div>
  <p class="bold">You have <span class="hl">${S.stars}</span> stars ★</p>
  <div class="sticker-grid">${STICKERS.map((s, i) => S.stars >= stickerAt(i) ? `<div class="sticker">${s}</div>` : `<div class="sticker lock">🔒<small>${stickerAt(i)} ★</small></div>`).join('')}</div>
  <div class="center"><button class="pill" id="rst">Reset progress</button></div>`);
  $('#bk').onclick = home;
  let armed = false; $('#rst').onclick = () => { if (!armed) { armed = true; $('#rst').textContent = 'Tap again to clear everything'; return; } S.stars = 0; S.best = {}; S.mistakes = []; S.cards = {}; save(); updStars(); stickers(); };
}

/* ---------------- boot ---------------- */
$('#homeBtn').onclick = home;
$('#stickerBtn').onclick = stickers;
const sb = $('#soundBtn'); const setSB = () => sb.textContent = S.sound ? '🔊' : '🔇'; setSB();
sb.onclick = () => { S.sound = !S.sound; save(); setSB(); };
updStars();
if ('speechSynthesis' in window) { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = pickVoice; }
home();
window.__g1 = { ALL, bank, buildSet, prep, clean, preview: (id, i) => { const b = QSETS[id] ? QSETS[id].map(q => ({ ...q, topic: id })) : bank(id); Q = { mode: id, qs: [prep(b[i])], i: 0, score: 0, log: [], exam: false }; showQ(); } };
