/* Base knowledge: the things that are true across every problem. */
window.BASE = {
  loop: {
    title: 'How a round actually runs',
    note: 'Same five beats every time. Interviewers score the beats, not just the answer -- most lost points are here, not in the algorithm.',
    steps: [
      ['1. Clarify', 'Ask before assuming. Boundary conditions, input size, format, what to return when there is no answer. Two to four questions, then stop.'],
      ['2. Example', 'Restate with a concrete small example. Catches misunderstandings while they are still free.'],
      ['3. Approach + complexity', 'Say the approach AND the complexity out loud BEFORE typing. If you have a brute force and a better idea, say both and why you are picking one.'],
      ['4. Code', 'Narrate while writing. Silence for 90 seconds reads as stuck. Write once, top to bottom.'],
      ['5. Trace + edges', 'Walk your own example through the finished code. Then speak the edge cases; code only the cheap ones.'],
    ],
  },

  constraints: {
    title: 'Read the constraint, pick the complexity',
    note: 'The input size tells you the intended solution before you have thought of it. This table is worth memorising -- it turns "what should I try?" into a lookup.',
    rows: [
      ['n <= 12', 'O(n!)', 'Permutations. Backtracking, brute-force orderings.'],
      ['n <= 20', 'O(2^n)', 'Subsets, bitmask DP.'],
      ['n <= 500', 'O(n^3)', 'Floyd-Warshall, triple loop, interval DP.'],
      ['n <= 5,000', 'O(n^2)', 'Nested loops, classic 2D DP.'],
      ['n <= 10^5 .. 10^6', 'O(n log n)', 'Sort, heap, binary search, sweep. THE most common target.'],
      ['n <= 10^7', 'O(n)', 'Single pass, hash map, two pointers, prefix sums.'],
      ['n up to 10^9+', 'O(log n) or O(1)', 'Binary search on the answer, or maths.'],
    ],
  },

  python: {
    title: 'Python toolkit (interview language)',
    note: 'Everything below is standard library. Nothing outside it will be available -- no sortedcontainers, no numpy.',
    rows: [
      ['heapq', 'heappush(h, x), heappop(h), h[0] is the MIN. For a max-heap push -x. heapify(list) is O(n).'],
      ['collections.deque', 'appendleft/popleft in O(1). Use for BFS queues and sliding windows. A plain list pop(0) is O(n) -- a real bug.'],
      ['defaultdict(list)', 'Adjacency lists without key checks: g[u].append(v).'],
      ['Counter', 'Frequency maps in one line. .most_common(k) for top-k.'],
      ['bisect', 'bisect_left / insort on a sorted list. This is your stand-in for a TreeMap.'],
      ['functools.lru_cache', '@lru_cache(None) above a recursive function is instant memoisation.'],
      ['sort(key=...)', 'sorted(xs, key=lambda x: (x[1], -x[0])). Tuples sort element-wise -- free tie-breaking.'],
      ['Prefer explicit branches', 'dict.get(k, default) and dict.setdefault(k, v) are compact and hide a branch. In this repo we write `if k in d:` or use defaultdict, because a reader should never have to decode syntax to follow the algorithm.'],
      ['No comprehensions here', 'Every list/dict comprehension and generator expression on this site is written as a loop that appends. `sum(w for u, v, w in edges if union(u, v))` is one line and three ideas; the loop is four lines and one idea at a time. Learn the compressed forms AFTER the patterns are automatic.'],
      ['No loop else, no chained assignment', '`for ... else` runs the else only when the loop did NOT break, which almost nobody recalls under pressure -- use an explicit flag. `i = j = 0` is split into two lines for the same reason.'],
      ['Ints are arbitrary precision', 'No overflow, ever. One less thing to reason about than C++ or Java.'],
      ['Recursion cap ~1000', 'sys.setrecursionlimit(10**6) or go iterative. A recursive DFS over 10^5 nodes WILL crash.'],
    ],
  },

  js: {
    title: 'JS / TS toolkit (for the front-end round)',
    note: 'You will still code the front-end round in JS. These are the gaps and traps that cost points.',
    rows: [
      ['No heap, no sorted map', 'Must hand-roll a binary heap. No TreeMap/TreeSet equivalent at all.'],
      ['sort() is lexicographic', '[10,9,100].sort() gives [10,100,9]. ALWAYS sort((a,b) => a-b).'],
      ['Bitwise is 32-bit signed', '1 << 31 goes negative. Plain numbers are exact only to 2^53.'],
      ['No integer division', 'Math.floor(a/b). The (a/b)|0 trick breaks past 2^31.'],
      ['Recursion ~10^4 frames', 'Iterative DFS on any large graph.'],
      ['Map keeps insertion order', 'A genuine advantage -- LRU cache becomes almost free.'],
      ['Objects stringify keys', 'obj[1] and obj["1"] are the same key. Use Map for non-string keys.'],
    ],
  },
};
