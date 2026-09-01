/* Animations, batch D: the last six pattern pages.
 * Sort-then-sweep, heap/top-k, DFS with memo, backtracking, Union-Find, trie.
 */
Object.assign(window.ANIMS, {

  // ================================================================= sweep ==

  'sweep': {
    title: 'Rooms for meetings [0,30], [5,10], [15,20] — events on a timeline',
    cells: ['+1@0', '-1@10', '+1@5', '+1@15', '-1@20', '-1@30'],
    label: 'events, unsorted:',
    frames: [
      { stat: 'rooms needed = maximum concurrency', note: 'Reframe first. The number of rooms at any instant is the number of meetings happening then, so the answer is the maximum over time.' },
      { mark: [0, 2, 3], stat: 'each meeting becomes +1 at start, -1 at end', note: 'Two-dimensional overlap reasoning collapses into a one-dimensional counter. This is the move worth transferring.' },
      { stat: 'sorted: +1@0, +1@5, -1@10, +1@15, -1@20, -1@30', note: 'Replay time in order. Sorting is what makes the sweep possible and it dominates the cost.' },
      { ptrs: { t: 0 }, mark: [0], stat: 'counter 1   max 1', note: 'Meeting [0,30] starts and does not end for a long time.' },
      { ptrs: { t: 2 }, mark: [0, 2], stat: 'counter 2   max 2', note: 'Meeting [5,10] starts while the first is still running. Two rooms needed.' },
      { ptrs: { t: 1 }, mark: [1], stat: 'counter 1   max 2', note: '[5,10] ends. The counter falls but max remembers — current and best again.' },
      { ptrs: { t: 3 }, mark: [0, 3], stat: 'counter 2   max 2', note: '[15,20] starts inside [0,30]. Two again, never three.' },
      { stat: 'answer 2   O(n log n)', note: 'The counter never exceeded 2, so two rooms suffice. Sorting dominates; the sweep itself is linear.' },
    ],
  },

  'sweep/1': {
    title: 'Minimum removals from [1,2], [2,3], [3,4], [1,3]',
    contrast: 'The template counts overlap. It cannot CHOOSE what to keep — so the question gets reversed first.',
    cells: ['[1,2]', '[2,3]', '[3,4]', '[1,3]'],
    label: 'intervals:',
    frames: [
      { stat: '"fewest removals" is hard to be greedy about', note: 'There is no local rule for what to delete. Reverse it: maximise what you KEEP, then subtract.' },
      { mark: [3], stat: 'sorted by START: [1,2], [1,3], [2,3], [3,4]', note: 'The intuitive sort. Watch it fail.' },
      { mark: [0, 3], stat: 'keep [1,2], then [1,3] overlaps... keep 3 total', note: 'By start, a long early interval can block two short ones. Sorting by start is the wrong greedy.' },
      { stat: 'sorted by END: [1,2], [2,3], [1,3], [3,4]', note: 'Earliest end first. This leaves the most room for everything that follows.' },
      { mark: [0], stat: 'keep [1,2]   last_end = 2', note: 'Take it. Nothing kept so far can conflict.' },
      { mark: [0, 1], stat: 'keep [2,3]   last_end = 3', note: '2 >= 2, compatible. Touching endpoints are allowed here, which is the same boundary question as always.' },
      { mark: [0, 1, 2], stat: '[1,3] starts at 1 < 3  ->  skip.  keep [3,4]', note: '[1,3] conflicts and is dropped; [3,4] fits. Three kept out of four.' },
      { stat: 'answer 4 - 3 = 1 removal', note: 'The exchange argument: swapping in the earliest-ending compatible interval never shrinks an optimal solution, so the greedy choice is always safe.' },
    ],
  },

  'sweep/2': {
    title: 'A 30-minute connection turns a legal itinerary illegal',
    contrast: 'The template compares an arrival directly against the next departure. One term is added, and the answer changes.',
    cells: ['A 09:00', 'B 10:00', 'B 10:15', 'C 11:30'],
    label: 'flights:',
    frames: [
      { mark: [0, 1], stat: 'flight 1: A 09:00 -> B 10:00', note: 'You land at B at 10:00.' },
      { mark: [2, 3], stat: 'flight 2: B 10:15 -> C 11:30', note: 'The next flight leaves B at 10:15. Fifteen minutes to change planes.' },
      { mark: [1, 2], stat: 'template: 10:00 <= 10:15  ->  LEGAL', note: 'Comparing arrival against departure says yes. Arrive at 11:30.' },
      { mark: [1, 2], stat: 'with MCT: 10:00 + 0:30 = 10:30 > 10:15  ->  ILLEGAL', note: 'One added term, and the connection is impossible. The itinerary the template found does not exist in reality.' },
      { stat: 'best[origin] + MCT <= departure', note: 'That is the entire change. Everything else about the sweep is unaltered.' },
      { stat: 'ask in the clarifying round', note: 'Interviewers wait to see whether you raise it. Discovering it at minute thirty-five costs the problem.' },
    ],
  },

  'sweep/3': {
    title: 'All events inside one day: skip the sort entirely',
    contrast: 'The template sorts, at O(n log n). When the time range is small and fixed, sorting is avoidable work.',
    cells: [0, 0, 0, 0, 0, 0],
    label: 'minutes (abridged):',
    frames: [
      { stat: 'times are minutes 0..1439', note: 'Bounded small integers. That phrase is always the hint that sorting can go.' },
      { mark: [1], stat: 'meeting 60..180  ->  diff[60] += 1', note: 'Mark the boundaries instead of building events to sort.' },
      { mark: [3], stat: '                  ->  diff[180] -= 1', note: 'Two writes per meeting, O(1) each, in any order at all.' },
      { mark: [2], stat: 'meeting 120..240  ->  diff[120] += 1, diff[240] -= 1', note: 'Order does not matter, because nothing is being sorted.' },
      { range: [0, 5], stat: 'one sweep of 1440 slots  ->  running max', note: 'A single pass over the fixed range gives the concurrency profile and its maximum.' },
      { stat: 'O(n + 1440) vs O(n log n)', note: 'Better once n is large relative to the range. At n = 10 the sort wins; at n = 10^6 this does. Say which regime you are in.' },
    ],
  },

  'sweep/4': {
    title: 'Which room, not how many — the counter is not enough',
    contrast: 'The template maintains a number. A number cannot name a room, so it becomes a heap of (endTime, roomId).',
    cells: ['M1 0-30', 'M2 5-10', 'M3 15-20'],
    label: 'meetings:',
    frames: [
      { stat: 'counter said 2 rooms — but which?', note: 'The sweep proves two rooms suffice and says nothing about assignment. Identity has to be carried.' },
      { mark: [0], stat: 'heap [(30, roomA)]   M1 -> A', note: 'Open room A for M1. The heap orders by when a room frees.' },
      { mark: [1], stat: 'top frees at 30 > 5  ->  open B.  M2 -> B', note: 'Nothing is free yet, so a second room opens and is named.' },
      { mark: [1], stat: 'heap [(10, B), (30, A)]', note: 'B frees soonest, so it sits on top. That ordering is the whole reason for a heap.' },
      { mark: [2], stat: 'top frees at 10 <= 15  ->  reuse B.  M3 -> B', note: 'Pop B, assign it, push it back with the new end time. The specific room is known because it was carried.' },
      { stat: 'A: M1.   B: M2, M3.', note: 'Same two-room answer, now with an assignment. This is the standard follow-up once you give the counter answer.' },
    ],
  },

  // ============================================================= heap-topk ==

  'heap-topk': {
    title: '2 largest of [3, 1, 5, 12, 2, 11] with a size-2 MIN-heap',
    cells: [3, 1, 5, 12, 2, 11],
    frames: [
      { stat: 'heap []', note: 'For k LARGEST use a MIN-heap. That is the counter-intuitive part and the reason it works.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'heap [3]', note: 'Push. Below capacity, so nothing is evicted.' },
      { ptrs: { at: 1 }, mark: [0, 1], stat: 'heap [1, 3]   full', note: 'Now at size k. The smallest of the best-so-far sits on top, where it can be compared cheaply.' },
      { ptrs: { at: 2 }, mark: [0, 2], stat: '5 > top 1  ->  push, pop 1.  heap [3, 5]', note: 'One comparison against the top decides everything. No scanning.' },
      { ptrs: { at: 3 }, mark: [2, 3], stat: '12 > 3  ->  heap [5, 12]', note: 'The weakest survivor is evicted each time. The heap never exceeds k.' },
      { ptrs: { at: 4 }, mark: [2, 3], stat: '2 < top 5  ->  rejected in ONE comparison', note: 'A value that cannot make the top k is dismissed immediately — that is where the saving comes from.' },
      { ptrs: { at: 5 }, mark: [3, 5], stat: '11 > 5  ->  heap [11, 12]', note: 'Final heap. Its top, 11, is the 2nd largest.' },
      { stat: 'O(n log k), not O(n log n)', note: 'A max-heap would have held all six and sorted more than was asked. As k approaches n the advantage disappears, and then you should just sort.' },
    ],
  },

  'heap-topk/0': {
    title: 'k = 5 of 6 elements: the heap has stopped paying',
    contrast: 'The template caps the heap at k for O(n log k). When k is nearly n, log k is log n and the heap is just extra machinery.',
    cells: [3, 1, 5, 12, 2, 11],
    frames: [
      { stat: 'n = 6, k = 5', note: 'The heap will hold five of six elements almost the whole time.' },
      { range: [0, 4], stat: 'heap size 5   log2(5) ~ 2.3', note: 'log k versus log n is 2.3 versus 2.6. The asymptotic advantage is gone.' },
      { range: [0, 5], stat: 'sorted(xs)[-5:]  ->  one line', note: 'Sorting is simpler, has no heap bookkeeping, and is often faster in practice at this ratio.' },
      { stat: 'the crossover is roughly k ~ n / log n', note: 'You do not need the exact figure. You need to notice the question and answer it.' },
      { stat: 'say WHY the heap was there', note: 'Naming the crossover shows you chose the heap rather than pattern-matched to it. That is the part being scored.' },
    ],
  },

  'heap-topk/1': {
    title: 'Running median of 5, 15, 1, 3 — two heaps facing each other',
    contrast: 'The template gives one end of the order. A median sits in the MIDDLE, which one heap can never reach.',
    cells: [5, 15, 1, 3],
    frames: [
      { stat: 'low = max-heap (lower half)   high = min-heap (upper half)', note: 'Two heaps back to back. The median is at one or both of their tops.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'low [5]   high []   median 5', note: 'First value goes low. With one element, its top is the median.' },
      { ptrs: { at: 1 }, mark: [0, 1], stat: 'low [5]   high [15]   median (5+15)/2 = 10', note: '15 belongs above 5. Even count, so the median is the average of the two tops.' },
      { ptrs: { at: 2 }, mark: [0, 1, 2], stat: 'low [5, 1]   high [15]   median 5', note: '1 goes low. Sizes are 2 and 1, within one, so no rebalance is needed.' },
      { ptrs: { at: 3 }, mark: [2, 3], stat: 'low [3, 1]   high [5, 15]   median (3+5)/2 = 4', note: '3 goes low, which makes it 3 versus 1 — too lopsided, so the largest of low moves up. Balance is the invariant.' },
      { stat: 'O(log n) per insert, O(1) per query', note: 'Sorting on every query would be O(n log n) each time. The invariant to state out loud: sizes within one, and every element of low <= every element of high.' },
    ],
  },

  'heap-topk/2': {
    title: 'Top-k frequent in O(n): buckets, because counts are bounded by n',
    contrast: 'The template pays log k per element. Here the values being ordered have a bounded range, which removes the log entirely.',
    cells: [1, 1, 1, 2, 2, 3],
    frames: [
      { range: [0, 5], stat: 'counts {1: 3, 2: 2, 3: 1}', note: 'Counting is the same either way. The question is how you then order by count.' },
      { stat: 'a count can never exceed n = 6', note: 'That is the whole insight. The thing being sorted lives in a small fixed range, so it can be bucketed.' },
      { mark: [0, 1, 2], stat: 'buckets[3] = [1]', note: 'File each value under its count. No comparisons at all.' },
      { mark: [3, 4], stat: 'buckets[2] = [2]', note: 'This is counting sort applied to frequencies.' },
      { mark: [5], stat: 'buckets[1] = [3]', note: 'Read down from the highest bucket and stop at k.' },
      { stat: 'O(n) total', note: 'Beats O(n log k). Whenever what you are ordering is bounded by n, sorting is avoidable — the same reasoning as coordinate compression.' },
    ],
  },

  'heap-topk/3': {
    title: 'Pushing bare nodes raises TypeError on the first tie',
    contrast: 'The template pushes comparable numbers. Push objects and the heap compares them the moment two priorities are equal.',
    cells: ['(1, nodeA)', '(1, nodeB)', '(4, nodeC)'],
    label: 'heap entries:',
    frames: [
      { mark: [0], stat: 'push (1, nodeA)   fine', note: 'Python compares tuples element by element, so with distinct first elements the payload is never touched.' },
      { mark: [0, 1], stat: 'push (1, nodeB)   TIE on 1', note: 'Two entries with priority 1. The comparison falls through to the second element.' },
      { mark: [0, 1], stat: 'nodeA < nodeB  ->  TypeError', note: 'ListNode defines no ordering, so the comparison raises. It works right up until two values tie, which is why it survives small tests.' },
      { mark: [0, 1], stat: 'fix: (1, 0, nodeA), (1, 1, nodeB)', note: 'Insert a monotonic counter between them. Ties now resolve on the counter and the payload is never compared.' },
      { mark: [2], stat: '(4, 2, nodeC)   no tie, still safe', note: 'The counter costs nothing and removes the failure mode entirely.' },
      { stat: 'or a dataclass with order=True', note: 'The tuple is faster to type under pressure. Either way, say why the tiebreak is there.' },
    ],
  },

  // ================================================================== memo ==

  'memo': {
    title: 'Coins [1, 3, 4], amount 6 — where the cache earns itself',
    cells: [0, 1, 2, 3, 4, 5, 6],
    label: 'amount:',
    frames: [
      { mark: [0], stat: 'best(0) = 0', note: 'Base case. Zero coins make zero, and every branch bottoms out here.' },
      { mark: [6], stat: 'best(6) = 1 + min(best(5), best(3), best(2))', note: 'Take one coin of each denomination and recurse on the remainder. Three branches from the top.' },
      { mark: [2, 3, 5], stat: 'three subproblems: 5, 3, 2', note: 'Now watch for repetition. best(2) will be reached from several places.' },
      { mark: [2], stat: 'best(2) reached via 6->5->2 and via 6->3->2', note: 'Two different routes, same subproblem. Without a cache the whole subtree below it is computed twice.' },
      { mark: [1, 2], stat: 'cached: computed once, read thereafter', note: 'Only amount+1 distinct states exist, so the cache bounds the work at 7 states times 3 coins.' },
      { mark: [3], stat: 'best(3) = 1   (a single 3-coin)', note: 'Filling upward: 1 needs one coin, 2 needs two, 3 needs one.' },
      { mark: [6], stat: 'best(6) = 1 + best(3) = 2', note: 'Answer 2, as 3 + 3. Greedy would take 4 then 1 then 1 — three coins — which is why greedy is wrong here.' },
      { stat: 'exponential -> O(amount x coins)', note: 'The recursion did not change. One decorator turned an exponential tree into a linear scan of states.' },
    ],
  },

  'memo/0': {
    title: 'Combinations vs permutations: the same table, the loops swapped',
    contrast: 'The template loops amounts outside and coins inside. Swapping them changes WHAT IS COUNTED, not the speed.',
    cells: [0, 1, 2, 3],
    label: 'amount:',
    frames: [
      { stat: 'coins [1, 2], target 3', note: 'How many ways? It depends entirely on whether 1+2 and 2+1 count as one way or two.' },
      { stat: 'amount outer, coin inner  ->  3 ways', note: 'This order reconsiders every coin at every amount, so it counts ORDERINGS: 1+1+1, 1+2, 2+1.' },
      { mark: [3], stat: 'dp[3] counts 1+2 AND 2+1 separately', note: 'Permutations. Correct for "in how many ways can you climb stairs", wrong for coin combinations.' },
      { stat: 'coin outer, amount inner  ->  2 ways', note: 'Now each coin is considered once for the whole table, so a coin can never appear before an earlier one.' },
      { mark: [3], stat: 'dp[3] counts 1+1+1 and 1+2 only', note: 'Combinations. 2+1 is never formed because coin 2 is processed after coin 1 has finished.' },
      { stat: 'the loop order IS the semantics', note: 'Same complexity, same lines, different problem. This is the deviation that catches people who memorised the code rather than the meaning.' },
    ],
  },

  'memo/1': {
    title: 'At most 2 transactions: a missing dimension fails SILENTLY',
    contrast: 'The template keys the cache on position alone. Add a constraint and that key stops identifying the state.',
    cells: [3, 2, 6, 5, 0, 3],
    label: 'prices:',
    frames: [
      { stat: 'state (i) — position only', note: 'Enough when the only thing that matters is where you are.' },
      { ptrs: { i: 2 }, mark: [2], stat: 'at day 2 with 2 transactions left', note: 'Now two different situations share the key i = 2.' },
      { ptrs: { i: 2 }, mark: [2], stat: 'at day 2 with 0 transactions left', note: 'Same position, completely different future. The cache cannot tell them apart.' },
      { ptrs: { i: 2 }, mark: [2], stat: 'first one cached  ->  second reads it', note: 'The second call gets an answer computed under the wrong constraint. No error, no crash — a confident wrong number.' },
      { stat: 'state (i, transactions_left, holding)', note: 'If the answer depends on it, it belongs in the key. Three dimensions here, and the state count is still small.' },
      { stat: 'the number-one DP bug', note: 'It fails silently, which is what makes it dangerous. Say the state out loud in words before coding it — that is when the missing dimension becomes obvious.' },
    ],
  },

  'memo/2': {
    title: 'Greedy on coins {1, 3, 4} for 6 — breaking it takes ten seconds',
    contrast: 'Not an adaptation but a test. Before writing DP, try to break the greedy; before trusting greedy, do the same.',
    cells: [1, 3, 4],
    label: 'coins:',
    frames: [
      { stat: 'target 6', note: 'Greedy says: take the largest coin that fits, repeatedly.' },
      { mark: [2], stat: 'take 4   remaining 2', note: 'The largest coin not exceeding 6.' },
      { mark: [0, 2], stat: 'take 1   remaining 1', note: '3 does not fit in 2, so take 1.' },
      { mark: [0, 2], stat: 'take 1   remaining 0  ->  3 coins', note: 'Greedy answers 3.' },
      { mark: [1], stat: 'but 3 + 3 = 6  ->  2 coins', note: 'Two coins. Greedy is wrong, and producing this counterexample took one line of arithmetic.' },
      { stat: 'with {1, 5, 10, 25} greedy IS optimal', note: 'Which is why it feels right — real currency is designed to make it work. The denominations decide, and you cannot tell by looking.' },
      { stat: 'so: test it, then commit', note: 'Fifteen seconds of adversarial arithmetic before choosing. Discovering it at minute thirty costs the problem.' },
    ],
  },

  'memo/3': {
    title: 'Edit distance "ab" -> "abc": draw the grid before coding it',
    contrast: 'The template has one dimension. Two sequences need two, and the recurrence is visible in the picture and invisible in your head.',
    cells: ['', 'a', 'b', 'c'],
    label: 'target "abc":',
    frames: [
      { stat: 'dp[i][j] = cost to turn a[:i] into b[:j]', note: 'State it in words first. Two indices, so a 2D table.' },
      { mark: [0], stat: 'row 0: 0, 1, 2, 3', note: 'Base case: turning the empty string into b[:j] costs j insertions.' },
      { mark: [1], stat: 'a matches a  ->  dp = dp[i-1][j-1], no cost', note: 'Characters equal, so take the diagonal unchanged. Free move.' },
      { mark: [2], stat: 'b matches b  ->  diagonal again', note: 'Still free. Two of three characters align.' },
      { mark: [3], stat: 'nothing left in "ab"  ->  insert c, cost 1', note: 'Three moves reach any cell: insert, delete, substitute — the three neighbours above, left and diagonal.' },
      { stat: 'answer 1', note: 'One insertion. The grid makes that obvious; reasoning about it verbally does not.' },
      { stat: 'and only the previous row is read', note: 'Which is why the space collapses to O(n) — but only after the recurrence is right.' },
    ],
  },

  // ========================================================== backtracking ==

  'backtracking': {
    title: 'All subsets of [1, 2, 3] — choose, recurse, un-choose',
    cells: [1, 2, 3],
    frames: [
      { stat: 'path []   result [[]]', note: 'Record on entry, so the empty subset is included. Every node of the recursion tree is an answer here.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'path [1]   result +[1]', note: 'Choose 1 and recurse. The start index prevents ever looking backwards.' },
      { ptrs: { at: 1 }, mark: [0, 1], stat: 'path [1, 2]   result +[1,2]', note: 'Deeper. [2,1] will never be generated, because the loop only moves forward — de-duplication by construction.' },
      { ptrs: { at: 2 }, mark: [0, 1, 2], stat: 'path [1, 2, 3]', note: 'Deepest. Nothing left to add, so this branch is finished.' },
      { ptrs: { at: 1 }, mark: [0, 1], stat: 'UN-CHOOSE 3   path [1, 2]', note: 'The pop. Without it, path keeps growing and every later result is contaminated.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'un-choose 2   path [1]', note: 'Unwinding. Each level removes exactly what it added.' },
      { ptrs: { at: 1 }, mark: [1], stat: 'path [2]   result +[2]', note: 'Now the second branch from the root. This is why the un-choose matters — the state must be clean.' },
      { stat: '8 subsets   append path[:] not path', note: '2^n results, which is expected since the output itself is exponential. Appending path by reference gives eight references to one list, which ends up empty.' },
    ],
  },

  'backtracking/0': {
    title: 'Duplicates in [1, 2, 2]: i > start, not i > 0',
    contrast: 'The template assumes distinct elements. With repeats you must skip — but only at the SAME level, and the guard is one token.',
    cells: [1, 2, 2],
    frames: [
      { stat: 'sorted, so equal values are adjacent', note: 'Sorting first is what makes "same as the previous one" a usable test.' },
      { ptrs: { at: 1 }, mark: [1], stat: 'level 1: choose xs[1] = 2   path [2]', note: 'First 2 at this level. Take it.' },
      { ptrs: { at: 2 }, mark: [1, 2], stat: 'level 2: choose xs[2] = 2   path [2, 2]', note: 'The second 2, one level DEEPER. This is legal and necessary — [2,2] is a real subset.' },
      { ptrs: { at: 2 }, mark: [2], stat: 'back at level 1: xs[2] == xs[1]  ->  SKIP', note: 'Now the same value appears again at the SAME level. Taking it would regenerate [2], which is already recorded.' },
      { stat: 'i > start   (not i > 0)', note: 'i > start means "not the first choice at this level". Using i > 0 would also block the deeper [2,2], losing a correct answer.' },
      { stat: 'result: [], [1], [1,2], [1,2,2], [2], [2,2]', note: 'Six, not eight. The skip removes exactly the duplicates and nothing else.' },
    ],
  },

  'backtracking/1': {
    title: 'Reuse allowed: go(i) instead of go(i + 1)',
    contrast: 'The template consumes each element. One character lets an element be chosen again.',
    cells: [2, 3, 5],
    label: 'candidates:',
    frames: [
      { stat: 'target 7', note: 'Combination sum: each candidate may be used any number of times.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'path [2]   remaining 5   recurse go(0)', note: 'Choose 2 and recurse with i UNCHANGED, so 2 is still available.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'path [2, 2]   remaining 3', note: 'The same index again. go(i + 1) would have made this impossible.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'path [2, 2, 2]   remaining 1   dead end', note: 'Overshoots, so this branch prunes and unwinds.' },
      { ptrs: { at: 1 }, mark: [0, 1], stat: 'path [2, 2, 3]  =  7  ✓', note: 'Backtrack one and take 3 instead. First answer.' },
      { ptrs: { at: 1 }, mark: [1, 2], stat: 'path [2, 5]  =  7  ✓', note: 'And another. Still no ordering duplicates, because the index never goes backwards.' },
      { stat: 'go(i) vs go(i + 1)', note: 'One character separates Combination Sum I from II. Recognising which you are being asked for is the entire decision.' },
    ],
  },

  'backtracking/2': {
    title: '"How many" instead of "which": stop enumerating',
    contrast: 'The template materialises every arrangement. If only the count is wanted, that is exponential work for a polynomial answer.',
    cells: [1, 2, 3, 4],
    label: 'n stairs:',
    frames: [
      { stat: 'how many ways to climb, 1 or 2 at a time?', note: 'Backtracking can answer it: enumerate every path and count them.' },
      { mark: [0, 1, 2, 3], stat: 'n = 4  ->  5 paths enumerated', note: 'Fine at n = 4. The recursion tree is small.' },
      { stat: 'n = 40  ->  ~165 million paths', note: 'The answer is one number. Building 165 million lists to count them is absurd.' },
      { mark: [0, 1], stat: 'dp[i] = dp[i-1] + dp[i-2]', note: 'DP counts without constructing. Forty additions instead.' },
      { stat: 'the tell is the question word', note: '"List them" or "return all" means backtracking. "How many" or "count" means DP. It is decided before you write anything.' },
    ],
  },

  'backtracking/3': {
    title: 'N-queens: prune before you recurse, not at the leaf',
    contrast: 'The template checks validity when a candidate is complete. Checking on the way down is the difference between seconds and never.',
    cells: ['.', '.', '.', '.'],
    label: 'row 0 columns:',
    frames: [
      { stat: '4x4 board, one queen per row', note: 'Place row by row. The only question is which column, so the search space is 4^4 = 256 without pruning.' },
      { mark: [0], stat: 'row 0 -> col 0', note: 'Place and immediately record what it attacks: column 0, diagonal r-c = 0, anti-diagonal r+c = 0.' },
      { mark: [0, 1], stat: 'row 1 -> col 1?  r-c = 0  ATTACKED', note: 'Rejected before recursing. Nothing below this branch is ever explored.' },
      { mark: [0, 2], stat: 'row 1 -> col 2   ok, descend', note: 'The first column that survives all three sets. Sets make each test O(1).' },
      { stat: 'leaf-only checking: 256 placements explored', note: 'Validating at the end walks the entire tree, then throws almost all of it away.' },
      { stat: 'pruning: a few dozen', note: 'Same algorithm, same correctness, an order of magnitude less work. For n = 8 it is the difference between instant and unusable.' },
    ],
  },

  // ============================================================ union-find ==

  'union-find': {
    title: 'Cities 0-1, 1-2, and 3 alone — counting groups',
    cells: [0, 1, 2, 3],
    label: 'parent:',
    frames: [
      { stat: 'parent [0, 1, 2, 3]   4 groups', note: 'Every node starts as its own root, so it is its own group.' },
      { mark: [0, 1], stat: 'union(0, 1): roots 0 and 1 differ  ->  merge', note: 'Find both roots first. Pointing a NODE at another node instead of its root is the classic bug.' },
      { mark: [1], stat: 'parent [0, 0, 2, 3]   3 groups', note: '1 now points at 0. Each successful union decrements the count.' },
      { mark: [1, 2], stat: 'union(1, 2): find(1) = 0, find(2) = 2', note: 'find(1) walks up to 0. Comparing roots, not the arguments you were handed.' },
      { mark: [2], stat: 'parent [0, 0, 0, 3]   2 groups', note: 'Path compression flattens as it goes, so later finds are near-constant.' },
      { mark: [0, 1], stat: 'union(0, 1) again  ->  returns False', note: 'Same root already, so nothing merges. That False is your cycle detector, free of charge.' },
      { mark: [3], stat: 'answer 2 groups: {0,1,2} and {3}', note: 'The lone node is still a group. Fifteen lines, near O(1) per operation.' },
    ],
  },

  'union-find/0': {
    title: 'Nodes that are emails: choosing WHAT to union',
    contrast: 'The template indexes an integer array. With string labels the mapping is trivial — the real work is deciding what a node is.',
    cells: ['a@x', 'b@x', 'c@x'],
    label: 'emails:',
    frames: [
      { stat: 'account 1: [a@x, b@x]   account 2: [b@x, c@x]', note: 'Two records sharing b@x. They are the same person, and the answer is the merged set.' },
      { stat: 'wrong: union the ACCOUNTS', note: 'Unioning account 1 with account 2 needs you to already know they overlap — which is the thing you were asked to work out.' },
      { mark: [0, 1], stat: 'right: union the EMAILS. union(a@x, b@x)', note: 'Union every email within a record. Now overlap is discovered rather than assumed.' },
      { mark: [1, 2], stat: 'union(b@x, c@x)', note: 'The second record links b@x to c@x. b@x is the bridge, and nothing had to detect that.' },
      { mark: [0, 1, 2], stat: 'all three share one root', note: 'Transitivity does the work. Group by root at the end to produce the merged account.' },
      { stat: 'idx = {} maps label -> index', note: 'The integer mapping is four lines. Choosing emails as the nodes was the solution.' },
    ],
  },

  'union-find/1': {
    title: 'Redundant connection: the first union that returns False',
    contrast: 'Nothing structural changes. The template already returns False on a redundant edge — you just stop and report it.',
    cells: ['1-2', '1-3', '2-3'],
    label: 'edges, in order:',
    frames: [
      { stat: 'a tree plus one extra edge', note: 'Exactly one edge creates a cycle, and the answer is the LAST such edge in input order.' },
      { mark: [0], stat: 'union(1, 2)  ->  True', note: 'Different roots, so they merge. A genuine tree edge.' },
      { mark: [0, 1], stat: 'union(1, 3)  ->  True', note: 'Also merges. Three nodes, two edges, still a tree.' },
      { mark: [2], stat: 'union(2, 3)  ->  FALSE', note: '2 and 3 already share a root, so this edge closes a loop. Return it.' },
      { stat: 'no second mechanism needed', note: 'Adding a separate cycle check gives two pieces of logic that can disagree. The return value is already the answer.' },
      { stat: 'processing order matters', note: 'The problem asks for the last edge that can be removed, which is why edges are processed in the given order rather than sorted.' },
    ],
  },

  'union-find/2': {
    title: 'A directed graph: union(u, v) throws the direction away',
    contrast: 'The template merges symmetric sets. Direction is information it structurally cannot hold.',
    cells: ['A', 'B'],
    label: 'nodes:',
    frames: [
      { stat: 'edge A -> B', note: 'A depends on B. The direction is the whole content of the edge.' },
      { mark: [0, 1], stat: 'union(A, B)  ->  same group', note: 'Union-Find records only that they are related. "A before B" is gone.' },
      { mark: [0, 1], stat: 'union(B, A) is IDENTICAL', note: 'The operation is symmetric by construction. A cycle A->B->A and a plain edge look the same afterwards.' },
      { stat: 'so it cannot detect a directed cycle', note: 'Not a bug to work around — the structure has no place to store what you need.' },
      { stat: 'use DFS with a grey set, or Kahn', note: 'Both keep the ordering. Recognising that a tool cannot express the problem is worth as much as using it well.' },
    ],
  },

  'union-find/3': {
    title: 'MST via Kruskal: greedy plus this template, and nothing else',
    contrast: 'The template answers connectivity. Sort the edges by weight first and the same loop produces a minimum spanning tree.',
    cells: ['1', '2', '3', '4'],
    label: 'edge weights, sorted:',
    frames: [
      { stat: 'edges sorted ascending by weight', note: 'The only addition. Kruskal is a sort followed by the template you already have.' },
      { mark: [0], stat: 'weight 1: union succeeds  ->  take it   total 1', note: 'Cheapest edge, endpoints not yet connected, so it joins the tree.' },
      { mark: [0, 1], stat: 'weight 2: union succeeds  ->  total 3', note: 'Same test. Union-Find is what makes "would this create a cycle?" cheap.' },
      { mark: [2], stat: 'weight 3: union returns FALSE  ->  skip', note: 'Both endpoints already connected. Adding it would make a cycle and cannot reduce the total.' },
      { mark: [0, 1, 3], stat: 'weight 4: union succeeds  ->  total 7', note: 'Three edges for four nodes. A spanning tree on V nodes always has exactly V-1 edges.' },
      { stat: 'V - 1 successful unions  ->  done', note: 'Stop early once the count is reached. Two lines on top of the template, and the greedy is provable by the exchange argument.' },
    ],
  },

  // ================================================================== trie ==

  'trie': {
    title: 'Inserting "car" and "carpet", then searching both',
    cells: ['c', 'a', 'r', 'p', 'e', 't'],
    label: 'characters:',
    frames: [
      { mark: [0], stat: 'root -> c', note: 'One node per character. setdefault creates the child if it is missing.' },
      { mark: [0, 1, 2], stat: 'c -> a -> r,  mark END at r', note: '"car" inserted. The END flag is what records that a word finishes here.' },
      { mark: [3, 4, 5], stat: 'carpet reuses c-a-r, then adds p-e-t', note: 'The shared prefix is stored ONCE. That is the whole point of the structure.' },
      { mark: [2], stat: 'search("car"): walk to r, END present  ->  True', note: 'Cost is the length of the word, not the size of the dictionary.' },
      { mark: [3], stat: 'search("carp"): walk to p, END absent  ->  False', note: 'The node exists but is not a word end. Without the flag this would wrongly return True.' },
      { mark: [3], stat: 'startsWith("carp")  ->  True', note: 'Same walk, different question: arriving anywhere is enough. A hash set cannot answer this at all.' },
      { stat: 'O(len) per operation', note: 'Ten words or ten million, the lookup cost is unchanged. Space is O(total characters), with prefixes shared.' },
    ],
  },

  'trie/0': {
    title: 'Autocomplete: store the top 3 AT each node',
    contrast: 'The template walks to a node then searches the subtree below it. For a search box that per-keystroke cost is far too high.',
    cells: ['m', 'o', 'u', 's', 'e'],
    label: 'typing "mouse":',
    frames: [
      { stat: 'products: mouse, mousepad, monitor, mug', note: 'Every keystroke must return up to three suggestions, and there may be a million products.' },
      { mark: [0], stat: 'plain trie: walk to "m", then DFS the subtree', note: 'The subtree under "m" could hold most of the catalogue. That is a full traversal per character typed.' },
      { mark: [0], stat: 'precomputed: node "m" holds [monitor, mouse, mousepad]', note: 'Insert words in sorted order and let each node keep the first three that pass through it.' },
      { mark: [0, 1], stat: 'node "mo": [monitor, mouse, mousepad]', note: 'Each keystroke is one pointer move and one read. No searching at all.' },
      { mark: [0, 1, 2], stat: 'node "mou": [mouse, mousepad]', note: 'The list narrows naturally as the prefix does.' },
      { mark: [0, 1, 2, 3, 4], stat: 'node "mouse": [mouse, mousepad]', note: 'O(1) per keystroke, which is the only budget a search box actually has. Built once, in O(total characters).' },
    ],
  },

  'trie/1': {
    title: 'A "." wildcard turns lookup into search',
    contrast: 'The template follows exactly one child per character. A wildcard means following all of them.',
    cells: ['b', 'a', 'd'],
    label: 'pattern "b.d":',
    frames: [
      { stat: 'dictionary: bad, dad, mad', note: 'Ordinary search walks one path. That is what makes a trie a lookup rather than a search.' },
      { mark: [0], stat: 'b: one child to follow', note: 'A concrete character narrows to exactly one node.' },
      { mark: [1], stat: '. : follow EVERY child of this node', note: 'The wildcard branches. One path becomes several, and the trie is now a search space.' },
      { mark: [1, 2], stat: 'try a-child, then any others', note: 'Each branch continues independently. Recursion handles it naturally.' },
      { mark: [2], stat: 'b-a-d has END  ->  True', note: 'The first branch succeeds, so the search short-circuits.' },
      { stat: 'worst case approaches a full scan', note: 'A pattern of all dots visits everything. Say that out loud — the degradation is part of the answer.' },
    ],
  },

  'trie/2': {
    title: 'Word search in a grid: the prune is the performance story',
    contrast: 'The template answers one word at a time. Here the trie rides along with the grid walk and kills dead branches instantly.',
    cells: ['o', 'a', 't', 'h'],
    label: 'grid path so far:',
    frames: [
      { stat: 'words: oath, pea, eat, rain', note: 'Searching the grid once per word would be hopeless — one traversal per dictionary entry.' },
      { mark: [0], stat: 'grid "o": in the trie  ->  keep going', note: 'One traversal instead, carrying the trie node alongside the grid position.' },
      { mark: [0, 1], stat: 'grid "oa": in the trie', note: 'Still a live prefix of "oath", so the branch is worth exploring.' },
      { mark: [0, 1], stat: 'grid "ob": NOT in the trie  ->  STOP', note: 'This is the prune. No word begins "ob", so the entire subtree of grid paths below it is abandoned at once.' },
      { mark: [0, 1, 2, 3], stat: 'grid "oath": END  ->  found', note: 'Reaching an END node records a word. The walk continues in case longer words share the prefix.' },
      { stat: 'this is why it is a trie problem', note: 'Backtracking supplies the grid walk; the trie supplies the early exit. Neither is sufficient alone.' },
    ],
  },

  'trie/3': {
    title: 'Only exact membership needed: use a set',
    contrast: 'The template pays for prefix structure. If nothing ever asks for a prefix, that is all cost and no benefit.',
    cells: ['cat', 'car', 'dog'],
    label: 'words:',
    frames: [
      { stat: 'the only question is "is X in the list?"', note: 'No prefixes, no autocomplete, no wildcards.' },
      { mark: [0, 1], stat: 'trie: ~6 nodes, dict lookups per character', note: 'Building the structure costs code and memory to enable a capability nobody uses.' },
      { range: [0, 2], stat: 'set: one line, O(1) average lookup', note: 'Faster than walking a character at a time, and there is nothing to get wrong.' },
      { stat: 'words = set(word_list)', note: 'The whole solution.' },
      { stat: 'saying so is the answer', note: 'Choosing the simpler structure and explaining why demonstrates judgement. Reaching for the trie because the topic is strings demonstrates the opposite.' },
    ],
  },
});
