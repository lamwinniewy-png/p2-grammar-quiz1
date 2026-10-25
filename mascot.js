/* Susu (red bow) and Neko (space buns): cartoon guides drawn from the family's two dolls */
'use strict';
const DOLL = (n, cls = '') => `<img class="doll ${cls}" src="img/${n}.webp" alt="" draggable="false">`;
const rnd2 = (a, b) => (Math.random() < .5 ? a : b);
const MASCOT = {
  get happy() { return DOLL(rnd2('susu-happy', 'neko-happy')); },
  get wink() { return DOLL(rnd2('susu-cheer', 'neko-cheer')); },
  get sad() { return DOLL(rnd2('susu-think', 'neko-think')); },
  get star() { return DOLL(rnd2('susu-cheer', 'neko-cheer')); },
  cloud: '<svg viewBox="0 0 120 60" aria-hidden="true"><path d="M30 50 h62 a18 18 0 0 0 0-36 a26 26 0 0 0-48-4 a20 20 0 0 0-14 40z" fill="#fff" opacity=".9"/></svg>',
};
