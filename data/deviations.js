/* Deviations, as question and answer.
 *
 * Nam: "deviations should also be shown in form of questions and solution --
 * how is the solution deviates and builds on top of the textbook solution
 * here?"
 *
 * So each entry is a real question, then the diff:
 *   q      the question as an interviewer would put it
 *   base   what the template on this page already does
 *   change what you change, in words
 *   code   the changed lines ONLY -- a delta, not a whole new solution
 *   why    why the change is correct
 *
 * The point of the shape is that the code block is a DIFF. Reprinting the whole
 * solution for every variation teaches you four solutions; showing the two lines
 * that move teaches you one solution and three adaptations, which is what an
 * interview actually tests.
 *
 * app.js prefers these over the older inline `deviations` array on a pattern,
 * and falls back to it where no entry exists here yet.
 */
window.DEVIATIONS = {

  'hash-count': [
    { q: 'Group these words so that anagrams end up together.',
      base: 'The template maps a value straight to its index — the key IS the thing you saw.',
      change: 'Derive a canonical key first, so that things which are different but equivalent collide on purpose.',
      code: `groups = defaultdict(list)
for w in words:
    key = ''.join(sorted(w))        # <- the only new line
    groups[key].append(w)`,
      why: 'Anagrams are exactly the words with the same multiset of letters, and sorting is the cheapest canonical form of a multiset. A 26-length count tuple is O(n) rather than O(n log n) if pushed.' },

    { q: 'Count the subarrays that sum to exactly k.',
      base: 'The template asks "have I seen this value?". Here you need "how many times have I seen it?".',
      change: 'Store counts rather than indices, key on the running prefix sum, and seed the map with the empty prefix.',
      code: `seen = {0: 1}              # <- the seed everyone forgets
run = total = 0
for x in xs:
    run += x
    total += seen.get(run - k, 0)   # count, not lookup
    seen[run] = seen.get(run, 0) + 1`,
      why: 'A subarray ending here sums to k exactly when some earlier prefix equals run − k. The {0: 1} seed is what lets a subarray starting at index 0 be counted at all.' },

    { q: 'Return the most frequent element, not just whether one exists.',
      base: 'The template gives O(1) membership, and nothing else — a hash map has no order.',
      change: 'Count with the map, then get order from somewhere else: a sort, a heap, or buckets.',
      code: `counts = Counter(xs)
# then ONE of:
counts.most_common(k)                     # simplest
heapq.nlargest(k, counts, key=counts.get) # O(n log k)
# buckets[c] for c in range(n, 0, -1)     # O(n), counts are bounded by n`,
      why: 'Do not try to make the map maintain order. Pick the ordering structure by what k is: small k wants a heap, k near n wants a sort, and bounded counts allow buckets.' },

    { q: 'The keys are only lowercase letters. Can you do better?',
      base: 'The template uses a dict, which hashes every key.',
      change: 'Swap the dict for a fixed-size array indexed by ord(ch) − ord("a").',
      code: `count = [0] * 26
for ch in s:
    count[ord(ch) - 97] += 1
return count_a == count_b        # arrays compare by value, dicts by content`,
      why: 'No hashing, better cache behaviour, and two count arrays compare directly — which turns "are these anagrams" into a single equality.' },
  ],

  'two-pointers': [
    { q: 'Now find three numbers that sum to zero, with no duplicate triplets.',
      base: 'The template converges two pointers over the whole array.',
      change: 'Fix the first element with an outer loop and two-pointer the remainder — and skip equal values at both levels.',
      code: `for i in range(len(xs) - 2):
    if i > 0 and xs[i] == xs[i-1]:
        continue                  # skip duplicate FIRST elements
    lo, hi = i + 1, len(xs) - 1
    while lo < hi:
        ...
        while lo < hi and xs[lo] == xs[lo-1]:
            lo += 1               # skip duplicate SECONDS after a match`,
      why: 'O(n^2) rather than O(n^3). The duplicate skipping has to happen at both levels — doing only the outer one still emits repeated triplets, which is the usual failure here.' },

    { q: 'Same two pointers, but maximise the water held between two lines.',
      base: 'The template moves whichever side makes the SUM closer to a target.',
      change: 'Move whichever side LIMITS the metric — the shorter line.',
      code: `if height[lo] < height[hi]:
    lo += 1        # the short side is the constraint
else:
    hi -= 1`,
      why: 'Width shrinks whatever you do, so the only way to improve is a taller limiting side. Moving the taller line can never help, and being able to say that sentence is the answer.' },

    { q: 'The array is not sorted, and sorting would destroy the answer.',
      base: 'The template depends entirely on sortedness for its monotonicity.',
      change: 'Abandon two pointers. Use a hash map for pair-finding, or a sliding window if the requirement is contiguous.',
      code: `# no two-pointer version exists; the invariant is gone
pos = {}
for i, x in enumerate(xs):
    if target - x in pos:
        return [pos[target - x], i]
    pos[x] = i`,
      why: 'Recognising when a pattern does NOT apply is worth as much as applying it. If order carries meaning you may not sort, and the monotonicity argument disappears with it.' },

    { q: 'Merge two sorted arrays into one.',
      base: 'The template runs both pointers over a single array, converging.',
      change: 'One pointer per array, both moving forward, advancing whichever is behind.',
      code: `i = j = 0
while i < len(a) and j < len(b):
    if a[i] <= b[j]:
        out.append(a[i]); i += 1
    else:
        out.append(b[j]); j += 1
out += a[i:] + b[j:]          # flush whichever remains`,
      why: 'Same skeleton, different geometry — and this is the merge step inside k-way merge and merge sort, so it is worth having in your fingers.' },
  ],

  'window': [
    { q: 'Find the SHORTEST substring of s containing every character of t.',
      base: 'The template records the answer after the window has been made valid again — that finds the longest.',
      change: 'The recording point moves INSIDE the shrink loop, at each moment the window is still valid.',
      code: `while valid():
    best = min(best, right - left + 1)   # <- record here
    count[s[left]] += 1
    left += 1                            # then shrink`,
      why: 'For longest you want the biggest valid window, which is the moment before shrinking becomes necessary. For shortest you want the smallest, which is the moment before it becomes invalid. Same loop, opposite instant — and getting it backwards is the single most common window failure.' },

    { q: 'Longest substring with at most K distinct characters.',
      base: 'The template shrinks while a single character repeats.',
      change: 'The invalid condition becomes "too many distinct", so shrink on the size of the count map — and delete keys that reach zero.',
      code: `while len(count) > K:
    count[s[left]] -= 1
    if count[s[left]] == 0:
        del count[s[left]]        # <- or len() lies to you
    left += 1`,
      why: 'A key left at zero still counts towards len(), so the window silently allows K+1 distinct characters. The deletion is the whole fix.' },

    { q: 'Now make it EXACTLY K distinct, not at most.',
      base: 'The template can only express "at most" — a window has no way to be told it is too small.',
      change: 'Do not write a new loop. Run the at-most function twice and subtract.',
      code: `def exactly(K):
    return at_most(K) - at_most(K - 1)`,
      why: 'Windows are naturally monotonic in "at most" and hopeless at "exactly". This subtraction is worth memorising outright — it converts a hard variant into two calls of an easy one.' },

    { q: 'Return the maximum of every window of size k.',
      base: 'The template maintains a SUM, which updates by adding one and removing one.',
      change: 'A maximum does not update that way, so replace the counter with a monotonic deque of indices.',
      code: `while dq and xs[dq[-1]] <= x:
    dq.pop()                  # smaller AND older can never win
dq.append(i)
if dq[0] <= i - k:
    dq.popleft()              # expired by position, not value`,
      why: 'Removing an element from a sum is arithmetic; removing the maximum leaves you with no idea what the new maximum is. The deque keeps every candidate that could still become the max, in order.' },

    { q: 'Same question, but a subsequence rather than a subarray.',
      base: 'The template assumes contiguity — that is what makes "leaving the window" meaningful.',
      change: 'Not a window problem at all. Go to DP.',
      code: `# there is no window here; the elements need not be adjacent
dp[i] = best answer considering the first i elements`,
      why: 'The word contiguous is what licenses the whole pattern. Without it, index i+1 can be chosen or skipped independently, which is a DP state, not a window.' },
  ],

  'binary-index': [
    { q: 'The array is sorted but rotated at an unknown pivot. Find the target.',
      base: 'The template assumes the whole range is sorted, so it can always tell which half to keep.',
      change: 'Work out which HALF is sorted first, then test whether the target lies inside it.',
      code: `if xs[lo] <= xs[mid]:               # left half is sorted
    if xs[lo] <= target < xs[mid]:
        hi = mid - 1
    else:
        lo = mid + 1
else:                               # right half is sorted
    ...`,
      why: 'A rotated array is always two sorted runs, so at least one side of any midpoint is sorted. That side you can reason about exactly; the other you skip into.' },

    { q: 'Count how many times a value occurs in the sorted array.',
      base: 'The template finds one boundary.',
      change: 'Run it twice with two different predicates and subtract.',
      code: `first = search(lambda v: v >= target)
after = search(lambda v: v >  target)
count = after - first`,
      why: 'Do not write a bespoke loop that walks outwards from a hit — that is O(n) when every element is the target. Two boundary searches stay O(log n).' },

    { q: 'There is no array — you can only call an API that returns the value at an index.',
      base: 'The template needs len(xs) to set its upper bound.',
      change: 'Find a bound first by doubling until the predicate flips, then search inside it.',
      code: `hi = 1
while not pred(get(hi)):
    hi *= 2                  # exponential search for a bound
lo = hi // 2`,
      why: 'Doubling costs O(log n) and then the search costs O(log n), so the total is still logarithmic. This is the shape for infinite or unknown-length inputs.' },

    { q: 'Find any peak element — one greater than both neighbours. The array is NOT sorted.',
      base: 'The template relies on sortedness to know which half to discard.',
      change: 'Compare mid with mid+1 and walk uphill. Sortedness is not required, only that a direction of improvement always exists.',
      code: `if xs[mid] < xs[mid + 1]:
    lo = mid + 1        # uphill to the right, a peak must exist there
else:
    hi = mid`,
      why: 'Binary search needs a monotonic PREDICATE, not a sorted array. "The peak is to my right" is monotonic here, and noticing that generalises the pattern well beyond sorted input.' },
  ],

  'binary-answer': [
    { q: 'Instead of the minimum speed, find the MAXIMUM value that still works.',
      base: 'The template searches for the first x where can(x) is true.',
      change: 'Keep the same template and search for the first x that FAILS, then subtract one. Do not invert the loop.',
      code: `# find first failing x, answer is one below it
lo, hi = 1, upper + 1
while lo < hi:
    mid = (lo + hi) // 2
    if can(mid):
        lo = mid + 1
    else:
        hi = mid
return lo - 1`,
      why: 'Rewriting the loop for maximisation is where off-by-ones come from. Reusing the one template you have memorised and adjusting the answer afterwards is safer under time pressure.' },

    { q: 'The answer is a real number, to six decimal places.',
      base: 'The template halves an integer range and terminates when lo == hi.',
      change: 'Loop a fixed number of times, or until the interval is smaller than the tolerance. Never test floats for equality.',
      code: `for _ in range(100):          # 100 halvings is ~1e-30
    mid = (lo + hi) / 2
    if can(mid):
        hi = mid
    else:
        lo = mid
return lo`,
      why: 'Floating point never converges to equality, so an integer-style loop can spin forever. A fixed iteration count is simpler to defend than an epsilon comparison.' },

    { q: 'What if a bigger budget does not always help?',
      base: 'The template rests entirely on can(x) being monotonic — false, false, …, true, true.',
      change: 'Nothing. The method is invalid and you must say so, then find another approach.',
      code: `# can(3) == True but can(4) == False  ->  binary search is meaningless
# the predicate must be monotonic or the halving discards the answer`,
      why: 'This is the trap in the pattern and interviewers plant it. Stating why monotonicity holds — before coding — is what separates using the pattern from pattern-matching.' },

    { q: 'What upper bound do you search to?',
      base: 'The template needs a range you can defend.',
      change: 'Derive it from the problem: the total, the maximum single element, or double until can() succeeds.',
      code: `lo = max(weights)      # cannot ship a package smaller than itself
hi = sum(weights)      # one day, everything at once -- always feasible`,
      why: 'A bound that is obviously feasible at the top and obviously infeasible at the bottom is what makes the search well-formed. Say why each end is safe.' },
  ],

  'tree-dfs': [
    { q: 'Validate that this binary tree is a BST.',
      base: 'The template returns information UPWARD from each subtree.',
      change: 'Pass a constraint DOWNWARD instead — an allowed (low, high) range that narrows at each step.',
      code: `def valid(node, low, high):
    if not node:
        return True
    if not (low < node.val < high):
        return False
    return (valid(node.left,  low, node.val) and
            valid(node.right, node.val, high))`,
      why: 'A node can be larger than its parent and still break the BST property against a grandparent. Comparing only to the parent is the classic wrong answer, and the range is what fixes it.' },

    { q: 'Find the diameter — the longest path between any two nodes.',
      base: 'The template returns the quantity that is also the answer.',
      change: 'Return one thing and record another: height goes upward, while the best left+right path is recorded outside.',
      code: `best = 0
def height(node):
    global best
    l, r = height(node.left), height(node.right)
    best = max(best, l + r)      # <- the answer, recorded
    return 1 + max(l, r)         # <- the contract, returned`,
      why: 'The longest path through a node is not the value its parent needs. Recognising when those two quantities differ is the core tree skill, and it recurs in maximum path sum and longest univalue path.' },

    { q: 'The tree is 10^5 nodes deep.',
      base: 'The template recurses, and Python allows about a thousand frames.',
      change: 'Convert to an explicit stack, or raise the recursion limit and say why that is acceptable.',
      code: `stack = [(root, False)]
while stack:
    node, processed = stack.pop()
    if processed:
        visit(node)                       # postorder position
    else:
        stack.append((node, True))
        stack.extend((c, False) for c in (node.right, node.left) if c)`,
      why: 'The two-pass flag is how you get postorder iteratively — you need to visit a node after its children, which a naive stack cannot express.' },

    { q: 'It is a graph with parent pointers, not a tree.',
      base: 'The template assumes no node is reachable twice, so it keeps no visited set.',
      change: 'Add one. Without it a cycle makes the recursion run forever.',
      code: `seen = set()
def dfs(node):
    if node in seen:
        return
    seen.add(node)
    ...`,
      why: 'Tree DFS is graph DFS minus the visited set. Being asked to relax "it is a tree" is a common follow-up and the fix should be immediate.' },
  ],

  'tree-bfs': [
    { q: 'Rot spreads from every rotten orange at once. How many minutes?',
      base: 'The template seeds the queue with one start node.',
      change: 'Seed it with ALL sources before the first step. Nothing else changes.',
      code: `q = deque((r, c) for r in range(R) for c in range(C)
                if grid[r][c] == ROTTEN)          # every source, minute 0`,
      why: 'Running BFS once per source would be O(sources × cells). Multi-source BFS gets the same answer in one pass, because levels still measure time correctly when everything starts together.' },

    { q: 'Return the actual shortest path, not just its length.',
      base: 'The template counts levels and discards how it got anywhere.',
      change: 'Keep a parent map alongside the visited set, then walk it backwards from the goal.',
      code: `parent = {start: None}
...
        parent[nxt] = node        # <- record who reached it first

path, cur = [], goal              # then reconstruct
while cur is not None:
    path.append(cur); cur = parent[cur]
return path[::-1]`,
      why: 'The first arrival is the shortest one, so the first parent recorded is on a shortest path. No extra search is needed.' },

    { q: 'The edges have different costs now.',
      base: 'The template treats every step as equal, which is what makes arrival order equal shortest order.',
      change: 'Swap the queue for a heap — that is Dijkstra. If the weights are only 0 and 1, a deque with appendleft is enough.',
      code: `heapq.heappush(h, (dist + w, nxt))    # Dijkstra
# or, for 0/1 weights only:
dq.appendleft(nxt) if w == 0 else dq.append(nxt)`,
      why: 'With weights, a path with more edges can be cheaper, so first-arrival stops meaning cheapest. The 0-1 case is worth knowing because it keeps O(V+E).' },

    { q: 'Neighbours are words differing by one letter, over a 10^4-word dictionary.',
      base: 'The template enumerates neighbours cheaply.',
      change: 'Do not compare every pair of words. Precompute wildcard buckets and look up.',
      code: `buckets = defaultdict(list)
for w in words:
    for i in range(len(w)):
        buckets[w[:i] + '*' + w[i+1:]].append(w)`,
      why: 'All-pairs comparison is O(n^2 · L). Bucketing makes neighbour lookup O(L) per word, which is the difference between passing and timing out on word ladder.' },
  ],

  'graph-dfs': [
    { q: 'Which grid cells can reach BOTH oceans?',
      base: 'The template searches outward from each starting cell.',
      change: 'Reverse the direction. Search inward from each ocean edge, then intersect the two reachable sets.',
      code: `pacific, atlantic = set(), set()
for r in range(R):
    dfs(r, 0, pacific)          # flow INWARD from the border
    dfs(r, C-1, atlantic)
return pacific & atlantic`,
      why: 'Testing every cell outward is O(cells^2) in the worst case. Two searches from the borders is O(cells), and the answer is a set intersection.' },

    { q: 'Is there a cycle in this DIRECTED graph?',
      base: 'The template uses one visited set, which cannot tell "finished" from "currently on the stack".',
      change: 'Three states. Meeting a node that is in progress means you have looped back into your own path.',
      code: `WHITE, GREY, BLACK = 0, 1, 2
if color[v] == GREY:
    return True             # back edge -> cycle
if color[v] == WHITE and dfs(v):
    return True`,
      why: 'A plain visited set reports a cycle for any re-visit, including a legitimate diamond. The grey state is what makes it correct.' },

    { q: 'Edges arrive one at a time and I query connectivity as they do.',
      base: 'The template walks a graph that already exists.',
      change: 'Do not re-run DFS per edge. Use Union-Find.',
      code: `# per edge, near O(1) instead of a full O(V+E) traversal
union(u, v)
connected = find(a) == find(b)`,
      why: 'DFS is O(V+E) per query, so m queries cost O(m(V+E)). Union-Find answers each in effectively constant time and merges incrementally.' },

    { q: 'The grid is a million cells of solid land.',
      base: 'The template recurses once per cell.',
      change: 'Iterative DFS with an explicit stack, or BFS with a deque.',
      code: `stack = [(r, c)]
while stack:
    r, c = stack.pop()
    ...
    stack.extend(neighbours(r, c))`,
      why: 'One connected component spanning the whole grid recurses a million deep and crashes. Say you noticed before the interviewer does.' },
  ],

  'topo': [
    { q: 'Return a valid course ORDER, not just whether one exists.',
      base: 'The template already builds the order — the boolean version just throws it away.',
      change: 'Return the emitted list, and the empty list when the count check fails.',
      code: `return order if len(order) == n else []`,
      why: 'The same machinery answers both. Recognising that "can it be done" and "how" are one algorithm apart is the point of the pair.' },

    { q: 'How many SEMESTERS, if unlimited courses can run in parallel?',
      base: 'The template pops one node at a time and produces a flat order.',
      change: 'Process the queue level by level, exactly as in BFS. Each level is one semester.',
      code: `while q:
    for _ in range(len(q)):        # <- snapshot: one whole level
        u = q.popleft()
        ...
    semesters += 1`,
      why: 'Everything at in-degree zero simultaneously can run together. The level snapshot is the same trick that turns BFS into a distance count.' },

    { q: 'Given words sorted in an unknown alphabet, recover the letter order.',
      base: 'The template is handed its edges.',
      change: 'The hard part moves to deriving them: each adjacent word pair gives exactly ONE constraint, at the first differing character.',
      code: `for a, b in zip(words, words[1:]):
    for x, y in zip(a, b):
        if x != y:
            edges.add((x, y))     # only the FIRST difference
            break
    else:
        if len(a) > len(b):
            return ''             # "abc" before "ab" is invalid input`,
      why: 'Taking more than the first difference invents constraints that the input does not imply. The prefix case is the edge case interviewers check for.' },

    { q: 'Break ties lexicographically.',
      base: 'The template uses a FIFO queue, so ties come out in insertion order.',
      change: 'Swap the deque for a heap.',
      code: `import heapq
heapq.heapify(q)
u = heapq.heappop(q)`,
      why: 'O(V log V + E) instead of O(V+E), for a defined tie-break. One data structure swap, no logic change — worth spotting quickly.' },
  ],

  'sweep': [
    { q: 'Do [9,10] and [10,11] count as overlapping?',
      base: 'The template sorts (time, delta) tuples, which puts −1 before +1 at equal times.',
      change: 'That default is the half-open reading. For closed intervals, make starts sort first.',
      code: `events.sort()                       # half-open: a room frees, then is taken
events.sort(key=lambda e: (e[0], -e[1]))   # closed: taken before freed`,
      why: 'One character of sort key, and it changes the answer on touching intervals. Ask the question before coding — this is the planted ambiguity in every interval problem.' },

    { q: 'Remove the fewest intervals so that none overlap.',
      base: 'The template counts concurrency; it does not choose what to keep.',
      change: 'Reverse the question into "keep the most", then greedily keep by EARLIEST END.',
      code: `intervals.sort(key=lambda x: x[1])      # by END, not start
kept, last = 0, float('-inf')
for s, e in intervals:
    if s >= last:
        kept += 1; last = e
return len(intervals) - kept`,
      why: 'Sorting by start is the intuitive choice and it is wrong: one long early interval blocks two short ones. Earliest end leaves the most room for everything after it.' },

    { q: 'Connections need thirty minutes between flights.',
      base: 'The template compares an arrival directly against the next departure.',
      change: 'Add the gap to the left-hand side of the comparison.',
      code: `if best[origin] + MCT <= departure:      # <- the whole change`,
      why: 'One term, and it changes the answer on tight connections. Interviewers wait to see whether you ask about it, so raise it in the clarifying round rather than discovering it later.' },

    { q: 'All events fall within one day, at minute granularity.',
      base: 'The template sorts, which costs O(n log n).',
      change: 'Skip the sort entirely — use a difference array over the fixed range.',
      code: `diff = [0] * 1441
for s, e in meetings:
    diff[s] += 1
    diff[e] -= 1
running = max over prefix sums of diff`,
      why: 'O(n + T) beats O(n log n) once n is large relative to the time range. "Bounded small integers" is always the hint to stop sorting.' },

    { q: 'Tell me WHICH room each meeting goes in.',
      base: 'The template keeps a counter, which knows how many but not which.',
      change: 'Keep a heap of (endTime, roomId) so the room being reused is identifiable.',
      code: `end, room = heapq.heappop(free)   # this exact room becomes available
assign[meeting] = room
heapq.heappush(free, (meeting_end, room))`,
      why: 'A counter is enough for "how many rooms"; identity requires carrying it. This is the standard follow-up once you give the sweep answer.' },
  ],

  'heap-topk': [
    { q: 'k is 90% of n.',
      base: 'The template keeps a size-k heap for O(n log k).',
      change: 'Just sort. Say why the heap has stopped paying.',
      code: `return sorted(xs)[-k:]        # log k ~= log n now`,
      why: 'The heap wins only while k is small. Naming the crossover shows you understand why the heap was there rather than reaching for it reflexively.' },

    { q: 'Give me the running median of a stream.',
      base: 'The template gives you one end of the order.',
      change: 'Two heaps facing each other, kept balanced in size.',
      code: `heapq.heappush(low, -x)                       # max-heap, lower half
heapq.heappush(high, -heapq.heappop(low))     # move the largest up
if len(high) > len(low):
    heapq.heappush(low, -heapq.heappop(high)) # rebalance`,
      why: 'The median sits between the halves, so it is at one or both tops. A single heap can never give you a middle.' },

    { q: 'Do the top-k frequent in O(n).',
      base: 'The template pays log k per element.',
      change: 'Bucket by frequency instead — counts cannot exceed n, so the range is bounded.',
      code: `buckets = [[] for _ in range(n + 1)]
for val, c in Counter(xs).items():
    buckets[c].append(val)
# read buckets from the top down`,
      why: 'This is counting sort applied to frequencies. Whenever the values you are ordering are bounded by n, sorting is avoidable entirely.' },

    { q: 'The heap holds linked-list nodes and it crashes.',
      base: 'The template pushes comparable numbers.',
      change: 'Push tuples with a tie-break so the payload is never compared.',
      code: `heapq.heappush(h, (node.val, i, node))     # i breaks ties`,
      why: 'Python compares tuples element by element, so two equal values make it try to compare the nodes themselves and raise. The index makes ties resolvable without touching the payload.' },
  ],

  'memo': [
    { q: 'Count the COMBINATIONS that make the amount, not the permutations.',
      base: 'The template loops amounts outside and coins inside, which counts orderings separately.',
      change: 'Swap the loops. Coins outside, amounts inside.',
      code: `for coin in coins:              # <- outer
    for amt in range(coin, target + 1):
        dp[amt] += dp[amt - coin]`,
      why: 'With coins on the outside, each coin is considered once for the whole table, so 1+2 and 2+1 are never both counted. The loop order IS the semantics here, which is why this variant catches people.' },

    { q: 'At most k transactions are allowed.',
      base: 'The template keys the cache on position only.',
      change: 'Add the new dimension to the state. If the answer depends on it, it belongs in the key.',
      code: `@lru_cache(None)
def best(i, k_left, holding):     # <- two extra dimensions
    ...`,
      why: 'A missing dimension fails silently: two genuinely different situations collide on one key and the cache returns a confident wrong answer. This is the number-one DP bug.' },

    { q: 'Can greedy do this instead?',
      base: 'The template explores all choices, which is why it is correct.',
      change: 'Try to break greedy with a small counterexample first. If it survives two attempts, state the exchange argument; if it fails, keep the DP.',
      code: `# coins {1, 3, 4}, amount 6
# greedy: 4 + 1 + 1 = 3 coins
# optimal: 3 + 3     = 2 coins   -> greedy is wrong here`,
      why: 'Producing that counterexample takes fifteen seconds and settles the question. Guessing costs the whole problem.' },

    { q: 'n is 10^5, so the 2D table will not fit.',
      base: 'The template stores every state.',
      change: 'Look for a rolling array, a greedy, or a binary-search variant. LIS drops from O(n^2) to O(n log n) this way.',
      code: `# only the previous row is ever read:
prev, cur = cur, [0] * (n + 1)     # O(n) space instead of O(n^2)`,
      why: 'Once the recurrence only reaches one row back, the rest of the table is dead weight. Spotting that is the standard "can you improve the space" answer.' },
  ],

  'backtracking': [
    { q: 'The input contains duplicates and the output must not.',
      base: 'The template assumes distinct elements, so every branch is unique.',
      change: 'Sort first, then skip a value equal to its predecessor AT THE SAME LEVEL.',
      code: `for i in range(start, len(xs)):
    if i > start and xs[i] == xs[i-1]:
        continue                      # same level only -- not i > 0`,
      why: 'i > start rather than i > 0 is the whole fix. Skipping globally would also prevent legitimately using the same value at a deeper level.' },

    { q: 'A number may be used more than once.',
      base: 'The template recurses with i + 1, consuming each element.',
      change: 'Recurse with i.',
      code: `go(i)          # instead of go(i + 1)`,
      why: 'One character, entirely different problem. Combination sum I and II differ by exactly this and the duplicate skip.' },

    { q: 'I only want the COUNT of arrangements.',
      base: 'The template materialises every arrangement.',
      change: 'Stop backtracking. Count with DP instead.',
      code: `# do not enumerate 2^n things to return one integer
dp[i] = number of ways to reach state i`,
      why: 'Enumerating to count is exponential work for a polynomial answer. Noticing the question asks "how many" rather than "which" is the whole decision.' },

    { q: 'N-queens on an 8×8 board — it is far too slow.',
      base: 'The template checks validity at the leaf.',
      change: 'Prune on the way down, and track attacked columns and diagonals in sets rather than rescanning.',
      code: `if col in cols or (r - c) in diag1 or (r + c) in diag2:
    continue                        # prune BEFORE recursing`,
      why: 'Validating only at the leaf explores the entire tree. Pruning at each level is the difference between seconds and never finishing.' },
  ],

  'deque-mono': [
    { q: 'Largest rectangle in a histogram.',
      base: 'The template computes a distance when it pops.',
      change: 'Compute an AREA instead, and append a trailing zero so the stack is forced to empty.',
      code: `heights.append(0)               # <- sentinel flushes the stack
...
h = heights[stack.pop()]
w = i - stack[-1] - 1 if stack else i
best = max(best, h * w)`,
      why: 'Without the sentinel, bars still on the stack at the end are never measured. The width comes from the index BELOW the popped one, not from the popped index itself.' },

    { q: 'Maximum of every window of size k.',
      base: 'The template only ever pops from one end.',
      change: 'A deque, popping from the back on value and from the front on position.',
      code: `while dq and xs[dq[-1]] <= x:
    dq.pop()                     # back: beaten by a newer, bigger value
dq.append(i)
if dq[0] <= i - k:
    dq.popleft()                 # front: fell out of the window`,
      why: 'Two different reasons to discard, so you need two ends. A stack cannot express expiry by position.' },

    { q: 'Previous SMALLER element instead of next greater.',
      base: 'The template keeps a decreasing stack and scans forward.',
      change: 'Flip the comparison, or scan backwards — decide which extreme you are tracking before writing the while.',
      code: `while stack and xs[stack[-1]] >= x:     # >= instead of <
    stack.pop()`,
      why: 'All four variants (next/previous × greater/smaller) are the same code with the comparison and direction flipped. Say which one you are building out loud, because it is easy to write the opposite by accident.' },

    { q: 'Trapping rain water.',
      base: 'A monotonic stack solves it by filling horizontal layers on each pop.',
      change: 'Two pointers with running maxima is shorter and easier to defend. Mention both, code the simpler one.',
      code: `if left_max < right_max:
    water += left_max - height[lo]; lo += 1
else:
    water += right_max - height[hi]; hi -= 1`,
      why: 'Both are O(n). Choosing the one you can explain under pressure is a real interview skill, and saying you know the other exists costs one sentence.' },
  ],

  'union-find': [
    { q: 'The nodes are email addresses, not integers.',
      base: 'The template indexes a parent array by integer.',
      change: 'Map each label to an index with a dict as you meet it. Choosing WHAT the nodes are is usually the real problem.',
      code: `idx = {}
def node(label):
    if label not in idx:
        idx[label] = len(idx)
        parent.append(idx[label]); size.append(1)
    return idx[label]`,
      why: 'In accounts-merge the nodes are emails, not accounts — unioning every email in a record is what merges the people. Getting the node choice right is most of the solution.' },

    { q: 'Find the edge that creates a cycle.',
      base: 'The template merges and reports groups.',
      change: 'Nothing structural — union() already returns False when both ends share a root.',
      code: `for u, v in edges:
    if not union(u, v):
        return [u, v]          # first edge that closes a loop`,
      why: 'The cycle detector is a by-product you already have. Adding a separate check would be duplicated logic that can disagree with itself.' },

    { q: 'The graph is directed.',
      base: 'The template merges symmetric sets, which has no notion of direction.',
      change: 'Union-Find does not apply. Use DFS with an in-progress set, or Kahn.',
      code: `# union(u, v) loses the fact that u -> v but not v -> u`,
      why: 'Recognising that a tool does not fit is worth as much as using it. Directed cycles need the ordering that Union-Find deliberately discards.' },

    { q: 'Weight the edges and connect everything as cheaply as possible.',
      base: 'The template answers connectivity questions.',
      change: 'Sort edges by weight and union greedily. That is Kruskal, and MST falls out.',
      code: `edges.sort(key=lambda e: e[2])
total = sum(w for u, v, w in edges if union(u, v))`,
      why: 'MST is greedy plus Union-Find, both of which you already have. Two lines on top of this template.' },
  ],

  'prefix': [
    { q: 'Now the queries are 2D — sums over a submatrix.',
      base: 'The template builds a one-dimensional running total.',
      change: 'A 2D table, and each query becomes four lookups with inclusion-exclusion.',
      code: `pre[r+1][c+1] = grid[r][c] + pre[r][c+1] + pre[r+1][c] - pre[r][c]
# query:
total = pre[r2+1][c2+1] - pre[r1][c2+1] - pre[r2+1][c1] + pre[r1][c1]`,
      why: 'The overlap is subtracted twice and must be added back — that final term is the one people drop. Draw the rectangle before coding it.' },

    { q: 'Ten thousand range UPDATES, then one read.',
      base: 'The template precomputes once and reads many times; every update would invalidate it.',
      change: 'Invert it. Mark the boundaries of each update, then sweep once at the end.',
      code: `diff[l] += v
diff[r + 1] -= v         # <- the +1 matters
# then one prefix pass turns diff into the final array`,
      why: 'Same idea, roles swapped: O(1) per update and O(n) once, rather than O(1) per query and O(n) once. Choose by which operation dominates.' },

    { q: 'Products instead of sums.',
      base: 'The template subtracts to remove a prefix.',
      change: 'You cannot divide when zeros exist, so build a prefix pass and a suffix pass and multiply.',
      code: `# left[i]  = product of everything before i
# right[i] = product of everything after i
answer[i] = left[i] * right[i]`,
      why: 'Division would be the obvious inverse, and the problem usually forbids it precisely because a single zero breaks it. Two passes sidestep the issue entirely.' },

    { q: 'Updates and queries are interleaved, thousands of each.',
      base: 'The template assumes the array is static between queries.',
      change: 'Prefix sums stop working. Say you would reach for a Fenwick or segment tree.',
      code: `# every update invalidates O(n) of the prefix table
# Fenwick: O(log n) update AND O(log n) query`,
      why: 'Naming the structure and its complexity is usually enough at interview level; you will rarely be asked to implement one. Knowing WHEN prefix sums break is the tested part.' },
  ],

  'trie': [
    { q: 'Return the top three suggestions for every prefix as the user types.',
      base: 'The template walks to a node, then searches the subtree below it.',
      change: 'Precompute the best three AT each node while inserting.',
      code: `node.setdefault('top', [])
if len(node['top']) < 3:
    node['top'].append(word)      # words inserted in sorted order`,
      why: 'A subtree walk per keystroke is far too slow for a search box. Storing the answer at the node makes each keystroke a single pointer move.' },

    { q: 'Support "." as a wildcard matching any character.',
      base: 'The template follows exactly one child per character.',
      change: 'On a wildcard, recurse into all children. The trie becomes a search space rather than a lookup.',
      code: `if ch == '.':
    return any(search(rest, child) for child in node.values())`,
      why: 'Worst case degrades towards scanning the dictionary, and saying that out loud is part of the answer.' },

    { q: 'Find every dictionary word hidden in a grid of letters.',
      base: 'The template answers queries about one word at a time.',
      change: 'Walk the grid with backtracking and the trie together, pruning the moment the current prefix leaves the trie.',
      code: `if ch not in node:
    return                    # <- the prune; this is the whole performance story`,
      why: 'Searching the grid once per word is hopeless. One traversal carrying the trie prunes dead branches immediately, which is why word search II is a trie problem rather than a backtracking one.' },

    { q: 'I only ever need exact membership.',
      base: 'The template pays for prefix structure you are not using.',
      change: 'Use a set.',
      code: `words = set(word_list)      # done`,
      why: 'A trie is more code, more memory and no faster for exact lookup. Saying so demonstrates judgement rather than pattern-matching.' },
  ],

  'fast-slow': [
    { q: 'Where does the cycle START?',
      base: 'The template detects that they meet, and stops there.',
      change: 'Reset one pointer to the head and advance both one step at a time. They meet at the entrance.',
      code: `slow = head
while slow is not fast:
    slow = slow.next
    fast = fast.next          # both at speed ONE now`,
      why: 'The distance from the head to the entrance equals the distance from the meeting point to the entrance, going round. It is worth knowing the result even if you cannot derive the proof under pressure.' },

    { q: 'Remove the nth node from the end.',
      base: 'The template uses two SPEEDS.',
      change: 'Two pointers at the same speed with a fixed GAP of n.',
      code: `for _ in range(n):
    fast = fast.next          # open the gap first
while fast:
    slow, fast = slow.next, fast.next`,
      why: 'Different problem, same family. When fast reaches the end, slow is exactly n from it — and a dummy head removes the "delete the head" special case.' },

    { q: 'Is this number "happy"? Repeatedly sum the squares of its digits.',
      base: 'The template walks node.next.',
      change: 'Replace the successor function. Everything else is identical.',
      code: `def nxt(n):
    return sum(int(d) ** 2 for d in str(n))
slow, fast = nxt(n), nxt(nxt(n))`,
      why: 'Any deterministic successor function defines a linked list. Recognising a number sequence as one is the entire point of these problems.' },

    { q: 'Is the linked list a palindrome, in O(1) space?',
      base: 'The template only locates a position.',
      change: 'Find the middle, reverse the second half in place, then walk both halves inwards.',
      code: `mid = find_middle(head)
second = reverse(mid)
# compare head..mid with second..end`,
      why: 'It composes two things you already know. Mention that you are mutating the input and could restore it afterwards — that is the part interviewers listen for.' },
  ],

  'greedy': [
    { q: 'Why sort by end time rather than start time?',
      base: 'The template sorts by whichever key you chose, and the choice is the solution.',
      change: 'Sort by END. Then state the exchange argument out loud.',
      code: `intervals.sort(key=lambda x: x[1])
# counterexample for sorting by START:
#   [0, 10], [1, 2], [3, 4]  ->  start-order keeps 1, end-order keeps 2`,
      why: 'Earliest end leaves the most room for everything after it. That counterexample takes ten seconds to produce and settles the question completely.' },

    { q: 'Prove your greedy is optimal.',
      base: 'The template produces an answer; it does not justify one.',
      change: 'Give the exchange argument: swapping the greedy choice into any optimal solution leaves it no worse.',
      code: `# if OPT does not take the earliest-ending compatible interval x,
# swap OPT's first interval for x. Still valid, same size.
# So some optimal solution contains x -- greedy is safe.`,
      why: 'An unjustified greedy reads as a guess that happened to work. The argument is three sentences and it is what makes the answer complete.' },

    { q: 'The greedy gives the wrong answer on this input.',
      base: 'The template assumes a local choice cannot cost you globally.',
      change: 'Abandon it for DP. Coin change with {1,3,4} and amount 6 is the standard demonstration.',
      code: `# greedy:  4 + 1 + 1 = 3 coins
# optimal: 3 + 3     = 2 coins`,
      why: 'Test greedy against a small adversarial case BEFORE committing. Discovering it at minute thirty costs the problem.' },

    { q: 'The best choice changes as items are consumed.',
      base: 'The template fixes an order up front by sorting once.',
      change: 'Keep the best choice current with a heap. Greedy and heap-topk merge here.',
      code: `while heap:
    count, task = heapq.heappop(heap)     # always the most urgent NOW
    ...
    heapq.heappush(heap, updated)`,
      why: 'Task scheduler and reorganise-string are both this shape: greedy in structure, heap in mechanism, because a static sort cannot express a changing priority.' },
  ],

  'kway': [
    { q: 'There are only two lists.',
      base: 'The template maintains a heap of k candidates.',
      change: 'Drop the heap. Two pointers, O(n).',
      code: `while i < len(a) and j < len(b):
    ...`,
      why: 'A heap of two is pure overhead. Reaching for the general tool when the specific one is simpler reads as pattern-matching without thinking.' },

    { q: 'Find the kth smallest element in a sorted matrix.',
      base: 'The template merges everything.',
      change: 'Pop only k times and stop — or binary search the VALUE range instead.',
      code: `for _ in range(k - 1):
    heapq.heappop(h); push_successor()
return h[0][0]
# alternative: binary search on value, count cells <= mid`,
      why: 'You never need the full merge for one element. The binary-search-on-value version is O(n log(range)) and often beats the heap on a large matrix.' },

    { q: 'Find the smallest range covering at least one number from each list.',
      base: 'The template only tracks the minimum, at the heap top.',
      change: 'Track the running MAXIMUM pushed so far alongside it; the range is max minus heap top.',
      code: `cur_max = max(cur_max, nxt_val)
if cur_max - h[0][0] < best_span:
    best = (h[0][0], cur_max)`,
      why: 'The heap gives you one end of the window for free; the other has to be carried. One extra variable turns the merge into a range search.' },
  ],

  'dijkstra': [
    { q: 'Some edges have negative weight.',
      base: 'The template settles a node permanently the moment it pops.',
      change: 'That assumption breaks. Use Bellman-Ford: relax every edge V−1 times.',
      code: `for _ in range(V - 1):
    for u, v, w in edges:
        dist[v] = min(dist[v], dist[u] + w)`,
      why: 'With a negative edge, a longer route can still get cheaper later, so "settled" is a lie. O(V·E) instead of O(E log V), and one more pass detects a negative cycle.' },

    { q: 'Every edge costs the same.',
      base: 'The template pays log V per operation to order the frontier by cost.',
      change: 'Use BFS. The queue is already in cost order when all costs are equal.',
      code: `q = deque([start])       # no heap needed at all`,
      why: 'O(V+E) instead of O(E log V), and much less code. Recognising the degenerate case is worth saying even if you then keep Dijkstra for generality.' },

    { q: 'The weights are only 0 and 1.',
      base: 'The template uses a heap to maintain cost order.',
      change: 'A deque does it: zero-weight edges go on the front, one-weight on the back.',
      code: `dq.appendleft(v) if w == 0 else dq.append(v)`,
      why: 'The deque stays sorted by distance for free, so you get O(V+E). This is the trick for grids where some moves are free.' },

    { q: 'The graph is time-dependent — a flight is only usable after you arrive.',
      base: 'The template treats an edge as always available at a fixed cost.',
      change: 'The label becomes "earliest arrival", and edges are filtered by departure time.',
      code: `if best[u] + MCT <= departure:
    best[v] = min(best[v], arrival)`,
      why: 'It still works because waiting is free, so arriving earlier is never worse. Say that assumption out loud — the whole correctness argument rests on it, and a "no waiting over four hours" constraint would break it.' },
  ],

  'quickselect': [
    { q: 'Would a heap not be simpler here?',
      base: 'The template partitions in place for expected O(n).',
      change: 'Often yes — use the heap and say why. Quickselect answers "can you beat O(n log k)", not "what is the obvious solution".',
      code: `heapq.nlargest(k, xs)        # O(n log k), no worst case, three words`,
      why: 'Quickselect has an O(n^2) worst case and mutates the input. Choosing the simpler tool and being able to justify the swap is the senior answer.' },

    { q: 'The input array must not be modified.',
      base: 'The template partitions in place, which reorders the caller\'s data.',
      change: 'Copy first, and declare the O(n) space that costs.',
      code: `xs = xs[:]        # and say that this is O(n) extra space`,
      why: 'In-place partitioning is intrinsic to the algorithm, so the copy is the only option. Naming the cost rather than hiding it is the point.' },

    { q: 'The data arrives as a stream and does not fit in memory.',
      base: 'The template needs random access to partition.',
      change: 'Back to a size-k heap, which only ever holds k items.',
      code: `# quickselect cannot run without the whole array in hand`,
      why: 'Streaming rules out anything that reorders the input. This is the constraint that makes the heap the right answer rather than the fallback.' },
  ],

  // ============================================================ techniques ==

  'sorting': [
    { q: 'Sort by length, then alphabetically for ties.',
      base: 'The template sorts by one key.',
      change: 'Return a tuple from the key function — tuples compare element by element.',
      code: `words.sort(key=lambda w: (len(w), w))`,
      why: 'No custom comparator needed, and the reading order of the tuple is the priority order of the keys.' },

    { q: 'Descending on one field, ascending on another.',
      base: 'The template sorts everything one way.',
      change: 'Negate the numeric field inside the tuple.',
      code: `items.sort(key=lambda x: (x.group, -x.score))`,
      why: 'Negation only works on numbers. For mixed directions on strings, exploit stability instead: sort by the secondary key first, then by the primary.' },

    { q: 'You must not lose the original positions.',
      base: 'The template reorders the data in place.',
      change: 'Sort the indices rather than the values.',
      code: `order = sorted(range(len(xs)), key=lambda i: xs[i])`,
      why: 'The answer often needs original indices — "return the index of" is the tell. Sorting values first throws away exactly the thing being asked for.' },
  ],

  'counting-sort': [
    { q: 'The values range up to 10^9.',
      base: 'The template allocates one bucket per possible value.',
      change: 'Do not. Either sort normally, or compress the coordinates first.',
      code: `# an array of 10^9 buckets to sort 100 items is absurd
vals = sorted(set(xs)); rank = {v: i for i, v in enumerate(vals)}`,
      why: 'Counting sort trades space for time, and the trade only pays while the range is comparable to n. Checking the range before reaching for it is the judgement being tested.' },

    { q: 'Sort objects by a small integer field, keeping equal ones in order.',
      base: 'The template counts values, which discards the objects.',
      change: 'Bucket the objects themselves, appending in input order.',
      code: `buckets = [[] for _ in range(k)]
for obj in items:
    buckets[obj.score].append(obj)     # stable by construction`,
      why: 'Appending in input order makes it stable for free, which matters when it is a pass inside radix sort.' },
  ],

  'recursion': [
    { q: 'The input is 10^5 deep and it crashes.',
      base: 'The template uses the call stack, which Python caps near a thousand frames.',
      change: 'An explicit stack, or raise the limit and justify it.',
      code: `import sys; sys.setrecursionlimit(10**6)   # quick, and say why it is safe
# or convert to an explicit stack, which always is`,
      why: 'Raising the limit works but risks a hard crash rather than a clean exception. Say which you chose and why — the interviewer is testing whether you noticed at all.' },

    { q: 'The same subproblem is being solved repeatedly.',
      base: 'The template recomputes every call.',
      change: 'One decorator. That is the entire step from recursion to DP.',
      code: `@lru_cache(None)
def solve(...):`,
      why: 'Memoised recursion IS dynamic programming. Framing it that way makes DP a one-line upgrade rather than a separate technique to fear.' },

    { q: 'The recursion is tail-recursive. Will Python optimise it?',
      base: 'The template assumes each call gets a frame.',
      change: 'No — Python has no tail-call optimisation. Rewrite as a loop.',
      code: `while cond:          # what the tail call was doing
    state = step(state)`,
      why: 'A deliberate language fact worth knowing. Any tail recursion converts mechanically to a while loop with no stack cost.' },
  ],

  'kadane': [
    { q: 'Every number is negative.',
      base: 'The template initialises cur and best from the first element.',
      change: 'Nothing — but only because of that initialisation. Starting from 0 returns 0, which is wrong.',
      code: `best = cur = xs[0]      # NOT best = 0`,
      why: 'The empty subarray is not usually allowed, so the answer should be the least negative element. This one-token difference is the classic Kadane bug.' },

    { q: 'Maximum PRODUCT instead of sum.',
      base: 'The template tracks a single running value.',
      change: 'Track the running minimum too — a negative times a negative becomes the new maximum.',
      code: `cur_max, cur_min = max(x, cur_max * x, cur_min * x), \\
                   min(x, cur_max * x, cur_min * x)`,
      why: 'Order matters: compute both from the OLD values, or the second line reads a variable you have already overwritten.' },

    { q: 'The array is circular.',
      base: 'The template assumes the subarray does not wrap.',
      change: 'Two cases: the normal Kadane maximum, or the total minus the minimum subarray.',
      code: `return max(kadane_max(xs), total - kadane_min(xs))
# guard: if every element is negative, the second case gives an empty array`,
      why: 'A wrapping subarray is exactly the complement of a non-wrapping one. The all-negative guard is the edge case that makes it correct.' },
  ],

  'index-as-storage': [
    { q: 'The array must not be modified.',
      base: 'The template writes its bookkeeping into the input.',
      change: 'The technique does not apply. Use a set or a count array, and pay the O(n) space.',
      code: `seen = set()      # the honest alternative`,
      why: 'Index-as-storage exists only to avoid that space. Remove the constraint and the trick has no purpose.' },

    { q: 'Values can be zero or negative.',
      base: 'The template negates values to mark them, which needs a sign to flip.',
      change: 'Negation breaks. Offset the values, or use cyclic sort, or accept a count array.',
      code: `# 0 has no sign to flip, so it can never be marked`,
      why: '"n numbers in the range 1..n" is the phrasing that licenses this technique. Outside that range, check before committing.' },
  ],

  'sentinel': [
    { q: 'The head node itself might be deleted.',
      base: 'The template returns head.',
      change: 'Return dummy.next instead — head may no longer be the head.',
      code: `return dummy.next        # NOT head`,
      why: 'This is the bug the dummy node creates if you forget it: the deletion works and the function returns the removed node anyway.' },

    { q: 'Bars are left on the stack when the histogram scan ends.',
      base: 'The template only pops when a smaller bar arrives.',
      change: 'Append a zero so every remaining bar is forced out.',
      code: `heights.append(0)        # nothing is shorter, so everything flushes`,
      why: 'Without it, the tallest trailing bars are never measured. One element removes an entire post-loop cleanup branch.' },
  ],

  'tabulation': [
    { q: 'The 2D table is too big for memory.',
      base: 'The template allocates the whole grid.',
      change: 'Keep only the rows the recurrence actually reads — usually one.',
      code: `prev, cur = cur, [0] * (n + 1)     # O(n) instead of O(m*n)`,
      why: 'Only possible once you can see which cells the recurrence touches, which is why memoisation comes first. It also destroys the ability to reconstruct the path.' },

    { q: 'I need the actual sequence, not just its length.',
      base: 'The rolling-array version has thrown away everything but the last row.',
      change: 'Keep the full table, or store parent pointers.',
      code: `# the space optimisation and path reconstruction are mutually exclusive`,
      why: 'Naming that trade-off is the answer to "can you do both?" — you cannot, and saying so is better than trying.' },

    { q: 'It gives the wrong answer and I cannot see why.',
      base: 'The template fills the table in a fixed order.',
      change: 'Check the iteration direction. Reading a cell before it is written fails silently.',
      code: `for c in range(cap, w - 1, -1):    # 0/1 knapsack: DOWNWARD
for c in range(w, cap + 1):        # unbounded: UPWARD`,
      why: 'This is the most common tabulation bug, and the two loops above are the same problem with opposite semantics.' },
  ],

  'knapsack': [
    { q: 'Each item may be used any number of times.',
      base: 'The template iterates capacity downward so each item is used once.',
      change: 'Iterate upward.',
      code: `for c in range(w, cap + 1):        # upward = reuse allowed`,
      why: 'Upward means the cell you read has already seen this item, so it can be taken again. One loop direction separates 0/1 from unbounded.' },

    { q: 'Can the set be split into two halves with equal sums?',
      base: 'The template maximises value under a capacity.',
      change: 'It is subset-sum in disguise: target = total / 2, and the value is a boolean.',
      code: `if total % 2: return False
dp = [False] * (total // 2 + 1); dp[0] = True
for x in nums:
    for c in range(target, x - 1, -1):
        dp[c] |= dp[c - x]`,
      why: 'Recognising partition, subset sum and coin change as one template is worth more than memorising three. The odd-total early exit is free.' },
  ],

  'bit-tricks': [
    { q: 'Every element appears three times except one.',
      base: 'XOR cancels PAIRS, so it does nothing useful against triples.',
      change: 'Count set bits per position and take them modulo 3.',
      code: `for b in range(32):
    if sum((x >> b) & 1 for x in xs) % 3:
        ans |= 1 << b`,
      why: 'The XOR trick is specific to pairs. Generalising to k copies means counting per bit position modulo k.' },

    { q: 'Write this in JavaScript instead.',
      base: 'The template assumes arbitrary-precision integers.',
      change: 'Every bitwise operator truncates to 32-bit signed. Guard anything above 2^31.',
      code: `1 << 31        // -2147483648 in JS, 2147483648 in Python
x >>> 0        // force unsigned interpretation`,
      why: 'Plain JS numbers are exact to 2^53, but bitwise operations are not — which makes hash and mask tricks fail silently on large values.' },
  ],

  'lru-cache': [
    { q: 'Implement it without OrderedDict.',
      base: 'The template leans on a language feature that does the ordering for you.',
      change: 'A dict for lookup plus a doubly linked list for order, with sentinel head and tail nodes.',
      code: `head <-> ... <-> tail          # sentinels remove every edge case
def _touch(node): _unlink(node); _push_front(node)`,
      why: 'This is the version usually asked for. The sentinels are what stop the unlink and insert code needing null checks — the same technique as a dummy head.' },

    { q: 'Make it LFU — least FREQUENTLY used — instead.',
      base: 'The template orders purely by recency.',
      change: 'Bucket by frequency, each bucket ordered by recency, and track the minimum frequency.',
      code: `freq[count] = OrderedDict()      # one recency list per frequency
min_freq = ...                   # so eviction is still O(1)`,
      why: 'Strictly harder, and the standard follow-up once LRU is done. Tracking min_freq is what keeps eviction constant rather than a scan.' },
  ],

  'coordinate-compression': [
    { q: 'The answer must be a real timestamp, not an index.',
      base: 'The template works entirely in compressed index space.',
      change: 'Keep the sorted value list and map back at the end.',
      code: `answer = vals[compressed_index]      # <- the inverse mapping`,
      why: 'Compression is a change of coordinates, not of the problem. Forgetting to invert it returns a rank where a value was asked for.' },

    { q: 'The gaps between values matter — I am summing durations.',
      base: 'The template replaces values with their rank, which discards distance.',
      change: 'Do not compress, or compress but carry the real widths alongside.',
      code: `width[i] = vals[i + 1] - vals[i]     # keep the true spacing`,
      why: 'Ranks preserve order and destroy magnitude. Any problem that measures length, area or duration needs the widths kept explicitly.' },
  ],

  'divide-conquer': [
    { q: 'Count the inversions in an array.',
      base: 'The template merges two halves and returns the merged list.',
      change: 'Count during the merge — every time you take from the right half, it jumps everything left in the left half.',
      code: `if a[i] <= b[j]:
    out.append(a[i]); i += 1
else:
    out.append(b[j]); j += 1
    inversions += len(a) - i        # <- the whole addition`,
      why: 'The merge already compares every cross-half pair implicitly. Counting there is free, which turns an O(n^2) count into O(n log n).' },

    { q: 'The halves are not independent — each depends on the other.',
      base: 'The template assumes each half can be solved alone.',
      change: 'It does not apply. Overlapping subproblems means DP.',
      code: `# if solve(left) needs solve(right), the recursion is not a division`,
      why: 'Independence is what makes the recurrence T(n) = 2T(n/2) + O(n) valid. Without it you are re-solving shared work and need a cache.' },
  ],

  'meet-in-middle': [
    { q: 'n is 40 and full enumeration times out.',
      base: 'Backtracking enumerates all 2^n subsets.',
      change: 'Split in half, enumerate 2^20 twice, then join with sorting or a hash map.',
      code: `A = subset_sums(xs[:20])              # 10^6, fine
B = sorted(subset_sums(xs[20:]))      # 10^6, fine
# then binary search B for each a in A`,
      why: '2^40 is a trillion; two lots of 2^20 is two million. The n ≈ 40 constraint is the tell, and naming the technique is usually enough.' },

    { q: 'n is 60.',
      base: 'The template halves the exponent.',
      change: 'Still 2^30 per half — a billion. Too slow. Look for a polynomial structure instead.',
      code: `# halving the exponent buys you roughly double the n, not ten times`,
      why: 'Knowing the ceiling of a technique matters as much as knowing the technique. Meet in the middle roughly doubles the feasible n and no more.' },
  ],

  'expand-centre': [
    { q: 'Count all palindromic substrings, not just the longest.',
      base: 'The template keeps the best result.',
      change: 'Count every successful expansion instead of comparing lengths.',
      code: `while l >= 0 and r < len(s) and s[l] == s[r]:
    total += 1                # <- each valid expansion IS a palindrome
    l -= 1; r += 1`,
      why: 'Every step outward that still matches is one more palindrome centred there. Same loop, a counter instead of a max.' },

    { q: 'O(n^2) is too slow — n is 10^5.',
      base: 'The template tries all 2n−1 centres, each expanding up to n.',
      change: "Manacher's algorithm gets O(n). Name it, and say you would look it up rather than reconstruct it under pressure.",
      code: `# Manacher reuses previously computed radii to skip re-comparison`,
      why: 'Honesty about what you would look up is better received than a half-remembered attempt. It is rarely required at interview level.' },
  ],

  'bitmask-enum': [
    { q: 'Also give me the subsets of each subset.',
      base: 'The template iterates 0 to 2^n − 1 once.',
      change: 'Enumerate submasks with a subtraction trick, which is O(3^n) overall rather than O(4^n).',
      code: `sub = mask
while sub:
    ...
    sub = (sub - 1) & mask       # next submask of mask`,
      why: 'The naive double loop over all masks and all masks is 4^n. This trick visits only actual submasks, and 3^n is the exact total.' },

    { q: 'n is 25.',
      base: 'The template loops 2^n times.',
      change: '2^25 is 33 million — borderline. 2^30 is a billion and out of reach. Check the constraint before committing.',
      code: `# n <= 20 is comfortable, 25 is borderline, 30 is not happening`,
      why: 'The exponent is the whole budget. Knowing where it stops being viable is what stops you writing a solution that cannot finish.' },
  ],

  'bitmask-dp': [
    { q: 'The tour must return to the start (travelling salesman).',
      base: 'The template stops when every node is visited.',
      change: 'Add the return edge cost at the base case.',
      code: `if mask == FULL:
    return cost[pos][start]     # <- close the loop`,
      why: 'A Hamiltonian path becomes a cycle by charging the way home. One line, and it is the difference between the path and the tour variants.' },

    { q: 'n is 22 — will n·2^n fit?',
      base: 'The template caches one entry per (mask, position).',
      change: '22 × 4 million is 92 million states. Too many. Fifteen or so is the practical ceiling.',
      code: `# states = n * 2^n  ->  n=15: 500k (fine), n=22: 92M (no)`,
      why: 'Bitmask DP is the answer to a small-n exponential problem, not to a large one. Compute the state count before you start.' },
  ],

  'interval-dp': [
    { q: 'Burst balloons — the value depends on the neighbours that survive.',
      base: 'The template splits a range and combines the halves.',
      change: 'Think of the LAST balloon burst in the range, not the first. Then its neighbours are exactly the range boundaries.',
      code: `dp[i][j] = max(dp[i][k] + nums[i-1]*nums[k]*nums[j+1] + dp[k+1][j])
#                       ^ k is the LAST one burst in (i, j)`,
      why: 'Choosing the first burst leaves an unknown neighbour; choosing the last makes both neighbours fixed by the range. That reframing is the entire problem.' },

    { q: 'It reads cells that are still zero.',
      base: 'The template iterates by increasing range LENGTH.',
      change: 'Nothing — but only because of that order. Looping i then j reads sub-ranges that have not been filled.',
      code: `for length in range(2, n + 1):    # <- outermost, not i`,
      why: 'Every dp[i][j] depends on strictly shorter ranges, so shorter ones must be computed first. The loop order encodes the dependency.' },
  ],

  'lis-patience': [
    { q: 'Non-decreasing instead of strictly increasing.',
      base: 'The template uses bisect_left, which replaces an equal value.',
      change: 'Use bisect_right, so an equal value extends rather than replaces.',
      code: `i = bisect.bisect_right(tails, x)     # was bisect_left`,
      why: 'One function name, and it flips strict to non-strict. Worth knowing which is which rather than guessing under pressure.' },

    { q: 'Return the actual subsequence, not its length.',
      base: 'The template keeps only the smallest tail per length, which is not a real subsequence.',
      change: 'Record a parent index each time you place a value, then walk the chain back.',
      code: `parent[i] = tails_index[len(tails) - 1] if tails else -1`,
      why: 'The tails array is a bookkeeping device, not an answer. Being asked to reconstruct is the standard follow-up and it needs extra state.' },
  ],

  'zero-one-bfs': [
    { q: 'The weights are 0, 1 and 2.',
      base: 'The template puts weight-0 on the front and weight-1 on the back, which keeps the deque sorted.',
      change: 'Three distinct weights break that. Back to Dijkstra — or split a weight-2 edge into two weight-1 edges through a dummy node.',
      code: `# u --2--> v   becomes   u --1--> dummy --1--> v`,
      why: 'The deque trick works only because there are exactly two possible distances in flight. Edge splitting is a neat way to preserve it.' },
  ],

  'bellman-ford': [
    { q: 'Is there a negative cycle?',
      base: 'The template relaxes every edge V−1 times, after which all shortest paths are settled.',
      change: 'Run one more pass. Any further improvement proves a negative cycle exists.',
      code: `for u, v, w in edges:
    if dist[u] + w < dist[v]:
        return True          # <- improved after V-1 rounds`,
      why: 'No simple path has more than V−1 edges, so nothing legitimate can improve on round V. Currency arbitrage is exactly this question.' },

    { q: 'At most k edges may be used.',
      base: 'The template runs V−1 rounds and lets paths grow freely.',
      change: 'Run exactly k rounds — and relax from a SNAPSHOT of the previous round, or one round can chain several edges.',
      code: `for _ in range(k):
    prev = dist[:]            # <- snapshot, or paths use >k edges
    for u, v, w in edges:
        dist[v] = min(dist[v], prev[u] + w)`,
      why: 'Round i of Bellman-Ford naturally means "shortest path using at most i edges", which makes the k-edge variant almost free — as long as you do not read your own writes.' },
  ],

  'mst': [
    { q: 'The graph is dense — n^2 edges.',
      base: 'Kruskal sorts every edge, which is O(E log E).',
      change: "Prim with a heap is O(E log V) and avoids sorting the whole edge list.",
      code: `# Kruskal: sort E edges       -- best on sparse graphs
# Prim:    grow one tree      -- best on dense graphs`,
      why: 'Both are correct; the choice is about E relative to V. Kruskal is the one to write because you already have greedy and Union-Find.' },

    { q: 'Some nodes must not be connected to each other.',
      base: 'The template connects everything into one tree.',
      change: 'Stop after the required number of unions, leaving a forest of k components.',
      code: `# stop at V - k successful unions instead of V - 1`,
      why: 'A minimum spanning forest is an MST stopped early. The greedy order means the k−1 most expensive edges are the ones you skip.' },
  ],

  'floyd-warshall': [
    { q: 'Detect a negative cycle with it.',
      base: 'The template fills the all-pairs distance table.',
      change: 'Check the diagonal afterwards — a negative d[i][i] means i sits on a negative cycle.',
      code: `any(d[i][i] < 0 for i in range(n))`,
      why: 'A path from i back to i with negative total is precisely a negative cycle through i. One line after the triple loop.' },

    { q: 'I only need paths from one source.',
      base: 'The template computes all V^2 pairs.',
      change: 'Use Dijkstra from that source. O(E log V) instead of O(V^3).',
      code: `# Floyd-Warshall pays for V^2 answers; do not buy them for one`,
      why: 'All-pairs is only worth it when you genuinely need all pairs, or V is small enough that n^3 is comfortable.' },
  ],

  'cycle-directed': [
    { q: 'The graph is undirected instead.',
      base: 'The template uses grey to detect a back edge into the current path.',
      change: 'In an undirected graph every edge looks like a back edge to its own parent. Track the parent and skip it — or use Union-Find.',
      code: `for v in g[u]:
    if v == parent:
        continue          # the edge you arrived by is not a cycle`,
      why: 'Without the parent check, every single edge reports a false cycle. Union-Find is the cleaner answer for undirected connectivity.' },

    { q: 'I only need yes or no, not the cycle itself.',
      base: 'The template colours nodes and recurses.',
      change: 'Kahn is simpler: count what you emit and compare to V.',
      code: `return len(order) != n        # fewer emitted -> a cycle exists`,
      why: 'No recursion, no colours, no stack-depth risk. The three-colour DFS earns itself when you need to report which nodes form the cycle.' },
  ],

  'rolling-hash': [
    { q: 'Two different substrings hashed the same.',
      base: 'The template compares hashes and treats a match as a match.',
      change: 'Verify the characters on a hash hit, or use two independent moduli.',
      code: `if h_window == h_target and s[i-k:i] == target:   # <- verify`,
      why: 'A collision makes the answer wrong, not slow. Saying that unprompted is the thing being tested; verification costs O(k) only on hits.' },

    { q: 'Find the longest duplicated substring.',
      base: 'The template hashes windows of one fixed length.',
      change: 'Binary search the LENGTH, using the rolling hash as the feasibility check.',
      code: `# can(L) = "some substring of length L appears twice"
# monotonic in L, so binary search it`,
      why: 'Two patterns composed: binary search on the answer, with rolling hash as the predicate. O(n log n) instead of O(n^2).' },
  ],

  'lazy-deletion': [
    { q: 'The heap is growing to O(E) and I am worried about memory.',
      base: 'The template pushes an updated entry and abandons the old one.',
      change: 'Usually accept it — E entries of two numbers is cheap. If it truly matters, use an indexed heap with decrease-key.',
      code: `# stale entries are discarded on pop, not on push
if d > dist[u]:
    continue`,
      why: 'log E and log V differ by a constant factor, so the simpler code almost always wins. Knowing decrease-key exists is enough.' },

    { q: 'How do I know a popped entry is stale?',
      base: 'The template compares the popped distance against the recorded one.',
      change: 'Nothing — but the recorded value must be updated at PUSH time, not at pop, or the check has nothing to compare against.',
      code: `dist[v] = nd                  # record when you push
heapq.heappush(h, (nd, v))`,
      why: 'If you only write dist on pop, every duplicate entry looks current and the algorithm degrades to exponential re-expansion.' },
  ],
};
