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
| **Front-end round** | Written | Implement-from-scratch classics, DOM and browser, language depth, performance and a11y, component design |
| **System design** | To write | Round format, the client-side→distributed gap, answer skeleton, numbers to memorise |
| **Googleyness** | To write | Attributes actually scored, a STAR story bank, senior-scope framing |

Three controls in the header:

- **Filter** — type a keyword to narrow every card on the page.
- **Review mode** — collapses all self-test answers so you can quiz yourself.
- **Reviewed checkboxes** — per pattern and per structure, stored in
  `localStorage`, so it remembers what you have been through. "Reset progress"
  clears them.

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
