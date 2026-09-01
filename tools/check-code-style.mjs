/* Code in this repo is TEACHING code, written for a reader who is still
 * building speed. It is spelled out rather than compressed.
 *
 * THIS IS A STAGING DECISION, NOT A JUDGEMENT ABOUT GOOD CODE.
 *
 * Nam, first: "they use a lot of syntax optimization that make the lines short
 * at the cost of comprehension ... what does this syntax do again? Very
 * annoying."
 *
 * Nam, correcting himself: "actually I was reacting prematurely. Having
 * efficient code is fine too, like the seen.get(), but for now we can live with
 * the easier version just so I increase my speed of learning, then we can
 * introduce them back in at a later point with a full appendix on production
 * code optimization."
 *
 * That is the right framing and this file follows it. While recognition is the
 * thing being trained, a reader who stops to decode syntax has lost the thread
 * of the algorithm -- so the compressed forms are held back. They are not
 * wrong; they are the SECOND thing to learn, and every one removed is recorded
 * in tools/IDIOM-APPENDIX.md ready to be taught deliberately later.
 *
 * Worth keeping straight, because the first framing muddled it: none of the
 * banned forms below are faster. `d.get(k, 0)` and `if k in d` are the same
 * complexity and roughly the same speed. They save characters, not time. Real
 * efficiency work -- fewer passes, better structures, avoiding copies -- is a
 * separate subject and the site teaches it everywhere.
 *
 * The gate runs in `npm run check` and in the pre-commit hook. The banned list
 * is deliberately narrow: constructs whose MEANING is not obvious reading left
 * to right. Ordinary Python is fine. defaultdict, heapq and enumerate stay,
 * because they are named concepts with pages explaining them rather than syntax
 * puzzles.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DATA = 'data';

/* Each rule: what it matches, and what to do instead. The advice matters more
   than the detection -- a gate that only says "no" teaches nothing. */
const RULES = [
  {
    id: 'walrus',
    re: /:=/,
    say: 'Assignment inside an expression. Assign on its own line first.',
  },
  {
    id: 'semicolon',
    re: /;\s*\S/,
    say: 'Two statements on one line. Give each its own line.',
  },
  {
    id: 'inline-if',
    // A block header must END with its colon. Testing for "colon followed by
    // code" wrongly matched slices like xs[1:] -- the colon is not always the
    // header's own.
    test: (line) => {
      const t = line.trim();
      if (!/^(if|elif|else|for|while|def|class|try|except|with)\b/.test(t)) return false;
      // Find a colon at bracket depth zero -- that is the header's own colon.
      // A colon inside [] or () belongs to a slice or a dict and is not it.
      let depth = 0;
      for (let i = 0; i < t.length; i++) {
        const c = t[i];
        if ('([{'.includes(c)) depth++;
        else if (')]}'.includes(c)) depth--;
        else if (c === ':' && depth === 0) {
          return t.slice(i + 1).trim().length > 0;   // code after the colon
        }
      }
      return false;   // no header colon on this line: it is a continuation
    },
    say: 'Body on the same line as its header. Put the body on the next line, indented.',
  },
  {
    id: 'ternary',
    re: /\S\s+if\s+.+\s+else\s+/,
    say: 'Conditional expression. Use a plain if/else block -- four lines that read in order beat one that reads inside out.',
  },
  {
    id: 'nested-comprehension',
    re: /\[[^\]]*\bfor\b[^\]]*\bfor\b/,
    say: 'Two for-clauses in one comprehension. Use nested loops.',
  },
  {
    id: 'get-default',
    re: /\.get\([^)]*,[^)]*\)/,
    say: 'dict.get(key, default) hides a branch. Use an explicit `if key in d:` or a defaultdict, and say which.',
  },
  {
    id: 'reduce',
    re: /\breduce\(/,
    say: 'functools.reduce is unreadable for a learner. Write the loop.',
  },
  {
    id: 'multi-assign-calls',
    // a, b = f(...), g(...)  -- two different computations on one line.
    // Plain swaps and attribute walks (a, b = b, a / slow, fast = slow.next, ...)
    // read fine and are not matched.
    re: /^\s*\w+\s*,\s*\w+\s*=\s*[^=\n]*\w\([^=\n]*,\s*[^=\n]*\w\(/,
    say: 'Two separate computations assigned on one line. Split them, and name any value used twice.',
  },
  {
    id: 'line-continuation',
    re: /\\\s*$/,
    say: 'Backslash continuation. Restructure so each line stands alone.',
  },
];

/** Pull every code string out of a data file, with the id it belongs to. */
function extractSnippets(src, file) {
  const out = [];
  // Track the most recent `id: 'x'` so a violation can be reported against a page.
  const lines = src.split('\n');
  let currentId = '(top of file)';
  let inCode = false;
  let buf = [];
  let startLine = 0;
  let field = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const idMatch = line.match(/\bid:\s*'([^']+)'/);
    if (idMatch && !inCode) currentId = idMatch[1];
    // deviations.js keys its entries by object key rather than an id: field
    const keyMatch = line.match(/^\s*'([\w-]+)':\s*\[/);
    if (keyMatch && !inCode) currentId = keyMatch[1];

    if (!inCode) {
      // A field opening a template literal: `code: \``, `template: \``, `build: \``
      const open = line.match(/\b(code|template|build)\s*:\s*`(.*)$/);
      if (open) {
        field = open[1];
        startLine = i + 1;
        inCode = true;
        buf = [];
        const rest = open[2];
        if (rest.includes('`')) {
          // opened and closed on the same line
          buf.push(rest.slice(0, rest.indexOf('`')));
          out.push({ file, id: currentId, field, startLine, code: buf.join('\n') });
          inCode = false;
        } else {
          buf.push(rest);
        }
      }
      continue;
    }

    if (line.includes('`')) {
      buf.push(line.slice(0, line.indexOf('`')));
      out.push({ file, id: currentId, field, startLine, code: buf.join('\n') });
      inCode = false;
    } else {
      buf.push(line);
    }
  }
  return out;
}

const files = readdirSync(DATA).filter((f) => f.endsWith('.js'));
let snippets = [];
for (const f of files) {
  snippets = snippets.concat(extractSnippets(readFileSync(join(DATA, f), 'utf8'), f));
}

const hits = [];
for (const s of snippets) {
  const codeLines = s.code.split('\n');
  let inDocstring = false;
  for (let i = 0; i < codeLines.length; i++) {
    const line = codeLines[i];
    // Docstrings and comments are prose, not code, and may say anything.
    const fences = (line.match(/"""/g) || []).length;
    const wasInDocstring = inDocstring;
    if (fences % 2 === 1) inDocstring = !inDocstring;
    if (wasInDocstring || inDocstring || fences > 0) continue;
    if (/^\s*#/.test(line)) continue;
    const bare = line.replace(/#.*$/, '');
    for (const rule of RULES) {
      const bad = rule.test ? rule.test(bare) : rule.re.test(bare);
      if (bad) {
        hits.push({ ...s, rule, line: bare.trim(), n: i + 1 });
      }
    }
  }
}

console.log(`code style: ${snippets.length} snippets across ${files.length} data files`);

if (!hits.length) {
  console.log('           all clear -- nothing optimised for length at the cost of reading');
  process.exit(0);
}

const byRule = {};
for (const h of hits) (byRule[h.rule.id] = byRule[h.rule.id] || []).push(h);

console.error(`\n${hits.length} violation(s):\n`);
for (const id of Object.keys(byRule)) {
  console.error(`  ${id} -- ${byRule[id][0].rule.say}`);
  for (const h of byRule[id]) {
    console.error(`      ${h.file} :: ${h.id} :: ${h.field} +${h.n}`);
    console.error(`      ${h.line}`);
  }
  console.error('');
}
console.error('Teaching code is optimised for comprehension. Fix the lines above.');
process.exit(1);
