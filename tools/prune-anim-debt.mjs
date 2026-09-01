/* Removes debt entries whose animation has landed.
 *
 * The gate deliberately FAILS when a listed item gains an animation, so the
 * list cannot silently stall. This is the one-command way to settle that, and
 * it only ever removes -- it can never add, so it cannot be used to hide work.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const win = {};
win.ANIMS = {};
for (const f of ['patterns', 'structures', 'techniques', 'deviations', 'anims', 'anims-b', 'anims-c']) {
  new Function('window', readFileSync(`data/${f}.js`, 'utf8'))(win);
}
const anims = new Set(Object.keys(win.ANIMS));

const FILE = 'tools/anim-debt.json';
const data = JSON.parse(readFileSync(FILE, 'utf8'));
const before = data.uncovered.length;
data.uncovered = data.uncovered.filter((k) => !anims.has(k));
data.remaining = data.uncovered.length;
writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n');

console.log(`anim debt: ${before} -> ${data.remaining}  (${before - data.remaining} settled)`);
