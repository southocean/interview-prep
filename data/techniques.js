/* Techniques: the smaller, sharper things that are not big enough to be a
 * pattern but are absolutely big enough to lose you a problem.
 *
 * A technique may declare a `family` -- the pattern, structure or technique it
 * is a deviation or specialisation of. app.js renders that as "A deviation of
 * X" with a link, and X's page lists everything that descends from it. Declared
 * one way only, inverted at load, like everything else here.
 *
 * `kind` on the family: 'pat', 'str' or 'tech'.
 */
window.TECHNIQUES = {
  note: 'Patterns are how you recognise a problem. Techniques are the moves you make once you have. Several of these are the entire difference between a solution that works and one that is fast enough — Kadane, coordinate compression, counting sort — and several are just the trick that removes a whole class of bug, like a sentinel.',

  items: [
    // ---------------------------------------------------------- ordering ---
    {
      id: 'sorting', name: 'Sorting and custom comparators', rank: 1,
      one: 'Not the algorithm — the judgement about WHEN to sort, and what to sort by.',
      what: 'Sorting costs O(n log n) and buys you an invariant: "everything to the left is smaller". That invariant is what makes two pointers legal, what makes greedy provable, and what makes a sweep possible. Choosing the sort KEY is usually the actual problem.',
      when: 'Whenever O(n log n) is inside your budget and order would give you a guarantee you do not currently have. If you find yourself scanning to find a minimum repeatedly, you either wanted a sort or a heap.',
      code: `xs.sort(key=lambda x: x[1])              # by one field
xs.sort(key=lambda x: (x[0], -x[1]))     # then by another, descending
xs.sort(key=lambda w: (len(w), w))       # tuples compare element-wise

# Python's sort is STABLE: equal elements keep their original order,
# which lets you sort by a second key first and a primary key after.`,
      gotcha: 'In JS, .sort() with no comparator is LEXICOGRAPHIC — [10,9,100] becomes [10,100,9]. Always pass (a,b)=>a-b. And sorting destroys the original order, which some problems need; sort indices instead if so.',
      also: [['pat', 'greedy'], ['pat', 'sweep'], ['pat', 'two-pointers'], ['tech', 'counting-sort']],
    },
    {
      id: 'counting-sort', name: 'Counting / bucket sort', rank: 2, family: ['tech', 'sorting'],
      one: 'O(n + k) sorting when the values are bounded small integers.',
      what: 'Skip comparisons entirely: count how many of each value there are, then read the counts back out in order. Beats the n log n lower bound because it is not a comparison sort.',
      when: 'Values are bounded and the range is not much bigger than n — ages, scores out of 100, minutes in a day, letter frequencies. Also the O(n) route for "top k frequent", where counts are bounded by n.',
      code: `# top-k frequent in O(n): counts cannot exceed n, so bucket by count
buckets = []
for _ in range(len(nums) + 1):
    buckets.append([])        # a FRESH list each time; [[]] * n shares one
for val, c in Counter(nums).items():
    buckets[c].append(val)

out = []
for c in range(len(buckets) - 1, 0, -1):
    out.extend(buckets[c])
    if len(out) >= k:
        break`,
      gotcha: 'Useless when the range dwarfs n — bucketing 10^9 possible values to sort 100 items is absurd. Check the range before reaching for it.',
      also: [['pat', 'heap-topk'], ['tech', 'coordinate-compression']],
    },
    {
      id: 'coordinate-compression', name: 'Coordinate compression', rank: 3, family: ['tech', 'sorting'],
      one: 'Huge value range, few distinct values: replace values with their rank.',
      what: 'Sort the distinct values, map each to its index, and work in index space. A range of 10^9 collapses to a range of n, which makes arrays and difference arrays affordable again.',
      when: 'Timestamps, prices or coordinates that are enormous in range but few in number, especially before a sweep or a difference array.',
      code: `vals = sorted(set(all_values))
rank = {}
for i, v in enumerate(vals):
    rank[v] = i
# now index into an array of len(vals) instead of len(10**9)`,
      gotcha: 'You must map back at the end if the answer is a value rather than a count. And compression destroys the DISTANCES between values, so it is wrong whenever the gaps matter.',
      also: [['pat', 'sweep'], ['pat', 'prefix'], ['tech', 'counting-sort']],
    },

    // --------------------------------------------------------- recursion ---
    {
      id: 'recursion', name: 'Recursion', rank: 4,
      one: 'Not a topic so much as the prerequisite for trees, graphs, backtracking and DP.',
      what: 'A function that solves a smaller version of its own problem. Three obligations every time: a base case that terminates, progress towards it, and a clear contract for what the call returns.',
      when: 'Whenever the structure is self-similar — subtrees, subarrays, sub-decisions. If you can say "the answer for this is built from the answer for something smaller", write the recursion first and optimise after.',
      code: `def solve(node):
    if not node:            # 1. base case
        return 0            # 2. contract: what does this RETURN?
    left = solve(node.left) # 3. progress: strictly smaller each time
    right = solve(node.right)
    return 1 + max(left, right)`,
      gotcha: 'Python recurses about 1000 frames deep by default, so a recursive DFS over 10^5 nodes crashes. Say you noticed, then either raise the limit or convert to an explicit stack. Also: state the return contract out loud — most tree bugs are the function returning something different from what the caller assumed.',
      also: [['pat', 'tree-dfs'], ['pat', 'memo'], ['pat', 'backtracking'], ['tech', 'divide-conquer']],
    },
    {
      id: 'divide-conquer', name: 'Divide and conquer', rank: 5, family: ['tech', 'recursion'],
      one: 'Split in half, solve both, combine. The shape behind merge sort and quicksort.',
      what: 'Break the input into independent halves, recurse on each, then spend linear time merging the answers. That gives the T(n) = 2T(n/2) + O(n) recurrence, which resolves to O(n log n).',
      when: 'The problem splits cleanly and the combine step is cheap. Also the honest answer to "how would you sort this yourself".',
      code: `def merge_sort(xs):
    if len(xs) <= 1:
        return xs

    mid = len(xs) // 2
    left_sorted = merge_sort(xs[:mid])
    right_sorted = merge_sort(xs[mid:])

    return merge(left_sorted, right_sorted)     # the linear combine step`,
      gotcha: 'Only pays when the halves are genuinely independent. If they share state, you are looking at DP instead.',
      also: [['pat', 'kway'], ['pat', 'quickselect'], ['pat', 'binary-index']],
    },
    {
      id: 'meet-in-middle', name: 'Meet in the middle', rank: 6, family: ['pat', 'backtracking'],
      one: 'When 2^n is too slow but 2^(n/2) is fine.',
      what: 'Split the input in half, enumerate every subset of each half separately, then join the two halves with sorting or a hash map. Turns 2^40 into two lots of 2^20.',
      when: 'n is around 30 to 40 — too big for full enumeration, too small for a polynomial algorithm to exist. The constraint is the tell.',
      code: `# subset sums of each half, then pair them up
A = all_subset_sums(xs[:n//2])
B = sorted(all_subset_sums(xs[n//2:]))
best = 0
for a in A:
    b = largest_b_at_most(target - a, B)
    best = max(best, a + b)`,
      gotcha: 'Rare in interviews. Recognise it from the n ≈ 40 constraint and say the name; you will rarely be asked to code it fully.',
      also: [['pat', 'backtracking'], ['tech', 'bitmask-enum']],
    },

    // ------------------------------------------------------------ arrays ---
    {
      id: 'kadane', name: "Kadane's algorithm", rank: 7, family: ['pat', 'memo'],
      one: 'Maximum-sum contiguous subarray in one pass, O(1) space.',
      what: 'At each position ask one question: is it better to extend the run so far, or start fresh here? That is a one-line DP with the table collapsed to a single variable.',
      when: '"Maximum sum subarray", and its relatives — maximum product, best time to buy and sell stock, circular variants.',
      code: `cur = xs[0]
best = xs[0]
for x in xs[1:]:
    cur = max(x, cur + x)     # extend, or restart at x
    best = max(best, cur)
return best`,
      gotcha: 'Initialise from xs[0], not 0 — starting at 0 silently returns 0 for an all-negative array, which is the classic wrong answer. For maximum PRODUCT you must track the minimum too, because a negative times a negative flips it.',
      also: [['pat', 'memo'], ['pat', 'window'], ['pat', 'prefix']],
    },
    {
      id: 'index-as-storage', name: 'Index as storage', rank: 8, family: ['str', 'array'],
      one: 'O(1) extra space by writing information into the array you were given.',
      what: 'Two flavours. Negation marking: to record "I have seen value v", flip the sign of a[v]. Cyclic sort: place each value at its own index, so a[i] should equal i, and any mismatch is the answer.',
      when: 'Values are bounded by the array length — "n numbers in the range 1..n" is the giveaway — and the problem demands O(1) space.',
      code: `# negation marking: which values are present?
for x in xs:
    i = abs(x) - 1
    if xs[i] > 0:
        xs[i] = -xs[i]
missing = []
for i, x in enumerate(xs):
    if x > 0:                 # never negated, so i + 1 was absent
        missing.append(i + 1)

# cyclic sort: put each value where it belongs
i = 0
while i < len(xs):
    j = xs[i] - 1
    if 0 <= j < len(xs) and xs[i] != xs[j]:
        xs[i], xs[j] = xs[j], xs[i]
    else:
        i += 1`,
      gotcha: 'It mutates the caller\'s data. Say so out loud and offer to restore it — an interviewer who cares about API contracts is waiting to hear that.',
      also: [['pat', 'two-pointers'], ['pat', 'fast-slow'], ['tech', 'sentinel']],
    },
    {
      id: 'sentinel', name: 'Sentinels and dummy nodes', rank: 9,
      one: 'Add a fake element so the special case disappears.',
      what: 'A dummy head gives every real node a predecessor, so insertion and deletion at the front stop being special. A trailing zero on a histogram forces the monotonic stack to flush. An infinity at the end of a merge removes the "one list ran out" branch.',
      when: 'Any time you are about to write a branch that exists only for the first or last element. Deleted branches cannot contain bugs, which is the whole argument.',
      code: `dummy = ListNode(0, head)     # every node now has a predecessor
prev = dummy
while prev.next:
    ...
return dummy.next             # not head -- head may have been removed

heights = heights + [0]       # forces the stack to empty`,
      gotcha: 'Remember to return dummy.next rather than head, and to exclude the sentinel from any count or output.',
      also: [['str', 'linked-list'], ['pat', 'deque-mono'], ['pat', 'kway']],
    },
    {
      id: 'expand-centre', name: 'Expand around centre', rank: 10, family: ['pat', 'two-pointers'],
      one: 'Palindromes, by growing outwards from every possible middle.',
      what: 'A palindrome is defined by its centre, so try all centres and expand while the characters match. There are 2n−1 of them: n characters, plus the n−1 gaps between them.',
      when: 'Longest palindromic substring, counting palindromic substrings. Simpler than the DP and easier to get right under time pressure.',
      code: `def grow(l, r):
    while l >= 0 and r < len(s) and s[l] == s[r]:
        l -= 1
        r += 1
    return s[l + 1:r]

best = ''
for i in range(len(s)):
    best = max(best, grow(i, i), grow(i, i + 1), key=len)  # odd AND even`,
      gotcha: 'Forgetting the even-length centres — the grow(i, i+1) call — is where this is nearly always failed. O(n^2), which is expected; Manacher gets O(n) and is not worth memorising.',
      also: [['pat', 'two-pointers'], ['pat', 'memo']],
    },

    // -------------------------------------------------------------- bits ---
    {
      id: 'bit-tricks', name: 'Bit manipulation', rank: 11,
      one: 'A handful of tricks worth knowing, and no more than a handful.',
      what: 'XOR cancels pairs, which finds a lone unmatched value in O(1) space. x & (x-1) clears the lowest set bit, so looping on it counts set bits in as many steps as there are ones. x & -x isolates that lowest bit.',
      when: 'Occasionally a warm-up, occasionally the O(1)-space escape hatch. Not worth deep study.',
      code: `# XOR cancels pairs, so whatever survives appeared an odd number of times.
lone = 0
for x in xs:
    lone ^= x
return lone

x & (x - 1)               # clear the lowest set bit
x & -x                    # isolate the lowest set bit
x >> 1                    # halve
x << 1                    # double`,
      gotcha: 'In JS all bitwise operators truncate to 32-bit SIGNED, so 1 << 31 goes negative even though plain numbers are exact to 2^53. Python integers are arbitrary precision and have no such trap.',
      also: [['tech', 'bitmask-enum'], ['tech', 'bitmask-dp']],
    },
    {
      id: 'bitmask-enum', name: 'Bitmask enumeration', rank: 12, family: ['tech', 'bit-tricks'],
      one: 'Every subset of n items, as the integers 0 to 2^n − 1.',
      what: 'Each integer is a subset: bit i set means item i is included. Iterating 0..2^n−1 therefore iterates every subset, with no recursion at all.',
      when: 'n ≤ 20. It is the iterative alternative to backtracking for subsets, and it is easier to get right because there is no un-choose step.',
      code: `for mask in range(1 << n):
    subset = []
    for i in range(n):
        if mask & (1 << i):        # bit i is set, so take xs[i]
            subset.append(xs[i])`,
      gotcha: 'Only viable up to about n = 20; beyond that 2^n stops being a number you can loop over.',
      also: [['pat', 'backtracking'], ['tech', 'meet-in-middle']],
    },
    {
      id: 'bitmask-dp', name: 'Bitmask DP', rank: 13, family: ['pat', 'memo'],
      one: 'DP where the state is "which subset have I already used".',
      what: 'The mask becomes part of the memo key, so dp[mask] means the best answer having covered exactly the items in mask. Travelling salesman and assignment problems are the classic shapes.',
      when: 'n ≤ 20 and the answer depends on a SET of choices rather than a position in a sequence.',
      code: `@lru_cache(None)
def best(mask, pos):
    if mask == (1 << n) - 1:
        return 0

    cheapest = float('inf')
    for j in range(n):
        if mask & (1 << j):
            continue                  # j has already been visited
        rest = best(mask | (1 << j), j)
        cheapest = min(cheapest, cost[pos][j] + rest)
    return cheapest`,
      gotcha: 'The state space is n·2^n, so it is fine at n = 15 and hopeless at n = 30. Check the constraint before committing.',
      also: [['pat', 'memo'], ['tech', 'bitmask-enum']],
    },

    // ---------------------------------------------------------------- DP ---
    {
      id: 'tabulation', name: 'Tabulation and rolling arrays', rank: 14, family: ['pat', 'memo'],
      one: 'The same recurrence, filled bottom-up, and then squeezed for space.',
      what: 'Once memoised recursion is correct, the same recurrence can be filled iteratively from the base cases outward. That removes the call stack, and often reveals that only the previous row is ever read — which drops space from O(n^2) to O(n).',
      when: 'After the recurrence is proven, not before. As an interview answer it is the natural follow-up to "can you do better on space?".',
      code: `# 2D, then collapsed to two rows
prev = [0] * (n + 1)
for i in range(1, m + 1):
    cur = [0] * (n + 1)
    for j in range(1, n + 1):
        if a[i - 1] == b[j - 1]:
            cur[j] = prev[j - 1] + 1        # characters match: extend
        else:
            cur[j] = max(prev[j], cur[j - 1])   # skip one side or the other
    prev = cur                              # only the last row is ever read
return prev[n]`,
      gotcha: 'Getting the iteration ORDER wrong silently reads cells that have not been filled yet. Write down which direction each dimension must be traversed before coding it.',
      also: [['pat', 'memo'], ['tech', 'knapsack'], ['tech', 'interval-dp']],
    },
    {
      id: 'knapsack', name: 'Knapsack', rank: 15, family: ['pat', 'memo'],
      one: 'Choose items under a capacity limit. The template most DP problems are wearing.',
      what: 'For each item: take it (and pay its cost) or skip it. 0/1 knapsack allows each item once; unbounded allows repeats. Coin change, subset sum and partition problems are all this in disguise.',
      when: 'A budget, a capacity or a target, and per-item choices. The word "at most" in front of a number is a strong tell.',
      code: `# 0/1: iterate capacity DOWNWARD so each item is used once
dp = [0] * (cap + 1)
for w, v in items:
    for c in range(cap, w - 1, -1):
        dp[c] = max(dp[c], dp[c - w] + v)

# unbounded: iterate UPWARD so an item can be reused
for c in range(w, cap + 1):
    dp[c] = max(dp[c], dp[c - w] + v)`,
      gotcha: 'The loop DIRECTION is the entire difference between 0/1 and unbounded. Downward means "the value I am reading has not seen this item yet". Get it backwards and you silently solve the other problem.',
      also: [['pat', 'memo'], ['tech', 'tabulation']],
    },
    {
      id: 'interval-dp', name: 'Interval DP', rank: 16, family: ['pat', 'memo'],
      one: 'State is a range (i, j), and you split it at every possible point.',
      what: 'dp[i][j] is the answer for the subarray from i to j, computed by trying every split k between them. That gives the O(n^3) shape: n^2 states, n choices each.',
      when: 'Burst balloons, matrix chain multiplication, "merge stones". The n ≤ 500 constraint is usually the hint.',
      code: `for length in range(2, n + 1):          # SHORT ranges first
    for i in range(n - length + 1):
        j = i + length - 1
        cheapest = float('inf')
        for k in range(i, j):           # every split point inside i..j
            total = dp[i][k] + dp[k+1][j] + cost(i, k, j)
            cheapest = min(cheapest, total)
        dp[i][j] = cheapest`,
      gotcha: 'Iterate by increasing LENGTH, not by i then j — otherwise the sub-ranges you depend on have not been computed yet.',
      also: [['pat', 'memo'], ['tech', 'tabulation']],
    },
    {
      id: 'lis-patience', name: 'Patience LIS', rank: 17, family: ['pat', 'binary-index'],
      one: 'Longest increasing subsequence in O(n log n) instead of O(n^2).',
      what: 'Keep an array where tails[k] is the smallest possible tail of an increasing subsequence of length k+1. For each value, binary search for where it belongs and overwrite. The array length is the answer.',
      when: 'LIS when n is too large for the quadratic DP. Worth knowing exists even if you code the O(n^2) version.',
      code: `import bisect
tails = []
for x in xs:
    i = bisect.bisect_left(tails, x)   # bisect_right for non-strict
    if i == len(tails):
        tails.append(x)
    else:
        tails[i] = x
return len(tails)`,
      gotcha: 'tails is NOT the subsequence — only its length is meaningful. Reconstructing the actual sequence needs parent pointers.',
      also: [['pat', 'binary-index'], ['pat', 'memo']],
    },

    // ------------------------------------------------------------ graphs ---
    {
      id: 'zero-one-bfs', name: '0-1 BFS', rank: 18, family: ['pat', 'tree-bfs'],
      one: 'Weighted shortest path in O(V+E) when every weight is 0 or 1.',
      what: 'A deque instead of a heap: a zero-weight edge goes on the FRONT, a one-weight edge on the back. The deque stays sorted by distance without ever paying log n.',
      when: 'Grids where some moves are free, or "minimum number of changes to make a path exist".',
      code: `INF = float('inf')

dist = {}
for node in all_nodes:
    dist[node] = INF
dist[start] = 0

dq = deque([start])
while dq:
    u = dq.popleft()
    for v, weight in g[u]:
        new_distance = dist[u] + weight
        if new_distance < dist[v]:
            dist[v] = new_distance
            if weight == 0:
                dq.appendleft(v)     # free move: same distance, go first
            else:
                dq.append(v)         # costs 1: strictly further, go last`,
      gotcha: 'Only valid for weights of exactly 0 and 1. Any other weight and you are back to Dijkstra.',
      also: [['pat', 'dijkstra'], ['pat', 'tree-bfs'], ['str', 'queue']],
    },
    {
      id: 'bellman-ford', name: 'Bellman-Ford', rank: 19, family: ['pat', 'dijkstra'],
      one: 'Shortest paths that survive negative edges, and detects negative cycles.',
      what: 'Relax every edge V−1 times. After that many rounds every shortest path is settled, because no simple path has more than V−1 edges. A further improvement on round V proves a negative cycle exists.',
      when: 'Negative weights, where Dijkstra is simply invalid. Also currency arbitrage, which is negative-cycle detection wearing a hat.',
      code: `INF = float('inf')

dist = {}
for node in all_nodes:
    dist[node] = INF
dist[source] = 0

# V-1 rounds, because no simple path has more than V-1 edges
for _ in range(V - 1):
    for u, v, weight in edges:
        if dist[u] == INF:
            continue                  # u is not reachable yet
        if dist[u] + weight < dist[v]:
            dist[v] = dist[u] + weight

# One more round. Any further improvement means a negative cycle.`,
      gotcha: 'O(V·E), far slower than Dijkstra. Only reach for it when weights can be negative — and say why Dijkstra fails, because that is the point being tested.',
      also: [['pat', 'dijkstra'], ['pat', 'topo']],
    },
    {
      id: 'mst', name: 'Minimum spanning tree', rank: 20, family: ['pat', 'union-find'],
      one: 'Connect every node for the least total edge weight.',
      what: 'Kruskal: sort the edges and add each one whose endpoints are not already connected, using Union-Find to test. Prim: grow one tree, always taking the cheapest edge leaving it, using a heap.',
      when: '"Connect all cities at minimum cost", "minimum cost to supply water". Kruskal is the one to write, because it is greedy plus Union-Find, both of which you already have.',
      code: `edges.sort(key=lambda e: e[2])
total = 0
for u, v, w in edges:
    if union(u, v):          # returns False if already connected
        total += w`,
      gotcha: 'Kruskal is exactly the greedy + Union-Find combination, so if you can write those two you already have MST. Prim is better only on dense graphs.',
      also: [['pat', 'union-find'], ['pat', 'greedy'], ['pat', 'dijkstra']],
    },
    {
      id: 'floyd-warshall', name: 'Floyd-Warshall', rank: 21, family: ['pat', 'memo'],
      one: 'Shortest paths between ALL pairs, in three nested loops.',
      what: 'For every intermediate node k, ask whether going through k is shorter than what you have. Three loops with k on the OUTSIDE, and the whole all-pairs table falls out.',
      when: 'n ≤ 500 and you need every pair, not just one source. The n^3 budget in the constraint table is usually pointing here.',
      code: `for k in range(n):            # k MUST be the outer loop
    for i in range(n):
        for j in range(n):
            d[i][j] = min(d[i][j], d[i][k] + d[k][j])`,
      gotcha: 'Putting k anywhere but the outermost loop gives wrong answers that look plausible. It is DP over "paths using only the first k nodes as intermediates", and the loop order is what encodes that.',
      also: [['pat', 'dijkstra'], ['pat', 'memo']],
    },
    {
      id: 'cycle-directed', name: 'Directed cycle detection', rank: 22, family: ['pat', 'graph-dfs'],
      one: 'Three colours: unvisited, in progress, finished.',
      what: 'DFS marking nodes grey on entry and black on exit. Meeting a GREY node means you have looped back into the path you are currently walking — that is a cycle. Meeting a black one is just a revisit and is fine.',
      when: 'Circular imports, dependency deadlock, "is this a valid build order". The undirected version is different and simpler — Union-Find handles that.',
      code: `WHITE, GREY, BLACK = 0, 1, 2
color = defaultdict(int)

def dfs(u):
    color[u] = GREY
    for v in g[u]:
        if color[v] == GREY:
            return True            # back edge -> cycle
        if color[v] == WHITE and dfs(v):
            return True
    color[u] = BLACK
    return False`,
      gotcha: 'A plain visited set is NOT enough — it cannot tell "already finished" from "currently on the stack", and reports cycles that do not exist. Kahn plus the count check is the simpler alternative if you only need yes or no.',
      also: [['pat', 'graph-dfs'], ['pat', 'topo'], ['pat', 'union-find']],
    },

    // ------------------------------------------------------------- misc ----
    {
      id: 'lru-cache', name: 'LRU cache', rank: 23, family: ['str', 'hash'],
      one: 'O(1) get and put with eviction of the least recently used key.',
      what: 'A hash map for O(1) lookup, plus a doubly linked list for O(1) reordering. Python has OrderedDict and JS has Map, both of which preserve insertion order and make this nearly free.',
      when: 'A classic design question, and genuinely front-end relevant — it is what an in-memory response cache is.',
      code: `from collections import OrderedDict

class LRU:
    def __init__(self, cap):
        self.d, self.cap = OrderedDict(), cap

    def get(self, k):
        if k not in self.d:
            return -1
        self.d.move_to_end(k)          # now most recently used
        return self.d[k]

    def put(self, k, v):
        if k in self.d:
            self.d.move_to_end(k)
        self.d[k] = v
        if len(self.d) > self.cap:
            self.d.popitem(last=False) # evict least recently used`,
      gotcha: 'Interviewers often ban OrderedDict and want the hash map plus doubly linked list by hand. Know where the sentinel head and tail go, because they remove every edge case.',
      also: [['str', 'hash'], ['str', 'linked-list'], ['tech', 'sentinel']],
    },
    {
      id: 'rolling-hash', name: 'Rolling hash', rank: 24, family: ['pat', 'hash-count'],
      one: 'Hash every window of a string in O(1) each, by updating rather than rehashing.',
      what: 'Treat the window as a number in some base. Sliding it along is one multiply, one add and one subtract, so all n windows cost O(n) rather than O(nk).',
      when: 'Substring search, finding duplicate substrings, comparing many fixed-length windows. Rabin-Karp is this.',
      code: `h = 0
for ch in s[:k]:
    h = (h * BASE + ord(ch)) % MOD
for i in range(k, len(s)):
    h = (h * BASE - ord(s[i - k]) * pow(BASE, k, MOD) + ord(s[i])) % MOD`,
      gotcha: 'Hash collisions are possible, so a match must be verified against the actual characters unless the interviewer waives it. Say that out loud — it is the thing being checked.',
      also: [['pat', 'window'], ['pat', 'hash-count']],
    },
    {
      id: 'lazy-deletion', name: 'Lazy deletion', rank: 25, family: ['str', 'heap'],
      one: 'Heaps cannot delete from the middle, so do not — skip stale entries on the way out.',
      what: 'Push the updated entry and leave the old one behind. When popping, check whether the entry still matches current state; if not, discard it and pop again.',
      when: 'Dijkstra, and any heap where priorities change after insertion. It is why the Dijkstra template has that "if d > dist[u]: continue" line.',
      code: `while h:
    d, u = heapq.heappop(h)
    if d > dist[u]:
        continue              # stale: a better entry was pushed later
    ...`,
      gotcha: 'The heap can grow to O(E) rather than O(V). That is fine and it is why Dijkstra is O(E log V) rather than O(E log E) in practice — but be ready to explain it.',
      also: [['str', 'heap'], ['pat', 'dijkstra']],
    },
  ],
};
