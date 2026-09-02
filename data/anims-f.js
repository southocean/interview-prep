/* Animations, batch F: techniques, first half.
 * Sorting family, recursion family, array tricks, bit tricks.
 */
Object.assign(window.ANIMS, {

  // =============================================================== sorting ==

  'sorting': {
    title: 'Sorting ["bb", "a", "ccc", "dd"] by length, then alphabetically',
    cells: ['bb', 'a', 'ccc', 'dd'],
    frames: [
      { stat: 'key = (len(w), w)', note: 'A tuple key. Python compares element by element, so the reading order of the tuple is the priority order of the keys.' },
      { mark: [1], stat: '"a" -> (1, "a")', note: 'Each word becomes its key once. The key function is called n times, not on every comparison.' },
      { mark: [0, 3], stat: '"bb" -> (2, "bb"),  "dd" -> (2, "dd")', note: 'Equal lengths, so the second element of the tuple decides between them.' },
      { mark: [2], stat: '"ccc" -> (3, "ccc")', note: 'Longest, so it sorts last regardless of its letters.' },
      { stat: 'result: a, bb, dd, ccc', note: 'No custom comparator needed. Two keys, one tuple.' },
      { stat: 'STABLE: equal keys keep input order', note: 'Which lets you sort by the secondary key first and the primary second — useful when one direction is descending and the values are not numbers.' },
    ],
  },

  'sorting/0': {
    title: 'Mixed directions: negate the numeric field',
    contrast: 'The base tuple sorts everything ascending. One minus sign flips a single field.',
    cells: ['A 90', 'B 90', 'C 70'],
    label: '(group, score):',
    frames: [
      { stat: 'want: group ascending, score DESCENDING', note: 'Two keys pulling opposite ways, which a plain tuple cannot express.' },
      { mark: [0, 1], stat: 'key = (group, -score)', note: 'Negation reverses only that field. Ascending on a negated number is descending on the original.' },
      { mark: [0], stat: 'A 90 -> ("A", -90)', note: '-90 sorts before -70, so the higher score comes first.' },
      { mark: [2], stat: 'C 70 -> ("C", -70)', note: 'The group still sorts ascending, untouched.' },
      { stat: 'but negation needs a NUMBER', note: 'You cannot negate a string. For descending text, exploit stability instead: sort by the secondary key first, then by the primary.' },
      { stat: 'two sorts, in reverse priority order', note: 'sort(key=secondary) then sort(key=primary). Stability preserves the first ordering inside each group of the second.' },
    ],
  },

  'sorting/1': {
    title: 'Sort the INDICES when the answer is a position',
    contrast: 'The base sorts values in place, which destroys the one thing the caller asked for.',
    cells: [30, 10, 20],
    frames: [
      { stat: '"return the index of the smallest"', note: 'The answer is a position in the ORIGINAL array. Sorting the values throws those positions away.' },
      { mark: [1], stat: 'sorted values: [10, 20, 30]  ->  smallest at 0', note: 'Index 0 of the sorted array. That is not what was asked, and the mistake is invisible unless you check.' },
      { stat: 'order = sorted(range(n), key=lambda i: xs[i])', note: 'Sort the indices BY their values. The array itself is never reordered.' },
      { mark: [1, 2, 0], stat: 'order = [1, 2, 0]', note: 'Index 1 holds the smallest value, index 2 the next, index 0 the largest.' },
      { stat: 'order[0] = 1  ->  the answer', note: 'Original positions preserved throughout.' },
      { stat: 'the tell is "return the index"', note: 'Any time the output is a position rather than a value, ask what sorting would cost before doing it.' },
    ],
  },

  'sorting/2': {
    title: 'JS: [10, 9, 100].sort() gives [10, 100, 9]',
    contrast: 'Not a variation but a trap. The default comparator is lexicographic, and the bug is silent.',
    cells: [10, 9, 100],
    frames: [
      { range: [0, 2], stat: 'expected [9, 10, 100]', note: 'Any reasonable expectation of what .sort() does to numbers.' },
      { mark: [0], stat: 'JS converts to STRINGS first: "10", "9", "100"', note: 'The default comparator compares string representations. Nothing warns you.' },
      { mark: [0, 2], stat: '"10" < "100" < "9"  (character by character)', note: '"1" comes before "9", so both 10 and 100 sort before 9.' },
      { stat: 'result [10, 100, 9]', note: 'Sorted, by a rule nobody wanted. On single-digit test data it looks perfectly correct.' },
      { stat: 'always: sort((a, b) => a - b)', note: 'The comparator returns negative, zero or positive. It is not optional for numbers.' },
      { stat: 'Python has no such trap', note: 'sorted() on numbers is numeric. This one is specific to the front-end round.' },
    ],
  },

  // ========================================================= counting-sort ==

  'counting-sort': {
    title: 'Top-2 frequent in [1,1,1,2,2,3] by bucketing counts',
    cells: [1, 1, 1, 2, 2, 3],
    frames: [
      { range: [0, 5], stat: 'counts {1:3, 2:2, 3:1}', note: 'A count can never exceed n = 6, so the values being ordered live in a small fixed range.' },
      { stat: 'buckets: an empty list for each count 0..n', note: 'One slot per possible count. No comparisons will happen at all.' },
      { mark: [0, 1, 2], stat: 'buckets[3] = [1]', note: 'File each value under its own count.' },
      { mark: [3, 4], stat: 'buckets[2] = [2]', note: 'Placement is O(1) per distinct value.' },
      { mark: [5], stat: 'buckets[1] = [3]', note: 'Table complete after one pass over the counts.' },
      { stat: 'read down from n: [1], then [2]  ->  stop at k', note: 'Answer [1, 2] in O(n). Beats O(n log n) sorting and O(n log k) heaping, because it never compares anything.' },
    ],
  },

  'counting-sort/0': {
    title: 'Values up to 10^9: bucketing 100 items into a billion slots',
    contrast: 'The base allocates one slot per possible value. That is only affordable while the range is comparable to n.',
    cells: [5, 900000000, 42],
    frames: [
      { stat: 'n = 3, range = 10^9', note: 'Three items, a billion possible values. The trade has inverted.' },
      { stat: 'buckets: an empty list for each of 10^9 values', note: 'Gigabytes of empty lists to sort three numbers. It would not even allocate.' },
      { mark: [0, 2], stat: 'sorting 3 items: trivial', note: 'O(n log n) on n = 3 is nothing. Counting sort solves a problem that does not exist here.' },
      { stat: 'rule: range must be O(n)-ish', note: 'Ages, scores out of 100, minutes in a day, letter frequencies. Check the range before reaching for it.' },
      { mark: [0, 1, 2], stat: 'or compress: {5:0, 42:1, 9e8:2}', note: 'Coordinate compression maps the three distinct values onto 0..2, and then bucketing is affordable again.' },
      { stat: 'the sentence to say', note: '"Counting sort if the range is small, otherwise compress first or just sort." That is the judgement being tested.' },
    ],
  },

  'counting-sort/1': {
    title: 'Bucketing objects, and getting stability for free',
    contrast: 'The base counts occurrences and discards the items. Bucket the items themselves and the sort becomes stable.',
    cells: ['A:2', 'B:1', 'C:2'],
    label: 'items with small integer keys:',
    frames: [
      { stat: 'counting only: {1: 1, 2: 2}', note: 'Enough to reconstruct a sorted list of KEYS. The objects are gone.' },
      { mark: [0], stat: 'buckets[2].append(A)', note: 'Append the object instead. Same pass, same cost.' },
      { mark: [1], stat: 'buckets[1].append(B)', note: 'Each object files under its own key.' },
      { mark: [2], stat: 'buckets[2] = [A, C]', note: 'C joins A. They were appended in input order, so that order is preserved.' },
      { stat: 'read buckets in order: B, A, C', note: 'A before C, exactly as in the input. Stability by construction — nothing had to be arranged for it.' },
      { stat: 'why stability matters', note: 'It is what makes counting sort usable as a pass inside radix sort, where each digit pass must not disturb the previous one.' },
    ],
  },

  // ================================================ coordinate-compression ==

  'coordinate-compression': {
    title: 'Timestamps 5, 900000000, 42 mapped onto 0, 1, 2',
    cells: [5, 900000000, 42],
    frames: [
      { range: [0, 2], stat: 'range 10^9, but only 3 distinct values', note: 'The gap between "how many values there are" and "how large they get" is what makes compression pay.' },
      { stat: 'vals = sorted(set(xs)) = [5, 42, 9e8]', note: 'Sort the distinct values. Their positions become the new coordinates.' },
      { mark: [0], stat: '5 -> rank 0', note: 'Order is preserved exactly. Only magnitude is lost.' },
      { mark: [2], stat: '42 -> rank 1', note: 'The relative order of every pair is unchanged, which is all a sweep or a difference array needs.' },
      { mark: [1], stat: '900000000 -> rank 2', note: 'An array of 3 slots now does the work of an array of 10^9.' },
      { stat: 'and map back at the end', note: 'answer = vals[rank]. Skipping the inverse returns a rank where a value was asked for — the standard mistake.' },
    ],
  },

  'coordinate-compression/0': {
    title: 'When the answer is a value, the inverse map is mandatory',
    contrast: 'The base works entirely in rank space. If the output is a real coordinate, one line is still missing.',
    cells: [100, 250, 900],
    frames: [
      { mark: [0, 1, 2], stat: 'compressed to ranks 0, 1, 2', note: 'The algorithm runs happily in index space and produces an index.' },
      { mark: [1], stat: 'algorithm returns rank 1', note: 'Correct — in the compressed world.' },
      { stat: 'returning 1 is WRONG', note: 'The caller asked for a timestamp, and 1 is not one. It is a plausible-looking number, which is what makes it dangerous.' },
      { mark: [1], stat: 'vals[1] = 250', note: 'One lookup restores the real value.' },
      { stat: 'counts need no inverse', note: 'If the answer is "how many" rather than "which", rank space is fine. Knowing which kind of answer you have is the whole check.' },
    ],
  },

  'coordinate-compression/1': {
    title: 'When the gaps matter, compression is simply wrong',
    contrast: 'The base preserves order and destroys distance. Any problem that measures length cannot use it as-is.',
    cells: [0, 10, 1000],
    label: 'positions:',
    frames: [
      { mark: [0, 1, 2], stat: 'true gaps: 10 and 990', note: 'Wildly uneven spacing, and that unevenness is often the point.' },
      { mark: [0, 1, 2], stat: 'ranks 0, 1, 2  ->  gaps 1 and 1', note: 'Compression makes them look evenly spaced. Every distance is now a lie.' },
      { stat: 'total covered length: 1000 vs 2', note: 'Any sum of durations, areas or distances comes out wrong — and plausibly wrong, not obviously.' },
      { mark: [1, 2], stat: 'fix: carry width[i] = vals[i+1] - vals[i]', note: 'Compress the indices but keep the true spacing alongside, and weight each slot by its real width.' },
      { stat: 'order-only questions are safe', note: '"How many overlap", "which is the kth" — fine. "How long", "how much area" — needs the widths.' },
    ],
  },

  // ============================================================= recursion ==

  'recursion': {
    title: 'Depth of 1(2(4,5), 3): base case, progress, contract',
    cells: [1, 2, 3, 4, 5],
    label: 'nodes:',
    frames: [
      { stat: 'three obligations, every time', note: 'A base case that terminates, progress towards it, and a clear contract for what the call returns.' },
      { ptrs: { at: 3 }, mark: [3], stat: 'BASE: no children  ->  return 1', note: 'Without a base case the recursion never stops. It is the first thing to write, not the last.' },
      { ptrs: { at: 1 }, mark: [1, 3, 4], stat: 'PROGRESS: each call gets a smaller subtree', note: 'Strictly smaller input every time, which is what guarantees the base case is reached.' },
      { ptrs: { at: 1 }, mark: [1], stat: 'CONTRACT: "returns the depth below me"', note: 'State it in words. Most tree bugs are the function returning something different from what the caller assumed.' },
      { ptrs: { at: 0 }, mark: [0, 1, 2], stat: 'root trusts its children: 1 + max(2, 1) = 3', note: 'The root does not re-walk anything. It combines two answers it trusts, which is the whole discipline.' },
      { stat: 'write the contract as a comment first', note: 'If you cannot write that sentence, you do not have a recursion yet — you have a hope.' },
    ],
  },

  'recursion/0': {
    title: '10^5 deep: the algorithm is right, the runtime refuses',
    contrast: 'The base uses the call stack. Past a thousand frames Python raises, and no amount of correctness helps.',
    cells: [1, 2, 3, 4, 5],
    label: 'a chain, not a tree:',
    frames: [
      { range: [0, 4], stat: 'every node has one child', note: 'A degenerate tree. Depth equals n, so recursion depth equals n.' },
      { ptrs: { at: 1 }, mark: [0, 1], stat: 'frames: 2', note: 'Nothing returns until the far end is reached, so frames only accumulate.' },
      { ptrs: { at: 4 }, mark: [0, 1, 2, 3, 4], stat: 'frames: 10^5  ->  RecursionError', note: 'Python\'s default limit is about a thousand. A hard stop, not a slow answer.' },
      { stat: 'option A: sys.setrecursionlimit(10**6)', note: 'Quick, and it can crash the interpreter rather than raise cleanly if the C stack runs out first. Say that you know the risk.' },
      { stat: 'option B: an explicit stack', note: 'Same O(n) space, but on the heap where there is no fixed ceiling. Always safe, slightly more code.' },
      { stat: 'either way, SAY you noticed', note: 'The constraint is in the problem precisely to see whether depth crossed your mind. That is the scored part.' },
    ],
  },

  'recursion/1': {
    title: 'One decorator turns recursion into dynamic programming',
    contrast: 'The base recomputes every call. Nothing about the shape changes — only that answers are remembered.',
    cells: [0, 1, 2, 3, 4, 5],
    label: 'fib(n):',
    frames: [
      { mark: [5], stat: 'fib(5) = fib(4) + fib(3)', note: 'Two branches, each of which branches again. The tree doubles at every level.' },
      { mark: [3], stat: 'fib(3) is computed under fib(4) AND under fib(5)', note: 'The same subproblem, reached by different routes. That overlap is the definition of a DP problem.' },
      { mark: [1, 2, 3], stat: 'without a cache: O(2^n) calls', note: 'fib(30) is over a million calls for a number you could add up on paper.' },
      { stat: '@lru_cache(None)', note: 'One line above the function. The recursion is untouched.' },
      { mark: [0, 1, 2, 3, 4, 5], stat: 'with a cache: n+1 distinct states', note: 'Each value computed once and read thereafter. O(2^n) becomes O(n).' },
      { stat: 'memoised recursion IS dynamic programming', note: 'Framing it that way makes DP a one-line upgrade rather than a separate topic to fear.' },
    ],
  },

  'recursion/2': {
    title: 'No tail-call optimisation in Python: rewrite as a loop',
    contrast: 'A tail call looks like it should be free. In Python it still costs a frame, so the ceiling is unchanged.',
    cells: [5, 4, 3, 2, 1],
    label: 'countdown(n):',
    frames: [
      { mark: [0], stat: 'def go(n): if n == 0: return; go(n-1)', note: 'The recursive call is the very last thing. Some languages reuse the frame; Python does not.' },
      { ptrs: { at: 1 }, mark: [0, 1], stat: 'frames: 2 — nothing reclaimed', note: 'The frame is kept even though nothing remains to be done in it.' },
      { ptrs: { at: 4 }, mark: [0, 1, 2, 3, 4], stat: 'frames: n  ->  same limit as any recursion', note: 'Tail position buys nothing here. The stack grows exactly as fast.' },
      { stat: 'while n > 0: n -= 1', note: 'Any tail recursion converts mechanically to a while loop: the recursive arguments become the loop variables.' },
      { stat: 'O(1) stack', note: 'Faster and unbounded. If the recursion is genuinely tail-shaped, the loop is strictly better in Python.' },
    ],
  },

  // ======================================================== divide-conquer ==

  'divide-conquer': {
    title: 'Merge sort on [5, 2, 8, 1]: split, solve, combine',
    cells: [5, 2, 8, 1],
    frames: [
      { range: [0, 3], stat: 'T(n) = 2T(n/2) + O(n)', note: 'Split into halves, recurse on both, spend linear time merging. That recurrence resolves to O(n log n).' },
      { range: [0, 1], stat: 'left [5, 2]   right [8, 1]', note: 'The halves are INDEPENDENT — neither needs anything from the other. That independence is what licenses the recurrence.' },
      { mark: [0, 1], stat: 'sort left  ->  [2, 5]', note: 'Recurse. At size 1 the base case returns immediately.' },
      { mark: [2, 3], stat: 'sort right  ->  [1, 8]', note: 'Same on the other side, and nothing was shared between them.' },
      { range: [0, 3], stat: 'merge [2,5] and [1,8]  ->  [1,2,5,8]', note: 'The combine step is two pointers, linear in the total size. That O(n) per level times log n levels is the whole cost.' },
      { stat: 'if the halves are NOT independent', note: 'Then you are re-solving shared work and need a cache. Overlapping subproblems means DP, not divide and conquer.' },
    ],
  },

  'divide-conquer/0': {
    title: 'Counting inversions during the merge, for free',
    contrast: 'The base merges and returns a list. The comparisons it already makes carry the answer, so counting costs nothing.',
    cells: [2, 5],
    label: 'left half:',
    cells2: [1, 8],
    label2: 'right half:',
    frames: [
      { ptrs: { i: 0 }, ptrs2: { j: 0 }, mark: [0], mark2: [0], stat: 'inversions = 0', note: 'An inversion is a pair out of order. Brute force is O(n^2) over all pairs.' },
      { ptrs: { i: 0 }, ptrs2: { j: 1 }, mark: [0, 1], mark2: [0], stat: '1 < 2  ->  take from RIGHT', note: 'Taking from the right half means 1 jumped ahead of everything still in the left half.' },
      { ptrs: { i: 0 }, ptrs2: { j: 1 }, mark: [0, 1], stat: 'inversions += len(left) - i = 2', note: 'Both 2 and 5 are inverted with 1. Two inversions counted in ONE operation, not two comparisons.' },
      { ptrs: { i: 1 }, ptrs2: { j: 1 }, range: [0, 0], mark2: [1], stat: 'take 2 from left  ->  no inversions', note: 'Taking from the left is the in-order case and adds nothing.' },
      { ptrs2: { j: 1 }, range: [0, 1], stat: 'take 5, then 8   total 2', note: 'The merge already compared every cross-half pair implicitly. Counting there is free.' },
      { stat: 'O(n^2) becomes O(n log n)', note: 'The insight is that the algorithm was already doing the work — you just were not reading it.' },
    ],
  },

  'divide-conquer/1': {
    title: 'When the halves share state, it is DP instead',
    contrast: 'The base assumes the two halves can be solved alone. If solving one needs the other, the recurrence is invalid.',
    cells: [1, 2, 3, 4],
    frames: [
      { range: [0, 1], stat: 'divide and conquer assumes independence', note: 'T(n) = 2T(n/2) + O(n) counts each half exactly once, which is only honest if they do not overlap.' },
      { range: [0, 2], mark: [1, 2], stat: 'but suppose left needs part of right', note: 'Now the two recursive calls re-solve shared subproblems, and each does it again on the way down.' },
      { stat: 'the recurrence undercounts the work', note: 'The real cost is far worse than O(n log n), because the same subproblem is computed many times.' },
      { mark: [1, 2], stat: 'overlapping subproblems  ->  cache them', note: 'Which is DP. Memoise on the state and each shared subproblem is computed once.' },
      { stat: 'the distinction in one line', note: 'Divide and conquer partitions; DP overlaps. If you can draw the recursion tree and see a repeated node, you need a cache.' },
    ],
  },

  // ========================================================= meet-in-middle ==

  'meet-in-middle': {
    title: 'n = 40: two lots of 2^20 instead of one 2^40',
    cells: [1, 2, 3, 4],
    label: 'items (abridged from 40):',
    frames: [
      { range: [0, 3], stat: '2^40 ~ 10^12 subsets', note: 'Full enumeration is a trillion. Backtracking cannot finish, and no polynomial algorithm exists.' },
      { range: [0, 1], stat: 'split: first half, second half', note: 'Twenty items each. The exponent halves, and that is the entire idea.' },
      { mark: [0, 1], stat: 'A = all subset sums of half 1   (2^20 = 10^6)', note: 'A million sums. Enumerable in well under a second.' },
      { mark: [2, 3], stat: 'B = all subset sums of half 2, SORTED', note: 'Another million, sorted so it can be searched.' },
      { stat: 'for each a in A: binary search B for target - a', note: 'The join. 10^6 searches of log(10^6), which is about 2 x 10^7 operations.' },
      { stat: '10^12  ->  ~10^7', note: 'The constraint n ~ 40 is the tell. Recognising it and naming the technique is usually enough; you will rarely code it fully.' },
    ],
  },

  'meet-in-middle/0': {
    title: 'n = 60: halving the exponent is not enough',
    contrast: 'The base turns 2^n into 2^(n/2). That roughly doubles the feasible n and no more.',
    cells: [1, 2, 3, 4],
    label: 'items (abridged from 60):',
    frames: [
      { stat: '2^60 ~ 10^18', note: 'Hopeless by any measure.' },
      { range: [0, 1], stat: 'split: 2^30 per half ~ 10^9', note: 'A billion subsets per half. Both to enumerate, and one to sort.' },
      { stat: 'plus 10^9 binary searches', note: 'Tens of billions of operations, and gigabytes to hold the lists. Not feasible.' },
      { stat: 'the rule of thumb', note: 'Meet in the middle roughly DOUBLES the workable n. If 2^n is fine to 20, this gets you to about 40 — not to 60.' },
      { stat: 'so look for structure instead', note: 'At n = 60 the intended solution is polynomial: a DP over a different state, a greedy, or a flow formulation.' },
    ],
  },

  'meet-in-middle/1': {
    title: 'Submask enumeration: 3^n, not 4^n',
    contrast: 'A related trick from the same family — iterate the subsets OF each subset without a nested full scan.',
    cells: ['000', '001', '010', '011'],
    label: 'masks:',
    frames: [
      { stat: 'for each mask, visit every submask', note: 'The naive version loops all masks inside all masks: 2^n x 2^n = 4^n.' },
      { mark: [3], stat: 'mask = 011', note: 'Its submasks are 011, 010, 001, 000 — four of them, not all eight masks.' },
      { mark: [2], stat: 'sub = (sub - 1) & mask  ->  010', note: 'Subtracting one borrows through the low bits; the AND clips it back inside the mask.' },
      { mark: [1], stat: 'next: 001', note: 'The sequence walks exactly the submasks, in decreasing order, touching nothing else.' },
      { mark: [0], stat: 'then 000, and stop', note: 'The loop ends when sub reaches zero.' },
      { stat: 'total across all masks: exactly 3^n', note: 'Each bit is in one of three states per pair: out of the mask, in the mask but not the submask, or in both. Hence 3^n.' },
    ],
  },

  // ====================================================== index-as-storage ==

  'index-as-storage': {
    title: 'Which of 1..5 are missing from [3, 1, 3, 4, 1]?',
    cells: [3, 1, 3, 4, 1],
    frames: [
      { range: [0, 4], stat: 'values are in 1..n  ->  O(1) space is possible', note: 'That phrasing is the licence for this technique. Value v can be recorded at index v-1.' },
      { ptrs: { at: 0 }, mark: [2], stat: 'saw 3  ->  negate xs[2].  [3, 1, -3, 4, 1]', note: 'The sign of a slot becomes a "seen" flag, and the magnitude still holds the original value.' },
      { ptrs: { at: 1 }, mark: [0], stat: 'saw 1  ->  negate xs[0].  [-3, 1, -3, 4, 1]', note: 'Read abs(x) so an already-negated value still points to the right slot.' },
      { ptrs: { at: 2 }, mark: [2], stat: 'saw 3 again  ->  xs[2] already negative, leave it', note: 'A duplicate. Negating twice would flip it back and lose the flag.' },
      { ptrs: { at: 4 }, mark: [0, 2, 3], stat: '[-3, 1, -3, -4, 1]', note: 'After the pass, a positive slot means that index+1 was never seen.' },
      { mark: [1, 4], stat: 'positive at index 1 and 4  ->  missing 2 and 5', note: 'O(1) extra space. The array carried the bookkeeping.' },
    ],
  },

  'index-as-storage/0': {
    title: 'The input must not be modified: the trick has no purpose',
    contrast: 'The base writes flags into the caller\'s array. Forbid that and the only thing it bought is gone.',
    cells: [3, 1, 3, 4, 1],
    frames: [
      { range: [0, 4], stat: 'the technique exists to avoid O(n) space', note: 'That is its entire justification. It is not faster — it is the same O(n) time.' },
      { mark: [0, 2], stat: 'but it mutates: [-3, 1, -3, ...]', note: 'The caller\'s data is now full of negative numbers.' },
      { stat: '"do not modify the input"', note: 'Now you must either copy it — paying the O(n) you were avoiding — or restore it afterwards.' },
      { stat: 'seen = set()   # the honest alternative', note: 'O(n) space, two lines, obviously correct, and no mutation.' },
      { stat: 'restoring is possible but fiddly', note: 'A second pass taking absolute values works. Say the option, then say the set is simpler unless space is genuinely constrained.' },
    ],
  },

  'index-as-storage/1': {
    title: 'A zero has no sign to flip',
    contrast: 'The base marks by negating. Zero negated is still zero, so the flag cannot be stored.',
    cells: [0, 1, 2],
    frames: [
      { mark: [0], stat: 'xs[0] = 0', note: 'Negation marking needs a value whose sign carries information.' },
      { mark: [0], stat: '-0 == 0  ->  the mark is invisible', note: 'You cannot tell a marked zero from an unmarked one. The technique silently loses that slot.' },
      { mark: [1, 2], stat: 'negative inputs break it too', note: 'An input that is already negative reads as "seen" before you touch it.' },
      { stat: 'so: values must be in 1..n', note: 'The standard phrasing exists precisely to guarantee a usable sign. Check it before committing.' },
      { stat: 'alternatives: offset, or cyclic sort', note: 'Add n+1 to everything first, or place each value at its own index and read mismatches. Both survive zeros.' },
    ],
  },
});
