/* Animations, batch H: the last 27. Graph algorithms, caching, hashing, Kadane.
 * With this file the debt list reaches zero.
 */
Object.assign(window.ANIMS, {

  // ================================================================ kadane ==

  'kadane/0': {
    title: 'All negative: [-3, -1, -4] and why you must not start at 0',
    contrast: 'The base initialises from xs[0]. Starting from 0 looks harmless and silently returns 0.',
    cells: [-3, -1, -4],
    frames: [
      { mark: [0], stat: 'best = cur = xs[0] = -3', note: 'Initialising from the first element, as the template does.' },
      { mark: [1], stat: 'cur = max(-1, -3 + -1) = -1   best = -1', note: 'Restarting beats extending. The best subarray is the least-bad single element.' },
      { mark: [2], stat: 'cur = max(-4, -1 + -4) = -4   best = -1', note: 'Answer -1, which is correct: the empty subarray is not allowed.' },
      { stat: 'now start from 0 instead', note: 'best = 0, cur = 0 — the version that looks tidier.' },
      { stat: 'every cur goes negative, so best stays 0', note: 'Returns 0, claiming an empty subarray. Wrong, and it passes every test with a positive number in it.' },
      { stat: 'one token, and it fails silently', note: 'If the problem DOES allow the empty subarray, 0 is right — so read the statement and say which you assumed.' },
    ],
  },

  'kadane/1': {
    title: 'Maximum PRODUCT: track the minimum too, because negatives flip',
    contrast: 'The base keeps one running value. With products a negative times a negative becomes the new maximum.',
    cells: [2, -3, -4],
    frames: [
      { mark: [0], stat: 'cur_max = 2   cur_min = 2', note: 'Two running values now. The minimum is tracked because it is a candidate for becoming the maximum.' },
      { mark: [1], stat: 'x = -3:  2 x -3 = -6', note: 'cur_max = max(-3, -6, -6) = -3.  cur_min = min(-3, -6, -6) = -6.' },
      { mark: [1], stat: 'cur_max = -3   cur_min = -6', note: 'The maximum is negative, which is fine. What matters is that -6 has been remembered.' },
      { mark: [2], stat: 'x = -4:  -6 x -4 = 24', note: 'The stored MINIMUM produces the new maximum. Tracking only the max would have missed 24 entirely.' },
      { mark: [0, 1, 2], stat: 'cur_max = 24   answer 24', note: 'The subarray is the whole array: 2 x -3 x -4.' },
      { stat: 'and compute both from the OLD values', note: 'Assigning cur_max first and then reading it for cur_min uses a value that has already changed. That was a real bug in this repo.' },
    ],
  },

  'kadane/2': {
    title: 'Circular array [5, -3, 5]: the answer wraps',
    contrast: 'The base assumes the subarray does not wrap. A circular one is the COMPLEMENT of a non-wrapping one.',
    cells: [5, -3, 5],
    frames: [
      { mark: [0], stat: 'normal Kadane: best non-wrapping = 5', note: 'Either single 5. Extending across -3 gives 7 — actually better, so best is 7.' },
      { mark: [0, 1, 2], stat: 'non-wrapping best = 7  (the whole array)', note: 'Total is 7, and no strict subarray beats it.' },
      { mark: [1], stat: 'now the wrapping case', note: 'A wrapping subarray leaves out a contiguous middle chunk. So maximise what you keep by MINIMISING what you drop.' },
      { mark: [1], stat: 'minimum subarray = -3', note: 'Run Kadane for the minimum instead. The worst middle chunk is just the -3.' },
      { mark: [0, 2], stat: 'total - min = 7 - (-3) = 10', note: 'Dropping -3 leaves 5 + 5 = 10, wrapping around the end. That beats the non-wrapping 7.' },
      { stat: 'guard: if all negative, skip case 2', note: 'The minimum subarray would be the whole array, leaving an empty one. Answer max(7, 10) = 10 here.' },
    ],
  },

  // ============================================================ tabulation ==

  'tabulation/2': {
    title: 'Reconstructing the path needs the table you just deleted',
    contrast: 'The base collapsed to two rows. Reconstruction reads cells from every row, so the two goals cannot both be met.',
    cells: [0, 1, 2, 3],
    label: 'dp row:',
    frames: [
      { range: [0, 3], stat: 'rolling rows: O(n) space, answer correct', note: 'The length or the cost comes out right. That part is untouched.' },
      { stat: '"which edits did you make?"', note: 'The standard follow-up. Answering it means walking backwards through the decisions.' },
      { mark: [2], stat: 'to walk back you need dp[i-1], dp[i-2], ...', note: 'Reconstruction reads cells from every earlier row, and those rows were overwritten.' },
      { stat: 'so: keep the full table, O(m x n)', note: 'Option A. Space returns to the unoptimised figure and the path falls out of the table.' },
      { stat: 'or: store parent pointers', note: 'Option B. Record which of the three moves each cell chose. Still O(m x n) space, but smaller per cell.' },
      { stat: 'they are mutually exclusive — say so', note: '"Can you do both?" You cannot, and naming the trade is a better answer than attempting it.' },
    ],
  },

  // =========================================================== zero-one-bfs ==

  'zero-one-bfs': {
    title: 'Weights 0 and 1: a deque replaces the heap',
    cells: ['S', 'A', 'B', 'T'],
    label: 'nodes:',
    frames: [
      { stat: 'S-A 0,  S-B 1,  A-T 1,  B-T 0', note: 'Only two possible weights. That is the precondition, and it is what makes the heap unnecessary.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'deque [S]   dist S = 0', note: 'The invariant: the deque holds at most two distinct distances at any moment, d and d+1.' },
      { mark: [1], stat: 'S->A weight 0  ->  appendLEFT.  deque [A]', note: 'A is at the same distance as S, so it must be processed before anything further away. Front of the deque.' },
      { mark: [2], stat: 'S->B weight 1  ->  append.  deque [A, B]', note: 'B is strictly further, so it goes to the back. Two distances in the deque, in order.' },
      { ptrs: { at: 1 }, mark: [1], stat: 'pop A (dist 0), relax T = 0 + 1 = 1', note: 'Processing in distance order with no comparisons at all.' },
      { ptrs: { at: 3 }, mark: [3], stat: 'answer dist[T] = 1', note: 'O(V+E) rather than O(E log V). A third weight and the invariant breaks — back to Dijkstra.' },
    ],
  },

  'zero-one-bfs/0': {
    title: 'A weight of 2 breaks the deque — or gets split in half',
    contrast: 'The base relies on there being exactly two distances in flight. A third weight destroys that.',
    cells: ['u', 'mid', 'v'],
    label: 'nodes:',
    frames: [
      { mark: [0, 2], stat: 'edge u -> v with weight 2', note: 'The deque has nowhere to put it: not the front (same distance) and not the back (distance + 1).' },
      { stat: 'appending it anyway breaks the ordering', note: 'Nodes come out of order, distances get finalised too early, and the answers are wrong.' },
      { mark: [1], stat: 'fix A: split into u -> mid -> v, each weight 1', note: 'Insert a dummy node. Two unit edges are equivalent to one edge of weight 2.' },
      { mark: [0, 1, 2], stat: 'now every weight is 0 or 1 again', note: 'The invariant is restored, and 0-1 BFS applies unchanged. Costs one extra node per split edge.' },
      { stat: 'fix B: just use Dijkstra', note: 'O(E log V) and no graph surgery. Splitting pays when weights are small integers and E is large.' },
      { stat: 'the tell is the weight SET', note: 'Not the range — the set. {0, 1} means deque; {0, 1, 2} means either split or heap.' },
    ],
  },

  // =========================================================== bellman-ford ==

  'bellman-ford': {
    title: 'Negative edges: relax everything V-1 times',
    cells: ['S', 'A', 'B'],
    label: 'nodes:',
    frames: [
      { stat: 'S-A 2,  S-B 5,  B-A -4.  V = 3', note: 'Dijkstra would settle A at 2 and never revisit it. The true answer is 1, via B.' },
      { mark: [0], stat: 'dist S=0, A=INF, B=INF', note: 'No priority queue and no settling. Every edge is simply relaxed, repeatedly.' },
      { mark: [1, 2], stat: 'round 1: A=2, B=5', note: 'One pass over all edges. Order within a pass does not matter for correctness, only for how fast it converges.' },
      { mark: [1], stat: 'round 2: B-A gives 5 - 4 = 1  <  2  ->  A=1', note: 'The improvement Dijkstra could not make, because nothing was ever declared final.' },
      { stat: 'V-1 = 2 rounds, and we are done', note: 'No simple path has more than V-1 edges, so V-1 rounds is enough for every shortest path to settle.' },
      { stat: 'O(V x E)', note: 'Much slower than Dijkstra. Only reach for it when weights can be negative — and say WHY Dijkstra fails, because that is the point being tested.' },
    ],
  },

  'bellman-ford/0': {
    title: 'One extra round proves a negative cycle',
    contrast: 'The base stops after V-1 rounds. Running one more turns the algorithm into a detector.',
    cells: ['A', 'B', 'C'],
    label: 'nodes:',
    frames: [
      { stat: 'A-B 1,  B-C -3,  C-A 1.  Cycle total = -1', note: 'Going round the loop reduces the distance every time. There is no shortest path at all.' },
      { mark: [0, 1, 2], stat: 'after V-1 = 2 rounds: dist settled?', note: 'With no negative cycle, nothing can improve after V-1 rounds. That is the guarantee being tested.' },
      { mark: [1], stat: 'round 3: B improves again', note: 'An improvement after V-1 rounds is impossible for any simple path. So the improving path must repeat a node.' },
      { stat: 'a repeated node in a shorter path = negative cycle', note: 'That is the proof. One extra pass, one boolean, no new machinery.' },
      { stat: 'currency arbitrage is this question', note: 'Take logs of exchange rates and negate them; a profitable loop becomes a negative cycle.' },
      { stat: 'return True on any improvement', note: 'Five lines on top of the template you already wrote.' },
    ],
  },

  'bellman-ford/1': {
    title: 'At most k edges: snapshot the row, or paths chain',
    contrast: 'The base runs V-1 rounds and lets paths grow freely. Bounding the edge count needs one extra line.',
    cells: ['S', 'A', 'B', 'T'],
    label: 'nodes:',
    frames: [
      { stat: 'round i means "using at most i edges"', note: 'That is already what Bellman-Ford computes, which makes the k-edge variant nearly free.' },
      { stat: 'so run exactly k rounds, not V-1', note: 'One change to a loop bound.' },
      { mark: [1], stat: 'round 1: relax S->A.  dist[A] = 5', note: 'One edge used.' },
      { mark: [1, 2], stat: 'same round: A->B reads the NEW dist[A]', note: 'Without care, this uses two edges inside a single round. The bound is silently violated.' },
      { mark: [1, 2], stat: 'fix: prev = dist[:] at the top of each round', note: 'Relax from a SNAPSHOT. Now every relaxation in round i reads only values from round i-1.' },
      { stat: 'one line, and the bound holds', note: 'Reading your own writes is the whole bug. This is the same class of error as knapsack loop direction.' },
    ],
  },

  // =================================================================== mst ==

  'mst': {
    title: 'Kruskal: sort the edges, union greedily',
    cells: [1, 2, 3, 4],
    label: 'edge weights, sorted:',
    frames: [
      { stat: '4 nodes, edges of weight 1, 2, 3, 4', note: 'A spanning tree on 4 nodes has exactly 3 edges. The question is which three.' },
      { mark: [0], stat: 'weight 1: union succeeds  ->  take.  total 1', note: 'Cheapest first. Union-Find answers "would this create a cycle?" in near-constant time.' },
      { mark: [0, 1], stat: 'weight 2: union succeeds  ->  total 3', note: 'Still connecting separate components, so still safe.' },
      { mark: [2], stat: 'weight 3: union returns FALSE  ->  skip', note: 'Both endpoints already share a root. Adding it would make a cycle and cannot reduce the total.' },
      { mark: [0, 1, 3], stat: 'weight 4: union succeeds  ->  total 7', note: 'Three successful unions, so the tree is complete and you can stop early.' },
      { stat: 'Kruskal = sort + greedy + Union-Find', note: 'All three already on the site. MST is two lines on top of a template you have, which is why it is the version to write.' },
    ],
  },

  'mst/0': {
    title: 'Dense graph: Prim grows one tree instead of sorting all edges',
    contrast: 'Kruskal sorts every edge. When E is near V^2 that sort dominates, and growing a single tree is cheaper.',
    cells: ['A', 'B', 'C', 'D'],
    label: 'nodes:',
    frames: [
      { stat: 'V = 4, E = 6 (complete graph)', note: 'Kruskal sorts 6 edges here. At V = 1000 it would sort half a million.' },
      { mark: [0], stat: 'Prim: start anywhere, tree = {A}', note: 'No global sort. Instead, repeatedly take the cheapest edge LEAVING the tree.' },
      { mark: [0, 1], stat: 'cheapest edge from {A}  ->  add B', note: 'A heap of candidate edges, seeded from the starting node.' },
      { mark: [0, 1, 2], stat: 'cheapest from {A,B}  ->  add C', note: 'The frontier grows and new candidate edges are pushed as nodes join.' },
      { mark: [0, 1, 2, 3], stat: 'V-1 edges added, done', note: 'Same total weight as Kruskal — MSTs are unique in weight even when the edge sets differ.' },
      { stat: 'Kruskal O(E log E), Prim O(E log V)', note: 'Both correct. The choice is E relative to V, and Kruskal is the one to write because you already have its parts.' },
    ],
  },

  'mst/1': {
    title: 'A spanning FOREST: stop early and leave k components',
    contrast: 'The base connects everything into one tree. Stopping sooner is the entire adaptation.',
    cells: [1, 2, 3, 4],
    label: 'edge weights, sorted:',
    frames: [
      { stat: 'V = 4, want k = 2 groups', note: '"Split into k clusters as cheaply as possible" is this question in disguise.' },
      { mark: [0], stat: 'take weight 1  ->  3 components', note: 'Each successful union reduces the component count by one.' },
      { mark: [0, 1], stat: 'take weight 2  ->  2 components', note: 'Two components reached. This is the target.' },
      { mark: [2, 3], stat: 'STOP. Do not take 3 or 4.', note: 'V - k = 2 successful unions instead of V - 1 = 3. One changed bound.' },
      { stat: 'total 3, and the two groups are the clusters', note: 'Because edges were taken cheapest-first, the ones NOT taken are the k-1 most expensive — the natural cluster boundaries.' },
      { stat: 'single-linkage clustering is this', note: 'The same algorithm under a different name, which is worth mentioning if the problem is framed as clustering.' },
    ],
  },

  // ======================================================== floyd-warshall ==

  'floyd-warshall': {
    title: 'All pairs, three loops, k on the OUTSIDE',
    cells: ['A', 'B', 'C'],
    label: 'nodes:',
    frames: [
      { stat: 'A-B 4,  B-C 2,  A-C 9', note: 'Direct A to C is 9. Going through B is 4 + 2 = 6.' },
      { stat: 'd[i][j] = direct edge, or INF', note: 'Start from the adjacency matrix. Every pair is initialised to its direct edge.' },
      { mark: [1], stat: 'k = B: is i -> B -> j better than i -> j?', note: 'k is the INTERMEDIATE node, and it is the outermost loop. That ordering is the whole algorithm.' },
      { mark: [0, 2], stat: 'd[A][C] = min(9, d[A][B] + d[B][C]) = 6', note: 'One improvement, found by allowing B as a stepping stone.' },
      { stat: 'after all k: every pair is final', note: 'Meaning: "shortest path using only the first k nodes as intermediates". After k = V, all intermediates are allowed.' },
      { stat: 'k innermost  ->  plausible WRONG answers', note: 'The DP semantics depend on k being outermost. Any other nesting computes something that is not shortest paths, and it does not crash.' },
    ],
  },

  'floyd-warshall/0': {
    title: 'A negative diagonal means a negative cycle',
    contrast: 'The base fills the all-pairs table. One check afterwards turns it into a detector.',
    cells: ['A', 'B', 'C'],
    label: 'nodes:',
    frames: [
      { stat: 'd[i][i] should be 0', note: 'The cost of going from a node to itself, using no edges at all.' },
      { mark: [0, 1, 2], stat: 'A-B 1, B-C -3, C-A 1', note: 'The loop totals -1, so going round it reduces your distance.' },
      { mark: [0], stat: 'after the triple loop: d[A][A] = -1', note: 'A path from A back to A with negative total. Floyd-Warshall found it without being asked.' },
      { stat: 'any(d[i][i] < 0)', note: 'One line after the loops. A negative d[i][i] IS a negative cycle through i, by definition.' },
      { stat: 'and it tells you WHICH nodes', note: 'Better than Bellman-Ford\'s boolean: the diagonal names every node lying on a negative cycle.' },
      { stat: 'at the cost of O(V^3)', note: 'Only worth it if you wanted all pairs anyway. For one source, Bellman-Ford is far cheaper.' },
    ],
  },

  'floyd-warshall/1': {
    title: 'One source only: do not buy V^2 answers',
    contrast: 'The base computes every pair. If you need one row of that table, almost all of the work is waste.',
    cells: [100, 500, 1000],
    label: 'V:',
    frames: [
      { mark: [0], stat: 'V = 100:  V^3 = 10^6', note: 'Trivial. At this size Floyd-Warshall is fine even for a single source.' },
      { mark: [1], stat: 'V = 500:  1.25 x 10^8', note: 'The upper limit, and the constraint that signals all-pairs is intended.' },
      { mark: [2], stat: 'V = 1000:  10^9', note: 'Too slow. And if E is small, Dijkstra from one source is O(E log V) — perhaps 10^4 operations.' },
      { stat: 'one source: Dijkstra', note: 'Five orders of magnitude cheaper on a sparse graph. Computing V^2 answers to read V of them is the waste.' },
      { stat: 'all pairs on a sparse graph: Dijkstra V times', note: 'O(V E log V), which still beats V^3 when E is much smaller than V^2. Worth naming as the middle option.' },
    ],
  },

  // ======================================================== cycle-directed ==

  'cycle-directed': {
    title: 'Three colours on 0 -> 1 -> 2 -> 0',
    cells: [0, 1, 2],
    label: 'nodes:',
    frames: [
      { stat: 'WHITE unvisited, GREY on the current path, BLACK finished', note: 'Two states are not enough, and the third is the whole algorithm.' },
      { ptrs: { at: 0 }, mark: [0], stat: '0 -> GREY', note: 'Grey on entry: this node is on the path being walked right now.' },
      { ptrs: { at: 1 }, mark: [0, 1], stat: '1 -> GREY.  path is 0, 1', note: 'Two nodes grey. Both are ancestors of wherever the recursion currently is.' },
      { ptrs: { at: 2 }, mark: [0, 1, 2], stat: '2 -> GREY.  path is 0, 1, 2', note: 'Three deep.' },
      { mark: [0], stat: '2 -> 0, and 0 is GREY  ->  CYCLE', note: 'A back edge into the current path. That is the definition of a directed cycle, and grey is what makes it visible.' },
      { stat: 'BLACK would have been fine', note: 'A finished node can legitimately be reached again — that is a diamond, not a cycle. Distinguishing them is why there are three colours.' },
    ],
  },

  'cycle-directed/0': {
    title: 'Undirected: every edge looks like a back edge to its parent',
    contrast: 'The base flags any edge into the current path. Undirected edges point both ways, so the edge you arrived by qualifies.',
    cells: ['A', 'B'],
    label: 'nodes:',
    frames: [
      { stat: 'one undirected edge A - B.  No cycle.', note: 'Two nodes, one edge. There is obviously no cycle here.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'A -> GREY', note: 'Start at A.' },
      { ptrs: { at: 1 }, mark: [0, 1], stat: 'B -> GREY, arrived from A', note: 'Walk to B. So far identical to the directed case.' },
      { mark: [0], stat: 'B sees A, and A is GREY  ->  "CYCLE"', note: 'But the edge B-A is the same edge we just used. Undirected storage keeps both directions, so it looks like a back edge.' },
      { mark: [1], stat: 'fix: skip the parent', note: 'if v == parent: continue. Without it EVERY single edge reports a false cycle.' },
      { stat: 'or use Union-Find', note: 'Cleaner for undirected: union() returning False is the cycle. Parallel edges still need care in both versions.' },
    ],
  },

  'cycle-directed/1': {
    title: 'Yes or no only: Kahn is simpler than three colours',
    contrast: 'The base colours nodes and recurses. If the answer is a boolean, the topological count already has it.',
    cells: [0, 1, 2],
    label: 'nodes:',
    frames: [
      { stat: 'question: is there a cycle?  Nothing more.', note: 'No need to report which nodes, or in what order they loop.' },
      { stat: 'three colours: recursion, a colour array, two states to keep straight', note: 'Plus a recursion-depth risk on a large graph.' },
      { mark: [0], stat: 'Kahn: in-degrees, a queue, a counter', note: 'Iterative, no colours, no stack depth to worry about.' },
      { mark: [0, 1], stat: 'emit 0, emit 1 ... then the queue empties', note: 'Anything in a cycle never reaches in-degree zero, so it is never emitted.' },
      { stat: 'len(order) != V  ->  cycle exists', note: 'One comparison. The count IS the detector, with nothing extra to maintain.' },
      { stat: 'colours earn their place when you need the PATH', note: 'The grey set is exactly the cycle when you find the back edge. If the question asks which nodes, go back to DFS.' },
    ],
  },

  // ============================================================= lru-cache ==

  'lru-cache': {
    title: 'Capacity 2: get and put in O(1), evicting the least recent',
    cells: ['a', 'b', 'c'],
    label: 'keys:',
    frames: [
      { mark: [0], stat: 'put(a)  ->  order [a]', note: 'A hash map for lookup, plus an ordering structure. Python OrderedDict is both.' },
      { mark: [0, 1], stat: 'put(b)  ->  order [a, b]', note: 'At capacity. Insertion order records recency, oldest first.' },
      { mark: [0], stat: 'get(a)  ->  move_to_end.  order [b, a]', note: 'A read counts as use, so a becomes the most recent. This is the step people forget.' },
      { mark: [2], stat: 'put(c)  ->  over capacity', note: 'Something must be evicted, and it must be the least recently used.' },
      { mark: [1], stat: 'popitem(last=False) evicts b', note: 'b, not a — because the get(a) moved a to the back. Without that move, a would have been evicted wrongly.' },
      { stat: 'order [a, c].  All operations O(1)', note: 'No scanning for the oldest entry, which is what a plain dict plus a timestamp would have required.' },
    ],
  },

  'lru-cache/0': {
    title: 'By hand: hash map plus doubly linked list, with two sentinels',
    contrast: 'The base leans on OrderedDict. Interviewers usually ban it, and the manual version is the actual question.',
    cells: ['head', 'a', 'b', 'tail'],
    label: 'list:',
    frames: [
      { mark: [0, 3], stat: 'sentinel head and tail, always present', note: 'Two fake nodes. Now every real node has both a predecessor and a successor, always.' },
      { mark: [1, 2], stat: 'map: key -> node.  list: recency order', note: 'The map gives O(1) lookup; the list gives O(1) reordering. Neither alone is enough.' },
      { mark: [1], stat: 'get(a): unlink a, push to front', note: 'Unlinking is two pointer writes. With sentinels there is no "is it the head?" check.' },
      { mark: [2, 3], stat: 'evict: tail.prev is the least recent', note: 'Always a real node, because the tail sentinel guarantees something sits before it.' },
      { stat: 'without sentinels: null checks everywhere', note: 'Every unlink and insert needs "is prev null?" and "is next null?". That is four branches that can each be wrong.' },
      { stat: 'same technique as the dummy head', note: 'Sentinels delete branches, and deleted branches cannot contain bugs. Worth naming the connection out loud.' },
    ],
  },

  'lru-cache/1': {
    title: 'LFU: bucket by frequency, and track the minimum',
    contrast: 'The base orders purely by recency. Ordering by frequency needs a second dimension and a running minimum.',
    cells: ['freq 1', 'freq 2', 'freq 3'],
    label: 'buckets:',
    frames: [
      { mark: [0], stat: 'new keys enter bucket 1', note: 'One recency list per frequency, so within a bucket it is still LRU.' },
      { mark: [0, 1], stat: 'get(a): a moves from bucket 1 to bucket 2', note: 'A use increments the frequency, which means moving between buckets rather than within one.' },
      { mark: [1, 2], stat: 'get(a) again  ->  bucket 3', note: 'Each access promotes it. The bucket index IS the access count.' },
      { mark: [0], stat: 'min_freq = 1', note: 'Eviction must take from the LOWEST non-empty bucket. Scanning for it would be O(capacity).' },
      { stat: 'min_freq only ever increases, or resets to 1', note: 'A new key resets it to 1; promoting the last member of the minimum bucket raises it by one. So it is maintainable in O(1).' },
      { stat: 'evict the OLDEST in the min bucket', note: 'Recency breaks ties within a frequency. LFU is strictly harder than LRU, and the standard follow-up once LRU is done.' },
    ],
  },

  // ========================================================== rolling-hash ==

  'rolling-hash': {
    title: 'Hashing every window of "abcd" in O(1) each',
    cells: ['a', 'b', 'c', 'd'],
    frames: [
      { stat: 'treat the window as a number in base B', note: 'hash("ab") = a x B + b. A string becomes an integer, and integers can be updated arithmetically.' },
      { range: [0, 1], stat: 'h = a x B + b', note: 'Build the first window normally, in O(k).' },
      { range: [1, 2], stat: 'roll: subtract a x B^1, x B, add c', note: 'Three operations, independent of the window length. Rehashing from scratch would be O(k) per window.' },
      { range: [1, 2], stat: 'h = b x B + c', note: 'The new hash, computed without looking at b at all.' },
      { range: [2, 3], stat: 'roll again  ->  h = c x B + d', note: 'All n windows for O(n) total instead of O(nk).' },
      { stat: 'and everything mod a large prime', note: 'Otherwise the number overflows. In Python it would just grow unboundedly and get slow.' },
    ],
  },

  'rolling-hash/0': {
    title: 'A collision makes the answer WRONG, not slow',
    contrast: 'The base compares hashes and treats a match as a match. Two different strings can share a hash.',
    cells: ['a', 'b', 'x', 'y'],
    frames: [
      { range: [0, 1], stat: 'hash("ab") = 12345', note: 'Some integer. The mapping from strings to integers cannot be injective — there are more strings than hashes.' },
      { range: [2, 3], stat: 'hash("xy") = 12345 too', note: 'A collision. Unlikely with a good base and modulus, and not impossible.' },
      { stat: 'template: hashes equal  ->  report a match', note: 'It reports "xy" where the pattern was "ab". A wrong answer, not a timeout.' },
      { range: [0, 1], stat: 'fix: verify the characters on a hit', note: 'if h == target_h and s[i-k:i] == pattern. The O(k) comparison only runs on hits, so the average cost is unchanged.' },
      { stat: 'or two independent moduli', note: 'Two hashes agreeing by chance is vanishingly unlikely. Cheaper than verifying when hits are frequent.' },
      { stat: 'saying this unprompted is the point', note: 'Rabin-Karp without a collision story is an incomplete answer, and interviewers listen for it.' },
    ],
  },

  'rolling-hash/1': {
    title: 'Longest duplicated substring: binary search the LENGTH',
    contrast: 'The base hashes windows of one fixed size. Here the size is the unknown, and two patterns compose.',
    cells: ['b', 'a', 'n', 'a', 'n', 'a'],
    frames: [
      { stat: 'find the longest substring appearing twice', note: 'In "banana" that is "ana", length 3. The length is what you are searching for.' },
      { stat: 'can(L) = does some length-L substring repeat?', note: 'Rolling hash answers this in O(n): hash every window of length L into a set and look for a repeat.' },
      { range: [0, 2], stat: 'can(3): "ban","ana","nan","ana"  ->  YES', note: '"ana" appears at index 1 and index 3. Feasible.' },
      { range: [0, 3], stat: 'can(4): "bana","anan","nana"  ->  NO', note: 'All distinct. Infeasible.' },
      { stat: 'monotonic: if length L repeats, so does L-1', note: 'Any substring of a repeated substring is also repeated. That is what licenses the binary search — say it out loud.' },
      { stat: 'binary search L  ->  O(n log n)', note: 'Binary search on the answer, with rolling hash as the predicate. Two patterns from the site composed into one solution.' },
    ],
  },

  // ========================================================= lazy-deletion ==

  'lazy-deletion': {
    title: 'Why Dijkstra has that "if d > dist[u]: continue" line',
    cells: ['S', 'A', 'B'],
    label: 'nodes:',
    frames: [
      { mark: [2], stat: 'push (5, B)  — the direct route', note: 'B is reachable at cost 5, so that entry goes into the heap.' },
      { mark: [1, 2], stat: 'later: a route of 3 is found.  push (3, B)', note: 'Better. But the (5, B) entry is still in the heap, and heaps cannot remove from the middle.' },
      { stat: 'heap now holds BOTH (3,B) and (5,B)', note: 'Two entries for one node, one of them obsolete. This is normal and expected.' },
      { mark: [2], stat: 'pop (3, B):  3 == dist[B]  ->  process it', note: 'The good entry surfaces first, because the heap is ordered by cost.' },
      { mark: [2], stat: 'pop (5, B):  5 > dist[B] = 3  ->  SKIP', note: 'The stale one is discarded on the way out rather than deleted on the way in. That is lazy deletion.' },
      { stat: 'without the check: B is processed twice', note: 'Re-expanding B relaxes all its edges again with a worse distance. Correctness survives, performance does not.' },
    ],
  },

  'lazy-deletion/0': {
    title: 'The heap grows to O(E), and that is fine',
    contrast: 'The base leaves obsolete entries behind. The usual worry is memory, and the usual answer is to accept it.',
    cells: ['E entries', 'V entries'],
    label: 'heap size:',
    frames: [
      { mark: [0], stat: 'every edge can push once  ->  up to E entries', note: 'Not V. Each improvement pushes a new entry and leaves the old one.' },
      { stat: 'log E vs log V: a constant factor', note: 'E is at most V^2, so log E is at most 2 log V. The difference disappears into the constant.' },
      { mark: [0], stat: 'memory: E pairs of numbers', note: 'For E = 10^6 that is a few megabytes. Almost never the binding constraint.' },
      { mark: [1], stat: 'the alternative: an indexed heap with decrease-key', note: 'Keeps the heap at V by locating and updating an existing entry. More code, more state, more to get wrong.' },
      { stat: 'so: accept the growth', note: 'The simpler code wins nearly always. Knowing decrease-key exists is enough for an interview.' },
      { stat: 'Fibonacci heaps improve the bound in theory', note: 'And lose in practice on constants. Worth naming only if asked about theoretical optimality.' },
    ],
  },

  'lazy-deletion/1': {
    title: 'Record the distance at PUSH time, or the check is useless',
    contrast: 'The base compares a popped distance against dist[u]. If dist is only written on pop, there is nothing to compare against.',
    cells: ['S', 'A', 'B'],
    label: 'nodes:',
    frames: [
      { mark: [2], stat: 'wrong: write dist[v] only when v pops', note: 'A tempting simplification — settle the distance at the moment the node is finalised.' },
      { mark: [2], stat: 'push (5,B) and (3,B).  dist[B] still INF', note: 'Both entries are in the heap and dist[B] has never been written, so neither can be recognised as stale.' },
      { mark: [2], stat: 'pop (3,B):  3 > INF?  no  ->  process', note: 'Fine so far.' },
      { mark: [2], stat: 'pop (5,B):  5 > 3?  yes ... but only if dist was written', note: 'It was written on pop, so this case happens to work. The failure appears with three or more entries and re-expansion cascades.' },
      { mark: [1, 2], stat: 'write dist[v] = nd BEFORE pushing', note: 'Then every push is accompanied by the current best, and any later pop can be compared against it immediately.' },
      { stat: 'push and record together, always', note: 'Two adjacent lines. Separating them is what turns lazy deletion from an optimisation into a source of exponential re-expansion.' },
    ],
  },
});
