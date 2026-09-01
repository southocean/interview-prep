/* Worked examples, keyed by pattern or technique id.
 *
 * One concrete problem per page, reasoned through the way a round runs: what
 * the tell was, what the brute force costs, where it is redundant, what the
 * invariant is, and what the answer comes to. The step-through animation, where
 * one exists, is rendered directly after this and shows the same example.
 *
 * The example is chosen to be the SIMPLEST problem that still needs the whole
 * pattern -- a worked example you can solve without the pattern teaches nothing.
 */
window.WORKED = {

  'hash-count': {
    problem: 'Given [2, 7, 11, 15] and target 9, return the indices of the two numbers that add to it.',
    tell: 'A search inside a loop — "is the number I need somewhere in this array?" That question is a hash map every time.',
    walk: [
      ['Brute force', 'Two nested loops over every pair. O(n^2), and correct, so say it out loud before improving it.'],
      ['Find the redundancy', 'The inner loop re-scans the array to answer one question: does target − x exist? That is a lookup pretending to be a search.'],
      ['Flip it', 'Store each value with its index as you pass it. Then the question costs O(1).'],
      ['One pass, not two', 'You do not need to build the map first. Check before you insert, and a pair is found the moment its second half arrives.'],
      ['Answer', 'At i=1, x=7, target−x=2 is already in the map at index 0. Return [0, 1]. O(n) time, O(n) space.'],
    ],
  },

  'two-pointers': {
    problem: 'Sorted array [2, 3, 5, 8, 11, 15]. Find two values summing to 16.',
    tell: 'Sorted input plus "find a pair". Sortedness is a gift and scanning it linearly wastes it.',
    walk: [
      ['Brute force', 'All pairs, O(n^2). It ignores the sortedness completely, which is the clue that something better exists.'],
      ['Start at both ends', '2 + 15 = 17, too big. Now the key question: which pointer moves?'],
      ['The argument', '15 is the largest value left. If it cannot pair with the smallest, it cannot pair with anything — so 15 is eliminated entirely. Move hi in.'],
      ['Monotonic', 'Neither pointer ever goes backwards. That is the proof it is O(n), and it is the sentence to say out loud.'],
      ['Answer', '17 → 13 → 14 → 16. Four comparisons instead of fifteen.'],
    ],
  },

  'window': {
    problem: 'Longest substring of "abcabcbb" with no repeated character.',
    tell: 'The word CONTIGUOUS, plus "longest". A subsequence would be a different problem entirely.',
    walk: [
      ['Brute force', 'Every start, every end, check each substring for duplicates. O(n^3), or O(n^2) with a set.'],
      ['Find the redundancy', 'Sliding from one substring to the next changes only one character at each end, yet the check re-examines all of them.'],
      ['Maintain instead', 'Keep a count map for the current window. Adding a character is one update; removing one is another.'],
      ['The invariant', 'At the top of every iteration the window contains no repeats. Expand right always; while the invariant is broken, shrink from the left.'],
      ['Where to record', 'For LONGEST you record after restoring validity. For SHORTEST you record inside the shrink. Getting this backwards is the classic failure.'],
      ['Answer', '3, for "abc". Each index enters and leaves exactly once, so O(n).'],
    ],
  },

  'binary-index': {
    problem: 'In sorted [1, 3, 5, 7, 9, 11, 13], find the first index whose value is at least 11.',
    tell: 'Sorted, and the question is about a boundary rather than an exact value.',
    walk: [
      ['Reframe as a predicate', 'Define pred(x) = x >= 11. The array is False, False, … True, True — sorted by the predicate too. You are looking for the flip.'],
      ['Halve', 'Test the middle. False means the answer is strictly right of it: lo = mid + 1. True means mid MIGHT be the answer: hi = mid, not mid − 1.'],
      ['Why hi is exclusive', 'It makes the empty range lo == hi, and makes "not found" return len(xs) rather than a special case.'],
      ['Terminates', 'The range strictly shrinks each iteration because mid < hi always, so lo = mid + 1 makes progress.'],
      ['Answer', 'Index 5, in three comparisons instead of six. O(log n).'],
    ],
  },

  'binary-answer': {
    problem: 'Piles [3, 6, 7, 11] and 8 hours. Find the minimum eating speed (bananas per hour) that clears them in time.',
    tell: 'The answer is a NUMBER, constructing it directly is hard, but checking a guess is easy. That asymmetry is the whole signal.',
    walk: [
      ['Write the checker first', 'hours(speed) = sum of ceil(pile / speed). At speed 4: 1+2+2+3 = 8 hours. Feasible.'],
      ['Prove monotonicity', 'Faster is never worse — if speed s finishes in time, so does s+1. So feasibility is False, False, … True, True over the speed range. Say this out loud; the method is invalid without it.'],
      ['Bound the range', 'Slowest useful is 1. Fastest ever needed is max(piles), since more than that wastes the hour. Defend your bounds.'],
      ['Binary search the answer', 'Not the array — the answer space. Same template as any boundary search.'],
      ['Answer', '4. O(n log(max pile)), where each check is one pass over the piles.'],
    ],
  },

  'tree-dfs': {
    problem: 'Find the diameter of a binary tree: the longest path between any two nodes, in edges.',
    tell: 'A tree, and the answer depends on information from BELOW each node.',
    walk: [
      ['What does each subtree owe its parent?', 'Its height. That is the contract, and naming it is the hard part of every tree problem.'],
      ['What is the answer at this node?', 'The longest path THROUGH it is leftHeight + rightHeight. That is a different quantity from what it returns.'],
      ['Return one, record another', 'The recursion returns 1 + max(left, right) upward, while a variable outside records the best left + right seen. Recognising when these two differ is the core tree skill.'],
      ['Base case', 'A null child has height 0, which makes a leaf height 1 and a leaf-to-leaf path 2 edges.'],
      ['Answer', 'One postorder pass, O(n) time and O(h) stack. No node is visited twice.'],
    ],
  },

  'tree-bfs': {
    problem: 'A grid of oranges, some rotten. Each minute rot spreads to adjacent fresh ones. How many minutes until none are fresh?',
    tell: '"How many steps until", with every step costing the same. Unweighted distance means BFS.',
    walk: [
      ['Why not DFS', 'DFS finds whether you can reach something, not how few steps it took. BFS explores in distance order, so the first arrival is the shortest.'],
      ['Many sources at once', 'Every rotten orange starts spreading at minute zero, so all of them go into the queue BEFORE the first step. Do not run BFS once per source.'],
      ['Levels are minutes', 'Snapshot len(queue) before the inner loop; consuming exactly that many nodes is one minute of spreading.'],
      ['Mark on enqueue', 'Not on dequeue. Otherwise the same cell enters the queue from several neighbours and the whole thing degrades.'],
      ['Answer', 'The level count when the queue empties — and if any fresh orange remains, return −1. O(R·C).'],
    ],
  },

  'graph-dfs': {
    problem: 'Count the islands in a grid of land and water cells.',
    tell: '"How many separate groups". Reachability, not distance — which makes DFS simpler than BFS here.',
    walk: [
      ['See the graph', 'The node is (row, col); the edges are the four neighbours. Once you say that, it stops being a grid problem.'],
      ['Outer loop, inner flood', 'Walk every cell. Each time you meet unvisited land, that is one new island — then flood the whole thing so it is never counted again.'],
      ['Sink as you go', 'Overwriting visited land with water saves the visited set entirely. Say out loud that you are mutating the input.'],
      ['Watch the stack', 'A 1000×1000 grid of solid land recurses a million deep. Iterative DFS with an explicit stack, or say why recursion is safe here.'],
      ['Answer', 'The number of times the outer loop started a flood. O(R·C) — each cell is visited once.'],
    ],
  },

  'topo': {
    problem: 'Courses 0..3 with prerequisites [[1,0], [2,1], [3,2]]. Can all be completed, and in what order?',
    tell: '"Prerequisites", "build order", "must come before". A directed graph where order is the answer.',
    walk: [
      ['Count what blocks each node', "in-degree[v] is how many prerequisites v still has. Anything at zero is available now."],
      ['Process the available', 'Take a zero-in-degree node, emit it, and decrement its dependents. Any that hit zero become available.'],
      ['The cycle detector is free', 'If a cycle exists, its members never reach zero, so they are never emitted. Compare the emitted count to V — that IS the check. Do not add a second mechanism.'],
      ['Front-end framing', 'This is module resolution. A circular import is a cycle, and a build order is a topological sort.'],
      ['Answer', '[0, 1, 2, 3], count 4 == V, so no cycle. O(V+E).'],
    ],
  },

  'sweep': {
    problem: 'Meetings [[0,30], [5,10], [15,20]]. What is the minimum number of rooms needed?',
    tell: 'Intervals, and "minimum number of X needed". You are being asked for a maximum overlap.',
    walk: [
      ['Reframe', 'The rooms needed at any instant is the number of meetings happening at that instant. So the answer is the maximum concurrency over time.'],
      ['Turn objects into events', 'Each meeting becomes (start, +1) and (end, −1). Two-dimensional overlap reasoning collapses into a one-dimensional counter.'],
      ['Replay time in order', 'Sort the events, sweep, track the running total and its maximum.'],
      ['The boundary condition', 'At equal timestamps, does an end release before a start claims? A tuple sort puts (t, −1) before (t, +1), which is the half-open reading. Ask before coding — it changes the answer.'],
      ['Answer', 'Counter goes 1, 2, 1, 0, 1, 0 → maximum 2. O(n log n), sort-dominated.'],
    ],
  },

  'heap-topk': {
    problem: 'Return the 2 largest values from [3, 1, 5, 12, 2, 11].',
    tell: '"k largest", or any repeated ask for the extreme. You need one end of the order, not the whole order.',
    walk: [
      ['Why not sort', 'Sorting is O(n log n) and produces far more order than you asked for. If k is small, that is waste you can name.'],
      ['The counter-intuitive part', 'For k LARGEST use a MIN-heap. The weakest of your current best sits on top, so each new candidate is one comparison against it.'],
      ['Cap the size', 'Push, then pop if the heap exceeds k. It never holds more than k items, so each operation is log k.'],
      ['Answer', 'Heap ends holding [11, 12]; the kth largest is at the top, 11. O(n log k).'],
      ['When it stops paying', 'As k approaches n, log k approaches log n and you may as well sort. Saying that shows you know why the heap was there.'],
    ],
  },

  'memo': {
    problem: 'Coins [1, 3, 4] and amount 6. What is the fewest coins that make it?',
    tell: '"Minimum / count the ways" with per-item choices, and the same subproblem reachable by different routes.',
    walk: [
      ['Kill the greedy first', 'Greedy takes 4, then 1, then 1 — three coins. The optimum is 3 + 3, two coins. Producing that counterexample is worth more than the DP.'],
      ['State it in words', 'best(amount) = the fewest coins that make exactly this amount. If you cannot write that sentence, you do not have a solution yet.'],
      ['Recurrence', 'best(a) = 1 + min over coins c of best(a − c). Base case best(0) = 0; anything negative is unreachable.'],
      ['Add the cache', 'best(2) is reached via both 4 and 3. Without memoisation the tree is exponential; with it there are only amount+1 distinct states.'],
      ['Answer', '2. O(amount × coins). Tabulation is a space optimisation you mention afterwards, not where you start.'],
    ],
  },

  'backtracking': {
    problem: 'Generate every subset of [1, 2, 3].',
    tell: 'The output is every arrangement, not a count. Counting would be DP; enumerating is backtracking.',
    walk: [
      ['The shape', 'choose, recurse, un-choose. The un-choose is the only thing separating it from ordinary recursion.'],
      ['Avoid duplicates by construction', 'Pass a start index and never look backwards, so [1,2] is generated and [2,1] is not. That is cheaper than de-duplicating afterwards.'],
      ['Record a copy', 'Appending the running path by reference means every result aliases the same list, which by the end is empty. path[:] every time.'],
      ['Count the work', '2^n subsets, and that is expected here — the output itself is exponential, so no algorithm can be better.'],
      ['Answer', '8 subsets. The alternative is bitmask enumeration, which has no un-choose step to forget.'],
    ],
  },

  'deque-mono': {
    problem: 'Temperatures [73, 74, 75, 71, 69, 72, 76]. For each day, how many days until a warmer one?',
    tell: '"Next greater" — you are looking forward for the first thing that beats the current element.',
    walk: [
      ['Brute force', 'For each day scan forward. O(n^2), and it re-scans the same cold stretch again and again.'],
      ['What is worth keeping', 'Days still waiting for a warmer day. Once a day is resolved it never matters again.'],
      ['The invariant', 'Those waiting days are in decreasing temperature. If a day were warmer than the one before it, the earlier one would already have been resolved.'],
      ['The pop is the computation', 'When a warmer day arrives, pop every waiting day it beats and write their answers. Store INDICES so the answer is an index difference.'],
      ['Why it is O(n)', 'Each index is pushed once and popped once. Total work is bounded by 2n no matter how the pops cluster — the nested loop is a lie.'],
    ],
  },

  'union-find': {
    problem: 'Cities 0..3 with roads [[0,1], [1,2]]. How many separate groups are there?',
    tell: 'Undirected connectivity, and especially edges arriving one at a time.',
    walk: [
      ['Why not DFS', 'DFS works on a static graph. If edges arrive incrementally you would re-run it from scratch after every one.'],
      ['Represent a group by its root', 'Every node points at a parent; follow the chain to find the root. Two nodes are connected exactly when their roots match.'],
      ['Union roots, not nodes', 'Pointing one node at another is the classic bug. Find both roots first, then attach one root under the other.'],
      ['Keep the trees flat', 'Path compression on the way up, union by size on the way down. Together they make operations effectively constant.'],
      ['Answer', 'Two groups: {0,1,2} and {3}. And union() returning False is your cycle detector for free.'],
    ],
  },

  'prefix': {
    problem: 'Array [3, 4, 7, 2, -3, 1, 4, 2]. Answer many queries of the form "sum from index l to r".',
    tell: 'Repeated range sums over data that does not change between queries.',
    walk: [
      ['Brute force', 'Each query walks its range. One query is fine; a thousand queries over a large array is not.'],
      ['Precompute once', 'pre[i] is the sum of everything BEFORE index i, with pre[0] = 0 for the empty prefix.'],
      ['Subtract', 'sum(l..r) = pre[r+1] − pre[l]. Everything left of l cancels out.'],
      ['Write down the convention', 'Inclusive or exclusive ends — pick one, write it in a comment, and the off-by-one stops happening.'],
      ['The mirror image', 'Many UPDATES and one read is the difference array: diff[l] += v, diff[r+1] −= v, then one sweep. Same idea with the roles swapped.'],
    ],
  },

  'trie': {
    problem: 'Given a product list, return up to three suggestions for every prefix of a search term as it is typed.',
    tell: '"Prefix", "autocomplete", "starts with". A hash set answers exact membership only.',
    walk: [
      ['Why not a set', 'A set can tell you "mouse" exists. It cannot tell you what starts with "mou" without scanning everything.'],
      ['Share the prefixes', 'A nested dict per character. Lookup costs the length of the word, not the size of the dictionary — a million products cost the same as ten.'],
      ['The end marker', 'Without an is-word flag, "car" appears to be present after inserting only "carpet". This is the bug in almost every first attempt.'],
      ['Make the keystroke free', 'Store the best three AT each node while building. Then each keystroke is one pointer move rather than a subtree walk.'],
      ['Answer', 'O(total characters) to build, O(1) per keystroke — which is the only budget an autocomplete actually has.'],
    ],
  },

  'fast-slow': {
    problem: 'Detect whether a linked list has a cycle, using constant extra space.',
    tell: 'A linked list plus "O(1) space". A visited set solves it trivially and misses the exercise.',
    walk: [
      ['The obvious answer', 'A set of seen nodes. O(n) space, and correct — say it, then note the constraint rules it out.'],
      ['Two speeds', 'slow moves one, fast moves two. Each step the gap between them changes by one.'],
      ['Why they must meet', 'Once both are inside the cycle, the gap shrinks by one per step, so it reaches zero. It cannot be stepped over.'],
      ['Why no cycle means no meeting', 'fast reaches the end first. That is why the loop condition checks fast AND fast.next before advancing.'],
      ['The follow-up', 'For the cycle START, reset one pointer to the head and advance both by one; they meet at the entrance.'],
    ],
  },

  'greedy': {
    problem: 'Intervals [[1,2], [2,3], [3,4], [1,3]]. Remove the fewest so that none overlap.',
    tell: 'A local choice feels obviously right. That feeling is the cue to try to break it, not to start coding.',
    walk: [
      ['Reverse the question', '"Fewest removals" is "most keepable". Maximising what you keep is a clean greedy; minimising removals is not.'],
      ['Choose the sort key', 'By END time. Sorting by start is the intuitive choice and it is wrong — one long early interval blocks two short ones.'],
      ['State the exchange argument', 'If an optimal solution does not take the earliest-ending compatible interval, swapping it in leaves the solution no smaller. So the greedy choice is always safe.'],
      ['Sweep', 'Keep an interval if it starts at or after the last kept end.'],
      ['Answer', 'Keep 3, remove 1. The whole solution is a sort key plus one comparison — the work was in justifying it.'],
    ],
  },

  'kway': {
    problem: 'Merge k sorted lists into one sorted list.',
    tell: 'Several sorted inputs. The global minimum must be at the head of one of them.',
    walk: [
      ['Only k candidates matter', 'You never need to consider more than one element per list, because each list is already sorted.'],
      ['Heap of heads', 'Push the first element of every list. Pop the smallest, then push its successor from the same list.'],
      ['Tag the entries', 'Push (value, listIndex, itemIndex). Bare nodes are not comparable and Python raises when the values tie.'],
      ['Cost', 'N pops, each log k. O(N log k) rather than the O(N log N) of concatenating and sorting.'],
      ['When not to', 'k = 2 does not need a heap. Two pointers, O(n) — reaching for the heap there reads as pattern-matching without thinking.'],
    ],
  },

  'dijkstra': {
    problem: 'Weighted graph, one source. Find the cheapest cost to reach every node.',
    tell: 'Shortest path with WEIGHTS. BFS is wrong the moment edges cost different amounts.',
    walk: [
      ['Why BFS fails', 'BFS orders by number of edges. A three-edge path can be cheaper than a one-edge path, so arrival order stops meaning cheapest.'],
      ['Order the frontier by cost', 'A heap instead of a queue. Popping the cheapest unsettled node is what makes it correct.'],
      ['Settled means finished', 'When a node pops, its distance is final — because every other route to it goes through something already at least as expensive. Non-negative weights are what guarantee this.'],
      ['Skip stale entries', 'You cannot delete from the middle of a heap, so old entries linger. Discard any pop whose distance is worse than the recorded one.'],
      ['Stop early', 'If you only need one target, return the moment it pops. Nothing later can beat it.'],
    ],
  },

  'quickselect': {
    problem: 'Find the 3rd smallest element without sorting the array.',
    tell: '"kth largest / smallest" and an explicit ask to beat O(n log k).',
    walk: [
      ['Borrow from quicksort', 'Partition around a pivot: smaller left, larger right. The pivot lands at its final sorted index.'],
      ['Recurse one side only', 'If the pivot index equals k you are done. Otherwise the answer is in exactly one half — discard the other entirely.'],
      ['Why it is linear', 'Work halves each time: n + n/2 + n/4 + … = 2n. Quicksort recurses into BOTH halves, which is where its log n comes from.'],
      ['Random pivot', 'A fixed pivot is O(n^2) on already-sorted input. Randomising makes the bad case vanishingly unlikely.'],
      ['Honesty', 'Expected O(n), worst case O(n^2). A heap has no bad case, so say why you chose this one.'],
    ],
  },
};
