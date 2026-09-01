/* Step-through animations, keyed by page id.
 *
 * One generic shape covers all of them: a row of cells, and a list of frames.
 * Each frame may move named pointers, highlight a range, mark cells, show a
 * line of state, and say what just happened. app.js renders the player.
 *
 * frame = {
 *   ptrs:  { name: index }      markers under the cells
 *   range: [lo, hi]             inclusive highlight
 *   mark:  [indices]            individually flagged cells
 *   stat:  'best = 3'           one line of running state
 *   note:  'why this step'      the sentence that teaches
 * }
 *
 * Every trace below was worked through by hand and checked against the
 * template on its page -- the point is defeated if the animation and the code
 * disagree. Not every page has one: an animation of "recursion" or "sentinel"
 * would be decoration rather than explanation, and those are left without.
 */
window.ANIMS = {

  'binary-index': {
    title: 'Finding the first index where xs[i] >= 11',
    cells: [1, 3, 5, 7, 9, 11, 13],
    frames: [
      { ptrs: { lo: 0, hi: 6 }, range: [0, 6], stat: 'lo=0  hi=7 (exclusive)', note: 'The answer is somewhere in the whole array. hi is one PAST the end.' },
      { ptrs: { lo: 0, hi: 6, mid: 3 }, range: [0, 6], mark: [3], stat: 'mid=3  xs[3]=7', note: 'Look at the middle. 7 < 11, so the predicate is false here.' },
      { ptrs: { lo: 4, hi: 6 }, range: [4, 6], stat: 'lo=4  hi=7', note: 'mid is definitely not the answer, so discard it and everything left of it: lo = mid+1.' },
      { ptrs: { lo: 4, hi: 6, mid: 5 }, range: [4, 6], mark: [5], stat: 'mid=5  xs[5]=11', note: '11 >= 11, so the predicate is TRUE. This might be the answer — keep it.' },
      { ptrs: { lo: 4, hi: 5 }, range: [4, 4], stat: 'lo=4  hi=5', note: 'hi = mid, not mid−1. That is what keeps a possible answer inside the range.' },
      { ptrs: { lo: 4, hi: 5, mid: 4 }, range: [4, 4], mark: [4], stat: 'mid=4  xs[4]=9', note: '9 < 11, false again. lo = mid+1 = 5.' },
      { ptrs: { lo: 5, hi: 5 }, mark: [5], stat: 'lo == hi == 5', note: 'The range is empty, so the loop ends and lo IS the answer. Index 5.' },
    ],
  },

  'two-pointers': {
    title: 'Two numbers summing to 16, in a sorted array',
    cells: [2, 3, 5, 8, 11, 15],
    frames: [
      { ptrs: { lo: 0, hi: 5 }, mark: [0, 5], stat: '2 + 15 = 17', note: 'Too big. One of these two has to change — but which?' },
      { ptrs: { lo: 0, hi: 4 }, mark: [0, 4], stat: '2 + 11 = 13', note: 'Only the LARGE side can make the sum smaller, so move hi in. 15 can now never be part of the answer.' },
      { ptrs: { lo: 1, hi: 4 }, mark: [1, 4], stat: '3 + 11 = 14', note: 'Too small now, so move the small side up. Neither pointer ever goes backwards — that is what makes it O(n).' },
      { ptrs: { lo: 2, hi: 4 }, mark: [2, 4], stat: '5 + 11 = 16', note: 'Found. Four comparisons instead of the fifteen a nested loop would have made.' },
    ],
  },

  'window': {
    title: 'Longest substring with no repeated character',
    cells: ['a', 'b', 'c', 'a', 'b', 'c', 'b', 'b'],
    frames: [
      { ptrs: { l: 0, r: 0 }, range: [0, 0], stat: 'best = 1', note: 'Window is "a". Valid, so record its length.' },
      { ptrs: { l: 0, r: 1 }, range: [0, 1], stat: 'best = 2', note: '"ab" — still no repeat. Expand right; that is the default move.' },
      { ptrs: { l: 0, r: 2 }, range: [0, 2], stat: 'best = 3', note: '"abc". Three distinct characters.' },
      { ptrs: { l: 0, r: 3 }, range: [0, 3], mark: [0, 3], stat: 'INVALID — two a', note: 'The incoming "a" already sits at index 0. The window is now invalid.' },
      { ptrs: { l: 1, r: 3 }, range: [1, 3], stat: 'best = 3', note: 'Shrink from the LEFT until it is valid again. Never shrink from the right — that would lose progress.' },
      { ptrs: { l: 2, r: 4 }, range: [2, 4], stat: 'best = 3', note: 'Same story for the incoming "b": expand, then shrink past the old one.' },
      { ptrs: { l: 3, r: 5 }, range: [3, 5], stat: 'best = 3', note: '"abc" again, one place along.' },
      { ptrs: { l: 5, r: 6 }, range: [5, 6], stat: 'best = 3', note: 'The incoming "b" duplicates index 4, so left jumps past it to 5.' },
      { ptrs: { l: 7, r: 7 }, range: [7, 7], stat: 'best = 3', note: 'Answer 3. Every index entered once and left once — 8 cells, 16 pointer moves, O(n).' },
    ],
  },

  'kadane': {
    title: 'Maximum-sum contiguous subarray',
    cells: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
    frames: [
      { ptrs: { i: 0 }, mark: [0], stat: 'cur = -2   best = -2', note: 'Start from the first element, NOT from 0. Starting at 0 would wrongly return 0 for an all-negative array.' },
      { ptrs: { i: 1 }, mark: [1], stat: 'cur = 1    best = 1', note: 'Extend gives -2+1 = -1; restarting gives 1. Restart wins, so the run so far is abandoned.' },
      { ptrs: { i: 2 }, range: [1, 2], stat: 'cur = -2   best = 1', note: 'Extend gives -2, restart gives -3. Extending wins even though cur went negative.' },
      { ptrs: { i: 3 }, mark: [3], stat: 'cur = 4    best = 4', note: 'Restart again — a negative running total is always worth dropping.' },
      { ptrs: { i: 4 }, range: [3, 4], stat: 'cur = 3    best = 4', note: 'Extend. cur dips but stays positive, so the run is still worth keeping.' },
      { ptrs: { i: 5 }, range: [3, 5], stat: 'cur = 5    best = 5', note: 'Extend, and a new best.' },
      { ptrs: { i: 6 }, range: [3, 6], stat: 'cur = 6    best = 6', note: 'Extend again. This is the winning subarray: [4, -1, 2, 1].' },
      { ptrs: { i: 7 }, range: [3, 7], stat: 'cur = 1    best = 6', note: 'cur drops but best remembers. Keeping CURRENT and BEST separate is the whole trick.' },
      { ptrs: { i: 8 }, range: [3, 6], stat: 'cur = 5    best = 6', note: 'Answer 6. One pass, two variables, no array of subproblems.' },
    ],
  },

  'prefix': {
    title: 'Prefix sums, then a range query in O(1)',
    cells: [3, 4, 7, 2, -3, 1, 4, 2],
    frames: [
      { stat: 'pre = [0]', note: 'pre[i] is the sum of everything BEFORE index i. It starts with a 0 for the empty prefix.' },
      { ptrs: { i: 0 }, range: [0, 0], stat: 'pre = [0, 3]', note: 'One pass, adding as you go.' },
      { ptrs: { i: 2 }, range: [0, 2], stat: 'pre = [0, 3, 7, 14]', note: 'Each entry is the running total up to that point.' },
      { ptrs: { i: 5 }, range: [0, 5], stat: 'pre = [0, 3, 7, 14, 16, 13, 14]', note: 'Negative values are no problem — it is just a running sum.' },
      { ptrs: { i: 7 }, range: [0, 7], stat: 'pre = [0, 3, 7, 14, 16, 13, 14, 18, 20]', note: 'Build finished. O(n), done once.' },
      { range: [2, 5], mark: [2, 5], stat: 'sum(2..5) = pre[6] − pre[2]', note: 'Now ANY range is two lookups: 14 − 7 = 7. Check it: 7 + 2 − 3 + 1 = 7.' },
      { range: [2, 5], stat: 'O(1) per query, forever', note: 'A thousand more queries cost nothing extra. That is the trade: one linear pass buys constant-time reads.' },
    ],
  },

  'fast-slow': {
    title: 'Cycle detection — the last node points back to index 2',
    cells: [1, 2, 3, 4, 5, 6],
    frames: [
      { ptrs: { slow: 0, fast: 0 }, mark: [0], stat: 'both at the head', note: 'Two pointers, same start, different speeds. No extra memory at all.' },
      { ptrs: { slow: 1, fast: 2 }, mark: [1, 2], stat: 'slow +1, fast +2', note: 'Each step the gap between them grows by one.' },
      { ptrs: { slow: 2, fast: 4 }, mark: [2, 4], stat: 'gap = 2', note: 'Still walking forward normally.' },
      { ptrs: { slow: 3, fast: 2 }, mark: [3, 2], stat: 'fast wrapped: 5 → 2', note: 'fast has gone round the cycle. Inside a loop the gap starts CLOSING instead of growing.' },
      { ptrs: { slow: 4, fast: 4 }, mark: [4], stat: 'they meet', note: 'They coincide, which can only happen inside a cycle. With no cycle, fast would have hit the end first.' },
    ],
  },

  'deque-mono': {
    title: 'Next warmer day — the pop is where you compute',
    cells: [73, 74, 75, 71, 69, 72, 76],
    frames: [
      { ptrs: { i: 0 }, mark: [0], stat: 'stack: [0]', note: 'Day 0 has no warmer day yet, so it waits on the stack. Store the INDEX, not the temperature.' },
      { ptrs: { i: 1 }, mark: [1], stat: 'stack: [1]   answer[0] = 1', note: '74 > 73, so day 0 is resolved: it waited 1 day. Pop it. The pop is where the answer is written.' },
      { ptrs: { i: 2 }, mark: [2], stat: 'stack: [2]   answer[1] = 1', note: 'Same again. The stack always holds days still waiting, in decreasing temperature.' },
      { ptrs: { i: 3 }, mark: [3], stat: 'stack: [2, 3]', note: '71 < 75, so nothing resolves. Day 3 joins the queue of waiting days.' },
      { ptrs: { i: 4 }, mark: [4], stat: 'stack: [2, 3, 4]', note: 'Colder again. Three days now waiting — and they are in decreasing order, which is the invariant.' },
      { ptrs: { i: 5 }, mark: [5], stat: 'stack: [2, 5]   answer[4]=1, answer[3]=2', note: '72 beats both 69 and 71, so TWO days resolve at once. This is where the inner while loop earns itself.' },
      { ptrs: { i: 6 }, mark: [6], stat: 'stack: [6]   answer[5]=1, answer[2]=4', note: '76 beats everything left. Each index was pushed once and popped once — O(n) despite the nested loop.' },
    ],
  },
};
