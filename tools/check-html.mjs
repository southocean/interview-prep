/* index.html must load exactly the data files the tools load.
 *
 * A file the page loads but the gates do not means the gates are checking a
 * different site than the one you see. A file the gates load but the page does
 * not means content that exists and never renders. Both are silent, so this is
 * a gate.
 */
import { readFileSync } from 'node:fs';
import { DATA_FILES } from './data-files.mjs';

const html = readFileSync('index.html', 'utf8');
const inPage = [...html.matchAll(/<script src="data\/([\w-]+)\.js">/g)].map((m) => m[1]);

const missing = DATA_FILES.filter((f) => !inPage.includes(f));
const extra = inPage.filter((f) => !DATA_FILES.includes(f));

console.log(`html: ${inPage.length} data files loaded by the page`);
if (!missing.length && !extra.length) {
  console.log('      the page and the tools agree');
  process.exit(0);
}
if (missing.length) console.error(`\n  index.html never loads: ${missing.join(', ')}`);
if (extra.length) console.error(`\n  index.html loads files the tools do not: ${extra.join(', ')}`);
console.error('\n  Keep index.html and tools/data-files.mjs in step.');
process.exit(1);
