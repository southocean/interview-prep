/* What to study, in what order, for a front-end-specialised SWE loop. */
window.TIERS = {
  note: 'Google runs generic DSA even for web roles -- do not skip trees and graphs because the job is front end. But the weighting below is real: tree and graph traversal is over-represented because the DOM IS a tree and a module graph IS a DAG, and interviewers reach for domain-flavoured framings.',
  tiers: [
    {
      name: 'Tier 1 -- expect these',
      odds: 'Near-certain. Roughly 70% of coding rounds land here.',
      topics: [
        ['Arrays and strings', 'Two pointers, in-place moves, reversal. The substrate for everything else.'],
        ['Hash maps and sets', 'Frequency counting, dedup, seen-sets, index lookup. The single most used structure in interviews.'],
        ['Sliding window', 'Any "longest / shortest / at most K" over a contiguous run.'],
        ['Sorting + custom comparators', 'Knowing WHEN to sort is the skill. Sorting first collapses a surprising number of problems.'],
        ['Binary search', 'On an index, and on the answer. The second form is what separates mid from senior.'],
        ['Trees: BFS and DFS', 'Traversals, depth, path-to-root, level order. Highest value per hour for a front-end candidate.'],
        ['Graphs: BFS, DFS, topological sort', 'Cycle detection and dependency ordering. Topo sort is the module-bundler question in disguise.'],
        ['Stacks and queues', 'Bracket matching, monotonic stack, undo/redo, parsing.'],
        ['Recursion', 'Not a topic so much as a prerequisite for trees, graphs, backtracking and DP.'],
      ],
    },
    {
      name: 'Tier 2 -- likely at senior level',
      odds: 'Common. Expect at least one across a full loop.',
      topics: [
        ['Heaps / top-k', 'Top-k, k-way merge, "smallest end time" scheduling. Reach for it when you need repeated min/max, not a full sort.'],
        ['Intervals and sweep line', 'Merge, overlap counting, room allocation. Sort by time, sweep once.'],
        ['Dynamic programming', '1D and 2D, memoisation first then tabulation. Climbing stairs to edit distance is the useful range.'],
        ['Prefix sums / difference arrays', 'Range sums, and the O(n+T) trick when values are bounded.'],
        ['Tries', 'Prefix search and autocomplete -- the most naturally front-end-flavoured structure there is.'],
        ['Union-Find', 'Connected components, grouping, cycle detection in undirected graphs. ~15 lines, high payoff.'],
        ['LRU cache', 'Classic, and in JS almost free because Map preserves insertion order.'],
        ['Grid / matrix traversal', 'Islands, flood fill, shortest path in a maze. BFS/DFS with (r,c) state.'],
        ['Linked lists', 'Reversal, cycle detection, merge. Less fashionable than it was, still asked.'],
      ],
    },
    {
      name: 'Tier 3 -- know it exists',
      odds: 'Rare. Recognise and name it; do not sink weeks here.',
      topics: [
        ['Bit manipulation', 'XOR tricks, masks, subset enumeration. Occasionally a warm-up.'],
        ['Dijkstra / MST', 'Weighted shortest path. Worth being able to describe even if you never code it.'],
        ['Backtracking at depth', 'N-queens, sudoku. Know the template shape.'],
        ['Segment trees, Fenwick', 'Almost never at Google interview level. Skip until everything above is solid.'],
      ],
    },
  ],
};
