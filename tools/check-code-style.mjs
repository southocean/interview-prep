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

/* Is there a `for ... in ...` inside a bracket pair? That is a comprehension or
   a generator expression, whichever bracket it happens to sit in -- [] for a
   list, {} for a dict or set, () for a genexp or a bare argument to a call. */
function isComprehension(text) {
  for (let i = 0; i < text.length; i++) {
    if (!'([{'.includes(text[i])) continue;
    let depth = 0;
    for (let j = i; j < text.length; j++) {
      if ('([{'.includes(text[j])) depth++;
      else if (')]}'.includes(text[j])) {
        depth--;
        if (depth === 0) {
          if (/\bfor\s+.+\s+in\s+/.test(text.slice(i, j + 1))) return true;
          break;
        }
      }
    }
  }
  return false;
}

/* Physical lines joined while brackets stay open, so a construct split across
   lines is tested as the one expression it really is. Returns the joined text
   with the physical line number it started on. */
function logicalLines(codeLines) {
  const out = [];
  let buf = '';
  let depth = 0;
  let start = 0;
  for (let i = 0; i < codeLines.length; i++) {
    const line = codeLines[i];
    if (!buf) start = i;
    buf += (buf ? ' ' : '') + line.trim();
    for (const c of line) {
      if ('([{'.includes(c)) depth++;
      else if (')]}'.includes(c)) depth--;
    }
    if (depth <= 0) {
      out.push({ text: buf, n: start + 1, raw: codeLines[start] });
      buf = '';
      depth = 0;
    }
  }
  if (buf) out.push({ text: buf, n: start + 1, raw: codeLines[start] });
  return out;
}

/* `else:` belongs to a loop when the nearest block header at its own indent is
   a for or a while. That else runs only if the loop did NOT break. */
function loopElseLines(codeLines) {
  const hits = [];
  for (let i = 0; i < codeLines.length; i++) {
    if (codeLines[i].trim() !== 'else:') continue;
    const indent = codeLines[i].match(/^\s*/)[0].length;
    for (let j = i - 1; j >= 0; j--) {
      const t = codeLines[j];
      if (!t.trim() || /^\s*#/.test(t)) continue;
      const ind = t.match(/^\s*/)[0].length;
      if (ind > indent) continue;
      if (ind < indent) break;
      if (/^\s*(for|while)\b/.test(t)) hits.push(i + 1);
      break;   // the nearest header at this indent decides it
    }
  }
  return hits;
}

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
    // Supersedes the old nested-comprehension rule, which only looked inside
    // [] and so missed deque(... for ... for ... if ...) entirely.
    id: 'comprehension',
    test: (line) => isComprehension(line),
    say: 'A comprehension or generator expression. Build the result with a loop that appends -- and never pass a bare `for` into a function call.',
  },
  {
    id: 'get-default',
    re: /\.get\([^)]*,[^)]*\)/,
    say: 'dict.get(key, default) hides a branch. Use an explicit `if key in d:` or a defaultdict, and say which.',
  },
  {
    id: 'setdefault',
    re: /\.setdefault\(/,
    say: 'dict.setdefault hides both a branch and an assignment. Write `if k not in d: d[k] = ...` then read d[k].',
  },
  {
    id: 'loop-else',
    // `else:` at the indent of a for/while runs only when the loop did NOT
    // break. Almost nobody recalls that under pressure. Detected in the
    // snippet pass below, which can see the surrounding lines.
    test: () => false,
    say: 'A for/while `else` clause. Set an explicit found = False flag before the loop and test it after.',
  },
  {
    id: 'chained-assign',
    re: /^\s*\w+\s*=\s*\w+\s*=\s*\S/,
    say: 'Chained assignment (a = b = 0). Give each name its own line.',
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
  // Normalise line endings first. JavaScript counts a carriage return as a
  // line terminator, so `.` will not match one and a trailing `$` never fires.
  // On CRLF files that silently extracted ZERO snippets from every data file,
  // and the gate then passed on an empty set.
  const lines = src.split(/\r?\n/);
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

const LOOP_ELSE = RULES.find((r) => r.id === 'loop-else');

const hits = [];
for (const s of snippets) {
  const codeLines = s.code.split('\n');

  // Strip docstrings and comments once, keeping line positions, so both the
  // per-line rules and the joined-expression rules see the same clean text.
  const clean = [];
  let inDocstring = false;
  for (const line of codeLines) {
    const fences = (line.match(/"""/g) || []).length;
    const wasInDocstring = inDocstring;
    if (fences % 2 === 1) inDocstring = !inDocstring;
    if (wasInDocstring || inDocstring || fences > 0) clean.push('');
    else if (/^\s*#/.test(line)) clean.push('');
    else clean.push(line.replace(/#.*$/, ''));
  }

  for (const n of loopElseLines(clean)) {
    hits.push({ ...s, rule: LOOP_ELSE, line: 'else:   (attached to a loop)', n });
  }

  // Rules run against LOGICAL lines -- a construct split over several physical
  // lines is one expression and has to be tested as one.
  for (const { text, n } of logicalLines(clean)) {
    if (!text.trim()) continue;
    for (const rule of RULES) {
      if (rule.id === 'loop-else') continue;
      const bad = rule.test ? rule.test(text) : rule.re.test(text);
      if (bad) {
        hits.push({ ...s, rule, line: text.trim().slice(0, 100), n });
      }
    }
  }
}

/* Animation captions carry code too -- `stat: 'buckets = [[] for _ in ...]'` is
 * a comprehension on the screen even though it is not in a `code:` field. The
 * snippet pass above cannot see it, so scan every stat: string as well.
 *
 * Only the comprehension rule runs here. A caption is allowed to be prose, and
 * a plain `for c in range(...)` in one describes a loop rather than being one. */
let captions = 0;
for (const f of files) {
  const lines = readFileSync(join(DATA, f), 'utf8').split(/\r?\n/);
  let currentId = '(top of file)';
  for (let i = 0; i < lines.length; i++) {
    const keyMatch = lines[i].match(/^\s*'([\w/-]+)':\s*\{/);
    if (keyMatch) currentId = keyMatch[1];
    const stat = lines[i].match(/\bstat:\s*'((?:[^'\\]|\\.)*)'/);
    if (!stat) continue;
    captions++;
    if (isComprehension(stat[1])) {
      hits.push({
        file: f, id: currentId, field: 'stat', rule: RULES.find((r) => r.id === 'comprehension'),
        line: stat[1].slice(0, 100), n: i + 1,
      });
    }
  }
}

console.log(`code style: ${snippets.length} snippets and ${captions} captions across ${files.length} data files`);

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
