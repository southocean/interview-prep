/* Animations, batch C: trees and graphs.
 *
 * These have no natural left-to-right layout, so the convention is:
 *   - the cell row holds the NODES in a fixed order, stated in the title
 *   - marks show what is being visited or has been settled
 *   - the stat line carries the frontier: the queue, the stack, the in-degrees,
 *     the return values
 *
 * One renderer for everything beats inventing a second visual language, and the
 * shape of the tree or graph is written into the title so the row is readable.
 */
Object.assign(window.ANIMS, {

  // ============================================================== tree-dfs ==

  'tree-dfs': {
    title: 'Max depth of  1(2(4,5), 3)  — nodes in level order',
    cells: [1, 2, 3, 4, 5],
    label: 'nodes:',
    frames: [
      { stat: '1 has children 2 and 3;  2 has children 4 and 5', note: 'Read the shape first. 4 and 5 are leaves, 3 is a leaf, so the tree is three levels deep.' },
      { ptrs: { at: 3 }, mark: [3], stat: 'depth(4) = 1', note: 'Postorder: children answer before parents. A leaf has no children, so 1 + max(0, 0) = 1.' },
      { ptrs: { at: 4 }, mark: [4], stat: 'depth(5) = 1', note: 'Same for the other leaf. Neither knows anything about the rest of the tree — that is the contract.' },
      { ptrs: { at: 1 }, mark: [1, 3, 4], stat: 'depth(2) = 1 + max(1, 1) = 2', note: 'Node 2 combines what its children reported. It never re-walks them.' },
      { ptrs: { at: 2 }, mark: [2], stat: 'depth(3) = 1', note: 'The other leaf.' },
      { ptrs: { at: 0 }, mark: [0, 1, 2], stat: 'depth(1) = 1 + max(2, 1) = 3', note: 'The root takes the deeper side. Answer 3, each node visited exactly once, O(n) with O(h) stack.' },
    ],
  },

  'tree-dfs/0': {
    title: 'Validate  10(5, 15(6, 20))  — the 6 is the whole point',
    contrast: 'The template returns information upward. Here a CONSTRAINT is passed downward, and only that catches the 6.',
    cells: [10, 5, 15, 6, 20],
    label: 'nodes:',
    frames: [
      { stat: '10 has children 5 and 15;  15 has children 6 and 20', note: 'Looks plausible: every node is on the correct side of its immediate parent.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'range (-inf, +inf)', note: 'The root may be anything. The range starts wide open and narrows on the way down.' },
      { ptrs: { at: 1 }, mark: [1], stat: 'range (-inf, 10)   5 fits', note: 'Going left, the upper bound becomes the parent value. 5 < 10, so it holds.' },
      { ptrs: { at: 2 }, mark: [2], stat: 'range (10, +inf)   15 fits', note: 'Going right, the LOWER bound becomes the parent. 15 > 10, fine.' },
      { ptrs: { at: 3 }, mark: [2, 3], stat: 'parent-only check: 6 < 15  ->  PASSES', note: 'Here is the trap. Compared only against its parent, 6 looks perfectly legal — and the classic wrong answer accepts the tree.' },
      { ptrs: { at: 3 }, mark: [0, 3], stat: 'range (10, 15):  is 6 > 10?  NO', note: 'The carried range remembers the grandparent. 6 sits in the RIGHT subtree of 10, so it must exceed 10, and it does not.' },
      { stat: 'answer False', note: 'The range is the only thing that sees a violation two levels up. This is why the constraint travels down rather than the answer travelling up.' },
    ],
  },

  'tree-dfs/1': {
    title: 'Diameter of  1(2(4,5), 3)  — returning one number, recording another',
    contrast: 'The template returns the quantity that IS the answer. Here they are two different numbers, and confusing them is the usual failure.',
    cells: [1, 2, 3, 4, 5],
    label: 'nodes:',
    frames: [
      { stat: 'best = 0', note: 'The answer is the longest path between any two nodes. It need not pass through the root.' },
      { ptrs: { at: 3 }, mark: [3], stat: 'returns 1   best stays 0', note: 'Leaf 4: height 1, and no path through it (no two children to join).' },
      { ptrs: { at: 1 }, mark: [1, 3, 4], stat: 'path through 2 = 1 + 1 = 2   best = 2', note: 'Node 2 joins its two subtrees: 4 - 2 - 5 is two edges. RECORD that. But it must RETURN height, 2.' },
      { ptrs: { at: 1 }, mark: [1], stat: 'returns 1 + max(1, 1) = 2', note: 'Two different numbers from one call. The parent needs height; the answer needed the join. Mixing them up is the bug.' },
      { ptrs: { at: 0 }, mark: [0, 1, 2], stat: 'path through 1 = 2 + 1 = 3   best = 3', note: 'The root joins a height-2 side to a height-1 side: 4 - 2 - 1 - 3, three edges. New best.' },
      { stat: 'answer 3', note: 'One postorder pass. The shape — return the contract, record the answer in a variable outside — recurs in maximum path sum and longest univalue path.' },
    ],
  },

  'tree-dfs/2': {
    title: 'A -> B -> C -> A: the same DFS runs forever',
    contrast: 'The template keeps no visited set, because a tree cannot revisit a node. Add one edge back and that assumption is gone.',
    cells: ['A', 'B', 'C'],
    label: 'nodes:',
    frames: [
      { stat: 'edges: A->B, B->C, C->A', note: 'Called a tree, but C points back at A. Nothing in the template notices.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'visit A', note: 'Ordinary first step.' },
      { ptrs: { at: 1 }, mark: [0, 1], stat: 'visit B', note: 'Still fine.' },
      { ptrs: { at: 2 }, mark: [0, 1, 2], stat: 'visit C', note: 'Still fine. Nothing has gone wrong yet, which is what makes this bug unpleasant.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'visit A ... again', note: 'C leads back to A, and the recursion happily descends. It will now loop until the stack overflows.' },
      { stat: 'fix: seen = set()', note: 'Three lines: check membership, add on entry, return early. Tree DFS is graph DFS minus the visited set — and being asked to relax "it is a tree" is a common follow-up.' },
    ],
  },

  'tree-dfs/3': {
    title: 'A degenerate chain 1-2-3-4-5, done with an explicit stack',
    contrast: 'The template uses the call stack. At 10^5 deep that crashes, so the stack becomes a list you control.',
    cells: [1, 2, 3, 4, 5],
    label: 'chain:',
    frames: [
      { range: [0, 4], stat: 'every node has one child', note: 'A list wearing a tree costume. Depth equals n, so recursion depth equals n.' },
      { stat: 'Python default limit: ~1000 frames', note: 'At n = 10^5 this raises RecursionError. The algorithm is right and the runtime refuses it.' },
      { ptrs: { top: 0 }, mark: [0], stat: 'stack [(1, False)]', note: 'Iterative version. The flag says whether this node has had its children pushed yet.' },
      { ptrs: { top: 1 }, mark: [0, 1], stat: 'stack [(1, True), (2, False)]', note: 'Pop unprocessed, push it back marked True, then push its children. That is how you get postorder without recursion.' },
      { ptrs: { top: 3 }, mark: [0, 1, 2, 3], stat: 'stack grows to n entries — on the HEAP', note: 'Same O(n) space, but heap-allocated rather than call frames, so there is no fixed ceiling.' },
      { stat: 'visit fires when the flag is True', note: 'The two-pass flag is the whole trick: a naive stack gives preorder easily and postorder not at all.' },
    ],
  },

  // ============================================================== tree-bfs ==

  'tree-bfs': {
    title: 'Level order of  3(9, 20(15, 7))  — the snapshot is what makes levels',
    cells: [3, 9, 20, 15, 7],
    label: 'nodes:',
    frames: [
      { stat: 'queue [3]', note: '3 has children 9 and 20; 20 has children 15 and 7. Start with the root alone.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'len(queue) = 1  ->  level is exactly 1 node', note: 'Snapshot the length BEFORE the inner loop. That number is the size of this level and nothing else.' },
      { mark: [1, 2], stat: 'queue [9, 20]   ->  level [3] done', note: 'Consuming exactly one node emitted level 0. Its children are now queued.' },
      { ptrs: { at: 1 }, mark: [1, 2], stat: 'len(queue) = 2  ->  level is 2 nodes', note: 'Snapshot again. Without it, the children pushed during this level would be consumed as part of it and the levels would merge.' },
      { mark: [3, 4], stat: 'queue [15, 7]   ->  level [9, 20] done', note: '9 is a leaf and adds nothing; 20 adds two.' },
      { mark: [3, 4], stat: 'level [15, 7] done   queue empty', note: 'Answer [[3], [9, 20], [15, 7]]. Marking on enqueue does not matter on a tree — but it matters enormously the moment it is a graph.' },
    ],
  },

  'tree-bfs/0': {
    title: 'Rot spreading from BOTH ends of R F F F F R',
    contrast: 'The template seeds the queue with one start. Every source goes in before the first step, and nothing else changes.',
    cells: ['R', 'F', 'F', 'F', 'F', 'R'],
    label: 'grid:',
    frames: [
      { mark: [0, 5], stat: 'queue [0, 5]   minute 0', note: 'Both rotten oranges are already rotten at minute zero, so both start in the queue. That single change is the whole adaptation.' },
      { mark: [1, 4], stat: 'queue [1, 4]   minute 1', note: 'One level of BFS spreads from both sources at once. Levels still count minutes correctly because everything began together.' },
      { mark: [2, 3], stat: 'queue [2, 3]   minute 2', note: 'They meet in the middle. Answer 2 minutes.' },
      { range: [0, 5], stat: 'single-source would say 5', note: 'Seeding only index 0 gives five levels — a wrong answer, not a slow one. The spread genuinely happens from both ends.' },
      { stat: 'and running BFS twice is worse', note: 'Once per source would be O(sources x cells) and would still need combining. Multi-source is one pass and simpler code.' },
      { stat: 'final check: any F left?  ->  -1', note: 'Unreachable fresh oranges mean impossible. That check after the loop is the edge case people drop.' },
    ],
  },

  'tree-bfs/1': {
    title: 'Not the distance but the ROUTE: A to E, via a parent map',
    contrast: 'The template counts levels and forgets how it got anywhere. One extra map, and the path falls out.',
    cells: ['A', 'B', 'C', 'D', 'E'],
    label: 'nodes:',
    frames: [
      { stat: 'edges A-B, A-C, B-D, C-D, D-E', note: 'Two routes to D. BFS will reach it by the shorter one first, and that is the fact being exploited.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'parent {A: None}', note: 'Record who reached each node. The root has no parent, which is also the stop condition when walking back.' },
      { mark: [1, 2], stat: 'parent {B: A, C: A}', note: 'Both neighbours of A record A. Written on ENQUEUE, so the first arrival wins.' },
      { ptrs: { at: 3 }, mark: [3], stat: 'parent {D: B}', note: 'B reaches D first. C would also reach D, but D is already marked, so the parent is not overwritten — that is what keeps the path shortest.' },
      { ptrs: { at: 4 }, mark: [4], stat: 'parent {E: D}', note: 'Goal found. Distance 3, exactly as the plain template would have reported.' },
      { mark: [0, 1, 3, 4], stat: 'walk back: E <- D <- B <- A', note: 'Follow parents to the root and reverse. Answer A, B, D, E — no second search needed.' },
    ],
  },

  'tree-bfs/2': {
    title: 'Weights break BFS: 2 edges costing 10 beats 3 edges costing 3?',
    contrast: 'The template treats every step as equal, which is exactly what makes arrival order equal cheapest order. Add weights and that identity fails.',
    cells: ['S', 'A', 'B', 'C', 'T'],
    label: 'nodes:',
    frames: [
      { stat: 'S->A 5, A->T 5   |   S->B 1, B->C 1, C->T 1', note: 'Two routes: two edges costing 10, or three edges costing 3. The cheap one is longer in edges.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'BFS: queue [S]   dist 0', note: 'BFS explores by number of edges, so it will find the two-edge route first.' },
      { mark: [1, 2], stat: 'level 1: A and B', note: 'Both one edge away. BFS cannot tell that B cost 1 and A cost 5 — it does not look at weights at all.' },
      { ptrs: { at: 4 }, mark: [4], stat: 'level 2 reaches T  ->  BFS says 2', note: 'BFS returns the fewest EDGES, which is 2. As a cost that is 10, and it is wrong.' },
      { mark: [2, 3, 4], stat: 'the real answer: 3 via S-B-C-T', note: 'Three edges, total cost 3. Cheapest, and BFS never even compares it.' },
      { stat: 'fix: order the frontier by COST', note: 'A heap instead of a queue — that is Dijkstra. If the weights are only 0 and 1, a deque with appendleft keeps O(V+E).' },
    ],
  },

  'tree-bfs/3': {
    title: 'Word ladder neighbours: wildcard buckets, not all-pairs',
    contrast: 'The template assumes neighbours are cheap to list. Here generating them naively costs more than the search itself.',
    cells: ['hit', 'hot', 'dot', 'dog', 'cog'],
    label: 'words:',
    frames: [
      { stat: 'neighbour = differs by exactly one letter', note: 'The graph is not given — you have to construct the adjacency yourself, and how you do it decides whether this passes.' },
      { range: [0, 4], stat: 'naive: compare every pair  ->  O(n^2 x L)', note: 'At 10^4 words that is 10^8 comparisons of 3-letter strings. Too slow, and the algorithm is not the problem.' },
      { mark: [0, 1], stat: 'bucket "h*t": [hit, hot]', note: 'Instead, wildcard each position. Every word in a bucket differs from the others in exactly that one slot.' },
      { mark: [1, 2], stat: 'bucket "*ot": [hot, dot]', note: 'Buckets are built once, in O(n x L). Membership IS adjacency.' },
      { mark: [2, 3], stat: 'bucket "do*": [dot, dog]', note: 'Now a node lookup is O(L) rather than O(n x L).' },
      { ptrs: { at: 4 }, mark: [3, 4], stat: 'hit -> hot -> dot -> dog -> cog  =  5', note: 'The BFS itself is the unchanged template. All the work went into making neighbours cheap.' },
    ],
  },

  // ============================================================= graph-dfs ==

  'graph-dfs': {
    title: 'Counting components of 0-1, 1-2, and 3-4, with 5 alone',
    cells: [0, 1, 2, 3, 4, 5],
    label: 'nodes:',
    frames: [
      { stat: 'edges 0-1, 1-2, 3-4.  Node 5 has none.', note: 'Three groups: {0,1,2}, {3,4}, {5}. The question is reachability, not distance, so DFS is the simpler tool.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'groups 1   flood from 0', note: 'The outer loop meets an unvisited node. That is a NEW group — increment before flooding.' },
      { mark: [0, 1, 2], stat: 'seen {0, 1, 2}', note: 'The flood takes everything reachable. None of these can start another group now.' },
      { ptrs: { at: 3 }, mark: [3], stat: 'groups 2   flood from 3', note: 'The outer loop skips 1 and 2 as already seen, then finds 3 unvisited.' },
      { mark: [3, 4], stat: 'seen {0, 1, 2, 3, 4}', note: 'Second flood. Isolated pairs are groups like any other.' },
      { ptrs: { at: 5 }, mark: [5], stat: 'groups 3', note: 'A node with no edges is still a component. Forgetting the lone node is the usual off-by-one here. Answer 3, O(V+E).' },
    ],
  },

  'graph-dfs/0': {
    title: 'Pacific-Atlantic on heights 1 2 2 3 5 — search inward, not outward',
    contrast: 'The template searches outward from each start. Reversing the direction turns O(cells^2) into O(cells).',
    cells: [1, 2, 2, 3, 5],
    label: 'row:',
    frames: [
      { stat: 'water flows to EQUAL or LOWER neighbours', note: 'A cell reaches an ocean if a non-increasing path exists to it. Left edge is the Pacific, right edge the Atlantic.' },
      { range: [0, 4], stat: 'outward: run a search from every cell', note: 'Ask each cell "can I get out?" — that is one search per cell, so O(cells) searches of O(cells) each.' },
      { ptrs: { from: 0 }, mark: [0, 1, 2, 3, 4], stat: 'inward from the left: 1 -> 2 -> 2 -> 3 -> 5', note: 'Reverse it. Ask instead "which cells can reach ME?" and climb inward to equal-or-higher neighbours. One search, from the border.' },
      { ptrs: { from: 4 }, mark: [4, 3, 2, 1, 0], stat: 'inward from the right: 5 -> 3 -> 2 -> 2 -> 1', note: 'One more search from the other ocean. Two searches total, not one per cell.' },
      { mark: [0, 1, 2, 3, 4], stat: 'answer = intersection of the two sets', note: 'Cells reached by both. A set intersection replaces all that per-cell searching.' },
      { stat: 'O(cells) instead of O(cells^2)', note: 'The insight is not the DFS — it is noticing that the question can be asked backwards. That reversal shows up in many reachability problems.' },
    ],
  },

  'graph-dfs/1': {
    title: 'A visited set says "cycle" when there is none: 0->1, 0->2, 1->3, 2->3',
    contrast: 'The template uses one visited set. That cannot tell "finished" from "on the current path", and the difference is the whole answer.',
    cells: [0, 1, 2, 3],
    label: 'nodes:',
    frames: [
      { stat: 'a diamond: 0->1->3 and 0->2->3.  No cycle.', note: 'Node 3 is genuinely reachable two ways. That is legal in a DAG and must not be reported as a cycle.' },
      { ptrs: { at: 1 }, mark: [0, 1], stat: 'visited {0, 1}', note: 'Walk 0 then 1.' },
      { ptrs: { at: 3 }, mark: [0, 1, 3], stat: 'visited {0, 1, 3}', note: 'Reach 3 down the first branch and finish it.' },
      { ptrs: { at: 2 }, mark: [0, 2], stat: 'now the second branch: 0 -> 2', note: 'Back up and take the other route.' },
      { ptrs: { at: 3 }, mark: [3], stat: '3 is in visited  ->  "CYCLE!"  (wrong)', note: 'A plain visited set reports a cycle here. 3 was seen, but it was FINISHED, not on the current path.' },
      { mark: [0, 2, 3], stat: 'three colours: white, grey, black', note: 'Grey means "on the path I am walking now". 3 is BLACK — done — so revisiting it is fine. Only a GREY hit is a cycle.' },
      { stat: 'or use Kahn and count', note: 'If you only need yes or no, the topological sort count is simpler and has no colours to get wrong.' },
    ],
  },

  'graph-dfs/2': {
    title: 'Edges arriving one at a time: DFS re-runs, Union-Find merges',
    contrast: 'The template walks a graph that already exists. When it is still being built, the cost model changes completely.',
    cells: [0, 1, 2, 3],
    label: 'nodes:',
    frames: [
      { stat: 'no edges yet: 4 components', note: 'Edges will arrive one by one, and after each you must answer "how many groups?".' },
      { mark: [0, 1], stat: 'add 0-1   DFS: full re-run  O(V+E)', note: 'DFS has no memory between queries. Answering after this edge means walking the whole graph again.' },
      { mark: [2, 3], stat: 'add 2-3   DFS: full re-run again', note: 'And again. With m edges arriving, that is O(m(V+E)) — the query pattern, not the algorithm, is what makes it slow.' },
      { mark: [0, 1], stat: 'Union-Find: union(0,1)  ->  3 groups', note: 'Union-Find keeps the answer incrementally. One near-constant operation per edge, and the count is maintained as you go.' },
      { mark: [2, 3], stat: 'union(2,3)  ->  2 groups', note: 'Each merge decrements the component count. No traversal at all.' },
      { mark: [1, 2], stat: 'union(1,2)  ->  1 group', note: 'And union() returning False would have told you the edge closed a cycle — a second answer for free.' },
    ],
  },

  'graph-dfs/3': {
    title: 'A million cells of solid land — the recursion is the problem',
    contrast: 'The template recurses once per cell. When one component spans the whole grid, that is one million frames deep.',
    cells: ['#', '#', '#', '#', '#', '#'],
    label: 'row of land:',
    frames: [
      { range: [0, 5], stat: 'one component, 10^6 cells', note: 'Nothing wrong with the algorithm — it is O(cells) and correct. The runtime is what refuses.' },
      { ptrs: { depth: 0 }, mark: [0], stat: 'frames: 1', note: 'The flood descends into a neighbour, which descends into a neighbour.' },
      { ptrs: { depth: 2 }, mark: [0, 1, 2], stat: 'frames: 3', note: 'Nothing returns until the far end of the grid is reached, so the frames just accumulate.' },
      { ptrs: { depth: 5 }, mark: [0, 1, 2, 3, 4, 5], stat: 'frames: 10^6  ->  RecursionError', note: 'Python gives up around a thousand. The crash is not a subtle wrong answer, it is a hard stop.' },
      { stat: 'stack = [(r, c)]  while stack: ...', note: 'An explicit stack holds the same O(cells) on the heap, where there is no ceiling. BFS with a deque works identically.' },
      { stat: 'say you noticed', note: 'Interviewers ask about the constraint precisely to see whether depth crossed your mind. Naming it costs one sentence and is scored.' },
    ],
  },

  // ================================================================== topo ==

  'topo': {
    title: 'Kahn on courses 0->1, 1->2, 2->3',
    cells: [0, 1, 2, 3],
    label: 'courses:',
    frames: [
      { stat: 'in-degree  [0, 1, 1, 1]', note: 'Count how many prerequisites each course still has. Course 0 has none, so it is available now.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'queue [0]   order []', note: 'Everything at zero starts in the queue. Here that is only course 0.' },
      { ptrs: { at: 1 }, mark: [0, 1], stat: 'order [0]   in-degree [_, 0, 1, 1]', note: 'Emit 0, then decrement its dependents. Course 1 drops to zero and becomes available.' },
      { ptrs: { at: 2 }, mark: [0, 1, 2], stat: 'order [0, 1]   2 becomes available', note: 'The same step repeats. Nothing is ever emitted before its prerequisites.' },
      { mark: [0, 1, 2, 3], stat: 'order [0, 1, 2, 3]', note: 'All four emitted.' },
      { stat: 'len(order) == 4 == V  ->  no cycle', note: 'The count IS the cycle detector. If a cycle existed, its members would never reach zero and would never be emitted — do not add a second mechanism.' },
    ],
  },

  'topo/0': {
    title: 'Same machinery, two questions: "can it be done" vs "in what order"',
    contrast: 'Nothing changes in the algorithm. The boolean version simply throws away what the template already built.',
    cells: [0, 1, 2, 3],
    label: 'courses:',
    frames: [
      { stat: 'the template already produces `order`', note: 'Course Schedule I asks only whether it is possible. That answer is a by-product of the work already done.' },
      { mark: [0, 1, 2, 3], stat: 'order [0, 1, 2, 3]   len 4 == V', note: 'Return the list, and you have solved Course Schedule II.' },
      { stat: 'return len(order) == n', note: 'Return the comparison, and you have solved Course Schedule I. One line apart.' },
      { mark: [1, 2], stat: 'now add 2->1, making a cycle', note: 'Courses 1 and 2 now depend on each other.' },
      { mark: [0], stat: 'order [0]   len 1 != 4', note: 'Only course 0 ever reaches in-degree zero. The other two block each other forever.' },
      { stat: 'so: order if complete else []', note: 'Recognising that "possible?" and "how?" are one algorithm apart is the point of having the pair on the board far from each other.' },
    ],
  },

  'topo/1': {
    title: 'How many SEMESTERS, when courses can run in parallel',
    contrast: 'The template pops one node at a time and flattens everything. Process the queue level by level and each level is one semester.',
    cells: [0, 1, 2, 3, 4],
    label: 'courses:',
    frames: [
      { stat: 'edges 0->2, 1->2, 2->3, 2->4', note: 'Courses 0 and 1 have no prerequisites. Both can be taken immediately, and that is what a flat order hides.' },
      { mark: [0, 1], stat: 'in-degree zero: [0, 1]   semester 1', note: 'Snapshot the queue length, exactly as in BFS. Everything currently at zero can run together.' },
      { mark: [2], stat: 'semester 2: [2]', note: 'Consuming both of level one drops course 2 to zero. It is the only thing available now.' },
      { mark: [3, 4], stat: 'semester 3: [3, 4]', note: 'Course 2 unlocks both 3 and 4, and they are independent, so they share a semester.' },
      { stat: 'answer 3 semesters, 5 courses', note: 'A flat topological order would have said "5 steps". The level snapshot is what turns order into elapsed time.' },
      { stat: 'same trick as BFS levels', note: 'Identical mechanism to counting minutes in a BFS. Once you see topological sort as a BFS, the variant is free.' },
    ],
  },

  'topo/2': {
    title: 'Alien dictionary: deriving the edges is the hard part',
    contrast: 'The template is handed its edges. Here you must extract them, and taking too many invents constraints the input never implied.',
    cells: ['wrt', 'wrf', 'er', 'ett', 'rftt'],
    label: 'words (sorted in the alien order):',
    frames: [
      { stat: 'the sort order is the only evidence', note: 'Nothing states the alphabet. Every constraint has to come from adjacent pairs in this list.' },
      { mark: [0, 1], stat: '"wrt" vs "wrf":  t before f', note: 'Compare left to right, stop at the FIRST difference. w and r match, then t vs f gives exactly one edge.' },
      { mark: [0, 1], stat: 'do NOT also add r->r or w->w', note: 'The matching prefix implies nothing. Taking more than the first difference invents ordering the input does not support.' },
      { mark: [1, 2], stat: '"wrf" vs "er":  w before e', note: 'First characters already differ, so that is the single constraint from this pair.' },
      { mark: [2, 3], stat: '"er" vs "ett":  r before t', note: 'e matches, then r vs t. Four pairs give four edges.' },
      { stat: 'then run the unchanged template', note: 'Topological sort over those edges gives w, e, r, t, f. All the difficulty was upstream of the algorithm.' },
      { stat: 'and reject "abc" before "ab"', note: 'A prefix cannot follow its own extension in any alphabet. That input is invalid and must return empty — the edge case interviewers check.' },
    ],
  },

  'topo/3': {
    title: 'Breaking ties lexicographically: a heap instead of a queue',
    contrast: 'The template uses FIFO, so ties come out in whatever order they were pushed. One data structure swap fixes it.',
    cells: [0, 1, 2, 3],
    label: 'courses:',
    frames: [
      { stat: 'no edges at all: every order is valid', note: 'With four independent courses, any permutation is a correct topological order. The question is which one you return.' },
      { mark: [0, 1, 2, 3], stat: 'deque: comes out in push order', note: 'A queue returns them however they were queued, which depends on iteration order rather than on anything meaningful.' },
      { mark: [3], stat: 'push 3, 1, 0, 2  ->  deque gives 3, 1, 0, 2', note: 'Correct, but arbitrary. If the problem asks for the smallest such order, arbitrary is a wrong answer.' },
      { mark: [0], stat: 'heap gives 0 first', note: 'Swap the deque for a heap and the smallest available course always comes out next.' },
      { mark: [0, 1, 2, 3], stat: 'heap order: 0, 1, 2, 3', note: 'Lexicographically smallest. The graph logic is untouched — only the container changed.' },
      { stat: 'O(V log V + E) instead of O(V + E)', note: 'The log is the price of the ordering. Worth naming the cost when you make the swap.' },
    ],
  },
});
