# Interview prep

A study deck for the Google **Senior Software Engineer, Web Development** loop.
Static files, no dependencies, no build step — open `index.html` in a browser.

## Why it exists

The CV work is done. A referral gets you past the stage an impressive CV would
have helped with, so from here the hiring committee reads *transcripts of your
rounds*, not your CV. This is the prep for those rounds.

## Using it

Open `index.html`. Four tabs:

| Tab | State | Covers |
| --- | --- | --- |
| **DSA** | Written | How a round runs, constraint→complexity table, Python and JS toolkits, priority tiers, 17 patterns, 13 structure cards with self-tests |
| **Reflexes** | Written | Cue→reflex table, the nine triage questions, 15 named optimisation moves, reasoning→code translation, learning method |
| **Problems** | Written | 60 problems, shuffled, difficulty hidden until solved |
| **Front-end round** | Written | Implement-from-scratch classics, DOM and browser, language depth, performance and a11y, component design |
| **System design** | To write | Round format, the client-side→distributed gap, answer skeleton, numbers to memorise |
| **Googleyness** | To write | Attributes actually scored, a STAR story bank, senior-scope framing |

Three controls in the header:

- **Filter** — type a keyword to narrow every card on the page.
- **Review mode** — collapses all self-test answers so you can quiz yourself.
- **Reviewed checkboxes** — per pattern, move and structure, stored in
  `localStorage`. "Reset reviewed marks" clears those and **does not touch solved
  problems**, which are kept under a separate key so they cannot be wiped by
  accident.

## The Reflexes tab

The one to open daily. It exists because the bottleneck is usually not knowing
an algorithm, it is retrieving the right one within ten seconds of reading a
question.

- **Cue → reflex** — the phrase that appears in the question, and what to reach
  for before you finish reading it. Read the left column and answer before
  looking right.
- **The nine questions** — what to ask, in order, when you have no idea yet.
  Designed so most problems reveal themselves by question five ("where is the
  brute force redundant?").
- **The moves** — the reusable tricks underneath the patterns: sort to buy an
  invariant, process in an order that makes dependencies already resolved, turn
  objects into events, track the frontier not the history, reverse the question.
  Patterns are what you *recognise*; moves are what you *do*.
- **Reasoning → code** — the step people skip, plus the six translation bugs.

## The Problems tab

Sixty problems, and **deliberately shuffled**. Grouping them by pattern would
train execution while destroying the thing being trained — if you know it is a
window problem before reading it, you have skipped the only hard step.

- **Difficulty, pattern and key insight stay hidden** until you tick *solved*.
  Difficulty is a spoiler: "hard" tells you not to trust your first idea, which
  is information a real interview will not give you.
- **You decide what counts as solved.** Ticking reveals the meta so you can
  check your reasoning against it.
- **"Stuck — reveal"** opens the same block without marking it solved.
- Progress persists in `localStorage`.

**The intended workflow:** write your reasoning on paper first — output type, n,
the brute force, where it is redundant, the pattern you are betting on. Then
batch the reviews: come back and say *"problem #23, here is my reasoning — what
do you think?"* Several at once. You do the thinking, the review is the cheap
part.

## Editing

All content is data, separate from rendering:

```
data/base.js       the round, the constraint table, the language toolkits
data/tiers.js      what to study in what order, with likelihood
data/patterns.js   the pattern catalogue — signal, template, cost, problems, bug
data/topics.js     one card per structure, with self-test Q&A
data/frontend.js   the front-end domain round
app.js             tabs, rendering, filter, review mode, progress
```

Add a pattern by appending to `PATTERNS.items`; nothing else needs touching.

## The order to work in

1. **Patterns first, not problems.** Learn to recognise the *signal*. Problems
   are re-skins of about seventeen ideas.
2. **Then the structure cards**, using "Cold" as the bar: type it correctly,
   first try, no reference.
3. **Then timed practice** — 35 minutes, no autocomplete, no running the code,
   narrating out loud. The format is a separate skill from the algorithms and it
   is the one most likely to be undertrained.

## Related

The callback repo (`C:/projects/friends/callback`) already holds two deep-dive
docs that serve the front-end round directly:

- `tools/INTERVIEW-PREP.md` — event propagation, delegation, `preventDefault`,
  measured with real numbers
- `tools/GOOGLE-FRONTEND-STACK.md` — how Meet's front end is actually built,
  jsaction, GM3, Material Symbols
