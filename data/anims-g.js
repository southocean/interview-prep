/* Animations, batch G: the last of the techniques.
 * Sentinels, palindromes, bits, DP variants, graph algorithms, caching, hashing.
 */
Object.assign(window.ANIMS, {

  // ============================================================== sentinel ==

  'sentinel': {
    title: 'Deleting the head of 1 -> 2 -> 3, with and without a dummy',
    cells: ['dummy', 1, 2, 3],
    label: 'list:',
    frames: [
      { mark: [1], stat: 'without a dummy: head is special', note: 'Deleting node 1 means reassigning head itself, which every other deletion does not. That is a whole extra branch.' },
      { stat: 'if node is head: head = head.next  else: prev.next = ...', note: 'Two code paths that must agree. The branch exists only for one position, and it is where the bug lives.' },
      { mark: [0], stat: 'dummy = Node(0, head)', note: 'One fake node in front. Now node 1 has a predecessor exactly like every other node.' },
      { mark: [0, 1], stat: 'prev = dummy   ->  prev.next = node.next', note: 'One code path for all positions. The special case has been deleted rather than handled.' },
      { mark: [2, 3], stat: 'return dummy.next   NOT head', note: 'head may be the node you removed. This is the bug the dummy introduces if you forget it.' },
      { stat: 'deleted branches cannot contain bugs', note: 'That is the whole argument for sentinels, and it applies well beyond linked lists.' },
    ],
  },

  'sentinel/0': {
    title: 'Returning head after deleting head',
    contrast: 'The dummy removes one bug and offers a new one. The fix is one identifier.',
    cells: ['dummy', 1, 2, 3],
    label: 'list:',
    frames: [
      { mark: [1], stat: 'remove node 1', note: 'The deletion itself works perfectly through the dummy.' },
      { mark: [0, 2], stat: 'dummy -> 2 -> 3', note: 'The list is correct. dummy.next is now node 2.' },
      { mark: [1], stat: 'return head  ->  returns node 1', note: 'head is still pointing at the node you just removed. The function returns the deleted element as if it were the list.' },
      { stat: 'and it LOOKS right on other inputs', note: 'Any test that does not delete the first node passes. That is what makes it survive to review.' },
      { mark: [2], stat: 'return dummy.next', note: 'One identifier. Always return through the sentinel, never through the variable you were handed.' },
    ],
  },

  'sentinel/1': {
    title: 'A trailing zero flushes the histogram stack',
    contrast: 'The base loop only pops when something shorter arrives. At the end nothing arrives, so tall bars are never measured.',
    cells: [2, 1, 5, 6],
    frames: [
      { ptrs: { i: 3 }, mark: [2, 3], stat: 'stack [1, 2, 3]  at end of scan', note: 'Bars 5 and 6 are still waiting for a shorter bar to their right. The array has run out.' },
      { stat: 'loop ends  ->  their areas are never computed', note: 'The two tallest bars contribute nothing, so the answer is silently too small.' },
      { stat: 'option A: a second loop after the scan', note: 'Works, and duplicates the area logic in two places that must stay in step.' },
      { mark: [3], stat: 'option B: heights.append(0)', note: 'Nothing is shorter than zero, so every remaining bar pops through the normal path.' },
      { ptrs: { i: 4 }, stat: 'pop 6 (area 6), pop 5 (area 10), pop 1', note: 'The existing loop does it. No new code, no second copy of the computation.' },
      { stat: 'and exclude the sentinel from the answer', note: 'Its own area is zero, so here it costs nothing — but remember to exclude sentinels from counts and outputs generally.' },
    ],
  },

  // ========================================================= expand-centre ==

  'expand-centre': {
    title: 'Longest palindrome in "babad": every centre, including the gaps',
    cells: ['b', 'a', 'b', 'a', 'd'],
    frames: [
      { stat: '2n - 1 = 9 centres', note: 'Five characters plus four gaps between them. Odd-length palindromes centre on a character, even-length ones on a gap.' },
      { ptrs: { c: 0 }, mark: [0], stat: 'centre 0: "b"   length 1', note: 'Expand outwards while the characters match. Immediately blocked on the left edge.' },
      { ptrs: { c: 1 }, mark: [0, 1, 2], stat: 'centre 1: "bab"   length 3', note: 's[0] == s[2], so it grows to three. Then index -1 stops it.' },
      { ptrs: { c: 2 }, mark: [1, 2, 3], stat: 'centre 2: "aba"   length 3', note: 'Another 3. Ties are fine — the problem asks for any longest one.' },
      { ptrs: { c: 3 }, mark: [3], stat: 'gap centre between 2 and 3: "ba"  ->  no match', note: 'The EVEN case. grow(i, i+1) is the call people forget, and without it every even-length palindrome is invisible.' },
      { stat: 'answer "bab" (or "aba"), length 3', note: 'O(n^2) worst case, which is expected. Manacher gets O(n) and is not worth memorising.' },
    ],
  },

  'expand-centre/0': {
    title: 'Counting palindromic substrings: every expansion is one more',
    contrast: 'The base keeps the longest. Counting needs no comparison at all — just a tally inside the growth loop.',
    cells: ['a', 'a', 'a'],
    frames: [
      { stat: 'count = 0', note: 'Every successful step outward from a centre is itself a palindrome.' },
      { ptrs: { c: 0 }, mark: [0], stat: 'centre 0: "a"   count 1', note: 'One expansion succeeded before the edge stopped it.' },
      { ptrs: { c: 1 }, mark: [0, 1], stat: 'gap 0-1: "aa"   count 2', note: 'The even centre. Without grow(i, i+1) this and every other even palindrome is missed.' },
      { ptrs: { c: 1 }, mark: [0, 1, 2], stat: 'centre 1: "a", then "aaa"   count 4', note: 'Two successful expansions from one centre, so two increments. The loop counts rather than compares.' },
      { ptrs: { c: 2 }, mark: [1, 2], stat: 'gap 1-2: "aa"   count 5', note: 'And the third character\'s own centre gives the sixth.' },
      { stat: 'answer 6', note: 'a, a, a, aa, aa, aaa. Same loop as the longest version, with a counter instead of a max.' },
    ],
  },

  'expand-centre/1': {
    title: 'n = 10^5: O(n^2) is too slow, and the honest answer is a name',
    contrast: 'The base tries 2n-1 centres, each expanding up to n. At 10^5 that is 10^10 character comparisons.',
    cells: ['a', 'a', 'a', 'a', 'a'],
    frames: [
      { range: [0, 4], stat: 'worst case: all identical characters', note: 'Every centre expands the full width, so the quadratic bound is actually reached.' },
      { stat: '10^5 characters  ->  ~10^10 comparisons', note: 'Minutes, not milliseconds. The approach is correct and unusable.' },
      { mark: [1, 2, 3], stat: 'the waste: centres re-compare the same characters', note: 'Adjacent centres cover almost the same ground, and nothing is carried between them.' },
      { stat: "Manacher's algorithm: O(n)", note: 'It reuses previously computed radii to skip comparisons already implied by symmetry.' },
      { stat: 'say the name, say you would look it up', note: 'That is received better than a half-remembered attempt. It is rarely required at interview level, and admitting the boundary is itself a signal.' },
    ],
  },

  // ============================================================ bit-tricks ==

  'bit-tricks': {
    title: 'XOR finds the unpaired value in [4, 1, 2, 1, 2]',
    cells: [4, 1, 2, 1, 2],
    frames: [
      { stat: 'lone = 0', note: 'XOR has two properties that do all the work: x ^ x == 0, and x ^ 0 == x.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'lone = 0 ^ 4 = 4', note: 'Order does not matter — XOR is commutative and associative, so the pairs can cancel in any arrangement.' },
      { ptrs: { at: 1 }, mark: [1], stat: 'lone = 4 ^ 1 = 5', note: 'An intermediate value with no meaning of its own. That is fine.' },
      { ptrs: { at: 3 }, mark: [1, 3], stat: 'the two 1s cancel', note: 'By the time both 1s have been folded in, their effect is exactly zero.' },
      { ptrs: { at: 4 }, mark: [2, 4], stat: 'the two 2s cancel too', note: 'Same for every pair, regardless of where they sit.' },
      { stat: 'lone = 4', note: 'Only the unpaired value survives. O(n) time, O(1) space, and no hash set.' },
    ],
  },

  'bit-tricks/0': {
    title: 'Every element three times except one: XOR stops working',
    contrast: 'The base cancels PAIRS. Three copies leave one behind, so the trick does not apply.',
    cells: [2, 2, 3, 2],
    frames: [
      { stat: 'XOR cancels in twos', note: 'Two 2s cancel, and the third 2 survives — indistinguishable from the answer.' },
      { mark: [0, 1, 3], stat: '2 ^ 2 ^ 2 = 2   (not 0)', note: 'The result is polluted by the very values you wanted removed.' },
      { stat: 'so: count set bits per POSITION', note: 'Generalise from "cancel pairs" to "count occurrences modulo k".' },
      { mark: [0, 1, 3], stat: 'bit 1: three 2s contribute 3.  3 % 3 = 0', note: 'Any value appearing three times contributes a multiple of three to every bit position.' },
      { mark: [2], stat: 'bit 0 and bit 1 from the single 3: 1 % 3 = 1', note: 'Only the lone value leaves a non-zero remainder, and it does so in exactly its own bits.' },
      { stat: 'answer 3.  O(32n)', note: 'The pattern generalises: k copies means modulo k. XOR is just the k = 2 case done in one instruction.' },
    ],
  },

  'bit-tricks/1': {
    title: 'JS: 1 << 31 goes negative',
    contrast: 'The base assumes arbitrary-precision integers. Every JS bitwise operator truncates to 32-bit signed first.',
    cells: [1073741824, 2147483648],
    label: '2^30 and 2^31:',
    frames: [
      { mark: [0], stat: '1 << 30 = 1073741824   correct', note: 'Fits in 31 bits, so the sign bit is untouched and the answer is what you expect.' },
      { mark: [1], stat: '1 << 31 = -2147483648', note: 'The bit lands ON the sign bit, and the result is reinterpreted as negative. No warning.' },
      { stat: 'but 2 ** 31 = 2147483648   fine', note: 'Plain arithmetic is exact to 2^53. It is only the BITWISE operators that truncate — which is what makes the bug confusing.' },
      { stat: 'x >>> 0 forces unsigned', note: 'The one operator that returns an unsigned 32-bit value. Useful for hash masking.' },
      { stat: 'or use BigInt for real bit work', note: 'Arbitrary precision, at a performance cost. For an interview, knowing the 32-bit boundary exists is the point.' },
      { stat: 'Python has no such limit', note: 'Which is why the site\'s snippets are in Python and this trap belongs to the front-end round.' },
    ],
  },

  // ========================================================== bitmask-enum ==

  'bitmask-enum': {
    title: 'Every subset of [a, b, c] as the integers 0..7',
    cells: ['a', 'b', 'c'],
    frames: [
      { stat: 'mask 000 = {}', note: 'Bit i set means item i is included. Counting from 0 to 2^n - 1 therefore enumerates every subset.' },
      { mark: [0], stat: 'mask 001 = {a}', note: 'Bit 0 set. Test with mask & (1 << i).' },
      { mark: [1], stat: 'mask 010 = {b}', note: 'No recursion, no path list, and nothing to un-choose.' },
      { mark: [0, 1], stat: 'mask 011 = {a, b}', note: 'The binary counter does the combinatorics for you.' },
      { mark: [0, 1, 2], stat: 'mask 111 = {a, b, c}', note: 'Eight masks, eight subsets, in a single flat loop.' },
      { stat: 'viable to about n = 20', note: '2^20 is a million. 2^25 is borderline at 33 million; 2^30 is a billion and out of reach.' },
    ],
  },

  'bitmask-enum/0': {
    title: 'Subsets of each subset: 3^n rather than 4^n',
    contrast: 'The base enumerates all masks once. Nesting it naively squares the work, and there is a trick that does not.',
    cells: ['000', '001', '010', '011'],
    label: 'masks:',
    frames: [
      { stat: 'naive: for mask, for sub in ALL masks', note: '2^n x 2^n = 4^n, and most inner iterations are skipped because sub is not inside mask.' },
      { mark: [3], stat: 'mask = 011.  sub starts at 011', note: 'Instead, walk only the actual submasks of mask.' },
      { mark: [2], stat: 'sub = (sub - 1) & mask  ->  010', note: 'Subtracting one borrows through the low bits; the AND clips whatever escaped back inside the mask.' },
      { mark: [1], stat: 'again  ->  001', note: 'Strictly decreasing, so it terminates, and it never visits anything outside mask.' },
      { mark: [0], stat: 'then 000, then stop', note: 'The loop ends when sub hits zero. Handle the empty submask separately if you need it.' },
      { stat: 'total is exactly 3^n', note: 'Each bit is in one of three states across a (mask, submask) pair: outside the mask, inside the mask only, or inside both.' },
    ],
  },

  'bitmask-enum/1': {
    title: 'n = 25 is borderline, n = 30 is not happening',
    contrast: 'The base is exponential by nature. Knowing where it stops being viable is part of knowing the technique.',
    cells: [20, 25, 30],
    label: 'n:',
    frames: [
      { mark: [0], stat: 'n = 20  ->  2^20 = 1,048,576', note: 'A million iterations. Comfortable, even with real work inside the loop.' },
      { mark: [1], stat: 'n = 25  ->  33,554,432', note: 'Thirty-three million. Fine if the body is a couple of operations, too slow if it allocates anything.' },
      { mark: [2], stat: 'n = 30  ->  1,073,741,824', note: 'A billion. Not feasible in an interview time limit in any language you would be writing.' },
      { stat: 'so the constraint tells you', note: 'n <= 20 in the problem statement is an invitation. n <= 30 means the intended solution is something else.' },
      { stat: 'and meet-in-the-middle buys ~2x', note: 'Splitting takes 2^n to 2 x 2^(n/2), which roughly doubles the workable n. It does not rescue n = 60.' },
    ],
  },

  // ============================================================ bitmask-dp ==

  'bitmask-dp': {
    title: 'Travelling salesman on 3 cities: state is (visited, position)',
    cells: [0, 1, 2],
    label: 'cities:',
    frames: [
      { stat: 'state = (mask of visited, current city)', note: 'The answer depends on WHICH cities are done, not how many — so the set itself goes in the key.' },
      { mark: [0], stat: '(001, at 0)   start', note: 'Only city 0 visited. n x 2^n states in total, which is 24 here.' },
      { mark: [0, 1], stat: '(011, at 1)   cost 0->1', note: 'Moving sets a bit. Two different orders reaching the same set collapse onto one state — that is the saving.' },
      { mark: [0, 2], stat: '(101, at 2)   a different branch', note: 'Same mask size, different set, so a genuinely different state.' },
      { mark: [0, 1, 2], stat: '(111, at 1) and (111, at 2)', note: 'All visited, but WHERE you finished still matters for the return trip, which is why position is in the state too.' },
      { stat: 'O(n^2 2^n), fine at n = 15', note: '15 x 32768 states with n transitions each. At n = 22 it is 92 million and out of reach — compute the state count first.' },
    ],
  },

  'bitmask-dp/0': {
    title: 'Closing the tour: charge the way home at the base case',
    contrast: 'The base stops when every city is visited. A cycle must also pay to return, which is one line.',
    cells: [0, 1, 2],
    label: 'cities:',
    frames: [
      { mark: [0, 1, 2], stat: 'mask == 111  ->  all visited', note: 'The path version stops here and returns 0.' },
      { mark: [2], stat: 'path answer: finishes at city 2, cost so far', note: 'A Hamiltonian PATH. Perfectly valid, and not what a tour asks for.' },
      { mark: [0, 2], stat: 'tour: still needs 2 -> 0', note: 'The salesman has to get home, and that edge has a cost nobody has paid yet.' },
      { stat: 'if mask == FULL: return cost[pos][start]', note: 'One line at the base case. The rest of the recursion is untouched.' },
      { stat: 'path vs cycle, one line apart', note: 'Same table, same transitions. Worth spotting quickly, because the two variants look identical in the problem statement.' },
    ],
  },

  'bitmask-dp/1': {
    title: 'n = 22: compute the state count before you start',
    contrast: 'The base is fine at n = 15. The state space is n x 2^n, which grows faster than the exponent alone suggests.',
    cells: [15, 18, 22],
    label: 'n:',
    frames: [
      { mark: [0], stat: 'n = 15  ->  15 x 32,768 = 491,520', note: 'Half a million states, each with 15 transitions. About 7 million operations. Comfortable.' },
      { mark: [1], stat: 'n = 18  ->  18 x 262,144 = 4.7M', note: 'Times 18 transitions is 85 million. Borderline, and memory for the cache is now a real consideration.' },
      { mark: [2], stat: 'n = 22  ->  22 x 4.2M = 92M states', note: 'Times 22 transitions is two billion. Not feasible, and the cache alone would exhaust memory.' },
      { stat: 'the arithmetic takes ten seconds', note: 'n x 2^n x transitions. Doing it before coding is the difference between the right approach and a wasted twenty minutes.' },
      { stat: 'n <= 20 is the invitation', note: 'Bitmask DP is the answer to a small-n exponential problem. Above that the intended solution is something else entirely.' },
    ],
  },

  // ============================================================ tabulation ==

  'tabulation': {
    title: 'Fibonacci bottom-up, then squeezed to two variables',
    cells: [0, 1, 1, 2, 3, 5],
    label: 'dp:',
    frames: [
      { mark: [0, 1], stat: 'dp[0] = 0, dp[1] = 1', note: 'Base cases first. Tabulation fills outward from them instead of recursing inward.' },
      { mark: [2], stat: 'dp[2] = dp[1] + dp[0] = 1', note: 'Each cell reads only cells already written. No call stack at all.' },
      { mark: [3], stat: 'dp[3] = dp[2] + dp[1] = 2', note: 'Iterative, so no recursion limit and no frame overhead.' },
      { mark: [4, 5], stat: 'dp[4] = 3, dp[5] = 5', note: 'Table complete. Same recurrence as the memoised version, filled in the opposite direction.' },
      { mark: [3, 4, 5], stat: 'only the last TWO cells are ever read', note: 'Now the space optimisation becomes visible — which it was not while the recursion was doing the bookkeeping.' },
      { stat: 'prev, cur = cur, prev + cur   ->  O(1) space', note: 'The whole array collapses to two variables. But only after the recurrence was proven correct.' },
    ],
  },

  'tabulation/0': {
    title: 'Rolling rows: O(n) space instead of O(m x n)',
    contrast: 'The base allocates the whole grid. If the recurrence only reaches one row back, the rest is dead weight.',
    cells: [0, 1, 2, 3],
    label: 'previous row:',
    frames: [
      { range: [0, 3], stat: 'dp[i][j] reads dp[i-1][*] and dp[i][j-1]', note: 'Look at what the recurrence actually touches: the row above, and the cell to the left.' },
      { mark: [0, 1], stat: 'nothing reads dp[i-2] or earlier', note: 'Every row older than the previous one is never read again. It is allocated and abandoned.' },
      { range: [0, 3], stat: 'keep only prev and cur', note: 'Two rows of length n rather than m rows of length n.' },
      { stat: 'prev = cur   at the end of each row', note: 'One assignment per row. Space drops from O(m x n) to O(n).' },
      { stat: 'but the path is now unrecoverable', note: 'Reconstructing WHICH edits or WHICH items were chosen needs the full table. The two goals are mutually exclusive.' },
      { stat: 'so: memoise, prove, then squeeze', note: 'The optimisation is only visible once the recurrence is right, which is why it comes last.' },
    ],
  },

  'tabulation/1': {
    title: 'Iteration direction: reading a cell before it is written',
    contrast: 'The base fills in one fixed order. Get the direction wrong and it reads uninitialised cells — silently.',
    cells: [0, 0, 0, 0, 0],
    label: 'dp over capacity:',
    frames: [
      { mark: [0], stat: '0/1 knapsack: each item ONCE', note: 'dp[c] must be built from values that have not yet seen this item.' },
      { mark: [1, 2], stat: 'DOWNWARD: for c in range(cap, w-1, -1)', note: 'Reading dp[c - w] reaches a lower index, which this pass has not touched yet. So it is still the previous item\'s value. Correct.' },
      { mark: [3, 4], stat: 'UPWARD: dp[c - w] was already updated', note: 'Now the value read already includes this item, so the item gets used twice.' },
      { stat: 'upward = unbounded knapsack', note: 'Which is a real algorithm and a correct one — for a different problem. Nothing crashes; you have solved something else.' },
      { stat: 'that is what makes it dangerous', note: 'No error, no exception. A plausible number for the wrong question.' },
      { stat: 'write the direction down before coding', note: 'One comment naming which cells must be stale. The most common tabulation bug, and the cheapest to prevent.' },
    ],
  },

  // ============================================================== knapsack ==

  'knapsack': {
    title: 'Capacity 5, items (w2,v3) and (w3,v4)',
    cells: [0, 0, 0, 0, 0, 0],
    label: 'dp[0..5]:',
    frames: [
      { range: [0, 5], stat: 'dp[c] = best value within capacity c', note: 'State in words first. One dimension, because the items are consumed by the outer loop.' },
      { mark: [2, 3], stat: 'item (w2, v3), c from 5 down to 2', note: 'Downward, so each read reaches a capacity this item has not touched.' },
      { mark: [2, 3, 4, 5], stat: 'dp = [0,0,3,3,3,3]', note: 'Any capacity of 2 or more can hold the first item.' },
      { mark: [3], stat: 'item (w3, v4): dp[3] = max(3, dp[0]+4) = 4', note: 'Take it or skip it. Taking means paying 3 capacity and reading dp[0].' },
      { mark: [5], stat: 'dp[5] = max(3, dp[2]+4) = 7', note: 'Both items fit: 3 + 4 = 7. dp[2] already held the first item, which is exactly the composition you want.' },
      { stat: 'answer 7   O(items x capacity)', note: 'Pseudo-polynomial: linear in the capacity NUMBER, not in its digits. Worth naming if capacity is huge.' },
    ],
  },

  'knapsack/0': {
    title: 'Unbounded: one loop direction, entirely different problem',
    contrast: 'The base iterates capacity downward so each item is used once. Upward lets it be reused.',
    cells: [0, 0, 0, 0, 0, 0],
    label: 'dp[0..5]:',
    frames: [
      { mark: [2], stat: 'item (w2, v3), UPWARD from 2', note: 'dp[2] = max(0, dp[0] + 3) = 3. Same as before at this point.' },
      { mark: [4], stat: 'dp[4] = max(0, dp[2] + 3) = 6', note: 'dp[2] already includes one copy of this item, and it is being read in the same pass. So the item is taken twice.' },
      { mark: [4], stat: 'two copies: 6', note: 'Correct for unbounded. In the 0/1 problem this would be a bug that produces a plausible larger number.' },
      { mark: [2, 4], stat: 'downward would have read the OLD dp[2] = 0', note: 'Which is what keeps each item to a single use. The direction encodes the constraint.' },
      { stat: 'coin change is unbounded knapsack', note: 'Unlimited coins per denomination, so the loop runs upward. Recognising it as the same template is worth more than memorising both.' },
    ],
  },

  'knapsack/1': {
    title: 'Partition [1, 5, 11, 5] into two equal halves',
    contrast: 'The base maximises value under a capacity. This is the same template with the value replaced by a boolean.',
    cells: [1, 5, 11, 5],
    frames: [
      { range: [0, 3], stat: 'total = 22', note: 'Two equal halves means each sums to 11. So the question is: can any subset sum to 11?' },
      { stat: 'odd total  ->  impossible, exit early', note: 'A free check before any DP. 22 is even, so continue.' },
      { mark: [0], stat: 'reachable = [T, F, ...]   target 11', note: 'dp[c] is now a boolean: is a sum of exactly c achievable? Sum 0 needs no items.' },
      { mark: [1], stat: 'after 1 and 5: {0, 1, 5, 6}', note: 'Each item, capacity downward, exactly as in 0/1 knapsack.' },
      { mark: [2], stat: 'after 11: {0, 1, 5, 6, 11, 12, 16, 17}', note: '11 alone reaches the target — but keep going, since other subsets may too.' },
      { stat: 'reachable[11] = True  ->  yes', note: '[11] and [1, 5, 5] both work. Partition, subset-sum and coin change are one template; seeing that is the win.' },
    ],
  },

  // =========================================================== interval-dp ==

  'interval-dp': {
    title: 'Burst balloons [3, 1, 5]: think about the LAST one',
    cells: [3, 1, 5],
    frames: [
      { stat: 'dp[i][j] = best score from the range (i, j)', note: 'State is a range, and it is split at every internal point. That gives O(n^2) states with O(n) choices each.' },
      { mark: [1], stat: 'wrong framing: which do I burst FIRST?', note: 'Burst 1 first and its neighbours become 3 and 5 — but after that, who neighbours whom depends on everything still to come. The subproblem is not independent.' },
      { mark: [1], stat: 'right framing: which do I burst LAST?', note: 'If 1 is last in this range, then when it pops its neighbours are exactly the range boundaries — fixed and known.' },
      { mark: [0, 2], stat: 'left and right are the range edges', note: 'That is what makes the subproblems independent: the two sides can be solved without knowing anything about each other.' },
      { mark: [0, 1, 2], stat: 'dp = dp[i][k] + edge x k x edge + dp[k+1][j]', note: 'Sum the two sides plus the score for k itself, maximised over every choice of k.' },
      { stat: 'iterate by increasing LENGTH', note: 'Every range depends on strictly shorter ones, so short ranges must be filled first. Looping i then j reads empty cells.' },
    ],
  },

  'interval-dp/0': {
    title: 'The loop order: shorter ranges first, not i then j',
    contrast: 'The base fills a 2D table. Here the dependency is by LENGTH, and the obvious nesting violates it.',
    cells: [3, 1, 5, 2],
    frames: [
      { mark: [0, 3], stat: 'dp[0][3] needs dp[0][k] and dp[k+1][3]', note: 'The full range depends on shorter sub-ranges inside it.' },
      { mark: [0, 1], stat: 'for i in ...: for j in ...  ->  reaches dp[0][3] early', note: 'With i outermost, the first row computes long ranges before the short ranges they depend on exist.' },
      { stat: 'reads zeros  ->  plausible wrong answer', note: 'Uninitialised cells are 0, so the arithmetic succeeds and the result is quietly too small.' },
      { mark: [0, 1], stat: 'length 2 first: dp[0][1], dp[1][2], dp[2][3]', note: 'Fill every range of length 2, then every range of length 3, and so on.' },
      { mark: [0, 1, 2], stat: 'then length 3, then 4', note: 'Now every dependency is already present when it is read.' },
      { stat: 'for length in range(2, n+1)', note: 'Length outermost, start index inside it, split point innermost. Three loops, and the order is the correctness argument.' },
    ],
  },

  'interval-dp/1': {
    title: 'n <= 500 in the constraints is pointing at O(n^3)',
    contrast: 'Not an adaptation — reading the constraint as a hint about which family is intended.',
    cells: [500, 5000, 100000],
    label: 'n:',
    frames: [
      { mark: [0], stat: 'n = 500  ->  n^3 = 1.25 x 10^8', note: 'Around a hundred million simple operations. Tight but feasible, and that is the signature of interval DP.' },
      { mark: [0], stat: 'n^2 states x n split points', note: 'Where the cube comes from: 250,000 ranges, each trying up to 500 split points.' },
      { mark: [1], stat: 'n = 5000  ->  10^11', note: 'Far too slow. If the constraint says 5000, interval DP is not the intended solution.' },
      { mark: [2], stat: 'n = 10^5  ->  O(n log n) territory', note: 'Sorting, heaps, sweeps, binary search. A completely different shelf.' },
      { stat: 'read the constraint FIRST', note: 'It narrows the family before you have had a single idea. The constraint table exists for exactly this.' },
    ],
  },

  // ========================================================= lis-patience ==

  'lis-patience': {
    title: 'LIS of [10, 9, 2, 5, 3, 7] in O(n log n)',
    cells: [10, 9, 2, 5, 3, 7],
    frames: [
      { stat: 'tails = []', note: 'tails[k] will hold the SMALLEST possible tail of an increasing subsequence of length k+1.' },
      { ptrs: { at: 0 }, mark: [0], stat: 'tails [10]', note: 'A subsequence of length 1 ending in 10.' },
      { ptrs: { at: 1 }, mark: [1], stat: '9 replaces 10.  tails [9]', note: 'Still length 1, but a smaller tail is strictly better — it leaves more room for what follows.' },
      { ptrs: { at: 2 }, mark: [2], stat: '2 replaces 9.  tails [2]', note: 'Better again. Replacements never change the length, only the potential.' },
      { ptrs: { at: 3 }, mark: [2, 3], stat: '5 > 2  ->  append.  tails [2, 5]', note: 'Larger than every tail, so it extends. Length is now 2.' },
      { ptrs: { at: 4 }, mark: [2, 4], stat: '3 replaces 5.  tails [2, 3]', note: 'bisect_left finds where 3 belongs. Length unchanged, tail improved.' },
      { ptrs: { at: 5 }, mark: [2, 4, 5], stat: '7 appends.  tails [2, 3, 7]', note: 'Answer 3, which is len(tails). Each step is one binary search: O(n log n).' },
    ],
  },

  'lis-patience/0': {
    title: 'Non-decreasing: bisect_right instead of bisect_left',
    contrast: 'One function name. It decides whether an equal value extends the subsequence or replaces a tail.',
    cells: [1, 3, 3, 4],
    frames: [
      { stat: 'STRICT: 1 < 3 < 4  ->  length 3', note: 'Strictly increasing cannot use both 3s.' },
      { mark: [1], stat: 'bisect_left(tails, 3) finds the FIRST 3', note: 'So the second 3 lands on the existing one and replaces it. Length does not grow.' },
      { mark: [1, 2], stat: 'tails stays [1, 3]  then [1, 3, 4]  ->  3', note: 'Correct for strict.' },
      { stat: 'NON-STRICT: 1 <= 3 <= 3 <= 4  ->  length 4', note: 'Now both 3s are allowed and the answer is one longer.' },
      { mark: [2], stat: 'bisect_right(tails, 3) goes PAST the 3', note: 'So the second 3 appends instead of replacing. Length grows.' },
      { stat: 'tails [1, 3, 3, 4]  ->  4', note: 'One identifier changed. Worth knowing which is which rather than guessing under pressure.' },
    ],
  },

  'lis-patience/1': {
    title: 'tails is NOT the subsequence',
    contrast: 'The base returns a length, and that length is correct. The array it came from is not an answer.',
    cells: [10, 9, 2, 5, 3, 7],
    frames: [
      { mark: [2, 4, 5], stat: 'tails ends as [2, 3, 7]', note: 'Length 3, and here it happens to be a real subsequence — which is exactly what makes the trap convincing.' },
      { stat: 'try [1, 100, 2, 3]', note: 'A case where it is not.' },
      { stat: 'tails becomes [1, 2, 3]', note: 'Length 3, correct. But 1, 2, 3 as INDICES were 0, 2, 3 — and 100 was overwritten, not chosen.' },
      { stat: 'tails is bookkeeping, not a path', note: 'Entries get replaced by later values from elsewhere in the array. The list is a set of best-possible tails, not one subsequence.' },
      { mark: [2, 4, 5], stat: 'to reconstruct: parent pointers', note: 'Record, for each value placed, which tails index it went to and what preceded it. Then walk back.' },
      { stat: 'the length is free, the path is not', note: 'Standard follow-up. Being clear that only the length is meaningful is the honest answer.' },
    ],
  },
});
