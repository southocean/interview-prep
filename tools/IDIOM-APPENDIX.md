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

### Generator expression passed straight into a function

```python
# compressed
stack.extend((c, False) for c in (node.right, node.left) if c)
total = sum(w for u, v, w in edges if union(u, v))
groups = sum(1 for i in range(n) if find(i) == i)
q = deque((r, c) for r in range(R) for c in range(C) if grid[r][c] == SRC)

# expanded
if node.right:
    stack.append((node.right, False))
if node.left:
    stack.append((node.left, False))
```

The single worst offender for a learner, because three separate ideas share one
line: what is produced, what is iterated, and what is filtered out. Read left to
right it makes no sense — the `for` in the middle governs the expression on the
left, and the `if` at the end governs both.

Two extra traps worth teaching when this comes back:

- **No brackets of its own.** `f(x for y in z)` is a generator expression using
  the *call's* parentheses. Write `f((x for y in z), other)` the moment there is
  a second argument, or it is a syntax error.
- **It is lazy.** The loop has not run when the expression is written. With
  `sum(w for ... if union(u, v))` the side effect inside `union` happens during
  the `sum`, not before it — which is fine here and a disaster elsewhere.

### `dict.setdefault(key, default)`

```python
# compressed
node = node.setdefault(ch, {})

# expanded
if ch not in node:
    node[ch] = {}
node = node[ch]
```

Same family as `dict.get(k, default)`, and worse: it hides a branch **and** a
mutation **and** returns the value, three things in one call. The trie insert is
where it shows up in nearly every published solution.

Note the evaluation trap: `setdefault(ch, {})` builds a fresh `{}` on *every*
call, even when the key already exists and the new dict is thrown away
immediately. Harmless here, wasteful in a hot loop.

### `for ... else` and `while ... else`

```python
# compressed
for x, y in zip(a, b):
    if x != y:
        edges.add((x, y))
        break
else:
    if len(a) > len(b):
        return ''

# expanded
found_difference = False
for j in range(shared):
    if a[j] != b[j]:
        edges.add((a[j], b[j]))
        found_difference = True
        break

if not found_difference and len(a) > len(b):
    return ''
```

The `else` runs only when the loop finished **without** breaking. Almost nobody
recalls that under interview pressure, and the ones who do still have to pause.
The name is the problem: it reads as "otherwise", but it means "no break".

An explicit flag costs two lines and asks nothing of the reader.

### A call nested inside another call

```python
# compressed
heapq.heappush(high, -heapq.heappop(low))

# expanded
largest_low = -heapq.heappop(low)     # undo the negation to read the value
heapq.heappush(high, largest_low)
```

Has to be read inside out, and here it also hides the negate/un-negate dance
that makes a min-heap behave as a max-heap. Naming the intermediate is where the
explanation goes.

### Two calls in one expression

```python
# compressed
key = ''.join(sorted(w))

# expanded
letters = sorted(w)        # a LIST of characters
key = ''.join(letters)     # glued back into a string
```

The anagram key. The compressed form is genuinely idiomatic Python and worth
knowing — but it depends on knowing that `sorted` on a string returns a *list*,
not a string, which is exactly the fact a learner does not have yet.

### Pairwise iteration with `zip`

```python
# compressed
for a, b in zip(words, words[1:]):

# expanded
for i in range(len(words) - 1):
    a = words[i]
    b = words[i + 1]
```

Elegant, and it stops at the shorter sequence for free. It also allocates a copy
of the list (`words[1:]`), which is worth mentioning when this comes back —
`itertools.pairwise` does the same thing without the copy.

### Argsort: sorting indices by their values

```python
# compressed
order = sorted(range(len(xs)), key=lambda i: xs[i])

# expanded
pairs = []
for i, x in enumerate(xs):
    pairs.append((x, i))      # value FIRST, so sorting orders by value
pairs.sort()

order = []
for value, i in pairs:
    order.append(i)
```

Three concepts at once: sorting a range rather than the data, a key function,
and a closure reading `xs`. The expanded form leans on tuple comparison instead,
which is a thing the site teaches anyway.

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
