/* Grammar Quiz 1 content (3 Nov 2026): object pronouns, prepositions, must/mustn't, spelling.
   Re-uses question banks in data.js (Grammar Time units 6, 10, 19; PLE 2A U1–2, 2B U7; Workbook; Revision 1). */
'use strict';
const GU = id => UNITS.find(u => u.id === id);
const MC = (text, answer, wrong, explain = '') => ({ type: 'mc', text, answer, wrong, explain, pic: '' });
const ORD = (text, sentence, explain = '') => ({ type: 'order', text, tiles: sentence.split(' '), answer: sentence, explain, pic: '' });
const PREPS = ['in', 'on', 'at', 'under', 'behind', 'next to', 'between', 'in front of', 'near'];
const prepQs = id => GU(id).qs.filter(q => q.type === 'mc' && /_{2,}/.test(q.text) && PREPS.includes(q.answer) && q.wrong.every(w => PREPS.includes(w)));
const mustQs = id => GU(id).qs.filter(q => /must/i.test(q.text + ' ' + (q.answer || '') + ' ' + (q.wrong || []).join(' ')));

/* ---------- 1. Object pronouns ---------- */
const SWAP = [
  ['Please help', 'Mum', '.', 'her'], ['I like', 'my brother', '.', 'him'], ['Look at', 'the birds', '!', 'them'],
  ['Can you see', 'the kite', '?', 'it'], ['Come and play with', 'Ruby and me', '!', 'us'], ['Dad gives', 'Mimi', ' a hug.', 'her'],
  ['Tom is with', 'Grandpa', '.', 'him'], ["Don't touch", 'the piano', '!', 'it'], ['Mum reads a story to', 'my sister and me', '.', 'us'],
  ["I can't find", 'my glasses', '.', 'them'], ['Say hello to', 'Miss Chan', '.', 'her'], ['Give the ball to', 'Ben', '.', 'him'],
  ['The teacher talks to', 'the children', '.', 'them'], ['I love', 'my cat', '.', 'it'], ['Please wait for', 'Mimi and me', '!', 'us'],
  ['Throw the ball to', 'Peter', '.', 'him'], ['Put', 'the books', ' on the shelf.', 'them'], ['We sing a song for', 'Grandma', '.', 'her'],
];
const swapQ = ([a, n, b, p]) => MC(`${a} ${n}${b}`, p, shuffle(['me', 'us', 'you', 'him', 'her', 'it', 'them'].filter(x => x !== p)).slice(0, 3), `${n} → ${p}`);
const OP_EXTRA = [
  MC('Ruby and Mimi are my friends. I play with ___ every day.', 'them', ['they', 'us']),
  MC("Where is Dad? I can't see ___.", 'him', ['he', 'her']),
  MC("I'm hungry. Please give ___ an apple.", 'me', ['I', 'us']),
  MC('___ are hungry.', 'We', ['Us', 'Them'], 'At the start of a sentence, use the subject: We.'),
  MC('___ is my best friend.', 'She', ['Her', 'Him'], 'At the start of a sentence, use the subject: She.'),
  MC('This is my sister. I love ___.', 'her', ['she', 'him']),
  MC('We are at the park. Come and play with ___!', 'us', ['we', 'them']),
  MC('Where is my umbrella? I need ___.', 'it', ['them', 'him']),
  ORD('Put the words in order.', 'Please help me.'),
  ORD('Put the words in order.', 'Can you see them?'),
];

/* ---------- 2. Prepositions ---------- */
const PLACE_SORT = {
  at: ['the bus stop', 'school', 'home'],
  on: ['the first floor', 'the ground floor', 'the second floor', 'the platform', 'the bus', 'the train', 'the school bus'],
  in: ['the cinema', 'the park', 'the zoo', 'the library', 'the hall', 'the classroom', 'the corridor', 'the garden', 'the art room', 'the computer room', 'the playground'],
};
const KITTY = ['in', 'on', 'under', 'behind', 'in front of', 'next to', 'between'];
const PP_LEARN = [
  ['in / on / at for places', `<div class="ioa"><div class="ioa-col c-sky"><b>at</b><span class="tap">at the bus stop</span><span class="tap">at school</span><span class="tap">at home</span></div><div class="ioa-col c-mint"><b>on</b><span class="tap">on the first floor</span><span class="tap">on the platform</span><span class="tap">on the bus</span><span class="tap">on the train</span></div><div class="ioa-col c-pink"><b>in</b><span class="tap">in the cinema</span><span class="tap">in the park</span><span class="tap">in the zoo</span><span class="tap">in the library</span><span class="tap">in the corridor</span></div></div><p class="note">💡 Floors, buses, trains and platforms use <b>on</b>. A small spot like a bus stop uses <b>at</b>. Rooms and big places with walls or fences use <b>in</b>.</p>`],
  ['Rules with places', `<div class="eg">We must line up at the bus stop.<br>We mustn't push on the platform.<br>We mustn't talk on the phone in the cinema.<br>The library is on the first floor.<br>We mustn't eat on the bus.<br>We mustn't touch the animals in the zoo.</div>`],
];
const PP_EXTRA = [
  MC('The computer room is ___ the first floor.', 'on', ['in', 'at'], 'floors → on'),
  MC('We must line up ___ the bus stop.', 'at', ['in', 'on']),
  MC("We mustn't push ___ the platform.", 'on', ['in', 'at']),
  MC("We mustn't talk on the phone ___ the cinema.", 'in', ['on', 'at']),
  MC("We mustn't eat ___ the bus.", 'on', ['in', 'at']),
  MC('The library is ___ the second floor.', 'on', ['in', 'at']),
  MC("We mustn't run around ___ the corridor.", 'in', ['on', 'at']),
  MC("We mustn't rush to the seats ___ the train.", 'on', ['in', 'at']),
  MC("We mustn't spit ___ the bus stop.", 'at', ['on', 'in']),
  MC('We must keep quiet ___ the library.', 'in', ['on', 'at']),
  MC("We mustn't feed the animals ___ the zoo.", 'in', ['on', 'at']),
  MC('The hall is ___ the ground floor.', 'on', ['in', 'at']),
];

/* ---------- 3. must / mustn't ---------- */
const LIGHTS = [
  ['🚌', 'line up', 'at the bus stop', 1, 'It is fair to everyone.'], ['🚉', 'push', 'on the platform', 0, 'People may fall off the platform!'],
  ['🟨', 'stand behind the yellow line', 'on the platform', 1, 'It is safe.'], ['💦', 'spit', 'at the bus stop', 0, 'It is dirty.'],
  ['🗑️', 'litter', 'in the park', 0, 'It makes the park dirty.'], ['🌱', 'keep off the grass', 'in the park', 1, 'The grass needs to grow.'],
  ['🌷', 'pick the flowers', 'in the park', 0, 'Everyone wants to enjoy the flowers.'], ['📱', 'talk on the phone', 'in the cinema', 0, 'It is very noisy!'],
  ['🍟', 'eat potato chips', 'in the cinema', 0, 'It is very noisy!'], ['🤫', 'keep quiet', 'in the library', 1, 'People are reading.'],
  ['🦆', 'feed the animals', 'in the zoo', 0, 'They may get sick.'], ['🦁', 'touch the animals', 'in the zoo', 0, 'It is dangerous.'],
  ['🛤️', 'stay on the path', 'in the zoo', 1, 'It is safe.'], ['💺', 'rush to the seats', 'on the train', 0, 'Someone may get hurt.'],
  ['🧓', 'offer our seat to people in need', 'on the train', 1, 'It is kind.'], ['🪑', 'sit still', 'on the school bus', 1, 'It is dangerous to run around.'],
  ['🏃', 'run around', 'on the bus', 0, 'It is dangerous.'], ['🥤', 'eat or drink', 'on the train', 0, 'It makes the train dirty.'],
  ['⏳', 'wait for our turn', 'in the computer room', 1, 'It is fair.'], ['🪧', 'follow the signs', 'in the park', 1, 'The signs keep us safe.'],
  ['🌳', 'climb the trees', 'in the garden', 0, 'We may fall and get hurt.'], ['🧍', 'line up', 'in the corridor', 1, 'It keeps the corridor tidy and safe.'],
];
const lightSentence = l => `We ${l[3] ? 'must' : "mustn't"} ${l[1]} ${l[2]}.`;
const MM_LEARN = [
  ['must and mustn\'t', `<div class="mm"><div class="mm-col go"><b>✅ must</b><p>We <b>must</b> do it. It is important.</p><span class="tap">We must line up at the bus stop.</span><span class="tap">We must keep quiet in the library.</span><span class="tap">We must keep off the grass.</span></div><div class="mm-col stop"><b>⛔ mustn't</b><p>We <b>mustn't</b> do it. Don't do it!</p><span class="tap">We mustn't push on the platform.</span><span class="tap">We mustn't litter in the park.</span><span class="tap">We mustn't spit at the bus stop.</span></div></div><p class="note">mustn't = must not. After must / mustn't, use the simple verb: We must <b>line</b> up. (not lines / lining)</p>`],
];
const MM_EXTRA = [
  ...LIGHTS.slice(0, 12).map(l => MC(`We ___ ${l[1]} ${l[2]}. (${l[4]})`, l[3] ? 'must' : "mustn't", [l[3] ? "mustn't" : 'must'])),
  MC('We must ___ up at the bus stop.', 'line', ['lines', 'lining'], 'must + simple verb'),
  MC("We mustn't ___ on the platform.", 'push', ['pushes', 'pushing'], "mustn't + simple verb"),
  ORD('Make the rule.', "We mustn't litter in the park."),
  ORD('Make the rule.', 'We must keep quiet in the library.'),
];

/* ---------- 4. Spelling ---------- */
function misspell(w) {
  const out = new Set(); const sw = { a: 'e', e: 'i', i: 'e', o: 'u', u: 'o' }; let g = 0;
  while (out.size < 3 && g++ < 60) {
    const k = Math.floor(Math.random() * w.length); const r = Math.random(); let v = w;
    if (r < .3 && k < w.length - 1 && w[k] !== w[k + 1] && w[k] !== ' ' && w[k + 1] !== ' ') v = w.slice(0, k) + w[k + 1] + w[k] + w.slice(k + 2);
    else if (r < .55 && sw[w[k]]) v = w.slice(0, k) + sw[w[k]] + w.slice(k + 1);
    else if (r < .8 && w[k] === w[k + 1]) v = w.slice(0, k) + w.slice(k + 1);
    else if (k > 0 && w[k - 1] !== ' ' && /[bcdfglmnprst]/.test(w[k]) && w[k] !== w[k + 1] && w[k] !== w[k - 1]) v = w.slice(0, k) + w[k] + w.slice(k);
    if (v !== w) out.add(v);
  }
  return [...out].slice(0, 2);
}
const spellQs = id => GU(id).words.map(([w, e, ex]) => ({ type: 'mc', text: `${e} Which spelling is correct?`, say: w, answer: w, wrong: misspell(w), explain: ex, pic: '' }));
const missQs = id => GU(id).words.filter(([w]) => /^[a-z]{4,}$/i.test(w)).map(([w, e, ex]) => {
  const vs = [...w].map((c, i) => /[aeiou]/.test(c) ? i : -1).filter(i => i > 0); const k = vs.length ? vs[Math.floor(Math.random() * vs.length)] : 1;
  return { type: 'mc', text: `${e} ${w.slice(0, k)}__${w.slice(k + 1)}`.replace('__', '___'), say: w, answer: w[k], wrong: ['a', 'e', 'i', 'o', 'u'].filter(c => c !== w[k]).slice(0, 2), explain: `${w}: ${ex}`, pic: '' };
});

const TOPICS = [
  { id: 'op', n: 1, title: 'Object pronouns', tag: 'Item 1 · Grammar Time U10', sub: 'me · us · you · them · him · her · it', emo: '🙋‍♀️', col: 'c-pink', guide: 'mimi',
    hello: "Hi, I'm Mimi! After a verb or a little word like with or to, we use me, us, you, him, her, it or them.",
    learn: GU('g10').learn, qs: [...GU('g10').qs, ...OP_EXTRA], game: ['swap', '🔄 Swap it!'] },
  { id: 'pp', n: 2, title: 'Prepositions', tag: 'Item 2 · GT U6 · WB 2A U1–2', sub: 'in · on · at · under · behind · next to · between', emo: '📦', col: 'c-sky', guide: 'ruby',
    hello: "Hi, I'm Ruby! We say on the first floor, at the bus stop, on the platform and in the cinema.",
    learn: [...PP_LEARN, ...GU('g6').learn], qs: [...GU('g6').qs, ...PP_EXTRA, ...prepQs('rev1'), ...prepQs('u2')], game: ['kitty', '🐱 Where is Kitty?'], game2: ['sort', '🧺 at · on · in'] },
  { id: 'mm', n: 3, title: "must and mustn't", tag: 'Item 3 · GT U19 · WB 2A U2', sub: 'Rules for public places', emo: '🚦', col: 'c-mint', guide: 'ruby',
    hello: "Let's follow the rules! Must means we have to do it. Mustn't means don't do it!",
    learn: [...MM_LEARN, ...GU('g19').learn.slice(0, 2), ...GU('u2').learn.slice(0, 2)], qs: [...mustQs('g19'), ...mustQs('u2'), ...MM_EXTRA], game: ['light', '🚦 Green or red?'] },
  { id: 'sp1', n: 4, title: 'Places at school', tag: 'Item 4 · Spelling · PLE 2A U1', sub: 'classroom · library · corridor …', emo: '🏫', col: 'c-butter', guide: 'mimi', spell: 'u1',
    hello: 'Listen, look and spell! Tap a card to hear the word.', words: GU('u1').words, qs: [...spellQs('u1'), ...missQs('u1')] },
  { id: 'sp2', n: 4, title: 'Rules words', tag: 'Item 4 · Spelling · PLE 2A U2', sub: 'litter · spit · push · platform …', emo: '🚏', col: 'c-peach', guide: 'ruby', spell: 'u2',
    hello: 'These words help us talk about rules. Can you spell them?', words: GU('u2').words, qs: [...spellQs('u2'), ...missQs('u2')] },
  { id: 'sp3', n: 4, title: 'Seasons and weather', tag: 'Item 4 · Spelling · PLE 2B U7', sub: 'spring · summer · autumn · winter …', emo: '🌦️', col: 'c-lav', guide: 'mimi', spell: 'u7',
    hello: 'Spring, summer, autumn, winter! Let\'s spell the weather words.', words: GU('u7').words, qs: [...spellQs('u7'), ...missQs('u7')] },
];
