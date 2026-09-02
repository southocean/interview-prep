/* Patterns. One page each.
 *
 * `structures` and `also` are the outbound links. Problems are NOT listed here:
 * each problem declares its own pattern, and the reverse index is built at load
 * time in app.js. One direction of truth, so the two can never disagree.
 *
 * `rank` drives sidebar order — most likely to appear, first.
 */
window.PATTERNS = {
  note: 'Interview problems are re-skins. You are not learning 300 problems, you are learning a couple of dozen patterns and recognising which one is wearing a costume. The deviations on each page matter more than the template: the template gets you the textbook version, the deviations are what interviewers actually ask.',

  items: [
    {
      id: 'hash-count', rank: 1, name: 'Hash map counting', tier: 1,
      signal: '"Frequency", "anagram", "appears more than", "have we seen this", "does X exist".',
      idea: 'Trade memory for time. Any inner loop asking "does this exist" or "where is this" is a hash map waiting to happen, and the trade is almost always worth taking.',
      cost: 'O(n) time, O(k) space.',
      structures: ['hash'],
      also: ['prefix', 'window'],
      template: `from collections import Counter, defaultdict

# seen-set: one pass, detect duplicates
seen = set()
for x in xs:
    if x in seen:
        return True
    seen.add(x)

# value -> index, the two-sum shape
pos = {}
for i, x in enumerate(xs):
    if target - x in pos:
        return [pos[target - x], i]
    pos[x] = i

# group by a DERIVED key
groups = defaultdict(list)
for w in words:
    letters = sorted(w)             # a LIST of characters, in order
    key = ''.join(letters)          # every anagram produces the same key
    groups[key].append(w)`,
      deviations: [
        ['The key is not the value', 'The problem groups things that are not equal but are equivalent.', 'Derive a canonical key: sorted letters for anagrams, a 26-length count tuple, a normalised form. Choosing the key IS the solution — say what your key is out loud.'],
        ['Counting subarrays, not elements', 'It asks how many subarrays sum to k, rather than whether one exists.', 'Map running prefix sum → how many times seen, and seed it with {0: 1} for the empty prefix. That seed is the single most common bug in this family.'],
        ['Need order as well as membership', 'It asks for the most frequent, or the first unique, or a range.', 'A hash map has no order. Count first, then sort, or bucket by frequency, or use a heap. Do not try to make the map do it.'],
        ['Bounded small keys', 'Keys are lowercase letters, or digits, or a small fixed set.', 'A fixed-size array beats a dict — faster and comparable by value, so two count arrays can be compared directly.'],
      ],
      bugs: ['Forgetting the {0: 1} seed on prefix-sum counting.', 'Assuming O(1) hashing when keys are long strings — hashing costs their length.'],
    },

    {
      id: 'two-pointers', rank: 2, name: 'Two pointers', tier: 1,
      signal: 'Sorted input, "pair or triplet that sums to", comparing from both ends, or removing in place.',
      idea: 'A nested loop is legal to collapse when the inner pointer never has to go backwards. That monotonicity is the whole justification, and stating it is what makes the answer complete.',
      cost: 'O(n), plus O(n log n) if you had to sort first.',
      structures: ['array'],
      also: ['window', 'fast-slow', 'binary-index'],
      template: `# converging from both ends
lo, hi = 0, len(xs) - 1
while lo < hi:
    s = xs[lo] + xs[hi]
    if s == target:
        return [lo, hi]
    if s < target:
        lo += 1          # only the small side can help
    else:
        hi -= 1

# read/write pointers: compact in place
w = 0
for r in range(len(xs)):
    if keep(xs[r]):
        xs[w] = xs[r]
        w += 1
return w                 # w is the new length`,
      deviations: [
        ['Triplets instead of pairs', 'Three numbers summing to a target.', 'Sort, fix the outer element with a loop, two-pointer the remainder. O(n^2). Skip duplicate values at BOTH the fixed index and after each match, or you emit repeats.'],
        ['Both ends but the metric is not a sum', 'Container with most water, or the largest area.', 'Move the pointer that limits the metric — the shorter side. Argue why moving the other one cannot improve anything; that argument is the answer.'],
        ['Input is not sorted and cannot be', 'Order carries meaning, so you may not sort.', 'Two pointers is probably wrong. Reach for a hash map or a sliding window instead.'],
        ['Two separate arrays', 'Merge, intersect, or compare two sorted sequences.', 'One pointer per array, advance whichever is behind. The same skeleton, and it is the merge step of k-way merge.'],
      ],
      bugs: ['Duplicate triplets from not skipping equal values.', 'Using `while lo <= hi` when the two must not be the same element.'],
    },

    {
      id: 'window', rank: 3, name: 'Sliding window', tier: 1,
      signal: '"Longest / shortest / maximum" over a CONTIGUOUS subarray or substring. The word contiguous is the tell.',
      idea: 'Maintain the answer for the current window instead of recomputing it. Every index enters once and leaves once, so the whole scan is linear no matter how much the window moves.',
      cost: 'O(n).',
      structures: ['array', 'hash'],
      also: ['two-pointers', 'deque-mono', 'prefix'],
      template: `# VARIABLE window: longest valid
from collections import defaultdict
count = defaultdict(int)
left = 0
best = 0
for right, ch in enumerate(s):
    count[ch] += 1
    while count[ch] > 1:              # while INVALID, shrink
        count[s[left]] -= 1
        left += 1
    best = max(best, right - left + 1)  # record while valid

# FIXED window of size k: no shrink loop
total = sum(xs[:k])
best = total
for i in range(k, len(xs)):
    total += xs[i] - xs[i - k]
    best = max(best, total)`,
      deviations: [
        ['Shortest instead of longest', 'Minimum window containing something, rather than maximum.', 'The recording point MOVES. For longest you record while the window is valid; for shortest you record INSIDE the shrink loop, at each moment it is still valid. Getting this backwards is the classic failure.'],
        ['"At most K distinct"', 'A cap on how many different things the window may hold.', 'Count map plus shrink while len(count) > K. Remember to delete keys that hit zero, or len() lies to you.'],
        ['"Exactly K"', 'Exactly K distinct, or exactly K odd numbers.', 'exactly(K) = atMost(K) − atMost(K−1). Two runs of the easier function. This trick is worth memorising outright.'],
        ['Window maximum, not window sum', 'The max or min of every window of size k.', 'A sum updates incrementally; a maximum does not, because removing the max leaves you with no idea what the new one is. Switch to a monotonic deque.'],
        ['Non-contiguous', 'A subsequence rather than a subarray.', 'Not a window problem at all. Almost certainly DP.'],
      ],
      bugs: ['`if` instead of `while` on the shrink.', 'Recording the answer on the wrong side of the shrink.', 'Not deleting zero-count keys, so the distinct count is wrong.'],
    },

    {
      id: 'binary-index', rank: 4, name: 'Binary search on an index', tier: 1,
      signal: 'Sorted array, rotated sorted array, or "find the first / last position where...".',
      idea: 'Each comparison discards half the remaining space. The skill is not the idea, it is having ONE template you never improvise around.',
      cost: 'O(log n).',
      structures: ['array'],
      also: ['binary-answer', 'two-pointers'],
      template: `# ONE template: first index where pred is True.
# Memorise this shape and bend problems to fit it.
lo, hi = 0, len(xs)          # hi is EXCLUSIVE
while lo < hi:
    mid = (lo + hi) // 2
    if pred(xs[mid]):
        hi = mid             # mid might be the answer, keep it
    else:
        lo = mid + 1         # mid is definitely not
return lo                    # == len(xs) if nothing satisfies pred`,
      deviations: [
        ['Rotated array', 'Sorted, then rotated at an unknown pivot.', 'At every step one half is definitely sorted. Work out which by comparing xs[mid] to xs[lo], then decide whether the target lies inside that sorted half.'],
        ['First and last occurrence', 'Count the occurrences of a duplicated value.', 'Two searches with different predicates: `>= target` gives the first, `> target` gives one past the last. Do not write a bespoke loop.'],
        ['No array at all', 'An API you can query, or an infinite stream.', 'Find bounds first by doubling an index until the predicate flips, then binary search inside them.'],
        ['Peak or unsorted local target', 'Find any local maximum.', 'Compare mid with mid+1 and walk uphill. Sortedness is not required — only a guarantee that a step direction always improves.'],
      ],
      bugs: ['Mixing inclusive and exclusive hi between problems. Pick exclusive and stay there.', '`lo = mid` instead of `mid + 1`, which loops forever.'],
    },

    {
      id: 'binary-answer', rank: 5, name: 'Binary search on the answer', tier: 1,
      signal: '"Minimum capacity / speed / size such that it is possible." The answer is a NUMBER and checking a candidate is easy.',
      idea: 'When constructing the answer is hard but verifying a guess is easy, search the answer space instead of the input. This is the pattern that most reliably separates a mid-level answer from a senior one.',
      cost: 'O(n log(range)).',
      structures: ['array'],
      also: ['binary-index', 'greedy'],
      template: `def can(x):
    """Feasible with capacity/speed x? Must be MONOTONIC in x:
    if x works, every larger x works. Say this out loud."""
    ...

lo, hi = 1, max_possible          # a bound you can defend
while lo < hi:
    mid = (lo + hi) // 2
    if can(mid):
        hi = mid
    else:
        lo = mid + 1
return lo`,
      deviations: [
        ['Maximise instead of minimise', '"Largest minimum distance", "maximum you can achieve".', 'The predicate flips direction: search for the last x that works rather than the first. Safer to keep the template and search for the first x that FAILS, then subtract one.'],
        ['Real-valued answer', 'A precision requirement rather than an integer.', 'Loop a fixed 100 iterations, or while hi − lo > 1e−9. Do not test equality on floats.'],
        ['can() is not monotonic', 'Feasibility does not improve with a bigger budget.', 'The method is simply invalid. Notice this before coding — it is the trap in this pattern, and interviewers plant it.'],
        ['The bound is not obvious', 'No natural maximum.', 'Use the total sum, or the largest single element, or double until can() succeeds. State why your bound is safe.'],
      ],
      bugs: ['Not stating monotonicity — the whole method rests on it.', 'An off-by-one lower bound: speed 0 is often nonsense.'],
    },

    {
      id: 'tree-dfs', rank: 6, name: 'Tree DFS', tier: 1,
      signal: 'Anything on a tree that needs information from BELOW: depth, sums, validity, the longest path.',
      idea: 'Recursion IS the data structure. A tree problem is nearly always "what does each subtree report upward, and what constraint comes downward".',
      cost: 'O(n) time, O(h) stack.',
      structures: ['tree'],
      also: ['tree-bfs', 'memo', 'backtracking'],
      template: `# ---- SHAPE 1: bare postorder. Children report upward. ----
def height(node):
    if not node:
        return 0
    return 1 + max(height(node.left), height(node.right))

# ---- SHAPE 2: the same recursion, plus a RECORDED side-value. ----
#      This is the diameter problem. The return value is STILL height --
#      best is the answer, and the two are different numbers.
best = 0

def height(node):
    global best
    if not node:
        return 0

    left_height = height(node.left)
    right_height = height(node.right)

    # The longest path THROUGH this node joins its two subtrees.
    path_through_here = left_height + right_height
    best = max(best, path_through_here)

    # But what the PARENT needs is height, which is a different number.
    return 1 + max(left_height, right_height)

# ---- SHAPE 3: top-down. A constraint travels DOWN as parameters. ----
#      A different problem (BST validation), the same pattern.
def valid(node, low, high):
    if not node:
        return True
    if not (low < node.val < high):
        return False
    return valid(node.left, low, node.val) and valid(node.right, node.val, high)`,
      deviations: [
        ['Constraint comes from above, not below', 'Validate a BST, or "path sum equals target".', 'Pass parameters DOWN instead of returning up. BST validation needs a (low, high) range; comparing to the parent alone is the classic wrong answer.'],
        ['Return one value, record another', 'Diameter, or maximum path sum.', 'The recursion returns height while a variable outside records the best path through each node. Recognising when these two differ is the core skill on tree problems.'],
        ['The tree is a graph', 'Nodes have parent pointers, or it may contain cycles.', 'Add a visited set. Without one, "tree" DFS loops forever the moment there is a cycle.'],
        ['Depth could be 10^5', 'A degenerate, list-shaped tree.', 'Python recurses ~1000 deep by default. Raise the limit or convert to an explicit stack, and say that you noticed.'],
      ],
      bugs: ['Comparing a BST node only against its parent.', 'Forgetting the null base case.', 'Mutating a shared path list without copying.'],
    },

    {
      id: 'tree-bfs', rank: 7, name: 'Tree / graph BFS', tier: 1,
      signal: '"Level by level", "fewest steps", "minimum moves", "shortest transformation". Unweighted only.',
      idea: 'BFS explores in order of distance, so the first time you reach something is by the shortest route. Levels are the distance metric, for free.',
      cost: 'O(V+E).',
      structures: ['queue', 'graph', 'tree'],
      also: ['graph-dfs', 'dijkstra'],
      template: `from collections import deque

q = deque([start])
seen = {start}                     # mark on ENQUEUE, not on dequeue
steps = 0
while q:
    for _ in range(len(q)):        # snapshot: this is exactly one level
        node = q.popleft()
        if node == goal:
            return steps
        for nxt in neighbours(node):
            if nxt not in seen:
                seen.add(nxt)
                q.append(nxt)
    steps += 1
return -1`,
      deviations: [
        ['Many starting points', 'Rotting oranges, or fire spreading from several cells.', 'Multi-source BFS: put every source in the queue BEFORE the first step. Levels then count time directly. No need to run BFS once per source.'],
        ['You need the path, not the length', '"Return the actual shortest sequence".', 'Keep a parent map alongside seen, then walk it backwards from the goal.'],
        ['Edges have weights', 'Costs differ per move.', 'BFS is wrong — fewer edges can cost more. Dijkstra with a heap. If weights are only 0 and 1, a deque with appendleft works (0-1 BFS).'],
        ['Neighbours are expensive to enumerate', 'Word ladder over a big dictionary.', 'Do not compare all pairs. Generate neighbours by wildcarding each position and looking up a precomputed bucket.'],
      ],
      bugs: ['Marking seen on dequeue — the same node enqueues many times and it degrades badly.', 'Forgetting the level snapshot, so levels merge.'],
    },

    {
      id: 'graph-dfs', rank: 8, name: 'Graph DFS and components', tier: 1,
      signal: '"Connected", "reachable", "how many groups", "flood fill", "islands".',
      idea: 'Reachability, not distance. If the question is "can I get there" or "how many separate clumps", DFS is simpler than BFS and the recursion writes itself.',
      cost: 'O(V+E).',
      structures: ['graph', 'grid', 'stack'],
      also: ['tree-dfs', 'union-find', 'topo'],
      template: `from collections import defaultdict

g = defaultdict(list)
for u, v in edges:
    g[u].append(v)
    g[v].append(u)              # drop this line if DIRECTED

seen = set()
def dfs(u):
    seen.add(u)
    for v in g[u]:
        if v not in seen:
            dfs(v)

groups = 0
for u in nodes:
    if u not in seen:
        groups += 1
        dfs(u)

# ITERATIVE, for big graphs -- Python recurses only ~1000 deep
stack = [start]
while stack:
    u = stack.pop()
    if u in seen:
        continue
    seen.add(u)
    for v in g[u]:
        if v not in seen:
            stack.append(v)`,
      deviations: [
        ['It is a grid', 'Islands, flood fill, word search.', 'The node is (row, col) and neighbours come from a delta loop. Sinking visited cells in place saves the seen set, but say that you are mutating the input.'],
        ['Search inward from the goal', 'Pacific-Atlantic water flow.', 'Do not test every cell outward. Start from the borders and search inward, then intersect the reachable sets. Reversing the direction is the whole insight.'],
        ['Cycle detection, directed', '"Is there a circular dependency / import cycle".', 'Three states: unvisited, in-progress, done. Meeting an in-progress node is a cycle. Or use Kahn and check the emitted count.'],
        ['Edges arrive one at a time', 'Connectivity queried as the graph is built.', 'Union-Find. DFS would need a full re-run per edge.'],
      ],
      bugs: ['Building an undirected adjacency list for a directed problem.', 'Recursion depth on 10^5 nodes.'],
    },

    {
      id: 'topo', rank: 9, name: 'Topological sort', tier: 1,
      signal: '"Dependencies", "prerequisites", "build order", "must come before". Directed graphs only.',
      idea: 'Process nodes only once everything they depend on is already done. The same idea as sorting flights by departure time — choose an order in which what you need is always already known.',
      cost: 'O(V+E).',
      structures: ['graph', 'queue'],
      also: ['graph-dfs', 'sweep'],
      template: `from collections import defaultdict, deque

g = defaultdict(list)
indeg = {}
for u in nodes:
    indeg[u] = 0
for u, v in edges:            # u must come before v
    g[u].append(v)
    indeg[v] += 1

q = deque()
for u in nodes:
    if indeg[u] == 0:         # nothing has to come before it
        q.append(u)
order = []
while q:
    u = q.popleft()
    order.append(u)
    for v in g[u]:
        indeg[v] -= 1
        if indeg[v] == 0:
            q.append(v)

# The COUNT is the cycle detector. Do not add a second mechanism.
if len(order) == len(nodes):
    return order
return []                     # some node never reached in-degree zero`,
      deviations: [
        ['Only "is it possible"', 'Course schedule I.', 'Same code, return the boolean len(order) == len(nodes). Nothing else changes.'],
        ['Constraints must be derived first', 'Alien dictionary — order the alphabet from sorted words.', 'The hard part is not the sort, it is extracting edges. Each adjacent word pair gives exactly ONE constraint: the first position where they differ. Also reject the invalid prefix case ("abc" before "ab").'],
        ['Levels matter, not just order', '"How many semesters", parallel courses.', 'Process the queue level by level, exactly as in BFS. Each level is one round of work that can happen in parallel.'],
        ['Lexicographically smallest order', 'Ties must break in a defined way.', 'Swap the deque for a heap. O(V log V + E).'],
      ],
      bugs: ['Reversing the edge direction.', 'Initialising in-degree only for nodes that appear as a target, losing isolated nodes.'],
    },

    {
      id: 'sweep', rank: 10, name: 'Sort then sweep', tier: 1,
      signal: 'Intervals, meetings, bookings, events with a start and an end. "Minimum number of X needed", "do any overlap".',
      idea: 'Turn objects into timestamped events, then replay time in order. This collapses two-dimensional reasoning about overlaps into a one-dimensional pass with a counter, and it is the most transferable trick in scheduling.',
      cost: 'O(n log n), sort-dominated.',
      structures: ['array', 'heap'],
      also: ['heap-topk', 'prefix', 'greedy'],
      template: `# EVENTS: maximum concurrency
events = []
for s, e in intervals:
    events.append((s, +1))
    events.append((e, -1))
events.sort()          # at equal times, -1 sorts before +1:
                       # a room frees before it is claimed (half-open)
cur = 0
best = 0
for _, delta in events:
    cur += delta
    best = max(best, cur)

# MERGE overlapping
intervals.sort()
out = []
for s, e in intervals:
    if out and s <= out[-1][1]:
        out[-1][1] = max(out[-1][1], e)
    else:
        out.append([s, e])`,
      deviations: [
        ['Endpoints touch', '[9,10] and [10,11] — conflict or not?', 'This is THE question to ask before coding. Half-open needs (t, −1) before (t, +1), which a tuple sort gives free. Closed intervals need starts first: sort by (t, −delta). One character.'],
        ['Minimum removals to stop overlap', '"Erase overlap intervals".', 'REVERSE the question: maximise how many you keep. Sort by END time and greedily keep. Sorting by start is the wrong greedy here.'],
        ['A connection or turnover time', 'Flights need 30 minutes to change planes; rooms need cleaning.', 'The condition becomes best[origin] + gap <= departure. Ask about it — it changes the answer and interviewers wait to see if you do.'],
        ['Times are bounded small integers', 'Everything within one day, minute granularity.', 'Skip the sort. A difference array over the time range gives O(n + T), which beats O(n log n) when n is large.'],
        ['You need who goes where, not how many', 'Assign each meeting to a specific room.', 'The counter is not enough. Use a heap of (endTime, roomId) so you know which room you are reusing.'],
      ],
      bugs: ['Guessing the endpoint convention instead of asking.', 'Forgetting to flush the final interval after the loop.'],
    },

    {
      id: 'heap-topk', rank: 11, name: 'Heap / top-k', tier: 2,
      signal: '"k largest / smallest / most frequent", repeated min or max, or a stream you cannot sort.',
      idea: 'You need the extreme repeatedly, not the whole order. A heap gives the extreme in O(log n) and never pays for sorting the rest.',
      cost: 'O(n log k) for top-k, which beats O(n log n) when k is small.',
      structures: ['heap'],
      also: ['sweep', 'kway', 'quickselect'],
      template: `import heapq

# k LARGEST -> MIN-heap of size k (the counter-intuitive bit)
h = []
for x in xs:
    heapq.heappush(h, x)
    if len(h) > k:
        heapq.heappop(h)      # evict the smallest of the best k
return h[0]                   # kth largest

# MAX-heap: push negatives, Python has no max-heap
heapq.heappush(h, -x)

# Scheduling: earliest free time on top
h = []
for start, end in sorted(meetings):
    if h and h[0] <= start:
        heapq.heappop(h)      # reuse the soonest-freeing slot
    heapq.heappush(h, end)
return len(h)`,
      deviations: [
        ['k is close to n', 'k largest where k is most of the array.', 'Just sort. The heap advantage vanishes, and saying so shows you understand why the heap was there.'],
        ['Both ends needed', 'Running median, or balancing two halves.', 'Two heaps facing each other — max-heap below, min-heap above, sizes kept within one.'],
        ['Frequencies, and O(n) is wanted', 'Top-k frequent elements.', 'Bucket by count: counts are bounded by n, so an array of buckets gives O(n) with no heap at all.'],
        ['Items are not comparable', 'Heap of linked-list nodes or custom objects.', 'Push tuples: (value, tiebreak, item). Python compares element-wise and will raise on the item itself otherwise.'],
      ],
      bugs: ['Max-heap for k largest, carrying all n.', 'Forgetting Python heaps are min-only.'],
    },

    {
      id: 'memo', rank: 12, name: 'DFS with memo (DP)', tier: 2,
      signal: 'Overlapping subproblems. "Count the ways", "minimum cost", "can we reach", "best value given choices".',
      idea: 'Write the recurrence first and cache it. Memoised recursion follows directly from the recurrence; tabulation is an optimisation you mention afterwards, not the place to start.',
      cost: 'O(number of distinct states).',
      structures: ['hash', 'array'],
      also: ['backtracking', 'tree-dfs', 'greedy'],
      template: `from functools import lru_cache

@lru_cache(None)
def best(i, remaining):
    """State must capture EVERYTHING the answer depends on.
    If two different situations share a key, the cache lies."""
    if remaining == 0:
        return 0
    if i == len(items) or remaining < 0:
        return INF
    return min(best(i + 1, remaining),                  # skip
               1 + best(i, remaining - items[i]))       # take

# Tabulation, once the recurrence is proven -- and often only
# the previous row is needed, so space collapses to O(n)
dp = [0] * (n + 1)
for i in range(1, n + 1):
    dp[i] = dp[i - 1] + dp[i - 2]`,
      deviations: [
        ['State needs an extra dimension', 'A cooldown, a budget, "at most k transactions".', 'Add it to the key. If the answer depends on it, it belongs in the state — a missing dimension is the number-one DP bug and it fails silently.'],
        ['Order does not matter (combinations)', 'Coin change counting ways vs permutations.', 'Loop coins OUTSIDE and amounts inside for combinations; swap them for permutations. The loop order IS the semantics.'],
        ['Greedy looks fine', 'Coin change with ordinary denominations.', 'Try to break it with a counterexample first. Coin change defeats greedy for {1,3,4} and amount 6; being able to produce that example is worth more than the DP.'],
        ['Two sequences', 'Edit distance, longest common subsequence.', '2D DP indexed by both positions. Draw the grid on paper before coding — the recurrence is visible in the picture and invisible in your head.'],
        ['n is up to 10^5', 'Too many states for 2D.', 'Look for a greedy, a monotonic structure, or a binary-search variant. LIS drops from O(n^2) to O(n log n) this way.'],
      ],
      bugs: ['An incomplete state key.', 'Mutable arguments to an lru_cache function — use tuples.', 'Jumping to tabulation before the recurrence is right.'],
    },

    {
      id: 'backtracking', rank: 13, name: 'Backtracking', tier: 2,
      signal: '"All combinations / permutations / subsets", or a constraint puzzle. The output is every arrangement, not a count.',
      idea: 'Choose, recurse, un-choose. The un-choose is what makes it backtracking rather than plain recursion.',
      cost: 'Exponential, and that is expected here.',
      structures: ['array', 'stack'],
      also: ['memo', 'tree-dfs'],
      template: `res, path = [], []

def go(start):
    res.append(path[:])            # a COPY -- or every result aliases
    for i in range(start, len(xs)):
        if i > start and xs[i] == xs[i - 1]:
            continue               # skip duplicates at this level
        path.append(xs[i])         # choose
        go(i + 1)                  # recurse
        path.pop()                 # un-choose

go(0)`,
      deviations: [
        ['Duplicates in the input', 'Subsets II, permutations II.', 'Sort first, then skip a value equal to its predecessor at the same recursion level. The "at the same level" part is what makes it correct.'],
        ['Reuse allowed', 'Combination sum where a number can repeat.', 'Recurse with i rather than i + 1. One character, entirely different problem.'],
        ['Only the count is wanted', '"How many ways" rather than "list them".', 'Stop backtracking and switch to DP. Enumerating to count is exponential for no reason.'],
        ['Needs pruning to finish', 'N-queens, sudoku.', 'Check validity BEFORE recursing, not at the leaf. The pruning is the difference between seconds and never.'],
      ],
      bugs: ['Appending path by reference instead of a copy.', 'Forgetting the pop.', 'Skipping duplicates globally rather than per level.'],
    },

    {
      id: 'deque-mono', rank: 14, name: 'Monotonic stack / deque', tier: 2,
      signal: '"Next greater", "previous smaller", histograms, skylines, or the max of a sliding window.',
      idea: 'Keep only the candidates that could still be an answer, in sorted order. Everything popped is popped because a better candidate arrived — and the pop is where you compute.',
      cost: 'O(n): each index is pushed once and popped once.',
      structures: ['stack', 'deque'],
      also: ['window', 'two-pointers'],
      template: `# NEXT GREATER: stack of indices, decreasing values
res = [0] * len(xs)
stack = []
for i, x in enumerate(xs):
    while stack and xs[stack[-1]] < x:
        j = stack.pop()
        res[j] = i - j            # the POP is where you compute
    stack.append(i)

# SLIDING WINDOW MAXIMUM: deque of indices
from collections import deque
dq, out = deque(), []
for i, x in enumerate(xs):
    while dq and xs[dq[-1]] <= x:
        dq.pop()                  # smaller values can never win again
    dq.append(i)
    if dq[0] <= i - k:
        dq.popleft()              # fell out of the window
    if i >= k - 1:
        out.append(xs[dq[0]])`,
      deviations: [
        ['You need widths, not just the next element', 'Largest rectangle in a histogram.', 'Store indices, and append a trailing sentinel of 0 so the stack flushes. Width comes from the index below the popped one.'],
        ['Window as well as monotonicity', 'Sliding window maximum.', 'Deque, not stack — you must also drop from the FRONT when indices fall out of the window.'],
        ['Increasing instead of decreasing', 'Previous smaller element.', 'Flip the comparison. Decide which extreme you are tracking before writing the while.'],
        ['Trapping rain water', 'Water held between bars.', 'Solvable with a monotonic stack, but two pointers with running maxima is shorter and easier to defend. Mention both.'],
      ],
      bugs: ['Storing values when you need index distances.', 'Wrong strictness (< vs <=), which breaks on equal neighbours.'],
    },

    {
      id: 'union-find', rank: 15, name: 'Union-Find', tier: 2,
      signal: 'Undirected connectivity, "how many groups", "are these connected", merging equivalences — especially as edges arrive over time.',
      idea: 'Near-constant-time merging and membership. Fifteen lines that you should be able to type from memory, because they unlock a whole class of grouping problems.',
      cost: 'Near O(1) amortised per operation.',
      structures: ['union-find'],
      also: ['graph-dfs', 'topo'],
      template: `parent = list(range(n))
size = [1] * n

def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]    # path compression
        x = parent[x]
    return x

def union(a, b):
    root_a = find(a)
    root_b = find(b)

    if root_a == root_b:
        return False              # already together -> this edge is a cycle

    # Attach the smaller tree under the larger one, so trees stay shallow.
    if size[root_a] < size[root_b]:
        root_a, root_b = root_b, root_a

    parent[root_b] = root_a
    size[root_a] += size[root_b]
    return True

groups = 0
for i in range(n):
    if find(i) == i:              # a root stands for one group
        groups += 1`,
      deviations: [
        ['Nodes are not integers', 'Emails, account names, strings.', 'Map each label to an index with a dict as you meet them. Choosing what the nodes ARE is usually the whole problem — accounts-merge unions by email.'],
        ['Find the edge that creates a cycle', 'Redundant connection.', 'union() returning False is the detector. The first such edge in input order is the answer.'],
        ['Directed graph', 'Cycle in a dependency graph.', 'Union-Find does not handle direction. Use DFS with an in-progress set, or Kahn.'],
        ['Groups must be undone', 'Rollback or offline queries.', 'Skip path compression and keep a union log so it can be reversed. Rare, but know that compression is what makes rollback hard.'],
      ],
      bugs: ['Unioning nodes instead of roots.', 'Omitting compression, giving O(n) finds.'],
    },

    {
      id: 'prefix', rank: 16, name: 'Prefix sums / difference array', tier: 2,
      signal: 'Repeated range sums, or many range UPDATES followed by one read.',
      idea: 'Precompute once so each query is O(1). The difference-array direction is the same trick with the roles of update and query swapped.',
      cost: 'O(n) build, O(1) per query.',
      structures: ['array', 'hash'],
      also: ['hash-count', 'window', 'sweep'],
      template: `# PREFIX: range sums
pre = [0] * (len(xs) + 1)
for i, x in enumerate(xs):
    pre[i + 1] = pre[i] + x
range_sum = pre[r + 1] - pre[l]        # inclusive l..r

# DIFFERENCE ARRAY: many updates, one read
diff = [0] * (n + 1)
for l, r, v in updates:
    diff[l] += v
    diff[r + 1] -= v
cur = 0
for i in range(n):
    cur += diff[i]
    final[i] = cur`,
      deviations: [
        ['Count subarrays with a property', 'Sum equals k, or divisible by k.', 'Combine with a hash map of prefix → count. Seed {0: 1}. This pairing is one of the most common medium questions there is.'],
        ['2D ranges', 'Sum over a submatrix.', 'A 2D prefix table, and the query is four lookups: total − top − left + corner. Draw it before coding.'],
        ['Products, not sums', 'Product of array except self.', 'Prefix and suffix products, then combine. Zeros are the edge case.'],
        ['Updates AND queries interleaved', 'Both happen many times.', 'Prefix sums stop working — every update invalidates the table. This is where a Fenwick tree belongs, and where you can say you would reach for one.'],
      ],
      bugs: ['Off-by-one on inclusive vs exclusive ends. Write the convention down.', 'Forgetting the diff array needs n+1 slots.'],
    },

    {
      id: 'trie', rank: 17, name: 'Trie', tier: 2,
      signal: '"Prefix", "autocomplete", "starts with", "dictionary of words", wildcard search.',
      idea: 'Share prefixes so lookup costs the length of the word rather than the size of the dictionary. The most naturally front-end structure in the set — autocomplete is the daily-work version.',
      cost: 'O(length) per insert or lookup, independent of how many words are stored.',
      structures: ['trie', 'tree'],
      also: ['hash-count', 'tree-dfs', 'backtracking'],
      template: `# Nested dicts are enough. A class is ceremony you do not have time for.
END = '$'

root = {}
for w in words:
    node = root
    for ch in w:
        if ch not in node:
            node[ch] = {}         # first time down this branch
        node = node[ch]
    node[END] = True              # WITHOUT this flag, "car" matches
                                  # when only "carpet" was inserted

def search(w, exact=True):
    node = root
    for ch in w:
        if ch not in node:
            return False
        node = node[ch]

    # We walked the whole word. For an exact match it must also be marked
    # as a word ending; for a prefix match, arriving here is enough.
    if exact:
        return END in node
    return True`,
      deviations: [
        ['Top-k per prefix', 'Search suggestions, three results per keystroke.', 'Store the best three AT each node during construction. Then every keystroke is O(1) instead of a subtree walk.'],
        ['Wildcards', '"." matches any character.', 'DFS over all children when you hit the wildcard. The trie becomes a search space rather than a lookup.'],
        ['Grid word search', 'Word search II.', 'Trie plus backtracking over the grid, pruning the moment the current prefix leaves the trie. The pruning is the entire performance story.'],
        ['Only exact membership is needed', 'No prefix queries at all.', 'Use a set. A trie is more code for no benefit, and saying so demonstrates judgement.'],
      ],
      bugs: ['Omitting the end-of-word marker.', 'Rebuilding the trie per query instead of once.'],
    },

    {
      id: 'fast-slow', rank: 18, name: 'Fast and slow pointers', tier: 2,
      signal: 'Linked list, "find the middle", "detect a cycle", or a sequence that must eventually repeat.',
      idea: 'Two speeds through the same sequence, using O(1) space. The space is the whole point — a visited set solves these trivially and misses the exercise.',
      cost: 'O(n) time, O(1) space.',
      structures: ['linked-list'],
      also: ['two-pointers'],
      template: `slow = head
fast = head
found_cycle = False

while fast and fast.next:          # null-check BOTH
    slow = slow.next
    fast = fast.next.next
    if slow is fast:
        found_cycle = True
        break

if not found_cycle:
    return None                    # ran off the end: no cycle

# Cycle START: reset one pointer to head, advance both by one
slow = head
while slow is not fast:
    slow = slow.next
    fast = fast.next
return slow`,
      deviations: [
        ['Find the middle', 'Split a list in half.', 'When fast reaches the end, slow is at the middle. Whether you get the upper or lower middle depends on your loop condition — check it against a 2-element list.'],
        ['Not a list at all', 'Happy number, or repeated digit-square sums.', 'Cycle detection on any deterministic sequence. Recognising that a number sequence is a linked list is the point of those problems.'],
        ['Nth from the end', 'Remove the nth-last node.', 'Not two speeds — two pointers with a fixed GAP of n, moved at the same rate.'],
        ['Palindrome list', 'Check a list reads the same backwards.', 'Find the middle, reverse the second half, compare. Mention that you are mutating the input and could restore it.'],
      ],
      bugs: ['Not checking fast and fast.next before advancing.', 'Off-by-one on which middle you land on.'],
    },

    {
      id: 'greedy', rank: 19, name: 'Greedy with an exchange argument', tier: 2,
      signal: '"Maximum number of", "minimum removals", scheduling, and any problem where a local choice feels obviously right.',
      idea: 'Take the locally best option and never reconsider. Cheap to code and easy to get wrong — the work is not the algorithm, it is justifying that the local choice cannot cost you the optimum.',
      cost: 'O(n log n), sort-dominated.',
      structures: ['array', 'heap'],
      also: ['sweep', 'memo', 'heap-topk'],
      template: `# The shape is almost always: sort by the right key, then sweep.
# CHOOSING THE KEY IS THE PROBLEM.

# Maximum non-overlapping intervals: sort by END
intervals.sort(key=lambda x: x[1])
count, last_end = 0, float('-inf')
for s, e in intervals:
    if s >= last_end:        # compatible with everything kept so far
        count += 1
        last_end = e

# The exchange argument, stated: if an optimal solution does not take the
# earliest-ending compatible interval, swapping it in leaves the solution
# no worse and no smaller. So a greedy choice is always safe.`,
      deviations: [
        ['Sorting by the wrong key', 'Non-overlapping intervals, sorted by start instead of end.', 'Sorting by start is the wrong greedy — a long early interval blocks two short ones. By END is correct. If you cannot justify the key, you have not solved it yet.'],
        ['Greedy is simply wrong', 'Coin change with denominations {1, 3, 4} and amount 6.', 'Greedy gives 4+1+1 = three coins; optimal is 3+3 = two. Try to break greedy with a small counterexample BEFORE committing, and switch to DP when it breaks.'],
        ['Greedy plus a heap', 'Task scheduler, or reorganising a string.', 'When the "best local choice" changes as you consume items, the heap keeps it current. Greedy and heap-topk are the same family here.'],
        ['Two competing keys', 'Sort by one field, tie-break by another.', 'A tuple key does it: sort(key=lambda x: (x[0], -x[1])). Say which field dominates and why.'],
      ],
      bugs: ['Not stating the exchange argument, so a correct answer looks like a guess.', 'Sorting by the intuitive key rather than the provable one.'],
    },

    {
      id: 'kway', rank: 20, name: 'K-way merge', tier: 2,
      signal: 'Several sorted inputs. "Merge them all", "kth smallest across k lists", "smallest range covering every list".',
      idea: 'A heap holding one candidate per input. The global minimum must be at the head of some list, so you only ever need k candidates in play at once.',
      cost: 'O(N log k) for N total items.',
      structures: ['heap', 'linked-list'],
      also: ['heap-topk', 'two-pointers'],
      template: `import heapq

h = []
for i, lst in enumerate(lists):
    if lst:                          # (value, which list, index in it)
        h.append((lst[0], i, 0))
heapq.heapify(h)

out = []
while h:
    val, li, idx = heapq.heappop(h)
    out.append(val)
    if idx + 1 < len(lists[li]):
        heapq.heappush(h, (lists[li][idx + 1], li, idx + 1))`,
      deviations: [
        ['Exactly two lists', 'Merge two sorted arrays.', 'Do not build a heap. Two pointers, O(n), and reaching for the heap here reads as pattern-matching without thinking.'],
        ['Linked lists rather than arrays', 'Merge k sorted linked lists.', 'Nodes are not comparable, so push (value, tiebreak, node) tuples. Python compares element-wise and will raise on the node otherwise.'],
        ['You only need the kth', 'Kth smallest in a sorted matrix.', 'Pop k times and stop. Or binary search on the value, which is O(n log(range)) and often better.'],
        ['Smallest range covering all lists', 'One element from each list, minimising the spread.', 'The heap gives the current minimum; track the maximum pushed so far separately. The range is max − heap top at each step.'],
      ],
      bugs: ['Pushing whole lists or bare nodes instead of tuples.', 'Forgetting to skip empty input lists when seeding.'],
    },

    {
      id: 'dijkstra', rank: 21, name: 'Dijkstra', tier: 3,
      signal: 'Shortest path with WEIGHTS, non-negative. "Cheapest", "fastest", "minimum cost to reach".',
      idea: 'BFS where the queue is ordered by distance rather than by arrival. Worth being able to describe even if you never code it in a round.',
      cost: 'O(E log V).',
      structures: ['graph', 'heap'],
      also: ['tree-bfs', 'heap-topk'],
      template: `import heapq

INF = float('inf')

# Every node starts unreachable. Filling the dict up front means every
# later line can just read dist[v] -- no defaults, no missing keys.
dist = {}
for node in all_nodes:
    dist[node] = INF
dist[start] = 0

heap = [(0, start)]
while heap:
    distance_so_far, u = heapq.heappop(heap)

    # A stale entry: we already found a better route to u after this one
    # was pushed. Heaps cannot delete from the middle, so we skip instead.
    if distance_so_far > dist[u]:
        continue

    if u == goal:
        return distance_so_far        # safe to stop the moment it pops

    for v, weight in g[u]:
        new_distance = distance_so_far + weight
        if new_distance < dist[v]:
            dist[v] = new_distance
            heapq.heappush(heap, (new_distance, v))`,
      deviations: [
        ['All weights equal', 'Every edge costs the same.', 'Use BFS. Dijkstra is strictly more machinery for the same answer.'],
        ['Weights are only 0 and 1', 'Some moves are free.', '0-1 BFS: a deque, appendleft for weight 0 and append for weight 1. O(V+E), no heap.'],
        ['Negative weights', 'Costs can be negative.', 'Dijkstra is invalid — the "settled" assumption breaks. Bellman-Ford, O(VE).'],
        ['Time-dependent edges', 'Flights, where an edge is only usable after a certain time.', 'The label becomes "earliest arrival" and edges are filtered by departure time. Still correct because waiting is free — say that out loud, because it is the assumption everything rests on.'],
      ],
      bugs: ['Not skipping stale heap entries.', 'Using it with negative weights.'],
    },

    {
      id: 'quickselect', rank: 22, name: 'Quickselect', tier: 3,
      signal: '"Kth largest / smallest" where O(n) is explicitly wanted, or the interviewer asks you to beat the heap.',
      idea: 'Quicksort that only recurses into the side containing the answer. Expected O(n) because the work halves each time instead of doubling.',
      cost: 'O(n) average, O(n^2) worst. Random pivot makes the worst case vanishingly unlikely.',
      structures: ['array'],
      also: ['heap-topk', 'binary-index'],
      template: `import random

def select(xs, k):                 # k is 0-based, in sorted order
    lo, hi = 0, len(xs) - 1
    while True:
        p = random.randint(lo, hi)     # random pivot: avoids the O(n^2) case
        xs[p], xs[hi] = xs[hi], xs[p]
        store = lo
        for i in range(lo, hi):
            if xs[i] < xs[hi]:
                xs[store], xs[i] = xs[i], xs[store]
                store += 1
        xs[store], xs[hi] = xs[hi], xs[store]
        if store == k:
            return xs[store]
        if store < k:
            lo = store + 1            # recurse ONE side only
        else:
            hi = store - 1`,
      deviations: [
        ['A heap is good enough', 'k is small and n is large.', 'Say so and use the heap: O(n log k), far less code and no worst case. Quickselect is the answer to "can you do better than n log k", not the default.'],
        ['You must not mutate the input', 'The caller keeps the array.', 'Copy first and say that the copy costs O(n) space — quickselect partitions in place by nature.'],
        ['The data is a stream', 'You cannot hold it all.', 'Quickselect needs random access. Back to a size-k heap.'],
      ],
      bugs: ['A fixed pivot, which is O(n^2) on sorted input.', 'Off-by-one between "kth largest" and a 0-based index.'],
    },
  ],
};
