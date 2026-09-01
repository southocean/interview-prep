/* Animations, batch B. Merged into the same ANIMS object.
 *
 * Split across files purely so no single file becomes unreadable — the key
 * space is flat and shared, and check-anims.mjs does not care which file an
 * entry lives in.
 *
 * For graph and tree pages the cell row holds the NODES in a fixed order and
 * the stat line carries the frontier (queue, stack, in-degrees). That keeps one
 * renderer for everything rather than inventing a second visual language, and
 * the structure itself is stated in the title.
 */
Object.assign(window.ANIMS, {

  // ============================================================ hash-count ==

  'hash-count': {
    title: 'Two Sum on [2, 7, 11, 15], target 9',
    cells: [2, 7, 11, 15],
    frames: [
      { ptrs: { i: 0 }, mark: [0], stat: 'need 7   map {}', note: 'The map is empty, so 7 is not in it yet. Store 2 -> index 0 and move on.' },
      { ptrs: { i: 1 }, mark: [1], stat: 'need 2   map {2: 0}', note: 'target - 7 = 2, and 2 IS in the map. Answer [0, 1] on the second element — the map was never fully built.' },
      { stat: 'answer [0, 1]', note: 'Check BEFORE you insert. Building the whole map first also works but needs a guard against pairing an element with itself.' },
    ],
  },

  'hash-count/0': {
    title: 'Grouping ["eat", "tea", "tan", "ate", "nat", "bat"] by anagram',
    contrast: 'The template keys on the value itself. Here the key is COMPUTED from the value, so different things collide deliberately.',
    cells: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'],
    frames: [
      { ptrs: { at: 0 }, mark: [0], stat: 'key "aet"  ->  groups {aet: [eat]}', note: 'Sort the letters to get a canonical form. "eat" becomes the key "aet".' },
      { ptrs: { at: 1 }, mark: [0, 1], stat: 'key "aet"  ->  groups {aet: [eat, tea]}', note: '"tea" sorts to the same key, so it lands in the same bucket without ever being compared to "eat".' },
      { ptrs: { at: 2 }, mark: [2], stat: 'key "ant"  ->  new bucket', note: 'A different key opens a new group. No comparison between words happens at any point.' },
      { ptrs: { at: 3 }, mark: [0, 1, 3], stat: 'key "aet"  ->  [eat, tea, ate]', note: '"ate" joins the first bucket. Three words, one lookup each.' },
      { ptrs: { at: 4 }, mark: [2, 4], stat: 'key "ant"  ->  [tan, nat]', note: 'Same for the second group.' },
      { ptrs: { at: 5 }, mark: [5], stat: 'key "abt"  ->  [bat]', note: 'Answer: three groups. O(n k log k) for the sorting of keys — and a 26-length count tuple would make it O(n k).' },
    ],
  },

  'hash-count/1': {
    title: 'Counting subarrays of [3, 4, 7, 2, -3, 1] that sum to 7',
    contrast: 'The template stores a value and its position. Here it stores a running prefix sum and HOW MANY TIMES it has occurred.',
    cells: [3, 4, 7, 2, -3, 1],
    frames: [
      { stat: 'counts {0: 1}   total 0', note: 'Seed with the empty prefix: sum 0, seen once. Without this line no subarray starting at index 0 is ever counted.' },
      { ptrs: { i: 0 }, range: [0, 0], stat: 'running 3   need -4   total 0', note: 'Looking for an earlier prefix of 3 - 7 = -4. Never seen, so nothing ends here.' },
      { ptrs: { i: 1 }, range: [0, 1], stat: 'running 7   need 0   FOUND   total 1', note: 'need 0, and the seed provides it. That is the subarray [3, 4] — found only because of the seed.' },
      { ptrs: { i: 2 }, range: [2, 2], stat: 'running 14   need 7   FOUND   total 2', note: 'Prefix 7 was recorded at the previous step, so the subarray after it — just [7] — sums to 7.' },
      { ptrs: { i: 3 }, range: [0, 3], stat: 'running 16   need 9   total 2', note: 'Nothing at 9. The running sum keeps climbing regardless.' },
      { ptrs: { i: 4 }, range: [0, 4], stat: 'running 13   need 6   total 2', note: 'A negative value pulls the running sum DOWN, which is why a sliding window cannot solve this — it has no monotonicity to shrink on.' },
      { ptrs: { i: 5 }, range: [2, 5], stat: 'running 14   need 7   FOUND   total 3', note: 'Prefix 14 has now occurred twice, and 7 once. Answer 3: [3,4], [7], and [7,2,-3,1]. One pass, no nested loop.' },
    ],
  },

  'hash-count/2': {
    title: 'Top 2 frequent in [1, 1, 1, 2, 2, 3]',
    contrast: 'The template answers membership. Here you also need ORDER, which a hash map cannot give — so a second structure joins it.',
    cells: [1, 1, 1, 2, 2, 3],
    frames: [
      { range: [0, 5], stat: 'counts {1: 3, 2: 2, 3: 1}', note: 'The map does the counting in one pass. That part is the template unchanged.' },
      { stat: 'a hash map has NO order', note: 'It can say "1 appeared three times". It cannot say "1 appeared most". Do not try to make it.' },
      { mark: [0, 1, 2], stat: 'buckets[3] = [1]', note: 'Option A, O(n): bucket by count. A frequency can never exceed n, so an array of n+1 buckets is affordable.' },
      { mark: [3, 4], stat: 'buckets[2] = [2]', note: 'Each value is filed under its own count.' },
      { mark: [5], stat: 'buckets[1] = [3]', note: 'Now read the buckets from the top down and stop at k. No sorting and no heap.' },
      { stat: 'answer [1, 2]', note: 'Option B is a size-k heap at O(n log k), which is better when k is tiny and n is huge. Say which you picked and why.' },
    ],
  },

  'hash-count/3': {
    title: 'Are "anagram" and "nagaram" anagrams? A 26-slot array instead of a dict',
    contrast: 'The template hashes arbitrary keys. Here the keys are known to be 26 letters, so the container becomes a fixed array.',
    cells: ['a', 'n', 'a', 'g', 'r', 'a', 'm'],
    frames: [
      { stat: 'count = [0] * 26', note: 'No hashing at all. The key is ord(ch) - 97, which is just arithmetic.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'a -> index 0   count[0] = 1', note: 'Walk the first string, adding one per character.' },
      { ptrs: { at: 2 }, mark: [0, 2], stat: 'count[0] = 2', note: 'The second "a". Repeats simply accumulate.' },
      { ptrs: { at: 6 }, range: [0, 6], stat: 'count = a:3, n:1, g:1, r:1, m:1', note: 'First string counted. Now do the same for the second and compare.' },
      { stat: 'both arrays equal  ->  True', note: 'Two fixed-size arrays compare by VALUE in one operation. Two dicts would compare key by key.' },
      { stat: 'why it is better here', note: 'No hashing, contiguous memory, and comparable in one step. It only works because the alphabet was declared bounded — check that before reaching for it.' },
    ],
  },

  // ================================================================ window ==

  'window/2': {
    title: 'Exactly 2 distinct in "pqpqs", via atMost(2) − atMost(1)',
    contrast: 'The template can express "at most". It has no way to say "too small". So you do not write a new loop — you run the old one twice.',
    cells: ['p', 'q', 'p', 'q', 's'],
    frames: [
      { stat: 'a window can only shrink on INVALID', note: 'There is no signal for "this window is under target", so exactly-K cannot be expressed directly. That is the whole difficulty.' },
      { range: [0, 3], stat: 'atMost(2) counts 12 substrings', note: 'Run the at-most-K window and count every valid window as it slides. This includes windows with 1 distinct character as well as 2.' },
      { range: [0, 0], stat: 'atMost(1) counts 5 substrings', note: 'Run the identical function with K = 1. These are exactly the windows that are too small — 1 distinct character.' },
      { stat: '12 − 5 = 7', note: 'Subtracting removes everything with fewer than 2 distinct, leaving exactly-2. Two runs of an easy function beat one run of a hard one.' },
      { range: [0, 3], stat: 'pq, qp, pq, pqp, qpq, pqpq, qs', note: 'The seven. Worth memorising the trick outright — it converts a whole family of "exactly K" problems into a family you already solved.' },
    ],
  },

  'window/3': {
    title: 'Window maximum of [1, 3, -1, -3, 5] with k = 3',
    contrast: 'The template maintains a SUM, which updates by arithmetic. A maximum cannot be updated that way, so the counter becomes a deque.',
    cells: [1, 3, -1, -3, 5],
    frames: [
      { range: [0, 2], stat: 'sum works: add xs[i], subtract xs[i-k]', note: 'For a sum, sliding is two arithmetic operations. Nothing needs to be remembered.' },
      { range: [0, 2], mark: [1], stat: 'max = 3 ... now slide', note: 'For a maximum, sliding off the element that WAS the maximum leaves you with no idea what the new one is. You would have to rescan.' },
      { ptrs: { i: 2 }, mark: [1, 2], stat: 'deque [1, 2]  ->  max 3', note: 'So keep every element that could still become the maximum, in decreasing order. The front is the answer.' },
      { ptrs: { i: 3 }, mark: [1, 2, 3], stat: 'deque [1, 2, 3]  ->  max 3', note: '-3 is smaller and newer, so it queues up behind. It is still a candidate for later windows.' },
      { ptrs: { i: 4 }, mark: [4], stat: 'deque [4]  ->  max 5', note: '5 beats everything waiting, so the whole back empties. Each index is pushed once and popped once — still O(n).' },
      { stat: 'answer [3, 3, 5]', note: 'The window pattern is unchanged; only the maintained quantity was swapped. Recognising that the quantity is the problem is the transferable part.' },
    ],
  },

  'window/4': {
    title: 'Why [10, 9, 2, 5, 3, 7, 101, 18] defeats every window',
    contrast: 'The template rests on contiguity — "leaving the window" only means something if elements are adjacent. Remove that and no window exists.',
    cells: [10, 9, 2, 5, 3, 7, 101, 18],
    frames: [
      { range: [2, 5], stat: 'a window is CONTIGUOUS', note: 'Any window is a solid block. The longest increasing block here is [2, 5] or [3, 7] — length 2.' },
      { mark: [2, 4, 5, 7], stat: 'the answer skips: 2, 3, 7, 18', note: 'But the real answer is length 4, taken from indices 2, 4, 5 and 7. Those are not adjacent, so no window can hold them.' },
      { mark: [3], stat: 'index 3 (value 5) is skipped', note: 'A window would be forced to include the 5, which breaks the increase. A subsequence is allowed to leave it out.' },
      { stat: 'each element: take it, or skip it', note: 'That independent per-element choice is a DP state, not a window. The tell is the word "subsequence" instead of "subarray".' },
      { stat: 'dp[i] = longest ending at i', note: 'O(n^2) DP, or O(n log n) with patience sorting. Either way the window pattern is the wrong shelf entirely.' },
    ],
  },

  // ========================================================== binary-index ==

  'binary-index/0': {
    title: 'Finding 0 in the rotated array [4, 5, 6, 7, 0, 1, 2]',
    contrast: 'The template assumes the whole range is sorted. Here only ONE half of any midpoint is, so the first job each step is working out which.',
    cells: [4, 5, 6, 7, 0, 1, 2],
    frames: [
      { range: [0, 6], stat: 'two sorted runs: [4..7] and [0..2]', note: 'A rotated array is always two ascending runs. That is the structure to exploit.' },
      { ptrs: { lo: 0, hi: 6, mid: 3 }, range: [0, 6], mark: [3], stat: 'xs[mid]=7   xs[lo]=4   4 <= 7', note: 'The LEFT half is sorted, because its first element is not greater than the middle one.' },
      { ptrs: { lo: 0, hi: 6, mid: 3 }, range: [0, 3], stat: 'is 0 in [4, 7]?  no', note: 'Now an ordinary range test on a sorted stretch. 0 is not inside it, so discard the whole left half.' },
      { ptrs: { lo: 4, hi: 6, mid: 5 }, range: [4, 6], mark: [5], stat: 'xs[mid]=1   xs[lo]=0   0 <= 1', note: 'Left half sorted again — this time the left half of the remaining range.' },
      { ptrs: { lo: 4, hi: 6, mid: 5 }, range: [4, 5], stat: 'is 0 in [0, 1]?  YES', note: 'Inside, so keep this half and discard the rest.' },
      { ptrs: { lo: 4, hi: 4, mid: 4 }, mark: [4], stat: 'xs[4] = 0  ->  found', note: 'Index 4. Still O(log n): the extra work per step is one comparison to decide which half is trustworthy.' },
    ],
  },

  'binary-index/2': {
    title: 'Unknown length: double to find a bound, then search inside it',
    contrast: 'The template needs len(xs) for its upper bound. Here there is no length — only an API you can query.',
    cells: [1, 3, 5, 7, 9, 11, 13, 15],
    frames: [
      { stat: 'get(i) works, len(xs) does not', note: 'You can read any index but cannot ask how many there are. The template cannot even initialise hi.' },
      { ptrs: { hi: 0 }, mark: [0], stat: 'hi = 1   get(1) = 3   still < target 11', note: 'Start at 1 and test the predicate. Not there yet.' },
      { ptrs: { hi: 1 }, mark: [1], stat: 'hi = 2   get(2) = 5   < 11', note: 'Double. Each step doubles the ground covered, which is why finding the bound is itself only O(log n).' },
      { ptrs: { hi: 3 }, mark: [3], stat: 'hi = 4   get(4) = 9   < 11', note: 'Double again. Four probes so far.' },
      { ptrs: { lo: 3, hi: 7 }, range: [4, 7], mark: [7], stat: 'hi = 8   get(8) >= 11   FLIPPED', note: 'The predicate has flipped, so the answer lies between the previous bound and this one. lo = hi / 2.' },
      { ptrs: { lo: 4, hi: 7, mid: 5 }, range: [4, 7], mark: [5], stat: 'now the ordinary template runs', note: 'Binary search the bracketed range with the template unchanged. O(log n) to find the bound plus O(log n) to search.' },
    ],
  },

  'binary-index/3': {
    title: 'Find any peak in [1, 2, 1, 3, 5, 6, 4] — and the array is NOT sorted',
    contrast: 'The template needs a sorted array. This one needs only a monotonic PREDICATE, which is a weaker and far more useful requirement.',
    cells: [1, 2, 1, 3, 5, 6, 4],
    frames: [
      { range: [0, 6], stat: 'not sorted anywhere', note: 'It goes up, down, then up again. Binary search still applies, which surprises people.' },
      { ptrs: { lo: 0, hi: 6, mid: 3 }, mark: [3, 4], stat: 'xs[3]=3 < xs[4]=5  ->  uphill right', note: 'Compare mid with its NEIGHBOUR, not with a target. Going uphill means a peak must exist somewhere to the right.' },
      { ptrs: { lo: 4, hi: 6, mid: 5 }, range: [4, 6], mark: [5, 6], stat: 'xs[5]=6 > xs[6]=4  ->  downhill', note: 'Now downhill, so a peak lies at mid or to the LEFT. hi = mid.' },
      { ptrs: { lo: 4, hi: 5, mid: 4 }, range: [4, 5], mark: [4, 5], stat: 'xs[4]=5 < xs[5]=6  ->  uphill', note: 'Uphill again, so move lo up.' },
      { ptrs: { lo: 5, hi: 5 }, mark: [5], stat: 'peak at index 5, value 6', note: 'Found. The guarantee is that walking uphill can never run out of array without hitting a peak.' },
      { stat: 'the real requirement', note: 'Binary search needs a predicate that is false-then-true, not a sorted array. Noticing that generalises the pattern well beyond sorted input.' },
    ],
  },

  // ========================================================= binary-answer ==

  'binary-answer': {
    title: 'Koko: piles [3, 6, 7, 11], 8 hours — searching the SPEED, not the array',
    cells: [3, 6, 7, 11],
    frames: [
      { range: [0, 3], stat: 'the answer is a speed, not an index', note: 'Nothing in the array is the answer. What is being searched is the range of possible speeds, 1 to 11.' },
      { stat: 'can(1): 3+6+7+11 = 27 hours   > 8   NO', note: 'Write the checker first. At speed 1 each pile takes its own size in hours.' },
      { stat: 'can(11): 1+1+1+1 = 4 hours   <= 8   YES', note: 'At the maximum pile size, every pile takes one hour. So the answer is somewhere between 1 and 11.' },
      { stat: 'monotonic: if s works, s+1 works', note: 'Say this out loud. Feasibility is NO...NO,YES...YES over the speed range, which is exactly what binary search needs.' },
      { stat: 'mid 6: 1+1+2+2 = 6 hours   YES  ->  hi = 6', note: 'Feasible, so 6 might be the answer. Search lower.' },
      { stat: 'mid 3: 1+2+3+4 = 10 hours   NO  ->  lo = 4', note: 'Infeasible, so discard 3 and everything below.' },
      { stat: 'mid 4: 1+2+2+3 = 8 hours   YES  ->  hi = 4', note: 'Exactly 8 — feasible. Keep it.' },
      { stat: 'answer 4', note: 'O(n log(max pile)). Constructing the answer directly was hard; checking a guess was four lines.' },
    ],
  },

  'binary-answer/0': {
    title: 'Largest minimum distance — maximising instead of minimising',
    contrast: 'The template finds the FIRST x that works. Here you want the LAST — and the safe move is to keep the template and adjust the answer.',
    cells: [1, 2, 4, 8, 9],
    frames: [
      { range: [0, 4], stat: 'place 3 items, maximise the smallest gap', note: 'Positions [1, 2, 4, 8, 9]. Feasibility now runs the other way: a SMALL gap is easy, a large one is hard.' },
      { stat: 'can(1) YES, can(3) YES, can(4) NO', note: 'So the pattern is YES...YES,NO...NO — the mirror image of the template.' },
      { stat: 'tempting: rewrite the loop', note: 'This is where off-by-ones come from. Under pressure, do not improvise a second template.' },
      { stat: 'instead: find the first FAILING x', note: 'Keep the one template you have memorised, search for the first x where can(x) is false, and subtract one.' },
      { stat: 'first failure at 4  ->  answer 3', note: 'Gaps of 3 are achievable (1, 4, 8 or 1, 4, 9); gaps of 4 are not. One subtraction instead of a rewritten loop.' },
    ],
  },

  'binary-answer/1': {
    title: 'A real-valued answer: 100 halvings instead of lo < hi',
    contrast: 'The template terminates when lo == hi. Floating point never reaches equality, so the loop condition has to change.',
    cells: ['lo', '', '', 'hi'],
    frames: [
      { mark: [0, 3], stat: 'lo = 0.0   hi = 100.0', note: 'The answer is a real number to six decimal places. The integer template would spin forever.' },
      { stat: 'while lo < hi never ends', note: 'Two floats that differ by 1e-18 are still not equal, and averaging them may not change either bound. The loop cannot terminate.' },
      { range: [0, 1], stat: 'fix: for _ in range(100)', note: 'A fixed iteration count. Each pass halves the interval, so 100 passes shrink it by 2^-100 — far beyond any precision asked for.' },
      { range: [0, 0], stat: 'after 20 passes: interval ~1e-4', note: 'Twenty halvings already give four decimal places. A hundred is simply a number nobody can argue with.' },
      { stat: 'or: while hi - lo > 1e-9', note: 'The alternative. Both are defensible; a fixed count is easier to justify because it cannot fail to terminate.' },
    ],
  },

  'binary-answer/2': {
    title: 'When can(x) is not monotonic, the method is invalid',
    contrast: 'Not an adaptation — a refusal. The template rests entirely on feasibility being false-then-true, and this shows what breaks without it.',
    cells: ['1', '2', '3', '4', '5', '6'],
    frames: [
      { stat: 'suppose can(3) = YES but can(4) = NO', note: 'A bigger budget that stops working. Feasibility is no longer NO...NO,YES...YES.' },
      { ptrs: { mid: 3 }, mark: [3], stat: 'test mid = 4: NO  ->  discard 1..4', note: 'The template concludes the answer must be above 4, and throws away everything below.' },
      { mark: [0, 1, 2], stat: 'but the answer was 3, in the discarded half', note: 'Correct, and now unreachable. The halving step is only sound when a NO guarantees every smaller value is also NO.' },
      { stat: 'this is the planted trap', note: 'Interviewers include it. The defence is to state WHY feasibility is monotonic before writing any code — one sentence, and it either holds or it does not.' },
      { stat: 'no fix — change approach', note: 'There is no repair. If the predicate is not monotonic, binary search on the answer is the wrong tool and something else is needed.' },
    ],
  },

  'binary-answer/3': {
    title: 'Choosing bounds you can defend: ship packages [1, 2, 3, 4, 5]',
    contrast: 'The template is handed its range. Here you have to derive it, and say why each end is safe.',
    cells: [1, 2, 3, 4, 5],
    frames: [
      { range: [0, 4], stat: 'find the minimum ship capacity', note: 'Packages must ship in order, within D days. What is the smallest capacity that suffices?' },
      { mark: [4], stat: 'lo = max(weights) = 5', note: 'Lower bound. Capacity below the largest single package can never ship it at all — not slow, impossible.' },
      { range: [0, 4], stat: 'hi = sum(weights) = 15', note: 'Upper bound. Everything in one day is always feasible if D >= 1, so this end definitely works.' },
      { stat: 'lo definitely fails or is minimal, hi definitely works', note: 'That is what makes the search well-formed: infeasible at one end, feasible at the other. Say both out loud.' },
      { stat: 'alternative: double until can() succeeds', note: 'When no natural maximum exists. Costs an extra O(log n) and needs no insight into the problem.' },
      { stat: 'a bad bound is a wrong answer', note: 'Starting lo at 1 here wastes iterations but is still correct. Starting hi too LOW returns a feasible-looking answer that is not — the dangerous direction.' },
    ],
  },
});
