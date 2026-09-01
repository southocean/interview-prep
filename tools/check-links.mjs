/* The graph validator, promoted out of a README one-liner into a real check.
 *
 * Every relationship in this repo is declared in ONE direction and inverted at
 * load, so the only way it can rot is a typo in an id. This walks every edge and
 * fails on any that does not resolve.
 */
import { readFileSync } from 'node:fs';
import { loadData } from './data-files.mjs';


// The data files assign to `window.X`, so loadData gives them a window.
const win = loadData(readFileSync);

const P = win.PATTERNS.items;
const S = win.STRUCTURES.items;
const T = win.TECHNIQUES.items;
const PR = win.PROBLEMS.items;

const pid = new Set(P.map((x) => x.id));
const sid = new Set(S.map((x) => x.id));
const tid = new Set(T.map((x) => x.id));
const anyId = new Set([...pid, ...sid, ...tid]);

const resolves = (kind, id) =>
  (kind === 'pat' && pid.has(id)) || (kind === 'str' && sid.has(id)) || (kind === 'tech' && tid.has(id));

const bad = [];

// patterns -> structures, patterns -> patterns
for (const p of P) {
  for (const x of p.structures || []) if (!sid.has(x)) bad.push(`pattern ${p.id} -> structure ${x}`);
  for (const x of p.also || []) if (!pid.has(x)) bad.push(`pattern ${p.id} -> also ${x}`);
}

// techniques -> family, techniques -> anything
for (const t of T) {
  if (t.family && !resolves(t.family[0], t.family[1])) bad.push(`technique ${t.id} -> family ${t.family}`);
  for (const pair of t.also || []) if (!resolves(pair[0], pair[1])) bad.push(`technique ${t.id} -> also ${pair}`);
}

// problems -> patterns / structures / techniques
PR.forEach((r, i) => {
  for (const x of r.pat || []) if (!pid.has(x)) bad.push(`problem #${i + 1} -> pattern ${x}`);
  for (const x of r.str || []) if (!sid.has(x)) bad.push(`problem #${i + 1} -> structure ${x}`);
  for (const x of r.tech || []) if (!tid.has(x)) bad.push(`problem #${i + 1} -> technique ${x}`);
});

// the linkifier's vocabulary
for (const phrase of Object.keys(win.LEXICON)) {
  const [kind, id] = win.LEXICON[phrase].split(':');
  if (!resolves(kind, id)) bad.push(`lexicon "${phrase}" -> ${kind}:${id}`);
}

// content keyed by page id
for (const [name, obj] of [['worked', win.WORKED], ['refs', win.REFS], ['deviations', win.DEVIATIONS]]) {
  for (const key of Object.keys(obj)) if (!anyId.has(key)) bad.push(`${name} key "${key}" is not a page`);
}

/* Animations key either a page ("window") or one of its deviations
   ("window/0"). A deviation animation whose index does not exist would render
   nowhere at all, silently, so check the index too. */
for (const key of Object.keys(win.ANIMS)) {
  if (!key.includes('/')) {
    if (!anyId.has(key)) bad.push(`anims key "${key}" is not a page`);
    continue;
  }
  const [page, idx] = key.split('/');
  if (!anyId.has(page)) {
    bad.push(`anims key "${key}" names no page`);
  } else if (!win.DEVIATIONS[page] || !win.DEVIATIONS[page][Number(idx)]) {
    bad.push(`anims key "${key}" has no such deviation`);
  }
}

// deviations must be complete -- a half-written one renders as a gap
for (const key of Object.keys(win.DEVIATIONS)) {
  win.DEVIATIONS[key].forEach((d, i) => {
    for (const field of ['q', 'base', 'change', 'code', 'why']) {
      if (!d[field] || !String(d[field]).trim()) bad.push(`deviations ${key}[${i}] missing ${field}`);
    }
  });
}

// duplicate ranks would make sidebar order non-deterministic
for (const [name, list] of [['patterns', P], ['structures', S], ['techniques', T]]) {
  const seen = new Set();
  for (const x of list) {
    if (seen.has(x.rank)) bad.push(`${name}: duplicate rank ${x.rank} (${x.id})`);
    seen.add(x.rank);
  }
}

/* Coverage, reported rather than enforced: the fuller problem statements are
   being added page by page, and a number that is visible gets finished. */
let withProblem = 0, devTotal = 0;
for (const key of Object.keys(win.DEVIATIONS)) {
  for (const d of win.DEVIATIONS[key]) {
    devTotal++;
    if (d.problem && d.example && d.reduces) withProblem++;
  }
}
const devAnims = Object.keys(win.ANIMS).filter((k) => k.includes('/')).length;

const total = P.length + S.length + T.length;
console.log(`links: ${total} pages (${P.length} patterns, ${S.length} structures, ${T.length} techniques), ` +
  `${PR.length} problems, ${Object.keys(win.LEXICON).length} lexicon entries`);

if (bad.length) {
  console.error(`\n${bad.length} broken reference(s):`);
  for (const b of bad) console.error(`  ${b}`);
  process.exit(1);
}
console.log('       every reference resolves');
console.log(`       deviations: ${devTotal} total, ${withProblem} with a full problem statement, ` +
  `${devAnims} with an animation`);
