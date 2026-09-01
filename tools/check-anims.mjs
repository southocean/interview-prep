/* EVERY SOLUTION MUST SHIP WITH AN ANIMATION.
 *
 * Nam: "Make it a hard hook that every problem when showing solution needs to
 * show an animation too."
 *
 * That is the rule. The complication is that the rule arrived after ~190
 * solutions were already written, and a gate that fails 190 times on day one is
 * a gate everybody switches off. A permanently red build teaches nothing.
 *
 * So it is a RATCHET, which is how a strict rule gets introduced to an existing
 * codebase without lying about the state of it:
 *
 *   - Anything new without an animation FAILS. The rule is hard going forward,
 *     which is the part that actually matters -- you cannot add a solution
 *     without animating it.
 *   - Everything already uncovered is listed, by name, in tools/anim-debt.json.
 *     That file is the honest backlog.
 *   - The list may only SHRINK. Once a listed item gains an animation the gate
 *     fails until its entry is deleted, so the debt cannot silently stall, and
 *     adding to the list requires an edit that shows up in review.
 *
 * The debt count is printed on every run, so the number is in front of you
 * rather than buried in a TODO.
 */
import { readFileSync, existsSync } from 'node:fs';

const FILES = ['patterns', 'structures', 'techniques', 'deviations', 'anims'];
const win = {};
for (const f of FILES) {
  new Function('window', readFileSync(`data/${f}.js`, 'utf8'))(win);
}

const DEBT_FILE = 'tools/anim-debt.json';
const debt = existsSync(DEBT_FILE) ? new Set(JSON.parse(readFileSync(DEBT_FILE, 'utf8')).uncovered) : new Set();
const anims = new Set(Object.keys(win.ANIMS));

/* Everything that shows a worked solution and therefore owes an animation.
   Structure `build` blocks are excluded on purpose: they show how a structure is
   CONSTRUCTED, not a problem being solved, so there is nothing to step through. */
const owed = [];
for (const p of win.PATTERNS.items) {
  if (p.template) owed.push({ key: p.id, what: `pattern "${p.name}" template` });
}
for (const t of win.TECHNIQUES.items) {
  if (t.code) owed.push({ key: t.id, what: `technique "${t.name}" code` });
}
for (const page of Object.keys(win.DEVIATIONS)) {
  win.DEVIATIONS[page].forEach((d, i) => {
    owed.push({ key: `${page}/${i}`, what: `deviation ${page} Q${i + 1}: ${d.q.slice(0, 52)}` });
  });
}

const missing = owed.filter((o) => !anims.has(o.key) && !debt.has(o.key));
const paidOff = [...debt].filter((k) => anims.has(k));
const stale = [...debt].filter((k) => !owed.some((o) => o.key === k));

const covered = owed.filter((o) => anims.has(o.key)).length;
console.log(`anims: ${covered} of ${owed.length} solutions animated, ${debt.size} on the debt list`);

const problems = [];

if (missing.length) {
  problems.push(`${missing.length} solution(s) with no animation and not on the debt list:`);
  for (const m of missing) problems.push(`    ${m.key}  --  ${m.what}`);
  problems.push('  Add an animation keyed by exactly that id in data/anims.js.');
  problems.push('  The rule is: a solution ships with a way to watch it run.');
}

if (paidOff.length) {
  problems.push(`${paidOff.length} item(s) now animated but still listed as debt. Delete them from ${DEBT_FILE}:`);
  for (const k of paidOff) problems.push(`    ${k}`);
}

if (stale.length) {
  problems.push(`${stale.length} debt entr(ies) name nothing that exists. Delete them from ${DEBT_FILE}:`);
  for (const k of stale) problems.push(`    ${k}`);
}

if (problems.length) {
  console.error('');
  for (const line of problems) console.error(line.startsWith('    ') ? line : `  ${line}`);
  console.error('');
  process.exit(1);
}

if (debt.size === 0) {
  console.log('       every solution has one, and the debt list is empty');
} else {
  console.log(`       nothing new is uncovered; ${debt.size} to work through`);
}
