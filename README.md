# Interview prep

A study site for the Google **Senior Software Engineer, Web Development** loop.
Static files, no dependencies, no build step — open `index.html` in a browser.

## Why it exists

The CV work is done. A referral gets you past the stage an impressive CV would
have helped with, so from here the hiring committee reads *transcripts of your
rounds*, not your CV. This is the prep for those rounds.

## Using it

It is a routed site, not a page of tabs: a top menu for the six sections, a
sidebar listing everything inside the current section **ordered by importance**,
and a page per item.

| Section | State | Covers |
| --- | --- | --- |
| **DSA** | Written | 5 foundation pages, 22 pattern pages, 25 technique pages, 12 structure pages |
| **Reflexes** | Written | Cue→reflex, the nine triage questions, 15 named moves, reasoning→code, learning method |
| **Problems** | Written | 61 problems, shuffled, difficulty hidden until solved, filterable by pattern |
| **Front-end round** | Written | Implement-from-scratch classics, DOM, language depth, performance, component design |
| **System design** | To write | Round format, the client-side→distributed gap, answer skeleton, numbers |
| **Googleyness** | To write | Attributes scored, a STAR story bank, senior-scope framing |
| **Index** | Written | All 59 pages in one alphabetical list |

**Theme** — the Auto / Light / Dark control in the header. Auto follows the OS.
The choice is stored and applied before first paint, so it never flashes.

**Sidebar** — collapsible groups. Foundations is open by default and the long
lists start shut, so the panel is five lines rather than thirty-nine. Your
open/shut choice per group is remembered. A group containing the page you are on
is always forced open, so a cross-link never drops you into a hidden section, and
that forced state is not written back over a choice you made.

**Filter** — narrows the cards, tiles, rows and table rows on the current page.

**Cross-reference links** — technique names in the constraint table, the study
tiers and the cue→reflex table are links to the page that explains them, so you
can jump from "sweep" straight to the sweep page. The vocabulary lives in
`data/lexicon.js` and is checked by the graph validator, so a typo fails the
check rather than rendering a dead link. It is deliberately not exhaustive:
terms with no page (Floyd-Warshall, coordinate compression) stay plain text,
because a link that lands somewhere approximate is worse than no link.

## How the pages interconnect

This is what makes it a site rather than a document.

Every **pattern and technique page** carries **deviations, written as question
and answer**: a real interview question, then the diff from the template — what
it already does, what you change, the changed lines only, and why that is
correct. 141 of them across all 47 pages.

That section matters more than the template, because the template is the
textbook version and the deviations are the interview. The code block being a
**diff rather than a whole solution** is deliberate: reprinting four complete
solutions teaches four solutions, whereas showing the two lines that move
teaches one solution and three adaptations.

Pattern pages link to the structures they use, related patterns, and every
problem on them. **Structure pages** carry how it is built, a costs table, what
to know cold, pitfalls and self-tests, and link back to the patterns built on
them and the problems that reach them. **Problems**, once solved, link to their
pattern and structure so the deviations can be read while it is fresh.

### Links are declared once and inverted at load

Patterns name their structures; problems name their pattern. **Nothing declares
the reverse** — `app.js` builds those indexes at startup. So adding a problem
appears on its pattern page and on that pattern's structure pages with no second
edit, and the two directions cannot drift apart.

To check the graph after editing content:

```bash
npm run check
```

That runs two gates. The first walks every reference — patterns to structures,
techniques to families, problems to patterns, the lexicon, and every content
file keyed by page id — and fails on anything that does not resolve. It earned
itself immediately: six `also` links pointed at pattern pages that did not
exist, and the renderer was silently dropping them.

## Code style: comprehension, not brevity

**The code on this site is teaching code, and it is optimised for reading.**

Nam: *"they use a lot of syntax optimization that make the lines short at the
cost of comprehension — what does this syntax do again? Very annoying."*

That is worse than annoying. A reader who stops to decode syntax has lost the
thread of the algorithm, which is the only thing the snippet exists to convey.
Every character saved by a clever idiom is paid for in comprehension, and on a
study site that is the wrong trade every time.

So it is a gate, not a guideline. `tools/check-code-style.mjs` runs in
`npm run check` and in the pre-commit hook, and it **fails the build** on:

| Banned | Instead |
| --- | --- |
| `x if c else y` | a plain `if` / `else` block |
| `a; b` on one line | one statement per line |
| `if c: body` on one line | body on the next line, indented |
| `dict.get(k, default)` | `if k in d:` or a `defaultdict`, and say which |
| `:=` | assign on its own line first |
| two `for` clauses in one comprehension | nested loops |
| `functools.reduce` | write the loop |
| `a, b = f(), g()` | two lines, and name anything used twice |
| backslash continuation | restructure so each line stands alone |

The list is deliberately narrow: constructs whose *meaning* is not obvious
reading left to right. Ordinary Python stays. `defaultdict`, `heapq` and
`enumerate` stay, because they are named concepts with pages explaining them
rather than syntax puzzles.

**Enable the hook** (once per clone):

```bash
git config core.hooksPath .githooks
```

## Editing

Content is data, separate from rendering:

```
data/base.js         the round, the constraint table, the language toolkits
data/tiers.js        study order with likelihoods
data/patterns.js     per pattern: signal, idea, template, deviations, bugs, links
data/structures.js   per structure: why, build, costs, cold, pitfalls, quiz
data/problems.js     per problem: ask, difficulty, insight, pattern links
data/reflexes.js     cues, triage, moves, translation, learning
data/frontend.js     the front-end domain round
app.js               router, sidebar, page renderers, derived indexes
```

Adding a pattern is appending to `PATTERNS.items` with an `id` and a `rank`. The
sidebar, the landing grid and every cross-link follow automatically.

## The Reflexes section

The one to open daily. It exists because the bottleneck is usually not knowing an
algorithm, it is retrieving the right one within ten seconds of reading a
question.

- **Cue → reflex** — the phrase that appears in the question, and what to reach
  for before you finish reading it.
- **The nine questions** — what to ask, in order, when you have no idea yet. Most
  problems reveal themselves by question five: *where is the brute force
  redundant?*
- **The moves** — the reusable tricks underneath the patterns: sort to buy an
  invariant, process in an order that makes dependencies already resolved, turn
  objects into events, track the frontier not the history, reverse the question.
  Patterns are what you *recognise*; moves are what you *do*.
- **Reasoning → code** — the step people skip, plus the six translation bugs.

## The Problems section

**Deliberately shuffled.** Grouping by pattern would train execution while
destroying the thing being trained — if you know it is a window problem before
reading it, you have skipped the only hard step. Two pairs are planted far apart
(Koko / ship packages, course schedule I and II) so the family has to be
recognised cold. Sidebar filtering by pattern is there for deliberate drilling
once recognition is no longer the goal.

- **Difficulty, pattern and insight stay hidden** until you tick *solved*.
  Difficulty is a spoiler: "hard" tells you not to trust your first idea, which a
  real interview will not.
- **You decide what counts as solved.** "Stuck — reveal" opens the same block
  without marking it.
- Progress persists in `localStorage` under its own key, so nothing else can wipe
  it.

**The intended workflow:** write your reasoning on paper first — output type, n,
the brute force, where it is redundant, the pattern you are betting on. Then
batch the reviews: *"problem #23, here is my reasoning — what do you think?"* You
do the thinking; review is the cheap part.

## Related

The callback repo (`C:/projects/friends/callback`) holds two deep-dive docs that
serve the front-end round directly:

- `tools/INTERVIEW-PREP.md` — event propagation, delegation, `preventDefault`
- `tools/GOOGLE-FRONTEND-STACK.md` — how Meet's front end is actually built
