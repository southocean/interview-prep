# Appendix: the compressed forms, held back on purpose

**Status: draft, not yet a page on the site. Deliberately deferred.**

Nam: *"actually I was reacting prematurely. Having efficient code is fine too,
like the `seen.get()`, but for now we can live with the easier version just so I
increase my speed of learning, then we can introduce them back in at a later
point with a full appendix on production code optimization."*

So this file is the holding pen. Every idiom removed from the site's snippets is
recorded here with its expanded form, so nothing is lost to git history and the
appendix can be written from a real list rather than from memory.

## Read this before the list

**None of these are faster.** That is the correction worth making, because the
first framing of this rule muddled it. `d.get(k, 0)` and `if k in d` have the
same complexity and roughly the same runtime. Ternaries do not beat `if/else`.
Comprehensions are marginally faster than an append loop, and that margin has
never decided an interview.

These are **idioms**: they save characters and they signal fluency to a reader
who already knows them. That is a real benefit in production code, where the
audience is other professionals and the code is read hundreds of times. It is a
cost on a study site, where the audience is learning the algorithm underneath.

**Real efficiency work is a different subject** — fewer passes, better data
structures, avoiding copies, tightening the complexity class. The site teaches
that on every page. Do not conflate "short" with "fast".

## When to come back to this

When the expanded form has become automatic — when you read the spelled-out
window template and see *the pattern* rather than *the lines*. At that point the
compressed forms become useful shorthand rather than a decoding tax, and they
are worth learning for two concrete reasons:

1. **You will read them in interviews and in real codebases.** Someone else's
   solution will use `.get()` and a ternary, and you should not lose a second to
   it.
2. **They are faster to type under time pressure.** Twenty minutes of writing
   time is real, and a comprehension you can produce without thinking is worth
   having.

## The idioms, with both forms

### `dict.get(key, default)`

```python
# compressed
total += seen.get(run - k, 0)
seen[run] = seen.get(run, 0) + 1

# expanded (what the site uses)
from collections import defaultdict
prefix_counts = defaultdict(int)     # missing key reads as 0
total += prefix_counts[needed]
prefix_counts[running_sum] += 1
```

`get` returns the value if present and the default otherwise, instead of raising
`KeyError`. `defaultdict(int)` achieves the same by manufacturing a `0` on first
touch. The compressed form is one line shorter; the expanded form names the
behaviour where it is introduced.

### Conditional expression (ternary)

```python
# compressed
return order if len(order) == n else []
width = i - stack[-1] - 1 if stack else i

# expanded
if len(order) == n:
    return order
return []
```

Reads inside out: you meet the result before the condition that chose it. Fine
once fluent, costly while learning.

### Semicolon-joined statements

```python
# compressed
out.append(a[i]); i += 1

# expanded
out.append(a[i])
i += 1
```

Pure character saving, no upside even in production. This one probably should not
come back.

### Two computations on one line

```python
# compressed
l, r = height(node.left), height(node.right)
cur_max, cur_min = max(x, cur_max * x, cur_min * x), \
                   min(x, cur_max * x, cur_min * x)

# expanded
left_height = height(node.left)
right_height = height(node.right)
```

The Kadane max-product case is the cautionary one: the compressed version reads
`cur_max` twice while assigning to it, which is correct only because Python
evaluates the whole right side first. That is a genuine trap, not just a
readability cost — worth teaching *as* a trap in the appendix.

### `functools.reduce`

```python
# compressed
lone = reduce(xor, xs)

# expanded
lone = 0
for x in xs:
    lone ^= x
```

### Nested comprehension

```python
# compressed
flat = [x for row in grid for x in row]

# expanded
flat = []
for row in grid:
    for x in row:
        flat.append(x)
```

The compressed form's clause order is the surprise: it reads outer-loop-first,
left to right, which is the opposite of how most people first guess.

### Walrus operator

```python
# compressed
while (line := f.readline()):

# expanded
line = f.readline()
while line:
    ...
    line = f.readline()
```

### Chained assignment

```python
# compressed
run = total = 0
left = best = 0

# expanded
run = 0
total = 0
```

Harmless with immutable values, and a genuine trap with mutable ones —
`a = b = []` gives two names for **one** list. Worth teaching alongside.

### Slice reversal

```python
xs[::-1]        # a reversed COPY
xs.reverse()    # in place, returns None
list(reversed(xs))
```

Three forms with different memory behaviour. The appendix should cover which is
which, since a copy inside a loop is a real complexity bug.

## Also worth a section, when this is written

- **`sorted(key=...)` with tuple keys**, including the negation trick for mixed
  directions and why stability lets you sort twice instead.
- **`enumerate` / `zip` / `zip(*)`** — already used on the site, worth a page.
- **Generator expressions vs list comprehensions**, and when the laziness
  matters.
- **`any` / `all` with a generator**, which is both terse and genuinely faster
  because it short-circuits. One of the few cases where the compressed form wins
  on more than characters.
- **JS equivalents**, since the front-end round is in JS: optional chaining,
  nullish coalescing, destructuring with defaults, and the 32-bit bitwise trap.
