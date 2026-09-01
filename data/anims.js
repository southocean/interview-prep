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

  /* ======================================================================
   * DEVIATION ANIMATIONS, keyed "pageId/deviationIndex".
   *
   * These render inside the deviation card, directly under its diff, so the
   * contrast with the template's own animation higher up the page is one
   * scroll away. `contrast` states in one line what is different.
   * ==================================================================== */

  'two-pointers/0': {
    title: '3Sum on [-2, -2, 0, 0, 2, 2], target 0 — where the two skips fire',
    contrast: 'The template moves two pointers once. Here an outer loop fixes the first element, and a repeated value has to be skipped in TWO places.',
    cells: [-2, -2, 0, 0, 2, 2],
    frames: [
      { ptrs: { i: 0, lo: 1, hi: 5 }, mark: [0, 1, 5], stat: '-2 + -2 + 2 = -2', note: 'i is fixed at index 0. Two pointers work the rest, exactly as in the template. Sum is too small, so move lo up.' },
      { ptrs: { i: 0, lo: 2, hi: 5 }, mark: [0, 2, 5], stat: '-2 + 0 + 2 = 0  ✓', note: 'A triplet. Record [-2, 0, 2]. Now both pointers move inward to look for another one with the same i.' },
      { ptrs: { i: 0, lo: 3, hi: 4 }, mark: [0, 3, 4], stat: 'lo moved to 3, hi to 4', note: 'Look at what lo is pointing at: another 0. The value it just used was also 0, at index 2.' },
      { ptrs: { i: 0, lo: 3, hi: 4 }, mark: [2, 3], stat: 'xs[3] == xs[2]  ->  SKIP 2 fires', note: 'WITHOUT the skip: -2 + 0 + 2 = 0 again — the identical triplet, recorded twice. The middle value repeats, so its partner repeats too.' },
      { ptrs: { i: 0, lo: 4, hi: 4 }, stat: 'lo == hi, this i is finished', note: 'lo skipped past the duplicate 0. Nothing left between the pointers, so the i = 0 iteration ends with exactly one triplet found.' },
      { ptrs: { i: 1 }, mark: [0, 1], stat: 'xs[1] == xs[0]  ->  SKIP 1 fires', note: 'The FIXED element is now a repeat. Every triplet starting with -2 was already found, so the whole iteration is jumped. Without this, all of it happens again.' },
      { ptrs: { i: 2, lo: 3, hi: 5 }, mark: [2, 3, 5], stat: '0 + 0 + 2 = 2', note: 'i = 2 is a new value, so it runs normally. Too big, move hi down.' },
      { ptrs: { i: 2, lo: 3, hi: 4 }, mark: [2, 3, 4], stat: '0 + 0 + 2 = 2', note: 'Still too big. hi moves again and the pointers meet, so this i finds nothing.' },
      { ptrs: { i: 3 }, mark: [2, 3], stat: 'xs[3] == xs[2]  ->  SKIP 1 again', note: 'Another repeated fixed element, jumped. Final answer: one triplet, [-2, 0, 2]. Both skips were needed — each one prevented a different duplicate.' },
    ],
  },

  'two-pointers/1': {
    title: 'Container with most water on [2, 3, 10, 5, 7, 8, 9]',
    contrast: 'The template moves whichever side brings the SUM closer to a target. Here there is no target — you move whichever side LIMITS the area.',
    cells: [2, 3, 10, 5, 7, 8, 9],
    frames: [
      { ptrs: { lo: 0, hi: 6 }, mark: [0, 6], stat: 'min(2, 9) x 6 = 12', note: 'Height is the SHORTER side, width is the gap. The left side is 2, so it caps the area.' },
      { ptrs: { lo: 1, hi: 6 }, mark: [1, 6], stat: 'min(3, 9) x 5 = 15', note: 'Move the shorter side in. The 2 can never help again: any other partner gives it less width and no more height.' },
      { ptrs: { lo: 2, hi: 6 }, mark: [2, 6], stat: 'min(10, 9) x 4 = 36  <- best', note: 'Now the RIGHT side is shorter, so the pointer that moves flips. This is the best so far.' },
      { ptrs: { lo: 2, hi: 5 }, mark: [2, 5], stat: 'min(10, 8) x 3 = 24', note: 'Width shrinks by one every step whatever you do, so only a taller limiting side can improve the area.' },
      { ptrs: { lo: 2, hi: 4 }, mark: [2, 4], stat: 'min(10, 7) x 2 = 14', note: 'Falling away. The 10 stays put because it is never the shorter side again.' },
      { ptrs: { lo: 2, hi: 3 }, mark: [2, 3], stat: 'min(10, 5) x 1 = 5', note: 'Pointers meet next step. Answer 36 — and note we never compared 10 against 5 or 7 as a left-hand side at full width, because those pairs cannot beat what we had.' },
    ],
  },

  'window/0': {
    title: 'SHORTEST window of "aabc" containing a, b and c',
    contrast: 'The template records the answer after the shrink. Here the recording moves INSIDE the shrink loop — same code, one line relocated.',
    cells: ['a', 'a', 'b', 'c'],
    frames: [
      { ptrs: { l: 0, r: 0 }, range: [0, 0], stat: 'have a — missing b, c', note: 'Expand right, exactly as in the template. Nothing to record yet: the window is not valid.' },
      { ptrs: { l: 0, r: 1 }, range: [0, 1], stat: 'have a a — missing b, c', note: 'Still invalid. For a SHORTEST problem you cannot record anything until the window first becomes valid.' },
      { ptrs: { l: 0, r: 2 }, range: [0, 2], stat: 'have a a b — missing c', note: 'One to go.' },
      { ptrs: { l: 0, r: 3 }, range: [0, 3], mark: [3], stat: 'VALID — length 4, best = 4', note: 'Now valid. The template would stop here and move right. For shortest, this is where the shrink loop STARTS recording.' },
      { ptrs: { l: 1, r: 3 }, range: [1, 3], stat: 'still VALID — length 3, best = 3', note: 'Drop the left "a" and it is still valid, so record again. THIS is the improvement the template misses — it never looked at a smaller valid window.' },
      { ptrs: { l: 2, r: 3 }, range: [2, 3], stat: 'INVALID — no a — stop shrinking', note: 'Now it breaks, so the shrink stops and right moves on. Answer 3, and it was found in the middle of the shrink, not after it.' },
    ],
  },

  'window/1': {
    title: 'Longest window of "eceba" with at most 2 distinct characters',
    contrast: 'The template shrinks while one character repeats. Here it shrinks on the SIZE of the count map — and a key left at zero makes that size lie.',
    cells: ['e', 'c', 'e', 'b', 'a'],
    frames: [
      { ptrs: { l: 0, r: 0 }, range: [0, 0], stat: '{e:1}  distinct 1  best 1', note: 'Expand right. The invalid condition is now "more than K distinct", not "a repeat".' },
      { ptrs: { l: 0, r: 1 }, range: [0, 1], stat: '{e:1, c:1}  distinct 2  best 2', note: 'Two distinct is allowed when K = 2.' },
      { ptrs: { l: 0, r: 2 }, range: [0, 2], stat: '{e:2, c:1}  distinct 2  best 3', note: 'A repeat is fine here — repeats do not add distinct characters. This is the best window and the eventual answer.' },
      { ptrs: { l: 0, r: 3 }, range: [0, 3], mark: [3], stat: '{e:2, c:1, b:1}  distinct 3  INVALID', note: 'Three distinct. Shrink from the left until it is legal again.' },
      { ptrs: { l: 1, r: 3 }, range: [1, 3], stat: '{e:1, c:1, b:1}  distinct STILL 3', note: 'Dropping one "e" left another behind, so nothing changed. One shrink is not enough — this is why it is a while loop.' },
      { ptrs: { l: 2, r: 3 }, range: [2, 3], mark: [1], stat: '{e:1, b:1}  c deleted  distinct 2', note: 'Dropping the "c" takes its count to zero. DELETE the key — leave it at zero and len() still says 3, so the window silently allows K+1.' },
      { ptrs: { l: 3, r: 4 }, range: [3, 4], stat: '{b:1, a:1}  distinct 2  best 3', note: 'The last character repeats the story. Answer 3, from the window at frame three.' },
    ],
  },

  'binary-index/1': {
    title: 'Counting the 2s in [1, 2, 2, 2, 3, 4] with two boundary searches',
    contrast: 'The template runs once to find one boundary. Here it runs TWICE with different predicates and subtracts — no bespoke loop.',
    cells: [1, 2, 2, 2, 3, 4],
    frames: [
      { stat: 'SEARCH 1: first index where x >= 2', note: 'Same template, unchanged. Only the predicate differs between the two runs.' },
      { ptrs: { lo: 0, hi: 5, mid: 3 }, range: [0, 5], mark: [3], stat: 'xs[3] = 2  >= 2  TRUE', note: 'True means mid might be the answer, so hi = mid. Never mid - 1.' },
      { ptrs: { lo: 0, hi: 3, mid: 1 }, range: [0, 2], mark: [1], stat: 'xs[1] = 2  >= 2  TRUE', note: 'Keep narrowing from the right.' },
      { ptrs: { lo: 0, hi: 1, mid: 0 }, range: [0, 0], mark: [0], stat: 'xs[0] = 1  >= 2  FALSE', note: 'False means discard mid and everything left of it: lo = mid + 1.' },
      { ptrs: { lo: 1, hi: 1 }, mark: [1], stat: 'first = 1', note: 'Range empty, so lo is the answer. The first 2 is at index 1.' },
      { stat: 'SEARCH 2: first index where x > 2', note: 'Identical code, predicate changed from >= to >. That finds one PAST the last 2.' },
      { ptrs: { lo: 0, hi: 5, mid: 3 }, range: [0, 5], mark: [3], stat: 'xs[3] = 2  > 2  FALSE', note: 'Now 2 fails the test, so the search moves right instead of left.' },
      { ptrs: { lo: 4, hi: 5, mid: 4 }, range: [4, 5], mark: [4], stat: 'xs[4] = 3  > 2  TRUE', note: 'Narrowing again from the other side.' },
      { ptrs: { lo: 4, hi: 4 }, mark: [4], stat: 'after_last = 4', note: 'Count = 4 - 1 = 3. Two O(log n) searches, where walking outwards from a hit would have been O(n) on an array of all 2s.' },
    ],
  },

  'deque-mono/1': {
    title: 'Maximum of every window of size 3 in [1, 3, -1, -3, 5, 3, 6, 7]',
    contrast: 'The template pops from one end only. Here you pop from the BACK on value and from the FRONT on position — two different reasons to discard, so you need two ends.',
    cells: [1, 3, -1, -3, 5, 3, 6, 7],
    frames: [
      { ptrs: { i: 0 }, mark: [0], stat: 'deque: [0]', note: 'Store indices, not values — you need positions to know when something falls out of the window.' },
      { ptrs: { i: 1 }, mark: [1], stat: 'deque: [1]', note: '3 > 1, and it is newer. Index 0 can never be the maximum of any future window, so pop it from the BACK.' },
      { ptrs: { i: 2 }, mark: [2], stat: 'deque: [1, 2]   ->  max = 3', note: 'Window is full for the first time. The front of the deque is always the current maximum.' },
      { ptrs: { i: 3 }, mark: [3], stat: 'deque: [1, 2, 3]   ->  max = 3', note: 'Smaller values queue up behind. They are still candidates — once 3 expires, -1 becomes the best of what remains.' },
      { ptrs: { i: 4 }, mark: [4], stat: 'deque: [4]   ->  max = 5', note: '5 beats everything waiting, so the whole back of the deque empties. Three pops in one step, and still O(n) overall.' },
      { ptrs: { i: 5 }, mark: [5], stat: 'deque: [4, 5]   ->  max = 5', note: 'Ordinary step: 3 queues up behind 5.' },
      { ptrs: { i: 6 }, mark: [6], stat: 'deque: [6]   ->  max = 6', note: 'Another sweep of the back.' },
      { ptrs: { i: 7 }, mark: [7], stat: 'deque: [7]   ->  max = 7', note: 'Result [3, 3, 5, 5, 6, 7]. A running sum could be maintained by arithmetic; a maximum cannot, which is why this needs a structure.' },
    ],
  },

  'prefix/1': {
    title: 'Difference array: two range updates, then one sweep',
    contrast: 'The template precomputes once and reads many times. This is the mirror image — many WRITES, one read.',
    cells: [0, 0, 0, 0, 0, 0],
    frames: [
      { stat: 'diff = [0, 0, 0, 0, 0, 0, 0]', note: 'One slot longer than the array, so an update ending at the last index still has somewhere to cancel.' },
      { mark: [1, 3], stat: 'update 1..3 by +2   ->   diff[1] += 2,  diff[4] -= 2', note: 'Two writes, whatever the range length. The +2 starts at 1 and is cancelled just past 3.' },
      { mark: [2, 5], stat: 'update 2..5 by +3   ->   diff[2] += 3,  diff[6] -= 3', note: 'Another O(1) update. A thousand more cost nothing extra — that is the whole point.' },
      { stat: 'diff = [0, +2, +3, 0, -2, 0, -3]', note: 'Nothing is a real value yet. diff holds only the CHANGES at each boundary.' },
      { range: [0, 0], stat: 'running 0   ->   final[0] = 0', note: 'Now one sweep. Running total of diff gives the actual array.' },
      { range: [0, 2], stat: 'running 2, then 5   ->   final = [0, 2, 5, ...]', note: 'The +2 switches on at index 1, the +3 joins it at index 2.' },
      { range: [0, 4], stat: 'index 3 keeps 5, index 4 drops to 3', note: 'At index 4 the -2 fires, cancelling the first update exactly where it was meant to end.' },
      { range: [0, 5], stat: 'final = [0, 2, 5, 5, 3, 3]', note: 'Two updates and one O(n) pass. Doing it directly would have been O(range) per update.' },
    ],
  },

  'sweep/0': {
    title: 'Meetings [9,10] and [10,11] — the tie at 10 decides the answer',
    contrast: 'The template sorts events and sweeps. The only change is the ORDER of two events that share a timestamp — and it changes the result.',
    cells: ['+1@9', '-1@10', '+1@10', '-1@11'],
    frames: [
      { stat: 'HALF-OPEN: a room frees before it is claimed', note: 'events.sort() on (time, delta) tuples puts (10, -1) before (10, +1), because -1 sorts before +1. This is the default, and it is a decision.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'counter 1   max 1', note: 'The first meeting starts.' },
      { ptrs: { at: 1 }, mark: [1], stat: 'counter 0   max 1', note: 'It ends at 10, and the room is released BEFORE anything else at 10 is considered.' },
      { ptrs: { at: 2 }, mark: [2], stat: 'counter 1   max 1', note: 'The second meeting takes the room that was just freed. The counter never reaches 2.' },
      { ptrs: { at: 3 }, mark: [3], stat: 'counter 0   max 1  ->  ONE room', note: 'Answer: 1 room. Touching intervals do not overlap under this reading.' },
      { stat: 'CLOSED: sort key becomes (time, -delta)', note: 'Now starts come first at equal times, so (10, +1) is processed before (10, -1).' },
      { ptrs: { at: 0 }, mark: [0], stat: 'counter 1   max 1', note: 'Same first step.' },
      { ptrs: { at: 2 }, mark: [1, 2], stat: 'counter 2   max 2  ->  TWO rooms', note: 'The second meeting claims a room while the first still holds one. Answer: 2 rooms. One character of sort key, a different answer — which is why you ask before coding.' },
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
