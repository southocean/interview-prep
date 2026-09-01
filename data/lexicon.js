/* The linkifier's vocabulary.
 *
 * Maps a phrase, as it is actually written in prose, to the page that explains
 * it. app.js turns these into links wherever it renders an index-like table --
 * the constraint lookup, the study tiers, and the cue-to-reflex table -- so you
 * can jump from "sweep" straight to the sweep page.
 *
 * `pat:` and `str:` prefixes resolve to pattern and structure pages, and both
 * are checked against the real ids by the graph validator in the README. A
 * typo here fails that check rather than rendering a dead link.
 *
 * DELIBERATELY NOT EXHAUSTIVE. Prose linked on every other word is harder to
 * read, not easier. Terms with no page (Floyd-Warshall, coordinate compression,
 * bitmask enumeration) are left as plain text rather than pointed somewhere
 * approximate -- a link that lands on the wrong page is worse than no link.
 *
 * Longest phrase wins, so "binary search on the answer" beats "binary search".
 */
window.LEXICON = {
  // --- searching ---
  'binary search on the answer': 'pat:binary-answer',
  'binary search on the ANSWER': 'pat:binary-answer',
  'binary search': 'pat:binary-index',

  // --- scanning ---
  'sliding window': 'pat:window',
  'two pointers': 'pat:two-pointers',
  'fast and slow pointers': 'pat:fast-slow',
  'prefix sums': 'pat:prefix',
  'prefix sum': 'pat:prefix',
  'difference array': 'pat:prefix',

  // --- lookup ---
  'hash map': 'pat:hash-count',
  'hash set': 'str:hash',
  'seen-set': 'str:hash',

  // --- ordering ---
  'sort then sweep': 'pat:sweep',
  'sweep line': 'pat:sweep',
  'sweep': 'pat:sweep',
  'exchange argument': 'pat:greedy',
  'greedy': 'pat:greedy',

  // --- priority ---
  'heap of size k': 'pat:heap-topk',
  'size-k heap': 'pat:heap-topk',
  'two heaps': 'pat:heap-topk',
  'min-heap': 'str:heap',
  'max-heap': 'str:heap',
  'heap': 'str:heap',
  'k-way merge': 'pat:kway',
  'quickselect': 'pat:quickselect',

  // --- trees and graphs ---
  'topological sort': 'pat:topo',
  'topo sort': 'pat:topo',
  'dijkstra': 'pat:dijkstra',
  'multi-source BFS': 'pat:tree-bfs',
  'BFS': 'pat:tree-bfs',
  'DFS': 'pat:graph-dfs',
  'postorder': 'pat:tree-dfs',
  'union-find': 'pat:union-find',
  'trie': 'pat:trie',
  'adjacency list': 'str:graph',

  // --- recursion ---
  'memoisation': 'pat:memo',
  'memoised recursion': 'pat:memo',
  'backtracking': 'pat:backtracking',
  'interval DP': 'pat:memo',
  'bitmask DP': 'pat:memo',
  '2D DP': 'pat:memo',
  'DP': 'pat:memo',
  'subsets': 'pat:backtracking',
  'permutations': 'pat:backtracking',

  // --- stacks ---
  'monotonic deque': 'pat:deque-mono',
  'monotonic stack': 'pat:deque-mono',
  'stack': 'str:stack',
  'deque': 'str:queue',

  // --- structures by name ---
  'linked list': 'str:linked-list',
  'grid': 'str:grid',
};
