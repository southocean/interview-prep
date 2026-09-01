/* Data structures. One page each.
 *
 * Structures do NOT list their patterns or problems. Patterns declare the
 * structures they use, problems declare their pattern, and app.js inverts both
 * indexes at load. Cross-links therefore cannot drift out of step.
 *
 * `rank` drives sidebar order.
 */
window.STRUCTURES = {
  note: 'A structure page answers three questions: how it is built, what it costs, and when to reach for it. "Cold" means you can type it correctly first try with no reference — that is the bar, and it is lower than it sounds because the list per structure is short.',

  items: [
    {
      id: 'hash', rank: 1, name: 'Hash map and set', tier: 1,
      one: 'The most-used structure in interviews by a wide margin. Usually the difference between O(n^2) and O(n).',
      why: 'It converts "search" into "look up". Any time a brute force scans to answer "is this here?" or "where is this?", a hash map removes the inner loop outright. Reach for it before anything cleverer.',
      build: `from collections import defaultdict, Counter

d = {}                          # plain
d = defaultdict(list)           # d[k].append(v) with no key check
d = defaultdict(int)            # counting without checks
c = Counter(xs)                 # frequencies in one line
c.most_common(k)                # top-k by count

seen = set()                    # membership only
if k in d:                      # explicit beats clever
    use(d[k])`,
      ops: [
        ['insert / update', 'O(1) average', 'Worst case O(n) on adversarial hashing. Never worth mentioning unless asked.'],
        ['lookup / membership', 'O(1) average', 'But hashing a long string costs its LENGTH — not free for big keys.'],
        ['delete', 'O(1) average', ''],
        ['iterate', 'O(n)', 'Python dicts preserve insertion order. JS Map does too; JS objects stringify keys.'],
        ['min / max / range', 'O(n)', 'No ordering at all. If you need order, you need a sort, a heap or a sorted structure.'],
      ],
      cold: [
        'Frequency counting, with and without Counter.',
        'A seen-set for one-pass duplicate detection.',
        'A value → index map (the two-sum shape).',
        'Grouping by a derived key: sorted letters, a count tuple, a normalised form.',
        'A prefix-sum → count map, seeded with {0: 1}.',
      ],
      pitfalls: 'Treating O(1) as free when keys are long. Needing order and trying to make a map provide it. In JS, using an object for non-string keys.',
      quiz: [
        ['Subarray sum equals k — what is the key and why the seed?', 'Key is the running prefix sum, value is how many times it has been seen. If prefix − k has been seen c times, c subarrays end here. Seed with {0: 1} so subarrays starting at index 0 are counted.'],
        ['When is a hash map the wrong choice?', 'When you need order, range queries, or the min/max repeatedly. Then you want a sort, a heap, or a sorted structure.'],
        ['Two words are anagrams. What is the cheapest canonical key?', 'A 26-length count tuple beats sorting: O(n) rather than O(n log n) per word, and tuples are hashable.'],
      ],
    },

    {
      id: 'array', rank: 2, name: 'Arrays and strings', tier: 1,
      one: 'The substrate. Every other structure and pattern assumes fluency here.',
      why: 'Not a choice so much as the default. What matters is knowing the costs you cannot see — that a slice copies, that string concatenation reallocates, that pop(0) is linear.',
      build: `xs[i:j]              # COPIES -- O(j-i), a hidden cost in loops
xs.sort(key=...)     # in place, O(n log n), stable
sorted(xs)           # returns a new list
''.join(parts)       # the ONLY correct way to build a string in a loop
xs[::-1]             # reversed copy
list(zip(a, b))      # pair up two sequences`,
      ops: [
        ['index read / write', 'O(1)', ''],
        ['append', 'O(1) amortised', ''],
        ['pop from the end', 'O(1)', ''],
        ['pop(0) / insert(0)', 'O(n)', 'The classic accidental O(n^2). Use a deque.'],
        ['slice', 'O(k)', 'Copies. A slice inside a loop turns O(n) into O(n^2).'],
        ['`in` on a list', 'O(n)', 'Use a set if you do this in a loop.'],
        ['string += in a loop', 'O(n^2) total', 'Strings are immutable. Collect and join.'],
      ],
      cold: [
        'Two-pointer reversal in place.',
        'Read/write index compaction (move zeroes, remove duplicates).',
        'Prefix sums, and knowing when they replace a nested loop.',
        'Building output with a list and one join.',
      ],
      pitfalls: 'Slicing in a loop. String concatenation in a loop. `in` on a list inside a loop. Mutating a list while iterating it.',
      quiz: [
        ['Why is += on a string inside a loop a problem?', 'Immutability: each += allocates a new string and copies everything so far, giving O(n^2). Collect into a list and join once.'],
        ['You need many range sums over a fixed array. What do you build?', 'A prefix-sum array — then any range is two lookups.'],
      ],
    },

    {
      id: 'tree', rank: 3, name: 'Trees and BSTs', tier: 1,
      one: 'Highest value per hour for a front-end candidate: the DOM is a tree, event bubbling is a path to the root, and interviewers reach for those framings.',
      why: 'Whenever data is hierarchical, or a problem mentions parents, children, levels or ancestors. The recursion is the structure — most tree problems are "what does each subtree report upward, and what constraint comes downward".',
      build: `class Node:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

# The three DFS orders differ only in WHERE the visit happens.
# Written out in full, because the difference IS the lesson.

def preorder(node):
    if not node:
        return
    visit(node)                 # <- before the children
    preorder(node.left)
    preorder(node.right)

def inorder(node):
    if not node:
        return
    inorder(node.left)
    visit(node)                 # <- between them; sorted order for a BST
    inorder(node.right)

def postorder(node):
    if not node:
        return
    postorder(node.left)
    postorder(node.right)
    visit(node)                 # <- after both children`,
      ops: [
        ['DFS traversal', 'O(n) time, O(h) stack', 'h is the height — O(log n) if balanced, O(n) if degenerate.'],
        ['BFS traversal', 'O(n) time, O(w) queue', 'w is the widest level.'],
        ['BST search / insert', 'O(h)', 'O(log n) balanced, O(n) if the tree is a list.'],
        ['BST inorder', 'O(n)', 'Yields sorted order. This is the property BST problems hinge on.'],
      ],
      cold: [
        'All three DFS orders recursively, and preorder iteratively with a stack.',
        'BFS level by level, snapshotting len(queue) before the inner loop.',
        'Depth, diameter, "is balanced" as postorder returns.',
        'BST validation with a (low, high) range passed downward.',
        'Lowest common ancestor.',
        'Serialise and deserialise with an explicit null marker.',
      ],
      pitfalls: 'Validating a BST against the immediate parent instead of a range. Forgetting the level snapshot in BFS, which merges levels. Recursion depth on a degenerate tree.',
      quiz: [
        ['How do you validate a BST?', 'DFS carrying an allowed (low, high) range that narrows going down. Every node must lie strictly inside it. Comparing to the parent alone is the classic wrong answer.'],
        ['Which traversal yields a BST in sorted order?', 'Inorder: left, node, right.'],
        ['Diameter — what does the recursion return, and what does it record?', 'It returns height upward, while separately recording the best left+right path through each node. Returning one thing and recording another is the shape to recognise.'],
      ],
    },

    {
      id: 'graph', rank: 4, name: 'Graphs', tier: 1,
      one: 'Over-represented in web interviews via dependency graphs, module resolution and import cycles.',
      why: 'The moment a problem has things and relationships between them. Also whenever you see a grid, a set of prerequisites, or a word-transformation puzzle — those are all graphs in costume.',
      build: `from collections import defaultdict

g = defaultdict(list)
for u, v in edges:
    g[u].append(v)
    g[v].append(u)          # OMIT for a directed graph -- the most
                            # common silent bug in graph problems

# in-degrees, for topological sort
indeg = {u: 0 for u in nodes}
for u, v in edges:
    indeg[v] += 1`,
      ops: [
        ['build adjacency list', 'O(V+E)', 'Almost always right. An adjacency matrix only for dense graphs or O(1) edge tests.'],
        ['BFS', 'O(V+E)', 'Shortest path, unweighted only.'],
        ['DFS', 'O(V+E)', 'Reachability and components. Iterative on big graphs.'],
        ['topological sort', 'O(V+E)', 'Directed acyclic only; the emitted count detects cycles.'],
        ['Dijkstra', 'O(E log V)', 'Weighted shortest path, non-negative weights.'],
      ],
      cold: [
        'Edge list → adjacency list, directed and undirected.',
        'BFS with seen marked on ENQUEUE.',
        'DFS recursive, and iteratively with an explicit stack.',
        'Kahn topological sort with the count check.',
        'Directed cycle detection with an in-progress set.',
      ],
      pitfalls: 'Building undirected edges for a directed problem. Marking seen on dequeue. Recursion depth at 10^5 nodes. Forgetting isolated nodes when initialising in-degrees.',
      quiz: [
        ['How does Kahn detect a cycle?', 'Count what you emit. Fewer than V means some nodes never reached in-degree zero, so they sit in a cycle. The count IS the detector.'],
        ['Why does BFS only give shortest paths on unweighted graphs?', 'BFS orders by number of edges. With weights, a path with more edges can be cheaper, so you need Dijkstra.'],
        ['"Detect a circular import" — what is this problem?', 'Directed cycle detection: DFS with an in-progress set, or Kahn and check the count.'],
      ],
    },

    {
      id: 'heap', rank: 5, name: 'Heap / priority queue', tier: 2,
      one: 'The answer whenever you need the extreme repeatedly but not the whole order.',
      why: 'Top-k, streaming, and scheduling. If you catch yourself re-sorting inside a loop, or asking for the minimum again and again, that is a heap.',
      build: `import heapq

h = []
heapq.heappush(h, x)
smallest = h[0]              # peek, O(1)
heapq.heappop(h)
heapq.heapify(xs)            # O(n), in place -- cheaper than n pushes

heapq.heappush(h, -x)        # MAX-heap: push negatives
heapq.heappush(h, (cost, tiebreak, item))   # tuples for non-comparables`,
      ops: [
        ['push', 'O(log n)', ''],
        ['pop min', 'O(log n)', ''],
        ['peek min', 'O(1)', 'h[0]. No pop needed.'],
        ['heapify', 'O(n)', 'Beats pushing n times.'],
        ['find max in a min-heap', 'O(n)', 'A heap gives you ONE end. Both ends means two heaps.'],
        ['delete arbitrary', 'O(n)', 'Use lazy deletion — mark and skip on pop.'],
      ],
      cold: [
        'Fixed-size-k heap for top-k, min-heap for k largest.',
        'Max-heap via negation.',
        'Heap of end times for interval scheduling.',
        'Two heaps for a running median.',
        'Tuples with a tiebreak for non-comparable payloads.',
      ],
      pitfalls: 'Using a max-heap for k largest and holding all n. Forgetting Python heaps are min-only. Pushing objects that cannot be compared.',
      quiz: [
        ['For the k largest, which heap and why?', 'A MIN-heap of size k: the weakest of your current best sits on top, so each candidate is one O(log k) comparison and the heap never grows past k.'],
        ['Running median from a stream?', 'Two heaps — max-heap for the lower half, min-heap for the upper — kept within one in size. The median is at the tops.'],
        ['When is a heap NOT better than sorting?', 'When k approaches n. Then O(n log k) is O(n log n) and a sort is simpler.'],
      ],
    },

    {
      id: 'stack', rank: 6, name: 'Stack', tier: 1,
      one: 'Nesting, matching, undo, and the whole monotonic-stack family.',
      why: 'Whenever the most recent unresolved thing is the one you need next: brackets, parsing, and "next greater element". Also how you convert a recursion into a loop when depth is a problem.',
      build: `stack = []
stack.append(x)
top = stack[-1]          # peek -- guard for empty first
stack.pop()

# Monotonic: store INDICES, keep values ordered
for i, x in enumerate(xs):
    while stack and xs[stack[-1]] < x:
        j = stack.pop()      # the pop is where you compute
    stack.append(i)`,
      ops: [
        ['push / pop / peek', 'O(1)', 'A plain list is a stack in Python.'],
        ['monotonic scan', 'O(n) total', 'Each index pushed once and popped once, whatever the inner while looks like.'],
      ],
      cold: [
        'Bracket matching, including the empty-at-end check.',
        'Monotonic stack storing indices.',
        'Iterative DFS.',
        'Min-stack, storing the running minimum alongside each element.',
      ],
      pitfalls: 'Peeking without checking empty. Storing values when you need index distances. Forgetting that a leftover non-empty stack usually means unmatched input.',
      quiz: [
        ['Why is a monotonic stack O(n) despite the inner while loop?', 'Every index is pushed once and popped at most once, so total work is bounded by 2n regardless of how the pops cluster.'],
        ['Min-stack in O(1) — why does one min variable fail?', 'Because pop can remove the minimum and you have no record of the previous one. Store the running min per element instead.'],
      ],
    },

    {
      id: 'queue', rank: 7, name: 'Queue and deque', tier: 1,
      one: 'BFS runs on one, and the deque variant powers sliding-window maximum.',
      why: 'Whenever order of arrival matters, or you are exploring by distance. In Python always collections.deque — a list is a correctness-level trap here, not a style preference.',
      build: `from collections import deque

q = deque([start])
q.append(x)        # right
q.popleft()        # left, O(1)  -- list.pop(0) is O(n)
q.appendleft(x)    # for 0-1 BFS
q[0], q[-1]        # both ends, O(1)`,
      ops: [
        ['append / pop (either end)', 'O(1)', ''],
        ['list.pop(0)', 'O(n)', 'Turns a BFS into O(n^2). The reason deque is not optional.'],
        ['index into the middle', 'O(n)', 'A deque is not an array.'],
      ],
      cold: [
        'BFS with a deque and a level snapshot.',
        'Monotonic deque for window maximum, dropping from both ends.',
        'Two stacks making a queue, and why it is amortised O(1).',
      ],
      pitfalls: 'Using a list as a queue. Indexing a deque in a loop. Forgetting to drop front elements that have fallen out of the window.',
      quiz: [
        ['Why must BFS use a deque rather than a list?', 'popleft() is O(1) on a deque and O(n) on a list, which silently makes the whole BFS quadratic.'],
        ['In sliding-window maximum, what does the deque hold?', 'Indices, in decreasing value order. The front is the current maximum; you pop the back while smaller values arrive and drop the front when it leaves the window.'],
      ],
    },

    {
      id: 'grid', rank: 8, name: 'Grid / matrix', tier: 2,
      one: 'A graph wearing a costume. Once the node is (row, col), the whole graph toolkit applies unchanged.',
      why: 'Islands, flood fill, mazes, spreading processes. The moment you recognise it as a graph, you stop inventing and start reusing.',
      build: `rows = len(grid)
cols = len(grid[0])
DIRS = ((1, 0), (-1, 0), (0, 1), (0, -1))     # add diagonals if asked

def nbrs(r, c):
    for dr, dc in DIRS:
        nr, nc = r + dr, c + dc
        if 0 <= nr < R and 0 <= nc < C:
            yield nr, nc

# Multi-source BFS: every source in the queue BEFORE the first step
q = deque((r, c) for r in range(R) for c in range(C) if grid[r][c] == SRC)`,
      ops: [
        ['visit every cell', 'O(R*C)', ''],
        ['BFS / DFS over the grid', 'O(R*C)', 'Each cell enters once if you mark on enqueue.'],
        ['in-place visited marking', 'O(1) space', 'Overwrite the cell. Say out loud that you are mutating the input.'],
        ['bounds check', 'O(1)', 'Name the dimensions rows and cols rather than R and C -- the code is read far more often than it is typed.'],
      ],
      cold: [
        'The four-direction delta loop with bounds checking.',
        'Islands by sinking as you visit.',
        'Multi-source BFS.',
        'Spiral traversal and in-place rotation.',
      ],
      pitfalls: 'Mutating the input without mentioning it. Running BFS once per source instead of seeding them all. Assuming the grid is square (R and C differ).',
      quiz: [
        ['Rotting oranges — why multi-source BFS?', 'All rotten oranges start spreading at minute zero, so they all go in the queue before the first step. Levels then count minutes directly.'],
        ['How do you avoid a visited set in a grid DFS?', 'Overwrite visited cells in the grid itself — but declare that you are mutating the caller’s data.'],
      ],
    },

    {
      id: 'linked-list', rank: 9, name: 'Linked list', tier: 2,
      one: 'Less fashionable than it was, still asked. Cheap to make solid because the problem set is small and closed.',
      why: 'Rarely the best choice in real code, but the pointer manipulation shows up inside harder problems — LRU caches, list reversal in place, merge steps.',
      build: `class Node:
    def __init__(self, val, nxt=None):
        self.val, self.next = val, nxt

# Reversal: save next BEFORE reassigning
prev, cur = None, head
while cur:
    nxt = cur.next
    cur.next = prev
    prev, cur = cur, nxt
return prev

dummy = Node(0, head)     # gives every real node a predecessor`,
      ops: [
        ['insert / delete given the node', 'O(1)', 'The one genuine advantage over an array.'],
        ['index access', 'O(n)', 'No random access, ever.'],
        ['find the middle', 'O(n), O(1) space', 'Fast and slow pointers.'],
        ['reverse', 'O(n), O(1) space', 'Iterative, three pointers.'],
      ],
      cold: [
        'Iterative reversal.',
        'Fast/slow for middle and cycle detection.',
        'Merging two sorted lists.',
        'A dummy head to remove first-element special cases.',
      ],
      pitfalls: 'Losing the tail by reassigning next before saving it. Not using a dummy head and then writing four branches. Not null-checking fast.next.',
      quiz: [
        ['What is a dummy head for?', 'It gives every real node a predecessor, so insertion and deletion at the front need no special case. Fewer branches, fewer bugs.'],
        ['Why does fast-and-slow prove a cycle?', 'Inside a cycle the gap closes by one per step, so they must coincide. Without a cycle, fast reaches the end first.'],
      ],
    },

    {
      id: 'trie', rank: 10, name: 'Trie', tier: 2,
      one: 'The most naturally front-end structure there is — autocomplete is the daily-work version of it.',
      why: 'Any prefix question. A hash set answers exact membership only; a trie answers "what starts with this" and shares storage across common prefixes.',
      build: `END = '$'
root = {}
for w in words:
    node = root
    for ch in w:
        node = node.setdefault(ch, {})
    node[END] = True        # without this, "car" matches after
                            # inserting only "carpet"`,
      ops: [
        ['insert', 'O(len)', 'Independent of how many words are stored.'],
        ['exact search', 'O(len)', ''],
        ['startsWith', 'O(len)', 'The reason the structure exists.'],
        ['enumerate under a prefix', 'O(size of subtree)', 'Walk to the node, then DFS. Or precompute top-k per node.'],
        ['space', 'O(total characters)', 'Shared prefixes are stored once.'],
      ],
      cold: [
        'Insert and search with nested dicts plus an end marker.',
        'Prefix walk then DFS to enumerate.',
        'Top-k stored at each node for autocomplete.',
      ],
      pitfalls: 'Omitting the end-of-word flag. Building a class hierarchy when nested dicts would do. Rebuilding per query.',
      quiz: [
        ['Why a trie instead of a hash set for prefix search?', 'A set can only answer exact membership. A trie makes lookup cost the word length regardless of dictionary size, and enumerating a prefix becomes a subtree walk.'],
        ['Autocomplete must answer in O(1) per keystroke. How?', 'Store the top three results AT each node when building, so a keystroke is a single pointer move rather than a subtree search.'],
      ],
    },

    {
      id: 'union-find', rank: 11, name: 'Union-Find', tier: 2,
      one: 'Fifteen lines that unlock a whole class of grouping problems. The best payoff per line memorised in the whole set.',
      why: 'Undirected connectivity, especially when edges arrive over time. DFS would have to re-run from scratch after each new edge; Union-Find just merges.',
      build: `parent = list(range(n))
size = [1] * n

def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]   # path compression
        x = parent[x]
    return x

def union(a, b):
    root_a = find(a)
    root_b = find(b)

    if root_a == root_b:
        return False            # already joined -> this edge closes a cycle

    # Hang the smaller tree off the larger, so the trees stay shallow.
    if size[root_a] < size[root_b]:
        root_a, root_b = root_b, root_a

    parent[root_b] = root_a
    size[root_a] += size[root_b]
    return True`,
      ops: [
        ['find', 'Near O(1) amortised', 'With path compression. O(n) without it.'],
        ['union', 'Near O(1) amortised', 'Union by size or rank keeps trees flat.'],
        ['count components', 'O(n)', 'Count the roots, or decrement on each successful union.'],
        ['undo a union', 'Not supported', 'Path compression is what makes rollback hard.'],
      ],
      cold: [
        'find with path compression.',
        'union by size, returning whether it merged.',
        'Counting components.',
        'Mapping non-integer labels to indices with a dict.',
      ],
      pitfalls: 'Unioning nodes instead of their roots. Omitting compression. Reaching for it on a directed graph, where it does not apply.',
      quiz: [
        ['Union-Find or DFS for connected components?', 'Either on a static graph. Union-Find wins when edges arrive incrementally, since DFS would need a full re-run per edge.'],
        ['How do you find the edge that creates a cycle?', 'union() returning False. The first such edge in input order is the answer.'],
      ],
    },

    {
      id: 'deque', rank: 12, name: 'Monotonic deque', tier: 3,
      one: 'A specialised use of a deque, separated out because it is the one structure people fail to recognise as a structure.',
      why: 'When you need an extreme over a sliding range. A heap cannot do it cleanly because elements must expire by position, not by value.',
      build: `from collections import deque

dq = deque()                  # holds INDICES, values decreasing
for i, x in enumerate(xs):
    while dq and xs[dq[-1]] <= x:
        dq.pop()              # x is bigger and newer: they can never win
    dq.append(i)
    if dq[0] <= i - k:
        dq.popleft()          # expired by position
    # xs[dq[0]] is the maximum of the current window`,
      ops: [
        ['amortised per element', 'O(1)', 'Pushed once, popped once.'],
        ['read the extreme', 'O(1)', 'Always at the front.'],
      ],
      cold: ['Window maximum, dropping from the back on value and the front on position.'],
      pitfalls: 'Confusing the two pop directions. Wrong strictness on equal values.',
      quiz: [
        ['Why not a heap for sliding-window maximum?', 'A heap cannot expire elements by position. You would need lazy deletion and the bookkeeping is worse than the deque.'],
      ],
    },
  ],
};
