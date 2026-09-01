/* Animations, batch E: the remaining patterns.
 * Greedy, k-way merge, Dijkstra, quickselect, and the partial pages —
 * monotonic stack/deque, prefix sums, fast and slow pointers.
 */
Object.assign(window.ANIMS, {

  // ================================================================ greedy ==

  'greedy': {
    title: 'Keep the most non-overlapping of [1,2], [2,3], [3,4], [1,3]',
    cells: ['[1,2]', '[2,3]', '[3,4]', '[1,3]'],
    label: 'intervals:',
    frames: [
      { stat: 'sort by END time', note: 'The sort key IS the solution. Earliest end leaves the most room for whatever comes next.' },
      { mark: [0], stat: 'keep [1,2]   last_end = 2', note: 'Take the earliest-ending interval. The exchange argument says this is always safe.' },
      { mark: [0, 1], stat: '[2,3] starts at 2 >= 2  ->  keep.  last_end = 3', note: 'Compatible, so keep it. One comparison per interval and no lookahead.' },
      { mark: [3], stat: '[1,3] starts at 1 < 3  ->  skip', note: 'Conflicts with what is kept. Greedy never reconsiders — that is what makes it linear after the sort.' },
      { mark: [0, 1, 2], stat: '[3,4] starts at 3 >= 3  ->  keep', note: 'Three kept.' },
      { stat: 'the exchange argument', note: 'If an optimal solution omits the earliest-ending compatible interval, swap it in: still valid, same size. So some optimum contains it, and the greedy choice cannot cost you.' },
    ],
  },

  'greedy/0': {
    title: 'Sorting by START on [0,10], [1,2], [3,4] — watch it fail',
    contrast: 'Same algorithm, different sort key. The key is the whole decision, and the intuitive one is wrong.',
    cells: ['[0,10]', '[1,2]', '[3,4]'],
    label: 'intervals:',
    frames: [
      { stat: 'by START: [0,10], [1,2], [3,4]', note: 'The intuitive order. Take the earliest available thing.' },
      { mark: [0], stat: 'keep [0,10]   last_end = 10', note: 'It starts first, so greedy takes it. Its end time is never considered.' },
      { mark: [1], stat: '[1,2] starts at 1 < 10  ->  skip', note: 'Blocked by the long interval.' },
      { mark: [2], stat: '[3,4] starts at 3 < 10  ->  skip.  total 1', note: 'Also blocked. One long interval cost two short ones — the answer is 1 and it is wrong.' },
      { mark: [1, 2], stat: 'by END: [1,2], [3,4], [0,10]  ->  keep 2', note: 'Earliest end first keeps both short intervals and drops the greedy one. Answer 2.' },
      { stat: 'produce this counterexample before coding', note: 'Ten seconds of arithmetic settles which key is right. Guessing costs the problem.' },
    ],
  },

  'greedy/1': {
    title: 'Proving it: the exchange argument in three steps',
    contrast: 'Not a code change — the part of the answer that turns a guess into a solution.',
    cells: ['g', 'o1', 'o2', 'o3'],
    label: 'greedy pick vs an optimal set:',
    frames: [
      { mark: [1, 2, 3], stat: 'suppose OPT is optimal and omits g', note: 'g is the earliest-ending compatible interval. Assume some optimal solution does not contain it.' },
      { mark: [1], stat: 'o1 is OPT\'s earliest-ending member', note: 'By definition of g, o1 ends no earlier than g does.' },
      { mark: [0, 2, 3], stat: 'swap o1 for g', note: 'g ends earlier, so it cannot conflict with anything o1 did not conflict with. The set stays valid.' },
      { stat: 'same size, still valid', note: 'So there is an optimal solution containing g. The greedy choice never costs you the optimum.' },
      { stat: 'three sentences, and it is scored', note: 'An unjustified greedy reads as a guess that happened to work. Saying this out loud is what completes the answer.' },
    ],
  },

  'greedy/2': {
    title: 'Coins {1, 3, 4} for 6: greedy 3, optimal 2',
    contrast: 'The counterexample that tells you to stop. Test greedy adversarially BEFORE committing to it.',
    cells: [1, 3, 4],
    label: 'coins:',
    frames: [
      { mark: [2], stat: 'greedy takes 4   remaining 2', note: 'Largest coin that fits. Locally the obvious move.' },
      { mark: [0, 2], stat: 'takes 1, 1   total 3 coins', note: '3 does not fit in 2, so two 1s. Greedy answers 3.' },
      { mark: [1], stat: 'optimal: 3 + 3  =  2 coins', note: 'One fewer. The local choice destroyed a better global structure.' },
      { stat: 'why it FEELS right', note: 'Real currency is designed so greedy works. {1, 5, 10, 25} is greedy-optimal, which is exactly why the instinct misleads.' },
      { stat: 'the denominations decide, and you cannot see it', note: 'There is no way to tell by looking. Either prove it with an exchange argument or fall back to DP.' },
    ],
  },

  'greedy/3': {
    title: 'Task scheduler: greedy that needs a heap to stay current',
    contrast: 'The template fixes an order once by sorting. Here the best choice CHANGES as tasks are consumed, so it must be recomputed.',
    cells: ['A x3', 'B x2', 'C x1'],
    label: 'task counts:',
    frames: [
      { stat: 'cooldown n = 2 between identical tasks', note: 'A static sort cannot express this: after running A, A is temporarily unavailable and B may now be the best choice.' },
      { mark: [0], stat: 'heap by count: run A   A x2', note: 'Always take the most frequent remaining. The heap keeps that answer current.' },
      { mark: [1], stat: 'run B   B x1   (A on cooldown)', note: 'A cannot run yet, so the next-best comes off the heap.' },
      { mark: [2], stat: 'run C   C x0', note: 'Filling the cooldown window with whatever is available.' },
      { mark: [0], stat: 'A available again: run A   A x1', note: 'Push the cooled-down tasks back. Greedy in structure, heap in mechanism.' },
      { stat: 'or compute it: (max-1) x (n+1) + ties', note: 'The most frequent task fixes a skeleton and everything else fills the gaps, so a formula beats the simulation. Worth knowing both.' },
    ],
  },

  // ================================================================== kway ==

  'kway': {
    title: 'Merging [1,4,5], [1,3,4], [2,6] with a heap of heads',
    cells: [1, 1, 2],
    label: 'the three heads:',
    frames: [
      { mark: [0, 1, 2], stat: 'heap [(1,L0), (1,L1), (2,L2)]', note: 'The global minimum must be at the head of some list, so only k candidates are ever needed.' },
      { mark: [0], stat: 'pop (1, L0)   out [1]   push L0 next = 4', note: 'Pop the smallest, then push that list\'s successor. The heap stays at size k.' },
      { mark: [1], stat: 'pop (1, L1)   out [1,1]   push 3', note: 'Duplicates across lists are kept — merging does not de-duplicate.' },
      { mark: [2], stat: 'pop (2, L2)   out [1,1,2]   push 6', note: 'Each pop is O(log k), and there are N pops in total.' },
      { stat: 'out [1,1,2,3,4,4,5,6]', note: 'O(N log k). Concatenating everything and sorting would be O(N log N) — worse whenever k is much smaller than N.' },
      { stat: 'push (value, listIndex, itemIndex)', note: 'The tag is not decoration: without it the heap compares list objects and raises on the first tie.' },
    ],
  },

  'kway/0': {
    title: 'Only two lists: the heap is pure overhead',
    contrast: 'The template maintains k candidates in a heap. At k = 2 that machinery buys nothing.',
    cells: [1, 3, 8],
    label: 'a =',
    cells2: [2, 3, 9],
    label2: 'b =',
    frames: [
      { ptrs: { i: 0 }, ptrs2: { j: 0 }, mark: [0], mark2: [0], stat: 'heap of 2 vs two pointers', note: 'With two lists the smaller head is one comparison away. A heap adds log(2) overhead and a data structure.' },
      { ptrs: { i: 1 }, ptrs2: { j: 0 }, range: [0, 0], stat: 'out [1]   O(1) comparison', note: 'Two pointers: compare the heads, take the smaller, advance that one. No allocation.' },
      { ptrs: { i: 1 }, ptrs2: { j: 1 }, range: [0, 0], range2: [0, 0], stat: 'out [1, 2]', note: 'O(n) total, and the code is four lines shorter.' },
      { stat: 'reaching for the heap at k=2', note: 'It works, and it reads as pattern-matching without thinking. Interviewers notice the difference.' },
      { stat: 'the general tool is not always the right one', note: 'Recognising the degenerate case is worth saying even when you then keep the general solution for k > 2.' },
    ],
  },

  'kway/1': {
    title: 'Kth smallest in a sorted matrix: pop k times, or binary search',
    contrast: 'The template merges everything. For one element that is almost all wasted work.',
    cells: [1, 5, 9],
    label: 'matrix row 0:',
    frames: [
      { stat: '3x3 matrix, want the 8th smallest', note: 'Merging all nine gives the answer, and eight-ninths of the work is thrown away.' },
      { mark: [0], stat: 'pop 1   count 1', note: 'Option A: run the k-way merge and stop after k pops. O(k log n).' },
      { mark: [1], stat: 'pop 5 ... stop at the 8th', note: 'Correct and simple. Fine when k is small relative to the matrix.' },
      { stat: 'option B: binary search the VALUE', note: 'Guess a value, count how many cells are <= it. That count is monotonic in the guess.' },
      { mark: [1], stat: 'guess 5: count = 4 cells  <  8  ->  go higher', note: 'Counting is O(n) per guess using the sorted rows, so the whole search is O(n log(range)).' },
      { stat: 'beats the heap when k is large', note: 'At k near n^2 the heap degrades and the value search does not. Say which regime you are in.' },
    ],
  },

  'kway/2': {
    title: 'Smallest range covering all lists: carry the maximum too',
    contrast: 'The template only ever reads the minimum, at the heap top. The other end of the window has to be tracked by hand.',
    cells: [4, 10, 15],
    label: 'current heads:',
    frames: [
      { mark: [0, 1, 2], stat: 'heap top = 4   max pushed = 15', note: 'One element from each list. The heap gives the minimum free; the maximum is not in it anywhere.' },
      { stat: 'range = 15 - 4 = 11', note: 'A valid covering range immediately, because one element from every list is in play.' },
      { mark: [0], stat: 'pop 4, push that list\'s next = 9', note: 'Advancing the minimum is the only move that can shrink the range.' },
      { mark: [1], stat: 'top = 9   max still 15   range 6', note: 'Better. The maximum only ever grows, and only when a pushed value exceeds it.' },
      { mark: [1, 2], stat: 'pop 9, push 20  ->  max becomes 20', note: 'Now the maximum moves. One extra variable, updated on every push.' },
      { stat: 'best range kept separately', note: 'Current versus best again. The heap supplies one boundary of the window and you carry the other.' },
    ],
  },

  // ============================================================== dijkstra ==

  'dijkstra': {
    title: 'S to T over S-A 1, A-B 2, S-B 5, B-T 1',
    cells: ['S', 'A', 'B', 'T'],
    label: 'nodes:',
    frames: [
      { ptrs: { at: 0 }, mark: [0], stat: 'dist S=0, others INF   heap [(0,S)]', note: 'Fill the distance table up front so every later line reads dist[v] plainly.' },
      { mark: [1, 2], stat: 'relax S: A=1, B=5   heap [(1,A), (5,B)]', note: 'Two routes to B will exist. Right now the direct one, cost 5, is all we know.' },
      { ptrs: { at: 1 }, mark: [1], stat: 'pop A (1) — SETTLED', note: 'A pops first because the heap orders by cost. Its distance is now final: nothing cheaper can reach it.' },
      { mark: [2], stat: 'relax A: B = 1 + 2 = 3  <  5  ->  update', note: 'A cheaper route to B, found after the expensive one was already pushed. Both entries are now in the heap.' },
      { ptrs: { at: 2 }, mark: [2], stat: 'pop B (3) — SETTLED   heap still holds (5,B)', note: 'The good entry pops first. The stale (5,B) is still sitting there.' },
      { ptrs: { at: 3 }, mark: [3], stat: 'relax B: T = 4.  pop T  ->  answer 4', note: 'Stop the moment the goal pops — nothing later can beat it.' },
      { mark: [2], stat: 'pop (5,B): 5 > dist[B]=3  ->  skip', note: 'Lazy deletion. Heaps cannot remove from the middle, so stale entries are discarded on the way out.' },
      { stat: 'O(E log V)', note: 'Every edge can push once. Non-negative weights are what make "settled on pop" true, and that is the whole correctness argument.' },
    ],
  },

  'dijkstra/0': {
    title: 'One negative edge and "settled" becomes a lie',
    contrast: 'The template finalises a node the moment it pops. A negative edge can cheapen a path AFTER that, so the guarantee fails.',
    cells: ['S', 'A', 'B'],
    label: 'nodes:',
    frames: [
      { stat: 'S-A 2,  S-B 5,  B-A -4', note: 'Route to A: direct at 2, or via B at 5 - 4 = 1. The second is cheaper and longer.' },
      { ptrs: { at: 1 }, mark: [1], stat: 'pop A at 2 — declared SETTLED', note: 'A is cheapest in the heap, so Dijkstra finalises it and never looks again.' },
      { ptrs: { at: 2 }, mark: [2], stat: 'pop B at 5', note: 'B settles later, being more expensive.' },
      { mark: [1, 2], stat: 'relax B: A = 5 - 4 = 1  <  2', note: 'A better route to A exists — but A was settled three steps ago. Dijkstra returns 2.' },
      { stat: 'answer 2, correct answer 1', note: 'Silently wrong. The proof of Dijkstra needs weights to be non-negative, and this is exactly where it breaks.' },
      { stat: 'Bellman-Ford: O(V x E)', note: 'Relax every edge V-1 times, so nothing is ever final too early. Slower, and it also detects negative cycles.' },
    ],
  },

  'dijkstra/1': {
    title: 'All weights equal: BFS gives the same answer for less',
    contrast: 'The template pays log V to keep the frontier cost-ordered. When every edge costs the same, a queue is already in that order.',
    cells: ['S', 'A', 'B', 'T'],
    label: 'nodes:',
    frames: [
      { stat: 'every edge costs 1', note: 'Cost and edge count are now the same quantity.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'heap [(0,S)]  ->  or just deque [S]', note: 'The heap is sorting values that arrive in sorted order anyway.' },
      { mark: [1, 2], stat: 'level 1: A, B at cost 1', note: 'BFS discovers by edge count, which here IS cost order. First arrival is cheapest.' },
      { ptrs: { at: 3 }, mark: [3], stat: 'level 2: T at cost 2', note: 'Same answer Dijkstra would give, with no priority queue involved.' },
      { stat: 'O(V+E) instead of O(E log V)', note: 'Less code and a better bound. Spotting the degenerate case is worth saying even if you keep Dijkstra for generality.' },
      { stat: 'weights 0 and 1 only: 0-1 BFS', note: 'A deque, appendleft for 0 and append for 1, keeps O(V+E). The middle ground between the two.' },
    ],
  },

  'dijkstra/2': {
    title: 'Weights 0 and 1: a deque keeps the frontier sorted for free',
    contrast: 'The template needs a heap because costs vary arbitrarily. With only two possible costs, both ends of a deque suffice.',
    cells: ['S', 'A', 'B', 'T'],
    label: 'nodes:',
    frames: [
      { stat: 'S-A 0,  S-B 1,  A-T 1', note: 'Free moves and unit moves. Common in grids where some transitions cost nothing.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'deque [S]   dist S=0', note: 'No heap. The invariant is that the deque holds at most two distinct distances at a time.' },
      { mark: [1], stat: 'S-A weight 0  ->  appendLEFT.  deque [A, ...]', note: 'A has the same distance as S, so it belongs at the front — it must be processed before anything more expensive.' },
      { mark: [2], stat: 'S-B weight 1  ->  append right.  deque [A, B]', note: 'B is strictly further, so it goes to the back. That single rule is what preserves the ordering.' },
      { ptrs: { at: 1 }, mark: [1], stat: 'pop A (dist 0), relax T = 1', note: 'Processing in distance order without ever comparing priorities.' },
      { stat: 'O(V+E), no log factor', note: 'Only valid for weights of exactly 0 and 1. Any third weight and the deque cannot stay sorted — back to Dijkstra.' },
    ],
  },

  'dijkstra/3': {
    title: 'Flights: an edge you can only use after you arrive',
    contrast: 'The template treats an edge as always available at a fixed cost. Here availability depends on WHEN you get there.',
    cells: ['A', 'B', 'C'],
    label: 'airports:',
    frames: [
      { stat: 'A->B dep 09:00 arr 10:00;  B->C dep 09:30 arr 11:00', note: 'The B->C flight leaves before you can possibly land at B. The edge exists and is unusable.' },
      { mark: [0], stat: 'best[A] = 08:00', note: 'The label is no longer "cost" but "earliest time I can be here".' },
      { mark: [1], stat: 'take A->B: best[B] = 10:00', note: 'Relaxing an edge sets an arrival time rather than adding a weight.' },
      { mark: [1, 2], stat: 'B->C departs 09:30 < 10:00  ->  UNUSABLE', note: 'Edges are filtered by departure time. A plain shortest-path relaxation would happily take it and produce an impossible itinerary.' },
      { stat: 'why Dijkstra still works', note: 'Waiting is free, so arriving earlier is never worse. That is what lets one number per airport be sufficient — say it out loud.' },
      { stat: '"no waiting over 4 hours" would break it', note: 'Then arriving earlier CAN be worse, one label per node stops being enough, and the state becomes (airport, time).' },
    ],
  },

  // =========================================================== quickselect ==

  'quickselect': {
    title: '3rd smallest of [7, 2, 9, 4, 1, 6] — recursing one side only',
    cells: [7, 2, 9, 4, 1, 6],
    frames: [
      { range: [0, 5], stat: 'want index 2 in sorted order', note: 'Sorting gives [1,2,4,6,7,9] and the answer 4 — but sorting does more than was asked.' },
      { mark: [5], stat: 'pivot 6 (random)   partition', note: 'Random pivot, not a fixed one: a fixed pivot is O(n^2) on already-sorted input.' },
      { range: [0, 3], mark: [4], stat: 'after partition: [2,4,1,6,7,9]   pivot at index 3', note: 'Smaller left, larger right. The pivot is now at its FINAL sorted position.' },
      { range: [0, 2], stat: 'pivot index 3 > target 2  ->  recurse LEFT only', note: 'The answer is in the left part. The right half is discarded entirely and never touched again.' },
      { mark: [1], stat: 'partition [2,4,1] with pivot 1  ->  index 0', note: 'Second partition on three elements instead of six.' },
      { range: [1, 2], stat: '0 < 2  ->  recurse right of it: [2,4]', note: 'Work halves each round: n + n/2 + n/4 ... = 2n. Quicksort recurses into BOTH halves, which is where its log n comes from.' },
      { mark: [1], stat: 'pivot lands at index 2  ->  answer 4', note: 'Expected O(n). Worst case O(n^2), made vanishingly unlikely by the random pivot — say both.' },
    ],
  },

  'quickselect/0': {
    title: 'k = 2 of a million: the heap is the better answer',
    contrast: 'The template beats O(n log k). When k is tiny that bound is already excellent, and the heap has no bad case.',
    cells: [7, 2, 9, 4, 1, 6],
    frames: [
      { stat: 'n = 10^6, k = 2', note: 'log k is 1. O(n log k) is essentially O(n) already.' },
      { mark: [0, 1], stat: 'heap: three words, no worst case', note: 'heapq.nlargest(2, xs). Nothing to get wrong and nothing to explain.' },
      { range: [0, 5], stat: 'quickselect: O(n) average, O(n^2) worst', note: 'Better on paper, worse in risk, and it mutates the caller\'s array.' },
      { stat: 'quickselect answers a different question', note: 'It is the response to "can you beat O(n log k)?", not the default for "find the kth largest".' },
      { stat: 'choosing the simpler tool is the senior move', note: 'Say the heap, name its bound, and mention quickselect exists. That reads better than the reverse.' },
    ],
  },

  'quickselect/1': {
    title: 'The caller keeps the array: copy, and say what it costs',
    contrast: 'The template partitions in place, which is intrinsic to it. There is no in-place version that leaves the input alone.',
    cells: [7, 2, 9, 4, 1, 6],
    frames: [
      { range: [0, 5], stat: 'partitioning REORDERS the input', note: 'Not a side effect to tidy up — swapping is how partitioning works.' },
      { mark: [1, 5], stat: 'after one partition the order is gone', note: 'The caller\'s array is now permuted, and there is no cheap way to restore it.' },
      { stat: 'xs = xs[:]   # O(n) extra space', note: 'The only option. Copy first and declare the cost rather than hiding it.' },
      { stat: 'or use the heap: O(n log k), no mutation', note: 'If the no-mutation constraint is hard and space is tight, the heap wins on both counts.' },
      { stat: 'naming the trade is the answer', note: 'Interviewers add "do not modify the input" precisely to see whether you notice that partitioning cannot comply.' },
    ],
  },

  'quickselect/2': {
    title: 'A stream: quickselect needs the whole array in hand',
    contrast: 'The template partitions by swapping arbitrary positions. A stream gives you each element once, in order.',
    cells: [7, 2, 9, 4, 1, 6],
    label: 'arriving one at a time:',
    frames: [
      { ptrs: { at: 0 }, mark: [0], stat: '7 arrives', note: 'You see it once. There is no array to index into and no way to swap.' },
      { ptrs: { at: 1 }, mark: [1], stat: '2 arrives — 7 may already be gone', note: 'Partitioning requires random access to positions that no longer exist.' },
      { stat: 'so quickselect cannot run at all', note: 'Not slow — inapplicable. The algorithm\'s mechanism is unavailable.' },
      { mark: [0, 1], stat: 'size-k heap holds only k items', note: 'One pass, O(k) memory, each element examined once and discarded. Exactly what a stream permits.' },
      { stat: 'the constraint chooses the algorithm', note: '"Streaming" or "does not fit in memory" rules out anything that reorders. That is the tell.' },
    ],
  },

  // ============================================================ deque-mono ==

  'deque-mono/0': {
    title: 'Largest rectangle in histogram [2, 1, 5, 6, 2, 3]',
    contrast: 'The template computes a DISTANCE on the pop. Here it computes an AREA, and a trailing sentinel is needed to flush.',
    cells: [2, 1, 5, 6, 2, 3],
    frames: [
      { ptrs: { i: 0 }, mark: [0], stat: 'stack [0]', note: 'Indices of bars still waiting for something shorter to their right.' },
      { ptrs: { i: 1 }, mark: [1], stat: '1 < 2  ->  pop 0.  area = 2 x 1 = 2', note: 'Bar 0 is bounded on the right. Its rectangle is height 2 and width 1.' },
      { ptrs: { i: 3 }, mark: [1, 2, 3], stat: 'stack [1, 2, 3]   increasing', note: '5 and 6 both extend upward, so nothing resolves. The stack holds an increasing run.' },
      { ptrs: { i: 4 }, mark: [3], stat: '2 < 6  ->  pop 3.  area = 6 x 1 = 6', note: 'Width comes from the index BELOW the popped one, not the popped index itself.' },
      { ptrs: { i: 4 }, mark: [2], stat: 'pop 2.  area = 5 x 2 = 10   <- best', note: 'Bar 2 extends across bars 2 and 3, because both were at least height 5. Width 2, area 10.' },
      { ptrs: { i: 5 }, mark: [1, 4, 5], stat: 'stack [1, 4, 5]', note: 'The scan ends with three bars still waiting. Without a sentinel they are never measured.' },
      { stat: 'append 0  ->  everything flushes', note: 'A trailing zero is shorter than everything, so the stack empties and each remaining bar gets its area. Answer 10.' },
    ],
  },

  'deque-mono/2': {
    title: 'Previous smaller instead of next greater: flip the comparison',
    contrast: 'The template pops while the stack top is SMALLER, scanning forward. All four variants are this code with two knobs.',
    cells: [4, 5, 2, 10, 8],
    frames: [
      { stat: 'four variants: next/previous x greater/smaller', note: 'Two knobs: which direction you scan, and which way the comparison points.' },
      { ptrs: { i: 0 }, mark: [0], stat: 'stack [0]   ans[0] = none', note: 'Previous smaller: keep an INCREASING stack, and the top is the answer for the incoming element.' },
      { ptrs: { i: 1 }, mark: [0, 1], stat: '4 < 5  ->  top stays.  ans[1] = 4', note: 'The stack top is already smaller than 5, so it is the previous smaller element. No popping.' },
      { ptrs: { i: 2 }, mark: [2], stat: '5 >= 2, 4 >= 2  ->  pop both.  ans[2] = none', note: 'Pop while the top is >= the incoming value. The comparison is flipped from the next-greater version.' },
      { ptrs: { i: 3 }, mark: [2, 3], stat: 'ans[3] = 2', note: 'The stack is increasing again, and its top answers the query directly.' },
      { stat: 'decide which extreme before writing the while', note: 'It is easy to write the opposite by accident. Say "increasing stack, previous smaller" out loud first.' },
    ],
  },

  'deque-mono/3': {
    title: 'Trapping rain water: two pointers is shorter than the stack',
    contrast: 'A monotonic stack solves it by filling horizontal layers. Two pointers with running maxima is easier to defend under pressure.',
    cells: [4, 2, 0, 3, 2, 5],
    frames: [
      { ptrs: { lo: 0, hi: 5 }, mark: [0, 5], stat: 'left_max 4   right_max 5', note: 'Water above a bar is min(left_max, right_max) - height. Both maxima can be maintained by two pointers.' },
      { ptrs: { lo: 1, hi: 5 }, mark: [1], stat: '4 < 5  ->  move LEFT.  water += 4 - 2 = 2', note: 'The smaller maximum is the binding constraint, so that side is safe to compute and advance.' },
      { ptrs: { lo: 2, hi: 5 }, mark: [2], stat: 'water += 4 - 0 = 4   total 6', note: 'A pit fills to the level of the lower wall. No lookahead needed.' },
      { ptrs: { lo: 3, hi: 5 }, mark: [3], stat: 'water += 4 - 3 = 1   total 7', note: 'Still bounded by the left maximum of 4.' },
      { ptrs: { lo: 4, hi: 5 }, mark: [4], stat: 'water += 4 - 2 = 2   total 9', note: 'Answer 9. O(n) time, O(1) space, six lines.' },
      { stat: 'mention the stack, code the pointers', note: 'Both are O(n). Choosing the one you can explain while typing is a real interview skill, and saying the other exists costs one sentence.' },
    ],
  },

  // ================================================================ prefix ==

  'prefix/0': {
    title: '2D prefix sums: four lookups and one easily-dropped term',
    contrast: 'The template subtracts two values. In two dimensions the overlap is removed twice and must be added back.',
    cells: [1, 2, 3, 4],
    label: 'row of a 2x2 grid:',
    frames: [
      { stat: 'grid = [[1, 2], [3, 4]]', note: 'pre[r][c] holds the sum of everything above and left of (r, c).' },
      { mark: [0], stat: 'pre[1][1] = 1', note: 'Build with pre[r+1][c+1] = grid + above + left - corner. The corner is subtracted because it was counted twice.' },
      { mark: [0, 1], stat: 'pre[1][2] = 3', note: 'Row-wise accumulation, same as the 1D case along each axis.' },
      { mark: [0, 1, 2, 3], stat: 'pre[2][2] = 10', note: 'Table built in one O(rows x cols) pass.' },
      { mark: [3], stat: 'query (1,1)-(1,1): pre[2][2] - pre[1][2] - pre[2][1] + pre[1][1]', note: 'Total minus the strip above minus the strip left, PLUS the corner — which the two subtractions removed twice.' },
      { stat: '10 - 3 - 4 + 1 = 4  ✓', note: 'That final + is the term people drop, and it gives a plausible wrong answer rather than a crash. Draw the rectangle before coding it.' },
    ],
  },

  'prefix/2': {
    title: 'Product except self: two passes, because you cannot divide',
    contrast: 'The template subtracts to remove a prefix. Products have no safe inverse when a zero is present.',
    cells: [1, 2, 3, 4],
    frames: [
      { stat: 'why not total_product / xs[i]?', note: 'Because one zero makes every division either wrong or a crash. The problem usually forbids division for exactly this reason.' },
      { mark: [0], stat: 'left  = [1, _, _, _]', note: 'Pass one: left[i] is the product of everything BEFORE i. left[0] is the empty product, 1.' },
      { mark: [0, 1, 2], stat: 'left  = [1, 1, 2, 6]', note: 'Running product, left to right.' },
      { mark: [3], stat: 'right = [_, _, _, 1]', note: 'Pass two, from the other end. right[last] is also the empty product.' },
      { mark: [1, 2, 3], stat: 'right = [24, 12, 4, 1]', note: 'Running product, right to left.' },
      { stat: 'answer[i] = left[i] x right[i]  ->  [24, 12, 8, 6]', note: 'Two passes, no division, and zeros need no special case at all. Build from both ends whenever a position needs everything on both sides.' },
    ],
  },

  'prefix/3': {
    title: 'Interleaved updates and queries: prefix sums stop working',
    contrast: 'The template assumes the array is static between queries. One update invalidates the whole table.',
    cells: [3, 4, 7, 2],
    frames: [
      { range: [0, 3], stat: 'pre = [0, 3, 7, 14, 16]', note: 'Built once, O(n). Every query is now O(1) — as long as nothing changes.' },
      { mark: [1], stat: 'update xs[1] += 5', note: 'A single element changes.' },
      { range: [1, 3], stat: 'pre[2], pre[3], pre[4] all wrong', note: 'Every prefix at or after the change is stale. Repairing it is O(n), so m updates cost O(mn).' },
      { stat: 'and a difference array does not help', note: 'That inverts the problem: O(1) updates but O(n) to read. Interleaving both is what defeats each of them.' },
      { stat: 'Fenwick tree: O(log n) for BOTH', note: 'A binary indexed tree gives logarithmic update and logarithmic prefix query. This is the case it exists for.' },
      { stat: 'naming it is usually enough', note: 'You will rarely be asked to implement one. Recognising WHEN prefix sums break is the tested part.' },
    ],
  },

  // ============================================================= fast-slow ==

  'fast-slow/0': {
    title: 'Where the cycle STARTS: reset one pointer to the head',
    contrast: 'The template stops at the meeting point. Two more lines turn that into the cycle entrance.',
    cells: [1, 2, 3, 4, 5, 6],
    label: 'node 5 points back to index 2:',
    frames: [
      { ptrs: { slow: 4, fast: 4 }, mark: [4], stat: 'they met at index 4', note: 'The template ends here, having proved a cycle exists. The entrance is index 2, and nothing so far identifies it.' },
      { ptrs: { slow: 0, fast: 4 }, mark: [0, 4], stat: 'reset slow to the head', note: 'Leave fast where it met. Move slow back to the start.' },
      { ptrs: { slow: 1, fast: 5 }, mark: [1, 5], stat: 'both advance by ONE now', note: 'Same speed, not double. That change is the whole trick.' },
      { ptrs: { slow: 2, fast: 2 }, mark: [2], stat: 'they meet at index 2  ->  the entrance', note: 'The distance from head to entrance equals the distance from the meeting point to the entrance, going round.' },
      { stat: 'why: 2 x (a + b) = a + b + c + b', note: 'Which gives a = c. Worth knowing the RESULT even if you cannot reproduce the algebra under pressure — and say that honestly if asked.' },
    ],
  },

  'fast-slow/1': {
    title: 'Nth from the end: a fixed GAP, not two speeds',
    contrast: 'The template uses different speeds. This one uses the same speed and a head start.',
    cells: [1, 2, 3, 4, 5],
    label: 'remove the 2nd from the end:',
    frames: [
      { ptrs: { slow: 0, fast: 0 }, mark: [0], stat: 'both at the head', note: 'Same family, different mechanism. Nothing here is about speed.' },
      { ptrs: { slow: 0, fast: 2 }, mark: [0, 2], stat: 'advance fast by n = 2   gap fixed', note: 'Open the gap first, then never change it.' },
      { ptrs: { slow: 1, fast: 3 }, mark: [1, 3], stat: 'both +1', note: 'Both move at one step. The gap of 2 is preserved by construction.' },
      { ptrs: { slow: 2, fast: 4 }, mark: [2, 4], stat: 'fast at the last node', note: 'When fast reaches the end, slow is exactly n behind it.' },
      { ptrs: { slow: 3, fast: 4 }, mark: [3], stat: 'slow at index 3 = 2nd from the end', note: 'Found in one pass without knowing the length.' },
      { stat: 'and use a dummy head', note: 'Removing the FIRST node is otherwise a special case. A sentinel gives every node a predecessor and deletes that branch.' },
    ],
  },

  'fast-slow/2': {
    title: 'Happy number: a number sequence IS a linked list',
    contrast: 'The template walks node.next. Replace the successor function and everything else is identical.',
    cells: [19, 82, 68, 100, 1],
    label: 'sum of squared digits:',
    frames: [
      { stat: 'next(n) = sum of squares of digits', note: 'That function defines a successor for every number, which is exactly what makes a linked list.' },
      { ptrs: { slow: 1, fast: 2 }, mark: [1, 2], stat: '19 -> 82 -> 68', note: 'slow takes one step, fast takes two. The code is unchanged from cycle detection.' },
      { ptrs: { slow: 2, fast: 4 }, mark: [2, 4], stat: 'slow 68   fast 1', note: 'fast is racing ahead through the sequence.' },
      { ptrs: { slow: 4, fast: 4 }, mark: [4], stat: 'reaches 1 — and 1 -> 1 forever', note: 'A happy number terminates at 1, which is a self-loop. That is the "no cycle" outcome here.' },
      { stat: 'an unhappy number cycles: 4 -> 16 -> 37 -> ... -> 4', note: 'Then slow and fast meet at some value other than 1, and the answer is False.' },
      { stat: 'the recognition IS the problem', note: 'Nothing about linked lists appears in the statement. Seeing a deterministic successor as a list is the whole insight.' },
    ],
  },

  'fast-slow/3': {
    title: 'Palindrome list: compose finding the middle with reversing',
    contrast: 'The template only locates a position. Here that position is the input to a second technique.',
    cells: [1, 2, 3, 2, 1],
    frames: [
      { ptrs: { slow: 0, fast: 0 }, mark: [0], stat: 'find the middle first', note: 'Reuse the template unchanged: when fast reaches the end, slow is at the middle.' },
      { ptrs: { slow: 2, fast: 4 }, mark: [2], stat: 'slow at index 2 (the middle)', note: 'Odd length, so the middle element belongs to neither half and can be skipped.' },
      { range: [3, 4], mark: [3, 4], stat: 'reverse the second half in place', note: 'Three-pointer reversal, also a technique you already have. Two known things composed.' },
      { range: [0, 1], stat: 'second half becomes 1 -> 2', note: 'Now both halves run in the same direction and can be walked together.' },
      { mark: [0, 4], stat: 'compare 1 vs 1, then 2 vs 2  ->  True', note: 'O(n) time, O(1) space. Copying to an array would be O(n) space and is the answer to beat.' },
      { stat: 'say you are mutating the input', note: 'The list is left reversed. Offer to restore it — that offer is what interviewers listen for on any in-place answer.' },
    ],
  },
});
