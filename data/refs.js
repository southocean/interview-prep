/* External references, keyed by page id (pattern, structure or technique).
 *
 * Every URL in here was checked with a real request before being committed --
 * see the link check in the README. Entries with no good source are simply
 * absent: a page that says "further reading" and then points at something
 * vaguely adjacent is worse than one that says nothing.
 *
 * Preference order: something with a visualisation or animation first, then a
 * solid written reference.
 */
window.REFS = {
  // ------------------------------------------------------------ patterns --
  'hash-count': [
    ['Hash table', 'https://en.wikipedia.org/wiki/Hash_table', 'wiki'],
    ['VisuAlgo — hash table, animated', 'https://visualgo.net/en/hashtable', 'viz'],
  ],
  'binary-index': [
    ['Binary search algorithm', 'https://en.wikipedia.org/wiki/Binary_search_algorithm', 'wiki'],
  ],
  'tree-dfs': [
    ['Depth-first search', 'https://en.wikipedia.org/wiki/Depth-first_search', 'wiki'],
    ['VisuAlgo — DFS and BFS, animated', 'https://visualgo.net/en/dfsbfs', 'viz'],
  ],
  'tree-bfs': [
    ['Breadth-first search', 'https://en.wikipedia.org/wiki/Breadth-first_search', 'wiki'],
    ['VisuAlgo — DFS and BFS, animated', 'https://visualgo.net/en/dfsbfs', 'viz'],
  ],
  'graph-dfs': [
    ['Connected component', 'https://en.wikipedia.org/wiki/Component_(graph_theory)', 'wiki'],
    ['VisuAlgo — graph traversal', 'https://visualgo.net/en/dfsbfs', 'viz'],
  ],
  'topo': [
    ['Topological sorting', 'https://en.wikipedia.org/wiki/Topological_sorting', 'wiki'],
    ['VisuAlgo — topological sort, animated', 'https://visualgo.net/en/dfsbfs', 'viz'],
  ],
  'heap-topk': [
    ['Binary heap', 'https://en.wikipedia.org/wiki/Binary_heap', 'wiki'],
    ['VisuAlgo — heap operations, animated', 'https://visualgo.net/en/heap', 'viz'],
  ],
  'memo': [
    ['Memoization', 'https://en.wikipedia.org/wiki/Memoization', 'wiki'],
    ['Dynamic programming', 'https://en.wikipedia.org/wiki/Dynamic_programming', 'wiki'],
  ],
  'backtracking': [
    ['Backtracking', 'https://en.wikipedia.org/wiki/Backtracking', 'wiki'],
    ['VisuAlgo — recursion tree', 'https://visualgo.net/en/recursion', 'viz'],
  ],
  'union-find': [
    ['Disjoint-set data structure', 'https://en.wikipedia.org/wiki/Disjoint-set_data_structure', 'wiki'],
    ['VisuAlgo — union-find, animated', 'https://visualgo.net/en/ufds', 'viz'],
  ],
  'prefix': [
    ['Prefix sum', 'https://en.wikipedia.org/wiki/Prefix_sum', 'wiki'],
  ],
  'trie': [
    ['Trie', 'https://en.wikipedia.org/wiki/Trie', 'wiki'],
  ],
  'fast-slow': [
    ['Cycle detection (Floyd and Brent)', 'https://en.wikipedia.org/wiki/Cycle_detection', 'wiki'],
  ],
  'greedy': [
    ['Greedy algorithm', 'https://en.wikipedia.org/wiki/Greedy_algorithm', 'wiki'],
    ['Matroid — why greedy is provably optimal', 'https://en.wikipedia.org/wiki/Matroid', 'wiki'],
  ],
  'kway': [
    ['k-way merge algorithm', 'https://en.wikipedia.org/wiki/K-way_merge_algorithm', 'wiki'],
  ],
  'dijkstra': [
    ["Dijkstra's algorithm", 'https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm', 'wiki'],
    ['VisuAlgo — shortest paths, animated', 'https://visualgo.net/en/sssp', 'viz'],
  ],
  'quickselect': [
    ['Quickselect', 'https://en.wikipedia.org/wiki/Quickselect', 'wiki'],
  ],
  'sweep': [
    ['Sweep line algorithm', 'https://en.wikipedia.org/wiki/Sweep_line_algorithm', 'wiki'],
  ],
  'deque-mono': [
    ['Monotonic stack discussion', 'https://en.wikipedia.org/wiki/Stack_(abstract_data_type)', 'wiki'],
  ],

  // ---------------------------------------------------------- structures --
  'array': [['Array data structure', 'https://en.wikipedia.org/wiki/Array_(data_structure)', 'wiki']],
  'hash': [
    ['Hash table', 'https://en.wikipedia.org/wiki/Hash_table', 'wiki'],
    ['VisuAlgo — hash table, animated', 'https://visualgo.net/en/hashtable', 'viz'],
  ],
  'tree': [
    ['Binary search tree', 'https://en.wikipedia.org/wiki/Binary_search_tree', 'wiki'],
    ['VisuAlgo — BST, animated', 'https://visualgo.net/en/bst', 'viz'],
  ],
  'graph': [
    ['Graph (abstract data type)', 'https://en.wikipedia.org/wiki/Graph_(abstract_data_type)', 'wiki'],
    ['VisuAlgo — graph structures', 'https://visualgo.net/en/graphds', 'viz'],
  ],
  'heap': [
    ['Binary heap', 'https://en.wikipedia.org/wiki/Binary_heap', 'wiki'],
    ['VisuAlgo — heap, animated', 'https://visualgo.net/en/heap', 'viz'],
  ],
  'stack': [['Stack (abstract data type)', 'https://en.wikipedia.org/wiki/Stack_(abstract_data_type)', 'wiki']],
  'queue': [
    ['Double-ended queue', 'https://en.wikipedia.org/wiki/Double-ended_queue', 'wiki'],
    ['VisuAlgo — linked structures', 'https://visualgo.net/en/list', 'viz'],
  ],
  'linked-list': [
    ['Linked list', 'https://en.wikipedia.org/wiki/Linked_list', 'wiki'],
    ['VisuAlgo — linked list, animated', 'https://visualgo.net/en/list', 'viz'],
  ],

  // ---------------------------------------------------------- techniques --
  'sorting': [
    ['Sorting algorithm', 'https://en.wikipedia.org/wiki/Sorting_algorithm', 'wiki'],
    ['VisuAlgo — sorting, animated', 'https://visualgo.net/en/sorting', 'viz'],
  ],
  'counting-sort': [['Counting sort', 'https://en.wikipedia.org/wiki/Counting_sort', 'wiki']],
  'recursion': [
    ['Recursion (computer science)', 'https://en.wikipedia.org/wiki/Recursion_(computer_science)', 'wiki'],
    ['VisuAlgo — recursion tree, animated', 'https://visualgo.net/en/recursion', 'viz'],
  ],
  'divide-conquer': [
    ['Divide-and-conquer algorithm', 'https://en.wikipedia.org/wiki/Divide-and-conquer_algorithm', 'wiki'],
    ['VisuAlgo — merge sort, animated', 'https://visualgo.net/en/sorting', 'viz'],
  ],
  'kadane': [['Maximum subarray problem', 'https://en.wikipedia.org/wiki/Maximum_subarray_problem', 'wiki']],
  'sentinel': [['Sentinel value', 'https://en.wikipedia.org/wiki/Sentinel_value', 'wiki']],
  'expand-centre': [['Longest palindromic substring', 'https://en.wikipedia.org/wiki/Longest_palindromic_substring', 'wiki']],
  'bit-tricks': [
    ['Bit manipulation', 'https://en.wikipedia.org/wiki/Bit_manipulation', 'wiki'],
    ['Bitwise operators in JS (MDN)', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators', 'docs'],
  ],
  'tabulation': [['Dynamic programming', 'https://en.wikipedia.org/wiki/Dynamic_programming', 'wiki']],
  'knapsack': [['Knapsack problem', 'https://en.wikipedia.org/wiki/Knapsack_problem', 'wiki']],
  'lis-patience': [['Longest increasing subsequence', 'https://en.wikipedia.org/wiki/Longest_increasing_subsequence', 'wiki']],
  'bellman-ford': [
    ['Bellman-Ford algorithm', 'https://en.wikipedia.org/wiki/Bellman%E2%80%93Ford_algorithm', 'wiki'],
    ['VisuAlgo — shortest paths, animated', 'https://visualgo.net/en/sssp', 'viz'],
  ],
  'mst': [
    ['Minimum spanning tree', 'https://en.wikipedia.org/wiki/Minimum_spanning_tree', 'wiki'],
    ['VisuAlgo — MST, animated', 'https://visualgo.net/en/mst', 'viz'],
  ],
  'floyd-warshall': [
    ['Floyd-Warshall algorithm', 'https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm', 'wiki'],
  ],
  'cycle-directed': [['Cycle (graph theory)', 'https://en.wikipedia.org/wiki/Cycle_(graph_theory)', 'wiki']],
  'lru-cache': [['Cache replacement policies', 'https://en.wikipedia.org/wiki/Cache_replacement_policies', 'wiki']],
  'rolling-hash': [
    ['Rolling hash', 'https://en.wikipedia.org/wiki/Rolling_hash', 'wiki'],
    ['Rabin-Karp algorithm', 'https://en.wikipedia.org/wiki/Rabin%E2%80%93Karp_algorithm', 'wiki'],
  ],
};
