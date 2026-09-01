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
      problem: 'Given a list of words, group them so that words which are anagrams of one another end up in the same group. Return the groups; their order and the order within them does not matter.',
      example: `Input:   ["eat", "tea", "tan", "ate", "nat", "bat"]
Output:  [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]

"eat", "tea" and "ate" are the same letters reordered.`,
      reduces: 'the same hash map, PLUS a derived key — you look up something computed FROM the value rather than the value itself.',
      base: 'The template maps a value straight to its index — the key IS the thing you saw.',
      change: 'Derive a canonical key first, so that things which are different but equivalent collide on purpose.',
      code: `groups = defaultdict(list)
for w in words:
    key = ''.join(sorted(w))        # <- the only new line
    groups[key].append(w)`,
      why: 'Anagrams are exactly the words with the same multiset of letters, and sorting is the cheapest canonical form of a multiset. A 26-length count tuple is O(n) rather than O(n log n) if pushed.' },

    { q: 'Count the subarrays that sum to exactly k.',
      problem: 'Given an integer array (values may be negative) and an integer k, count the contiguous subarrays whose elements sum to exactly k. Count them all, including overlapping ones — do not just decide whether one exists.',
      example: `Input:   xs = [3, 4, 7, 2, -3, 1, 4, 2],  k = 7
Output:  4

[3, 4]        sums to 7
[7]           sums to 7
[7, 2, -3, 1] sums to 7
[1, 4, 2]     sums to 7`,
      reduces: 'the same hash map, PLUS storing COUNTS instead of positions, and keying on a running prefix sum rather than on the values.',
      base: 'The template asks "have I seen this value?". Here you need "how many times have I seen it?".',
      change: 'Store counts rather than indices, key on the running prefix sum, and seed the map with the empty prefix.',
      code: `from collections import defaultdict

# A subarray from j+1..i sums to k exactly when
#     prefix_up_to_i - prefix_up_to_j == k
# so at each position we need: how many earlier prefixes
# equalled (running_sum - k)?

# defaultdict(int) hands back 0 for a key never seen, so we never
# have to check whether a key exists before reading it.
prefix_counts = defaultdict(int)

# The empty prefix has sum 0, and it has occurred once before we start.
# Without this line, a subarray starting at index 0 is never counted.
prefix_counts[0] = 1

running_sum = 0
total = 0

for x in xs:
    running_sum += x

    # Each earlier prefix equal to this marks the start of a
    # subarray that ends here and sums to k.
    needed = running_sum - k
    total += prefix_counts[needed]

    # Record this prefix so later positions can look back at it.
    prefix_counts[running_sum] += 1

return total`,
      why: 'A subarray ending here sums to k exactly when some earlier prefix equals run − k. The {0: 1} seed is what lets a subarray starting at index 0 be counted at all.' },

    { q: 'Return the most frequent element, not just whether one exists.',
      problem: 'Given an array, return the k most frequent values. Ties may be broken arbitrarily unless the problem says otherwise.',
      example: `Input:   xs = [1, 1, 1, 2, 2, 3],  k = 2
Output:  [1, 2]

1 appears three times, 2 appears twice, 3 once.`,
      reduces: 'the hash map for counting, PLUS a second structure for the ordering the map cannot provide.',
      base: 'The template gives O(1) membership, and nothing else — a hash map has no order.',
      change: 'Count with the map, then get order from somewhere else: a sort, a heap, or buckets.',
      code: `counts = Counter(xs)
# then ONE of:
counts.most_common(k)                     # simplest
heapq.nlargest(k, counts, key=counts.get) # O(n log k)
# buckets[c] for c in range(n, 0, -1)     # O(n), counts are bounded by n`,
      why: 'Do not try to make the map maintain order. Pick the ordering structure by what k is: small k wants a heap, k near n wants a sort, and bounded counts allow buckets.' },

    { q: 'The keys are only lowercase letters. Can you do better?',
      problem: 'Decide whether two strings are anagrams of each other, given that both contain only lowercase English letters.',
      example: `Input:   s = "anagram",  t = "nagaram"
Output:  True

Input:   s = "rat",  t = "car"
Output:  False`,
      reduces: 'the same counting, PLUS swapping the container — a fixed 26-slot array where the dict was.',
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
      problem: 'Given an integer array that may contain repeated values, return every unique triplet [a, b, c] with a + b + c == 0. Order inside a triplet does not matter, and the same triplet must not appear twice in the result even if the values occur several times in the input.',
      example: `Input:   [-1, 0, 1, 2, -1, -4]
Sorted:  [-4, -1, -1, 0, 1, 2]
Output:  [[-1, -1, 2], [-1, 0, 1]]

[-1, 0, 1] can be formed from either of the two -1s.
It must appear ONCE.`,
      reduces: 'the two-pointer pair search, run once per fixed first element, PLUS a rule that suppresses duplicates.',
      base: 'The template converges two pointers over the whole array.',
      change: 'Fix the first element with an outer loop and two-pointer the remainder — and skip equal values at both levels.',
      code: `xs.sort()
result = []

for i in range(len(xs) - 2):
    # SKIP 1 -- the fixed element.
    # Equal values sit next to each other after sorting, so if xs[i] is the
    # same value as last time, every triplet starting with it was already
    # found. i > 0 guards the very first element.
    if i > 0 and xs[i] == xs[i - 1]:
        continue

    lo = i + 1
    hi = len(xs) - 1
    while lo < hi:
        total = xs[i] + xs[lo] + xs[hi]

        if total < 0:
            lo += 1               # need a bigger sum
        elif total > 0:
            hi -= 1               # need a smaller sum
        else:
            result.append([xs[i], xs[lo], xs[hi]])
            lo += 1
            hi -= 1

            # SKIP 2 -- the middle element, AFTER a match.
            # lo has just moved, so xs[lo - 1] is the value we used. If the
            # new xs[lo] equals it, the next step would pair the same value
            # with the same partner and record the identical triplet.
            while lo < hi and xs[lo] == xs[lo - 1]:
                lo += 1`,
      why: 'O(n^2) rather than O(n^3). Two skips because a value can repeat in two places: as the fixed element, and as the middle one after a match. Doing only the outer skip still emits repeated triplets, which is the usual failure here.' },

    { q: 'Same two pointers, but maximise the water held between two lines.',
      problem: 'Given an array of heights, each a vertical line at that index, pick two lines so that the container they form with the x-axis holds the most water. Area is the shorter of the two heights multiplied by the distance between them. Return the maximum area.',
      example: `Input:   [1, 8, 6, 2, 5, 4, 8, 3, 7]
Output:  49

Lines at index 1 (height 8) and index 8 (height 7):
area = min(8, 7) x (8 - 1) = 7 x 7 = 49`,
      reduces: 'the same converging two pointers, PLUS a different rule for deciding which pointer moves.',
      base: 'The template moves whichever side makes the SUM closer to a target.',
      change: 'Move whichever side LIMITS the metric — the shorter line.',
      code: `if height[lo] < height[hi]:
    lo += 1        # the short side is the constraint
else:
    hi -= 1`,
      why: 'Width shrinks whatever you do, so the only way to improve is a taller limiting side. Moving the taller line can never help, and being able to say that sentence is the answer.' },

    { q: 'Buy once and sell once for the maximum profit — the order is the constraint.',
      problem: 'Given daily prices, choose one day to buy and a LATER day to sell, maximising profit. Return 0 if no profitable pair exists. You may not sort, because sorting destroys the only thing that makes the problem meaningful: which day came first.',
      example: `Input:   [7, 1, 5, 3, 6, 4]
Output:  5

Buy on day 1 at 1, sell on day 4 at 6.
The lowest price is 1 and the highest is 7 -- but 7 comes
BEFORE 1, so that pair is illegal. Sorting loses exactly
that fact.`,
      reduces: 'nothing. Two pointers converge because sortedness makes one direction safe to discard; here order is the problem, not an aid to it.',
      base: 'The template earns its O(n) from sortedness — "everything left of lo is smaller" is what lets a pointer move one way only.',
      change: 'Abandon two pointers. One forward pass carrying the best answer so far, which is the Kadane family rather than this one.',
      code: `best_profit = 0
lowest_so_far = prices[0]

for price in prices[1:]:
    # Selling today is only as good as the cheapest day BEFORE today,
    # which is the constraint sorting would have thrown away.
    profit_today = price - lowest_so_far
    if profit_today > best_profit:
        best_profit = profit_today

    if price < lowest_so_far:
        lowest_so_far = price

return best_profit`,
      why: 'Recognising when a pattern does NOT apply is worth as much as applying it. The tell is that reordering the input changes the answer — whenever that is true, no sort-based pattern can be correct.' },

    { q: 'Merge two sorted arrays into one.',
      problem: 'Given two arrays that are each already sorted, produce one sorted array containing all their elements. Duplicates across the two inputs are kept — the output length is the sum of the input lengths.',
      example: `Input:   a = [1, 3, 8],  b = [2, 3, 9, 11]
Output:  [1, 2, 3, 3, 8, 9, 11]

Both 3s survive. The output is 7 long.`,
      reduces: 'two pointers again, but one per array and both moving FORWARD, instead of one array with pointers converging.',
      base: 'The template runs both pointers over a single array, converging.',
      change: 'One pointer per array, both moving forward, advancing whichever is behind.',
      code: `i = j = 0
while i < len(a) and j < len(b):
    if a[i] <= b[j]:
        out.append(a[i])
        i += 1
    else:
        out.append(b[j])
        j += 1

out += a[i:]                  # flush whichever list still has items
out += b[j:]`,
      why: 'Same skeleton, different geometry — and this is the merge step inside k-way merge and merge sort, so it is worth having in your fingers.' },
  ],

  'window': [
    { q: 'Find the SHORTEST substring of s containing every character of t.',
      problem: 'Given strings s and t, return the shortest substring of s that contains every character of t, counting repeats — if t has two "a"s, the window needs two. Return the empty string when no such substring exists.',
      example: `Input:   s = "ADOBECODEBANC",  t = "ABC"
Output:  "BANC"

"ADOBEC" also contains A, B and C, and is 6 long.
"BANC" is 4 long, and nothing shorter works.`,
      reduces: 'the same expand-right / shrink-left window, PLUS moving the point at which the answer is recorded.',
      base: 'The template records the answer after the window has been made valid again — that finds the longest.',
      change: 'The recording point moves INSIDE the shrink loop, at each moment the window is still valid.',
      code: `while valid():
    best = min(best, right - left + 1)   # <- record here
    count[s[left]] += 1
    left += 1                            # then shrink`,
      why: 'For longest you want the biggest valid window, which is the moment before shrinking becomes necessary. For shortest you want the smallest, which is the moment before it becomes invalid. Same loop, opposite instant — and getting it backwards is the single most common window failure.' },

    { q: 'Longest substring with at most K distinct characters.',
      problem: 'Given a string and an integer K, return the length of the longest substring containing at most K distinct characters. Repeats of an already-counted character are free — only the number of DIFFERENT characters is capped.',
      example: `Input:   s = "eceba",  K = 2
Output:  3

"ece" uses only e and c -- two distinct, length 3.
"eceb" would be three distinct, so it is not allowed.`,
      reduces: 'the same window, PLUS a different definition of "invalid" — map size instead of a repeated character.',
      base: 'The template shrinks while a single character repeats.',
      change: 'The invalid condition becomes "too many distinct", so shrink on the size of the count map — and delete keys that reach zero.',
      code: `while len(count) > K:
    count[s[left]] -= 1
    if count[s[left]] == 0:
        del count[s[left]]        # <- or len() lies to you
    left += 1`,
      why: 'A key left at zero still counts towards len(), so the window silently allows K+1 distinct characters. The deletion is the whole fix.' },

    { q: 'Now make it EXACTLY K distinct, not at most.',
      problem: 'Given a string and an integer K, count the substrings containing exactly K distinct characters. Not at most K, and not the longest — the count of substrings that hit K precisely.',
      example: `Input:   s = "pqpqs",  K = 2
Output:  7

The seven are: pq, qp, pq, pqp, qpq, pqpq, qs
"pqpqs" itself has three distinct, so it does not count.`,
      reduces: 'two runs of the at-most-K window, subtracted. The window pattern is used unchanged, twice.',
      base: 'The template can only express "at most" — a window has no way to be told it is too small.',
      change: 'Do not write a new loop. Run the at-most function twice and subtract.',
      code: `def exactly(K):
    return at_most(K) - at_most(K - 1)`,
      why: 'Windows are naturally monotonic in "at most" and hopeless at "exactly". This subtraction is worth memorising outright — it converts a hard variant into two calls of an easy one.' },

    { q: 'Return the maximum of every window of size k.',
      problem: 'Given an array and a window size k, return the maximum of each window as it slides one position at a time from left to right. The output has len(xs) - k + 1 entries.',
      example: `Input:   xs = [1, 3, -1, -3, 5, 3, 6, 7],  k = 3
Output:  [3, 3, 5, 5, 6, 7]

windows: [1,3,-1] [3,-1,-3] [-1,-3,5] [-3,5,3] [5,3,6] [3,6,7]
maxima:      3         3          5        5       6       7`,
      reduces: 'the fixed-size window, PLUS replacing the maintained quantity — a sum can be updated by arithmetic, a maximum cannot.',
      base: 'The template maintains a SUM, which updates by adding one and removing one.',
      change: 'A maximum does not update that way, so replace the counter with a monotonic deque of indices.',
      code: `while dq and xs[dq[-1]] <= x:
    dq.pop()                  # smaller AND older can never win
dq.append(i)
if dq[0] <= i - k:
    dq.popleft()              # expired by position, not value`,
      why: 'Removing an element from a sum is arithmetic; removing the maximum leaves you with no idea what the new maximum is. The deque keeps every candidate that could still become the max, in order.' },

    { q: 'Same question, but a subsequence rather than a subarray.',
      problem: 'Find the longest strictly increasing SUBSEQUENCE: elements taken in order but not necessarily adjacent. A subarray must be contiguous; a subsequence may skip.',
      example: `Input:   [10, 9, 2, 5, 3, 7, 101, 18]
Output:  4

The subsequence is [2, 3, 7, 18] -- indices 2, 4, 5, 7.
Not contiguous, so no window can express it.`,
      reduces: 'nothing. Contiguity is the precondition the window pattern rests on, and it is absent.',
      base: 'The template assumes contiguity — that is what makes "leaving the window" meaningful.',
      change: 'Not a window problem at all. Go to DP.',
      code: `# there is no window here; the elements need not be adjacent
dp[i] = best answer considering the first i elements`,
      why: 'The word contiguous is what licenses the whole pattern. Without it, index i+1 can be chosen or skipped independently, which is a DP state, not a window.' },
  ],

  'binary-index': [
    { q: 'The array is sorted but rotated at an unknown pivot. Find the target.',
      problem: 'A sorted array was rotated at some unknown pivot, so it reads as two ascending runs. Find the index of a target value, or -1 if it is absent. All values are distinct.',
      example: `Input:   [4, 5, 6, 7, 0, 1, 2],  target 0
Output:  4

The pivot is between 7 and 0. Runs are [4,5,6,7] and [0,1,2].`,
      reduces: 'the same boundary search, PLUS one comparison per step to work out which half is currently sorted.',
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
      problem: 'A sorted array may contain repeats. Return how many times a target value appears. Do not scan outwards from a hit — an array of all-equal values would make that O(n).',
      example: `Input:   [1, 2, 2, 2, 3, 4],  target 2
Output:  3

first index where x >= 2  is 1
first index where x >  2  is 4
count = 4 - 1 = 3`,
      reduces: 'two runs of the template with different predicates, subtracted. Nothing new is written.',
      base: 'The template finds one boundary.',
      change: 'Run it twice with two different predicates and subtract.',
      code: `first = search(lambda v: v >= target)
after = search(lambda v: v >  target)
count = after - first`,
      why: 'Do not write a bespoke loop that walks outwards from a hit — that is O(n) when every element is the target. Two boundary searches stay O(log n).' },

    { q: 'There is no array — you can only call an API that returns the value at an index.',
      problem: 'A sorted sequence of unknown length, reachable only through get(i), which returns the value at i or a sentinel past the end. Find a target. You cannot ask how long it is.',
      example: `Input:   get() backs [1, 3, 5, 7, 9, 11],  target 11
Output:  5

Probe 1, 2, 4, 8 -- get(8) is out of range or too large,
so the answer lies between index 4 and 8.`,
      reduces: 'the template, PLUS an exponential probe first to manufacture the upper bound it needs.',
      base: 'The template needs len(xs) to set its upper bound.',
      change: 'Find a bound first by doubling until the predicate flips, then search inside it.',
      code: `hi = 1
while not pred(get(hi)):
    hi *= 2                  # exponential search for a bound
lo = hi // 2`,
      why: 'Doubling costs O(log n) and then the search costs O(log n), so the total is still logarithmic. This is the shape for infinite or unknown-length inputs.' },

    { q: 'Find any peak element — one greater than both neighbours. The array is NOT sorted.',
      problem: 'Return the index of any element strictly greater than both its neighbours. Elements outside the array count as negative infinity, so a peak always exists. The array is NOT sorted.',
      example: `Input:   [1, 2, 1, 3, 5, 6, 4]
Output:  5   (value 6)

Index 1 is also a valid peak. Any one is accepted.`,
      reduces: 'the template with the target comparison replaced by a NEIGHBOUR comparison — it needs a monotonic predicate, not a sorted array.',
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
      problem: 'Place k items along a line of positions so that the smallest gap between any two is as LARGE as possible. Return that largest achievable minimum gap.',
      example: `Input:   positions [1, 2, 4, 8, 9],  k = 3
Output:  3

Place at 1, 4, 8 -- gaps of 3 and 4, smallest is 3.
A minimum gap of 4 is not achievable with 3 items.`,
      reduces: 'the same search, PLUS a flipped predicate — so reuse the template and adjust the answer rather than rewriting the loop.',
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
      problem: 'Given a target area and a shape whose area grows with some parameter x, find x to six decimal places. Feasibility is monotonic in x, but x is continuous.',
      example: `Find sqrt(2) to 1e-6 without math.sqrt:
can(x) = x * x >= 2

lo = 0, hi = 2  ->  after 100 halvings, lo ~ 1.41421356`,
      reduces: 'the same halving, PLUS a different termination rule — floats never reach equality, so lo < hi cannot end the loop.',
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
      problem: 'A hypothetical where feasibility is not monotonic: can(3) is true but can(4) is false. Nothing needs coding — the question is whether you notice that binary search is now invalid.',
      example: `can(1) F   can(2) F   can(3) T   can(4) F   can(5) T

The template tests mid = 4, sees false, and discards
1..4 -- including the answer 3.`,
      reduces: 'nothing. Monotonicity is the precondition the halving step rests on, and without it the method is unsound.',
      base: 'The template rests entirely on can(x) being monotonic — false, false, …, true, true.',
      change: 'Nothing. The method is invalid and you must say so, then find another approach.',
      code: `# can(3) == True but can(4) == False  ->  binary search is meaningless
# the predicate must be monotonic or the halving discards the answer`,
      why: 'This is the trap in the pattern and interviewers plant it. Stating why monotonicity holds — before coding — is what separates using the pattern from pattern-matching.' },

    { q: 'What upper bound do you search to?',
      problem: 'Packages with given weights must ship in order within D days, and a ship has a fixed daily capacity. Find the minimum capacity. Before coding: what range do you search, and why is each end safe?',
      example: `Input:   weights [1, 2, 3, 4, 5],  D = 2
Output:  9

lo = max(weights) = 5   below this the largest package
                        can never ship at all
hi = sum(weights) = 15  everything in one day always works`,
      reduces: 'the same search, PLUS deriving the bounds from the problem instead of being handed them.',
      base: 'The template needs a range you can defend.',
      change: 'Derive it from the problem: the total, the maximum single element, or double until can() succeeds.',
      code: `lo = max(weights)      # cannot ship a package smaller than itself
hi = sum(weights)      # one day, everything at once -- always feasible`,
      why: 'A bound that is obviously feasible at the top and obviously infeasible at the bottom is what makes the search well-formed. Say why each end is safe.' },
  ],

  'tree-dfs': [
    { q: 'Validate that this binary tree is a BST.',
      problem: 'Decide whether a binary tree is a valid binary search tree: every node in a left subtree is strictly less than the node, and every node in a right subtree strictly greater — for ALL ancestors, not just the parent.',
      example: `Input:   10(5, 15(6, 20))
Output:  False

6 < 15 so it passes a parent-only check, but it sits in
the RIGHT subtree of 10 and must therefore exceed 10.`,
      reduces: 'the same postorder walk, PLUS a constraint passed DOWNWARD instead of an answer returned upward.',
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
      problem: 'Return the number of edges on the longest path between any two nodes in a binary tree. The path need not pass through the root.',
      example: `Input:   1(2(4, 5), 3)
Output:  3

The path is 4 - 2 - 1 - 3, which is three edges.
The path 4 - 2 - 5 is only two.`,
      reduces: 'the same recursion, PLUS returning one quantity (height) while recording a different one (the join through each node).',
      base: 'The template returns the quantity that is also the answer.',
      change: 'Return one thing and record another: height goes upward, while the best left+right path is recorded outside.',
      code: `best = 0
def height(node):
    global best
    left_height = height(node.left)
    right_height = height(node.right)

    best = max(best, left_height + right_height)  # the answer, recorded
    return 1 + max(left_height, right_height)     # the contract, returned`,
      why: 'The longest path through a node is not the value its parent needs. Recognising when those two quantities differ is the core tree skill, and it recurs in maximum path sum and longest univalue path.' },

    { q: 'The tree is 10^5 nodes deep.',
      problem: 'The same traversal, on a degenerate tree where every node has exactly one child. Depth equals n, so the recursion depth does too. Produce the answer without crashing.',
      example: `Input:   a chain 1 -> 2 -> 3 -> ... -> 100000
Output:  100000

The recursive version raises RecursionError at roughly
frame 1000.`,
      reduces: 'the same traversal with the call stack replaced by an explicit list — and a two-pass flag if you need postorder.',
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
      problem: 'The same traversal, but the structure is not acyclic — nodes carry parent pointers, or an edge leads back to an ancestor. Visit every node exactly once.',
      example: `Input:   A -> B -> C -> A
Output:  visit A, B, C  (and terminate)

The tree version descends into A again and loops until
the stack overflows.`,
      reduces: 'the same DFS, PLUS a visited set. Tree DFS is graph DFS minus that set.',
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
      problem: 'A grid of empty cells, fresh oranges and rotten ones. Each minute, every rotten orange rots its orthogonal fresh neighbours. Return the minutes until none are fresh, or -1 if some can never rot.',
      example: `Input:   [[2,1,1],
          [1,1,0],
          [0,1,1]]
Output:  4

The single 2 spreads outward. With TWO rotten oranges the
answer would be smaller, and both must start at minute 0.`,
      reduces: 'the same level-by-level BFS, PLUS seeding the queue with every source before the first step.',
      base: 'The template seeds the queue with one start node.',
      change: 'Seed it with ALL sources before the first step. Nothing else changes.',
      code: `q = deque((r, c) for r in range(R) for c in range(C)
                if grid[r][c] == ROTTEN)          # every source, minute 0`,
      why: 'Running BFS once per source would be O(sources × cells). Multi-source BFS gets the same answer in one pass, because levels still measure time correctly when everything starts together.' },

    { q: 'Return the actual shortest path, not just its length.',
      problem: 'Same unweighted graph and same start and goal, but return the sequence of nodes on a shortest path rather than its length. Any shortest path is acceptable.',
      example: `Input:   edges A-B, A-C, B-D, C-D, D-E.  A to E
Output:  [A, B, D, E]

Length 3, which the plain template already reports.
[A, C, D, E] is equally valid.`,
      reduces: 'the same BFS, PLUS a parent map written on enqueue — the first arrival is on a shortest path, so the first parent recorded is correct.',
      base: 'The template counts levels and discards how it got anywhere.',
      change: 'Keep a parent map alongside the visited set, then walk it backwards from the goal.',
      code: `parent = {start: None}
...
        parent[nxt] = node        # <- record who reached it first

# then reconstruct, walking parents backwards from the goal
path = []
cur = goal
while cur is not None:
    path.append(cur)
    cur = parent[cur]

path.reverse()                # we built it goal-first
return path`,
      why: 'The first arrival is the shortest one, so the first parent recorded is on a shortest path. No extra search is needed.' },

    { q: 'The edges have different costs now.',
      problem: 'The same source-to-target question on a graph whose edges carry positive weights. Return the minimum total cost, not the fewest edges.',
      example: `Input:   S-A 5, A-T 5,  S-B 1, B-C 1, C-T 1
Output:  3

BFS returns 2 -- the fewest EDGES, which costs 10.
The cheapest route uses three edges and costs 3.`,
      reduces: 'nothing. BFS orders by edge count, and with weights that is no longer cost order, so the frontier needs a heap instead.',
      base: 'The template treats every step as equal, which is what makes arrival order equal shortest order.',
      change: 'Swap the queue for a heap — that is Dijkstra. If the weights are only 0 and 1, a deque with appendleft is enough.',
      code: `heapq.heappush(heap, (dist + weight, nxt))     # Dijkstra

# or, for 0/1 weights only:
if weight == 0:
    dq.appendleft(nxt)
else:
    dq.append(nxt)`,
      why: 'With weights, a path with more edges can be cheaper, so first-arrival stops meaning cheapest. The 0-1 case is worth knowing because it keeps O(V+E).' },

    { q: 'Neighbours are words differing by one letter, over a 10^4-word dictionary.',
      problem: 'Transform a start word into an end word one letter at a time, where every intermediate must be in a given dictionary. Return the fewest words in such a sequence, or 0 if impossible.',
      example: `Input:   hit -> cog, dict [hot, dot, dog, lot, log, cog]
Output:  5

hit -> hot -> dot -> dog -> cog`,
      reduces: 'the same BFS, PLUS constructing the adjacency cheaply — wildcard buckets rather than comparing every pair of words.',
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
      problem: 'A grid of heights. Water flows from a cell to an orthogonal neighbour of equal or lower height. The top and left edges are the Pacific, the bottom and right the Atlantic. Return every cell from which water can reach both.',
      example: `Input:   [[1, 2, 3],
          [8, 9, 4],
          [7, 6, 5]]
Output:  cells on the spiral ridge, e.g. (0,2), (1,2), (2,0) ...

Testing every cell outward is O(cells^2).`,
      reduces: 'the same flood fill, PLUS reversing the direction — search inward from each ocean and intersect the two reachable sets.',
      base: 'The template searches outward from each starting cell.',
      change: 'Reverse the direction. Search inward from each ocean edge, then intersect the two reachable sets.',
      code: `pacific = set()
atlantic = set()

for r in range(rows):
    dfs(r, 0, pacific)             # flow INWARD from the left border
    dfs(r, cols - 1, atlantic)     # and inward from the right

return pacific & atlantic          # cells that reached both`,
      why: 'Testing every cell outward is O(cells^2) in the worst case. Two searches from the borders is O(cells), and the answer is a set intersection.' },

    { q: 'Is there a cycle in this DIRECTED graph?',
      problem: 'Given a directed graph, decide whether it contains a cycle. A node reachable by two different paths is NOT a cycle, and must not be reported as one.',
      example: `Input:   0->1, 0->2, 1->3, 2->3
Output:  False   (a diamond, no cycle)

Input:   0->1, 1->2, 2->0
Output:  True

A plain visited set reports True for BOTH.`,
      reduces: 'the same DFS, PLUS a third node state — "on the current path" versus "finished" is the distinction one visited set cannot make.',
      base: 'The template uses one visited set, which cannot tell "finished" from "currently on the stack".',
      change: 'Three states. Meeting a node that is in progress means you have looped back into your own path.',
      code: `WHITE, GREY, BLACK = 0, 1, 2
if color[v] == GREY:
    return True             # back edge -> cycle
if color[v] == WHITE and dfs(v):
    return True`,
      why: 'A plain visited set reports a cycle for any re-visit, including a legitimate diamond. The grey state is what makes it correct.' },

    { q: 'Edges arrive one at a time and I query connectivity as they do.',
      problem: 'Nodes are fixed, but edges arrive one at a time and after each you must report the number of connected components. Answer every query, not just the final one.',
      example: `Input:   4 nodes, then edges (0,1), (2,3), (1,2)
Output:  3, 2, 1

DFS answers each query in O(V+E), so m queries cost
O(m(V+E)).`,
      reduces: 'nothing. The traversal has no memory between queries, so the structure changes to one that merges incrementally.',
      base: 'The template walks a graph that already exists.',
      change: 'Do not re-run DFS per edge. Use Union-Find.',
      code: `# per edge, near O(1) instead of a full O(V+E) traversal
union(u, v)
connected = find(a) == find(b)`,
      why: 'DFS is O(V+E) per query, so m queries cost O(m(V+E)). Union-Find answers each in effectively constant time and merges incrementally.' },

    { q: 'The grid is a million cells of solid land.',
      problem: 'Count the islands in a 1000 x 1000 grid where every cell is land — one component spanning the whole grid. Produce the answer without crashing.',
      example: `Input:   1000 x 1000, all 1s
Output:  1

The recursive flood descends 10^6 frames deep before
anything returns, and Python stops at about 1000.`,
      reduces: 'the same flood fill, PLUS moving the stack from call frames onto the heap.',
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
      problem: 'Given numCourses and prerequisite pairs [a, b] meaning b must precede a, return any valid order in which all courses can be taken, or an empty list if none exists.',
      example: `Input:   4 courses, prerequisites [[1,0],[2,1],[3,2]]
Output:  [0, 1, 2, 3]

Course Schedule I asks only whether it is possible, and
the answer to that is len(order) == numCourses.`,
      reduces: 'the same Kahn loop. The boolean version simply discards the list this one returns.',
      base: 'The template already builds the order — the boolean version just throws it away.',
      change: 'Return the emitted list, and the empty list when the count check fails.',
      code: `if len(order) == n:
    return order
return []                     # fewer emitted -> a cycle blocked the rest`,
      why: 'The same machinery answers both. Recognising that "can it be done" and "how" are one algorithm apart is the point of the pair.' },

    { q: 'How many SEMESTERS, if unlimited courses can run in parallel?',
      problem: 'Same prerequisite graph, but any number of courses with no outstanding prerequisites may be taken in the same semester. Return the minimum number of semesters, or -1 if impossible.',
      example: `Input:   5 courses, edges 0->2, 1->2, 2->3, 2->4
Output:  3

Semester 1: courses 0 and 1 together.
Semester 2: course 2.   Semester 3: courses 3 and 4.
A flat order would have said "5 steps".`,
      reduces: 'the same Kahn loop, PLUS the BFS level snapshot — each level of the queue is one semester.',
      base: 'The template pops one node at a time and produces a flat order.',
      change: 'Process the queue level by level, exactly as in BFS. Each level is one semester.',
      code: `while q:
    for _ in range(len(q)):        # <- snapshot: one whole level
        u = q.popleft()
        ...
    semesters += 1`,
      why: 'Everything at in-degree zero simultaneously can run together. The level snapshot is the same trick that turns BFS into a distance count.' },

    { q: 'Given words sorted in an unknown alphabet, recover the letter order.',
      problem: 'Given a list of words sorted according to some unknown alphabet, recover a possible letter ordering. Return the empty string if the input is inconsistent.',
      example: `Input:   ["wrt", "wrf", "er", "ett", "rftt"]
Output:  "wertf"

"wrt" before "wrf" gives t before f -- the FIRST
difference only. Taking more invents constraints.`,
      reduces: 'the same topological sort, PLUS deriving the edges. All the difficulty is upstream of the algorithm.',
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
      problem: 'Same prerequisite graph, but when several courses are simultaneously available, return the smallest-numbered one first — so the whole output is the lexicographically smallest valid order.',
      example: `Input:   4 courses, no prerequisites
Output:  [0, 1, 2, 3]

A FIFO queue returns them in whatever order they were
pushed, which is arbitrary and therefore wrong here.`,
      reduces: 'the same algorithm with the queue swapped for a heap. No logic changes, and the cost gains a log factor.',
      base: 'The template uses a FIFO queue, so ties come out in insertion order.',
      change: 'Swap the deque for a heap.',
      code: `import heapq
heapq.heapify(q)
u = heapq.heappop(q)`,
      why: 'O(V log V + E) instead of O(V+E), for a defined tie-break. One data structure swap, no logic change — worth spotting quickly.' },
  ],

  'sweep': [
    { q: 'Do [9,10] and [10,11] count as overlapping?',
      problem: 'Given meeting intervals, find the minimum number of rooms required. Before coding, settle whether a meeting ending exactly when another starts needs a second room.',
      example: `Input:   [[9,10], [10,11]]
Output:  1   if intervals are half-open [start, end)
         2   if they are closed [start, end]

Same input, two defensible answers. You must ask.`,
      reduces: 'the same event sweep. The only change is the ORDER of two events sharing a timestamp.',
      base: 'The template sorts (time, delta) tuples, which puts −1 before +1 at equal times.',
      change: 'That default is the half-open reading. For closed intervals, make starts sort first.',
      code: `events.sort()                       # half-open: a room frees, then is taken
events.sort(key=lambda e: (e[0], -e[1]))   # closed: taken before freed`,
      why: 'One character of sort key, and it changes the answer on touching intervals. Ask the question before coding — this is the planted ambiguity in every interval problem.' },

    { q: 'Remove the fewest intervals so that none overlap.',
      problem: 'Given intervals, return the minimum number to remove so that the rest do not overlap. Touching endpoints do not count as overlapping.',
      example: `Input:   [[1,2], [2,3], [3,4], [1,3]]
Output:  1

Remove [1,3] and the other three coexist. Keeping the
most is easier to be greedy about than removing fewest.`,
      reduces: 'the same sort-and-sweep, PLUS reversing the question and sorting by END rather than start.',
      base: 'The template counts concurrency; it does not choose what to keep.',
      change: 'Reverse the question into "keep the most", then greedily keep by EARLIEST END.',
      code: `intervals.sort(key=lambda x: x[1])      # by END, not start
kept = 0
last_end = float('-inf')
for start, end in intervals:
    if start >= last_end:     # compatible with everything kept so far
        kept += 1
        last_end = end
return len(intervals) - kept`,
      why: 'Sorting by start is the intuitive choice and it is wrong: one long early interval blocks two short ones. Earliest end leaves the most room for everything after it.' },

    { q: 'Connections need thirty minutes between flights.',
      problem: 'Given flights with origin, destination, departure and arrival, find the earliest arrival at a destination — where changing planes requires a minimum connection time.',
      example: `Input:   A 09:00 -> B 10:00,   B 10:15 -> C 11:30
         MCT = 30 minutes
Output:  unreachable

Without the MCT the itinerary looks legal and arrives
11:30. Fifteen minutes is not enough to change planes.`,
      reduces: 'the same departure-ordered sweep, PLUS one added term in the boarding comparison.',
      base: 'The template compares an arrival directly against the next departure.',
      change: 'Add the gap to the left-hand side of the comparison.',
      code: `if best[origin] + MCT <= departure:      # <- the whole change`,
      why: 'One term, and it changes the answer on tight connections. Interviewers wait to see whether you ask about it, so raise it in the clarifying round rather than discovering it later.' },

    { q: 'All events fall within one day, at minute granularity.',
      problem: 'The same maximum-concurrency question, with the extra fact that every timestamp is a minute within a single day — so times are integers from 0 to 1439.',
      example: `Input:   [[60,180], [120,240]]  (minutes)
Output:  2

Sorting is O(n log n). With only 1440 possible times, a
difference array gives O(n + 1440).`,
      reduces: 'the same sweep with the sort removed — bounded small integers mean you can index directly instead of ordering.',
      base: 'The template sorts, which costs O(n log n).',
      change: 'Skip the sort entirely — use a difference array over the fixed range.',
      code: `diff = [0] * 1441
for s, e in meetings:
    diff[s] += 1
    diff[e] -= 1
running = max over prefix sums of diff`,
      why: 'O(n + T) beats O(n log n) once n is large relative to the time range. "Bounded small integers" is always the hint to stop sorting.' },

    { q: 'Tell me WHICH room each meeting goes in.',
      problem: 'Given meeting intervals, assign each meeting to a specific room, using as few rooms as possible. Return the assignment, not just the count.',
      example: `Input:   [[0,30], [5,10], [15,20]]
Output:  room A: [0,30]
         room B: [5,10], [15,20]

The sweep proves two rooms suffice and cannot say which.`,
      reduces: 'the same scheduling, PLUS carrying identity — a heap of (endTime, roomId) instead of a bare counter.',
      base: 'The template keeps a counter, which knows how many but not which.',
      change: 'Keep a heap of (endTime, roomId) so the room being reused is identifiable.',
      code: `end, room = heapq.heappop(free)   # this exact room becomes available
assign[meeting] = room
heapq.heappush(free, (meeting_end, room))`,
      why: 'A counter is enough for "how many rooms"; identity requires carrying it. This is the standard follow-up once you give the sweep answer.' },
  ],

  'heap-topk': [
    { q: 'k is 90% of n.',
      problem: 'Return the k largest elements, where k is nearly as large as n. The size-k heap still works — the question is whether it is still the right choice.',
      example: `Input:   [3, 1, 5, 12, 2, 11],  k = 5
Output:  [1, 3, 5, 11, 12]

O(n log k) is O(6 log 5); O(n log n) is O(6 log 6).
Indistinguishable.`,
      reduces: 'nothing — it is the same problem with the constants changed, and the answer is to stop using the pattern.',
      base: 'The template keeps a size-k heap for O(n log k).',
      change: 'Just sort. Say why the heap has stopped paying.',
      code: `return sorted(xs)[-k:]        # log k ~= log n now`,
      why: 'The heap wins only while k is small. Naming the crossover shows you understand why the heap was there rather than reaching for it reflexively.' },

    { q: 'Give me the running median of a stream.',
      problem: 'Support addNum(x) and findMedian() over a stream of integers. The median must be available at any point, and re-sorting on every query is too slow.',
      example: `addNum(5)  ->  median 5
addNum(15) ->  median 10
addNum(1)  ->  median 5
addNum(3)  ->  median 4`,
      reduces: 'the same heap idea, PLUS a second heap facing the other way — one heap gives an extreme, and a median is not an extreme.',
      base: 'The template gives you one end of the order.',
      change: 'Two heaps facing each other, kept balanced in size.',
      code: `heapq.heappush(low, -x)                       # max-heap, lower half
heapq.heappush(high, -heapq.heappop(low))     # move the largest up
if len(high) > len(low):
    heapq.heappush(low, -heapq.heappop(high)) # rebalance`,
      why: 'The median sits between the halves, so it is at one or both tops. A single heap can never give you a middle.' },

    { q: 'Do the top-k frequent in O(n).',
      problem: 'Return the k most frequent elements of an array, in O(n) time. Counting is easy; the ordering is where the log factor usually creeps in.',
      example: `Input:   [1, 1, 1, 2, 2, 3],  k = 2
Output:  [1, 2]

Counts are 3, 2 and 1 -- and no count can exceed n = 6.`,
      reduces: 'the same counting, PLUS bucketing by count instead of heaping — the values being ordered are bounded by n.',
      base: 'The template pays log k per element.',
      change: 'Bucket by frequency instead — counts cannot exceed n, so the range is bounded.',
      code: `buckets = [[] for _ in range(n + 1)]
for val, c in Counter(xs).items():
    buckets[c].append(val)
# read buckets from the top down`,
      why: 'This is counting sort applied to frequencies. Whenever the values you are ordering are bounded by n, sorting is avoidable entirely.' },

    { q: 'The heap holds linked-list nodes and it crashes.',
      problem: 'Merge k sorted linked lists using a heap. It works on your first test and raises TypeError on the second. Explain and fix.',
      example: `push (1, nodeA)  ->  fine
push (1, nodeB)  ->  TypeError: '<' not supported
                     between instances of 'ListNode'

Only when two priorities TIE does the payload get compared.`,
      reduces: 'the same heap, PLUS a tiebreak element so the comparison never reaches the payload.',
      base: 'The template pushes comparable numbers.',
      change: 'Push tuples with a tie-break so the payload is never compared.',
      code: `heapq.heappush(h, (node.val, i, node))     # i breaks ties`,
      why: 'Python compares tuples element by element, so two equal values make it try to compare the nodes themselves and raise. The index makes ties resolvable without touching the payload.' },
  ],

  'memo': [
    { q: 'Count the COMBINATIONS that make the amount, not the permutations.',
      problem: 'Given coin denominations and a target, count the ways to make the target where ORDER DOES NOT MATTER. 1+2 and 2+1 are the same way and must be counted once.',
      example: `Input:   coins [1, 2],  target 3
Output:  2

The two are 1+1+1 and 1+2.
Counting orderings would give 3, adding 2+1 separately.`,
      reduces: 'the same table and the same recurrence, with the two loops SWAPPED — the loop order is what decides which is counted.',
      base: 'The template loops amounts outside and coins inside, which counts orderings separately.',
      change: 'Swap the loops. Coins outside, amounts inside.',
      code: `for coin in coins:              # <- outer
    for amt in range(coin, target + 1):
        dp[amt] += dp[amt - coin]`,
      why: 'With coins on the outside, each coin is considered once for the whole table, so 1+2 and 2+1 are never both counted. The loop order IS the semantics here, which is why this variant catches people.' },

    { q: 'At most k transactions are allowed.',
      problem: 'Buy and sell a stock at most k times, never holding two positions at once, maximising total profit. Each buy must precede its sell.',
      example: `Input:   prices [3, 2, 6, 5, 0, 3],  k = 2
Output:  7

Buy 2 sell 6 (+4), buy 0 sell 3 (+3).
With k = 1 the answer is 4.`,
      reduces: 'the same memoised recursion, PLUS extra dimensions in the state — position alone no longer identifies the situation.',
      base: 'The template keys the cache on position only.',
      change: 'Add the new dimension to the state. If the answer depends on it, it belongs in the key.',
      code: `@lru_cache(None)
def best(i, k_left, holding):     # <- two extra dimensions
    ...`,
      why: 'A missing dimension fails silently: two genuinely different situations collide on one key and the cache returns a confident wrong answer. This is the number-one DP bug.' },

    { q: 'Can greedy do this instead?',
      problem: 'Given coins and a target, return the fewest coins that make it. Greedy — take the largest coin that fits, repeatedly — is tempting. Decide whether it is correct before writing any DP.',
      example: `Input:   coins [1, 3, 4],  target 6
Output:  2   (3 + 3)

Greedy takes 4, then 1, then 1 -- three coins.
With [1, 5, 10, 25] greedy IS optimal, which is the trap.`,
      reduces: 'nothing to code — it is the test you run BEFORE choosing, and here it fails.',
      base: 'The template explores all choices, which is why it is correct.',
      change: 'Try to break greedy with a small counterexample first. If it survives two attempts, state the exchange argument; if it fails, keep the DP.',
      code: `# coins {1, 3, 4}, amount 6
# greedy: 4 + 1 + 1 = 3 coins
# optimal: 3 + 3     = 2 coins   -> greedy is wrong here`,
      why: 'Producing that counterexample takes fifteen seconds and settles the question. Guessing costs the whole problem.' },

    { q: 'n is 10^5, so the 2D table will not fit.',
      problem: 'Longest increasing subsequence where n is 10^5. The O(n^2) DP is correct and far too slow, and an n x n table would not fit in memory either.',
      example: `Input:   [10, 9, 2, 5, 3, 7, 101, 18]
Output:  4   ([2, 3, 7, 18])

At n = 10^5 the quadratic version is 10^10 operations.`,
      reduces: 'nothing directly. The state space itself is too large, so the answer is a different formulation — patience sorting with binary search.',
      base: 'The template stores every state.',
      change: 'Look for a rolling array, a greedy, or a binary-search variant. LIS drops from O(n^2) to O(n log n) this way.',
      code: `# only the previous row is ever read:
prev, cur = cur, [0] * (n + 1)     # O(n) space instead of O(n^2)`,
      why: 'Once the recurrence only reaches one row back, the rest of the table is dead weight. Spotting that is the standard "can you improve the space" answer.' },
  ],

  'backtracking': [
    { q: 'The input contains duplicates and the output must not.',
      problem: 'Return all distinct subsets of an array that may contain repeated values. [2,2] is a legitimate subset; two copies of [2] are not.',
      example: `Input:   [1, 2, 2]
Output:  [], [1], [1,2], [1,2,2], [2], [2,2]

Six, not eight. Note [2,2] IS present -- the skip must
not block it.`,
      reduces: 'the same choose/recurse/un-choose, PLUS sorting and skipping a repeated value at the SAME recursion level.',
      base: 'The template assumes distinct elements, so every branch is unique.',
      change: 'Sort first, then skip a value equal to its predecessor AT THE SAME LEVEL.',
      code: `for i in range(start, len(xs)):
    if i > start and xs[i] == xs[i-1]:
        continue                      # same level only -- not i > 0`,
      why: 'i > start rather than i > 0 is the whole fix. Skipping globally would also prevent legitimately using the same value at a deeper level.' },

    { q: 'A number may be used more than once.',
      problem: 'Given distinct candidates and a target, return all unique combinations summing to the target, where each candidate may be reused any number of times.',
      example: `Input:   candidates [2, 3, 5],  target 8
Output:  [2,2,2,2], [2,3,3], [3,5]

[3,2,3] is the same combination as [2,3,3] and must
appear once.`,
      reduces: 'the same recursion, PLUS recursing with i instead of i+1 — one character.',
      base: 'The template recurses with i + 1, consuming each element.',
      change: 'Recurse with i.',
      code: `go(i)          # instead of go(i + 1)`,
      why: 'One character, entirely different problem. Combination sum I and II differ by exactly this and the duplicate skip.' },

    { q: 'I only want the COUNT of arrangements.',
      problem: 'Count the distinct ways to climb n stairs taking one or two steps at a time. Return the number, not the list of ways.',
      example: `Input:   n = 4
Output:  5

n = 40 would be about 165 million ways -- and the answer
is still one integer.`,
      reduces: 'nothing. Enumerating to count is exponential work for a polynomial answer, so it becomes DP.',
      base: 'The template materialises every arrangement.',
      change: 'Stop backtracking. Count with DP instead.',
      code: `# do not enumerate 2^n things to return one integer
dp[i] = number of ways to reach state i`,
      why: 'Enumerating to count is exponential work for a polynomial answer. Noticing the question asks "how many" rather than "which" is the whole decision.' },

    { q: 'N-queens on an 8×8 board — it is far too slow.',
      problem: 'Place n queens on an n x n board so that no two share a row, column or diagonal. Return the number of distinct solutions.',
      example: `Input:   n = 8
Output:  92

Checking validity only at a complete placement explores
the entire tree before rejecting almost all of it.`,
      reduces: 'the same backtracking, PLUS pruning at each level — attacked columns and diagonals held in sets so the test is O(1).',
      base: 'The template checks validity at the leaf.',
      change: 'Prune on the way down, and track attacked columns and diagonals in sets rather than rescanning.',
      code: `if col in cols or (r - c) in diag1 or (r + c) in diag2:
    continue                        # prune BEFORE recursing`,
      why: 'Validating only at the leaf explores the entire tree. Pruning at each level is the difference between seconds and never finishing.' },
  ],

  'deque-mono': [
    { q: 'Largest rectangle in a histogram.',
      problem: 'Given bar heights of equal width 1, find the area of the largest rectangle that fits entirely under the outline.',
      example: `Input:   [2, 1, 5, 6, 2, 3]
Output:  10

Bars 5 and 6 together give height 5 across width 2.`,
      reduces: 'the same monotonic stack, PLUS computing an AREA on the pop and a trailing sentinel so the stack flushes.',
      base: 'The template computes a distance when it pops.',
      change: 'Compute an AREA instead, and append a trailing zero so the stack is forced to empty.',
      code: `heights.append(0)               # <- sentinel flushes the stack
...
height_of_bar = heights[stack.pop()]

# The rectangle runs from just after the bar now on top of the stack
# up to just before the current index.
if stack:
    width = i - stack[-1] - 1
else:
    width = i                 # nothing shorter to the left: spans 0..i-1

best = max(best, height_of_bar * width)`,
      why: 'Without the sentinel, bars still on the stack at the end are never measured. The width comes from the index BELOW the popped one, not from the popped index itself.' },

    { q: 'Maximum of every window of size k.',
      problem: 'Return the maximum of each window of size k as it slides one position at a time from left to right.',
      example: `Input:   [1, 3, -1, -3, 5, 3, 6, 7],  k = 3
Output:  [3, 3, 5, 5, 6, 7]

A running SUM updates by arithmetic. A running maximum
does not -- removing the max tells you nothing.`,
      reduces: 'the same monotonic structure, PLUS popping from the FRONT on position as well as the back on value.',
      base: 'The template only ever pops from one end.',
      change: 'A deque, popping from the back on value and from the front on position.',
      code: `while dq and xs[dq[-1]] <= x:
    dq.pop()                     # back: beaten by a newer, bigger value
dq.append(i)
if dq[0] <= i - k:
    dq.popleft()                 # front: fell out of the window`,
      why: 'Two different reasons to discard, so you need two ends. A stack cannot express expiry by position.' },

    { q: 'Previous SMALLER element instead of next greater.',
      problem: 'For each element, return the nearest element to its LEFT that is strictly smaller, or none if there is no such element.',
      example: `Input:   [4, 5, 2, 10, 8]
Output:  [none, 4, none, 2, 2]

Next-greater keeps a decreasing stack; this one keeps an
increasing stack.`,
      reduces: 'the same stack with the comparison flipped. All four variants of next/previous x greater/smaller are this code with two knobs.',
      base: 'The template keeps a decreasing stack and scans forward.',
      change: 'Flip the comparison, or scan backwards — decide which extreme you are tracking before writing the while.',
      code: `while stack and xs[stack[-1]] >= x:     # >= instead of <
    stack.pop()`,
      why: 'All four variants (next/previous × greater/smaller) are the same code with the comparison and direction flipped. Say which one you are building out loud, because it is easy to write the opposite by accident.' },

    { q: 'Trapping rain water.',
      problem: 'Given an elevation map of bar heights, compute how much water is trapped after rain. Water sits above a bar up to the lower of the tallest bars on either side.',
      example: `Input:   [4, 2, 0, 3, 2, 5]
Output:  9

Above index 2 the water level is min(4, 5) = 4, so that
column holds 4.`,
      reduces: 'either a monotonic stack filling layers, or two pointers with running maxima — the second is shorter and easier to defend.',
      base: 'A monotonic stack solves it by filling horizontal layers on each pop.',
      change: 'Two pointers with running maxima is shorter and easier to defend. Mention both, code the simpler one.',
      code: `if left_max < right_max:
    water += left_max - height[lo]
    lo += 1
else:
    water += right_max - height[hi]
    hi -= 1`,
      why: 'Both are O(n). Choosing the one you can explain under pressure is a real interview skill, and saying you know the other exists costs one sentence.' },
  ],

  'union-find': [
    { q: 'The nodes are email addresses, not integers.',
      problem: 'Each account is a name followed by emails. Two accounts belong to the same person if they share any email. Merge them, returning each person once with their emails sorted.',
      example: `Input:   ["J","a@x","b@x"], ["J","b@x","c@x"], ["K","d@x"]
Output:  ["J","a@x","b@x","c@x"], ["K","d@x"]

b@x is the bridge. Unioning ACCOUNTS would require
already knowing they overlap.`,
      reduces: 'the same template, PLUS choosing what a node is — the emails, not the accounts — and a dict to index the labels.',
      base: 'The template indexes a parent array by integer.',
      change: 'Map each label to an index with a dict as you meet it. Choosing WHAT the nodes are is usually the real problem.',
      code: `idx = {}
def node(label):
    if label not in idx:
        new_index = len(idx)
        idx[label] = new_index
        parent.append(new_index)   # a new node is its own root
        size.append(1)
    return idx[label]`,
      why: 'In accounts-merge the nodes are emails, not accounts — unioning every email in a record is what merges the people. Getting the node choice right is most of the solution.' },

    { q: 'Find the edge that creates a cycle.',
      problem: 'A tree of n nodes had one extra edge added, so it now has exactly one cycle. Return the edge that can be removed to restore a tree. If several could, return the one appearing last in the input.',
      example: `Input:   [[1,2], [1,3], [2,3]]
Output:  [2, 3]

Processing in input order, [2,3] is the first edge whose
endpoints already share a root.`,
      reduces: 'the same template with nothing added — union() already returns False on a redundant edge.',
      base: 'The template merges and reports groups.',
      change: 'Nothing structural — union() already returns False when both ends share a root.',
      code: `for u, v in edges:
    if not union(u, v):
        return [u, v]          # first edge that closes a loop`,
      why: 'The cycle detector is a by-product you already have. Adding a separate check would be duplicated logic that can disagree with itself.' },

    { q: 'The graph is directed.',
      problem: 'Detect a cycle in a DIRECTED graph. The instinct is to reuse Union-Find because it detected cycles in the undirected case.',
      example: `Input:   A -> B
union(A, B) and union(B, A) are IDENTICAL operations.

So a plain edge and a 2-cycle look the same afterwards.`,
      reduces: 'nothing. Union-Find stores symmetric membership, and direction is information it structurally cannot hold.',
      base: 'The template merges symmetric sets, which has no notion of direction.',
      change: 'Union-Find does not apply. Use DFS with an in-progress set, or Kahn.',
      code: `# union(u, v) loses the fact that u -> v but not v -> u`,
      why: 'Recognising that a tool does not fit is worth as much as using it. Directed cycles need the ordering that Union-Find deliberately discards.' },

    { q: 'Weight the edges and connect everything as cheaply as possible.',
      problem: 'Given a weighted undirected graph, connect every node at minimum total cost. Return that total.',
      example: `Input:   4 nodes, edges of weight 1, 2, 3, 4
Output:  7

Take 1, 2 and 4. The weight-3 edge would close a cycle.
A spanning tree on V nodes has exactly V-1 edges.`,
      reduces: 'the same template, PLUS sorting the edges by weight first — that is Kruskal, and greedy plus Union-Find is all of it.',
      base: 'The template answers connectivity questions.',
      change: 'Sort edges by weight and union greedily. That is Kruskal, and MST falls out.',
      code: `edges.sort(key=lambda e: e[2])
total = sum(w for u, v, w in edges if union(u, v))`,
      why: 'MST is greedy plus Union-Find, both of which you already have. Two lines on top of this template.' },
  ],

  'prefix': [
    { q: 'Now the queries are 2D — sums over a submatrix.',
      problem: 'Answer many queries of the form "sum of the submatrix from (r1,c1) to (r2,c2)" over a fixed 2D grid.',
      example: `Input:   [[1, 2], [3, 4]],  query (1,1)-(1,1)
Output:  4

pre[2][2] - pre[1][2] - pre[2][1] + pre[1][1]
= 10 - 3 - 4 + 1`,
      reduces: 'the same precompute-then-subtract, PLUS inclusion-exclusion — the overlap is removed twice and must be added back.',
      base: 'The template builds a one-dimensional running total.',
      change: 'A 2D table, and each query becomes four lookups with inclusion-exclusion.',
      code: `pre[r+1][c+1] = grid[r][c] + pre[r][c+1] + pre[r+1][c] - pre[r][c]
# query:
total = pre[r2+1][c2+1] - pre[r1][c2+1] - pre[r2+1][c1] + pre[r1][c1]`,
      why: 'The overlap is subtracted twice and must be added back — that final term is the one people drop. Draw the rectangle before coding it.' },

    { q: 'Ten thousand range UPDATES, then one read.',
      problem: 'Apply many range updates of the form "add v to every element from l to r", then read the final array once. No queries in between.',
      example: `Input:   n = 6, updates (1,3,+2) and (2,5,+3)
Output:  [0, 2, 5, 5, 3, 3]

Applying each update directly is O(range) each.`,
      reduces: 'the same idea with the roles swapped — O(1) per update and one O(n) sweep at the end, instead of O(n) once and O(1) per read.',
      base: 'The template precomputes once and reads many times; every update would invalidate it.',
      change: 'Invert it. Mark the boundaries of each update, then sweep once at the end.',
      code: `diff[l] += v
diff[r + 1] -= v         # <- the +1 matters
# then one prefix pass turns diff into the final array`,
      why: 'Same idea, roles swapped: O(1) per update and O(n) once, rather than O(1) per query and O(n) once. Choose by which operation dominates.' },

    { q: 'Products instead of sums.',
      problem: 'For each position, return the product of every other element. You may not use division, and the array may contain zeros.',
      example: `Input:   [1, 2, 3, 4]
Output:  [24, 12, 8, 6]

total / xs[i] would be tempting, and one zero anywhere
makes it wrong or a crash.`,
      reduces: 'the same prefix idea run from BOTH ends, PLUS multiplying instead of subtracting — because products have no safe inverse.',
      base: 'The template subtracts to remove a prefix.',
      change: 'You cannot divide when zeros exist, so build a prefix pass and a suffix pass and multiply.',
      code: `# left[i]  = product of everything before i
# right[i] = product of everything after i
answer[i] = left[i] * right[i]`,
      why: 'Division would be the obvious inverse, and the problem usually forbids it precisely because a single zero breaks it. Two passes sidestep the issue entirely.' },

    { q: 'Updates and queries are interleaved, thousands of each.',
      problem: 'Support both "add v to index i" and "sum from l to r", thousands of each, arriving in any order.',
      example: `update(1, +5)   then   query(0, 3)
then update(2, -1)  then  query(1, 2)

Every update invalidates every prefix at or after it.`,
      reduces: 'nothing. Prefix sums assume the array is static between queries, and a difference array inverts rather than fixes the problem.',
      base: 'The template assumes the array is static between queries.',
      change: 'Prefix sums stop working. Say you would reach for a Fenwick or segment tree.',
      code: `# every update invalidates O(n) of the prefix table
# Fenwick: O(log n) update AND O(log n) query`,
      why: 'Naming the structure and its complexity is usually enough at interview level; you will rarely be asked to implement one. Knowing WHEN prefix sums break is the tested part.' },
  ],

  'trie': [
    { q: 'Return the top three suggestions for every prefix as the user types.',
      problem: 'Given a product list and a search term, return up to three matching products for every prefix of the term as it is typed, in lexicographic order.',
      example: `products: mobile, mouse, moneypot, monitor, mousepad
term:     mouse

after "m":     mobile, moneypot, monitor
after "mou":   mouse, mousepad
after "mouse": mouse, mousepad`,
      reduces: 'the same trie, PLUS precomputing the best three AT each node so a keystroke is a pointer move rather than a subtree walk.',
      base: 'The template walks to a node, then searches the subtree below it.',
      change: 'Precompute the best three AT each node while inserting.',
      code: `node.setdefault('top', [])
if len(node['top']) < 3:
    node['top'].append(word)      # words inserted in sorted order`,
      why: 'A subtree walk per keystroke is far too slow for a search box. Storing the answer at the node makes each keystroke a single pointer move.' },

    { q: 'Support "." as a wildcard matching any character.',
      problem: 'Support addWord and search over a dictionary, where a "." in the search pattern matches any single character.',
      example: `addWord("bad"), addWord("dad"), addWord("mad")
search("pad")  ->  False
search("bad")  ->  True
search(".ad")  ->  True
search("b..")  ->  True`,
      reduces: 'the same walk, PLUS branching into every child on a wildcard — the trie stops being a lookup and becomes a search space.',
      base: 'The template follows exactly one child per character.',
      change: 'On a wildcard, recurse into all children. The trie becomes a search space rather than a lookup.',
      code: `if ch == '.':
    return any(search(rest, child) for child in node.values())`,
      why: 'Worst case degrades towards scanning the dictionary, and saying that out loud is part of the answer.' },

    { q: 'Find every dictionary word hidden in a grid of letters.',
      problem: 'Given a board of letters and a word list, return every word that can be spelled by moving to orthogonally adjacent cells without reusing a cell in one word.',
      example: `board  o a a n     words: oath, pea, eat, rain
       e t a e
       i h k r
       i f l v
Output: [oath, eat]`,
      reduces: 'backtracking over the grid PLUS the trie carried alongside — the prune when a prefix leaves the trie is the entire performance story.',
      base: 'The template answers queries about one word at a time.',
      change: 'Walk the grid with backtracking and the trie together, pruning the moment the current prefix leaves the trie.',
      code: `if ch not in node:
    return                    # <- the prune; this is the whole performance story`,
      why: 'Searching the grid once per word is hopeless. One traversal carrying the trie prunes dead branches immediately, which is why word search II is a trie problem rather than a backtracking one.' },

    { q: 'I only ever need exact membership.',
      problem: 'You need to answer "is this exact word in the list?" and nothing else. No prefixes, no autocomplete, no wildcards.',
      example: `words = [cat, car, dog]
contains("car")  ->  True
contains("ca")   ->  False`,
      reduces: 'nothing. A set answers it in one line, and a trie is more code and more memory for a capability nobody uses.',
      base: 'The template pays for prefix structure you are not using.',
      change: 'Use a set.',
      code: `words = set(word_list)      # done`,
      why: 'A trie is more code, more memory and no faster for exact lookup. Saying so demonstrates judgement rather than pattern-matching.' },
  ],

  'fast-slow': [
    { q: 'Where does the cycle START?',
      problem: 'A linked list contains a cycle. Return the node where the cycle begins, using O(1) extra space.',
      example: `3 -> 2 -> 0 -> -4
          ^          |
          +----------+
Output:  the node with value 2

The template only proves a cycle exists.`,
      reduces: 'the same two pointers, PLUS resetting one to the head and advancing BOTH at speed one.',
      base: 'The template detects that they meet, and stops there.',
      change: 'Reset one pointer to the head and advance both one step at a time. They meet at the entrance.',
      code: `slow = head
while slow is not fast:
    slow = slow.next
    fast = fast.next          # both at speed ONE now`,
      why: 'The distance from the head to the entrance equals the distance from the meeting point to the entrance, going round. It is worth knowing the result even if you cannot derive the proof under pressure.' },

    { q: 'Remove the nth node from the end.',
      problem: 'Remove the nth node from the end of a linked list in one pass, and return the head. You do not know the length.',
      example: `Input:   1 -> 2 -> 3 -> 4 -> 5,  n = 2
Output:  1 -> 2 -> 3 -> 5

n = 5 would remove the head, which is the edge case.`,
      reduces: 'two pointers again, but with a fixed GAP at the same speed rather than two different speeds — plus a dummy head.',
      base: 'The template uses two SPEEDS.',
      change: 'Two pointers at the same speed with a fixed GAP of n.',
      code: `for _ in range(n):
    fast = fast.next          # open the gap first
while fast:
    slow, fast = slow.next, fast.next`,
      why: 'Different problem, same family. When fast reaches the end, slow is exactly n from it — and a dummy head removes the "delete the head" special case.' },

    { q: 'Is this number "happy"? Repeatedly sum the squares of its digits.',
      problem: 'Repeatedly replace a number by the sum of the squares of its digits. Return True if it eventually reaches 1, and False if it loops forever.',
      example: `Input:   19
Output:  True

19 -> 82 -> 68 -> 100 -> 1

Input:   2  ->  False  (it cycles 4, 16, 37, 58, 89, 145, 42, 20, 4)`,
      reduces: 'the same cycle detection with node.next replaced by a successor FUNCTION — a deterministic sequence is a linked list.',
      base: 'The template walks node.next.',
      change: 'Replace the successor function. Everything else is identical.',
      code: `def nxt(n):
    total = 0
    for digit in str(n):
        total += int(digit) ** 2
    return total

slow = nxt(n)
fast = nxt(nxt(n))`,
      why: 'Any deterministic successor function defines a linked list. Recognising a number sequence as one is the entire point of these problems.' },

    { q: 'Is the linked list a palindrome, in O(1) space?',
      problem: 'Decide whether a singly linked list reads the same forwards and backwards, in O(n) time and O(1) space.',
      example: `Input:   1 -> 2 -> 3 -> 2 -> 1
Output:  True

Copying the values to an array is O(n) space, which is
the answer to beat.`,
      reduces: 'find-the-middle PLUS in-place reversal — two techniques you already have, composed.',
      base: 'The template only locates a position.',
      change: 'Find the middle, reverse the second half in place, then walk both halves inwards.',
      code: `mid = find_middle(head)
second = reverse(mid)
# compare head..mid with second..end`,
      why: 'It composes two things you already know. Mention that you are mutating the input and could restore it afterwards — that is the part interviewers listen for.' },
  ],

  'greedy': [
    { q: 'Why sort by end time rather than start time?',
      problem: 'Given intervals, keep as many as possible with no two overlapping. The algorithm is one sort plus one sweep — the whole question is which key you sort by.',
      example: `Input:   [[0,10], [1,2], [3,4]]
By START: keep [0,10] only  ->  1
By END:   keep [1,2], [3,4]  ->  2`,
      reduces: 'the same greedy sweep. Only the sort key changes, and it changes the answer.',
      base: 'The template sorts by whichever key you chose, and the choice is the solution.',
      change: 'Sort by END. Then state the exchange argument out loud.',
      code: `intervals.sort(key=lambda x: x[1])
# counterexample for sorting by START:
#   [0, 10], [1, 2], [3, 4]  ->  start-order keeps 1, end-order keeps 2`,
      why: 'Earliest end leaves the most room for everything after it. That counterexample takes ten seconds to produce and settles the question completely.' },

    { q: 'Prove your greedy is optimal.',
      problem: 'You have a greedy that passes your tests. The interviewer asks why it is correct. Nothing needs coding — this is the part of the answer that turns a guess into a solution.',
      example: `Claim: taking the earliest-ending compatible interval
       is always safe.

Let OPT be optimal and omit g. Swap OPT's earliest-ending
member for g: g ends no later, so the set stays valid and
the same size. So some optimum contains g.`,
      reduces: 'nothing to code. It is three sentences, and it is separately scored.',
      base: 'The template produces an answer; it does not justify one.',
      change: 'Give the exchange argument: swapping the greedy choice into any optimal solution leaves it no worse.',
      code: `# if OPT does not take the earliest-ending compatible interval x,
# swap OPT's first interval for x. Still valid, same size.
# So some optimal solution contains x -- greedy is safe.`,
      why: 'An unjustified greedy reads as a guess that happened to work. The argument is three sentences and it is what makes the answer complete.' },

    { q: 'The greedy gives the wrong answer on this input.',
      problem: 'Given coins and a target, return the fewest coins. Test the greedy adversarially before committing to it.',
      example: `Input:   coins [1, 3, 4],  target 6
Greedy:  4 + 1 + 1 = 3 coins
Optimal: 3 + 3     = 2 coins`,
      reduces: 'nothing. When greedy breaks, the answer is DP — and finding the counterexample takes ten seconds.',
      base: 'The template assumes a local choice cannot cost you globally.',
      change: 'Abandon it for DP. Coin change with {1,3,4} and amount 6 is the standard demonstration.',
      code: `# greedy:  4 + 1 + 1 = 3 coins
# optimal: 3 + 3     = 2 coins`,
      why: 'Test greedy against a small adversarial case BEFORE committing. Discovering it at minute thirty costs the problem.' },

    { q: 'The best choice changes as items are consumed.',
      problem: 'Given task counts and a cooldown n between two identical tasks, return the minimum total time including idle slots.',
      example: `Input:   tasks [A,A,A,B,B,C],  n = 2
Output:  7

A B C A B idle A -- the most frequent task fixes the
skeleton and the rest fill its gaps.`,
      reduces: 'greedy in structure, PLUS a heap in mechanism — a static sort cannot express a priority that changes as items are used.',
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
      problem: 'Merge two sorted arrays into one sorted array. The general k-way machinery applies, and the question is whether it should.',
      example: `Input:   a = [1, 3, 8],  b = [2, 3, 9]
Output:  [1, 2, 3, 3, 8, 9]

A heap of size 2 is pure overhead for one comparison.`,
      reduces: 'nothing to add — it SIMPLIFIES to two pointers, and reaching for the heap here reads as pattern-matching.',
      base: 'The template maintains a heap of k candidates.',
      change: 'Drop the heap. Two pointers, O(n).',
      code: `while i < len(a) and j < len(b):
    ...`,
      why: 'A heap of two is pure overhead. Reaching for the general tool when the specific one is simpler reads as pattern-matching without thinking.' },

    { q: 'Find the kth smallest element in a sorted matrix.',
      problem: 'Given an n x n matrix where every row and every column is sorted ascending, return the kth smallest element.',
      example: `Input:   [[1,  5,  9],
          [10, 11, 13],
          [12, 13, 15]],  k = 8
Output:  13

Merging all nine and taking the 8th wastes most of the work.`,
      reduces: 'either the k-way merge stopped after k pops, or binary search on the VALUE with an O(n) counting step.',
      base: 'The template merges everything.',
      change: 'Pop only k times and stop — or binary search the VALUE range instead.',
      code: `for _ in range(k - 1):
    heapq.heappop(heap)
    push_successor()
return heap[0][0]
# alternative: binary search on value, count cells <= mid`,
      why: 'You never need the full merge for one element. The binary-search-on-value version is O(n log(range)) and often beats the heap on a large matrix.' },

    { q: 'Find the smallest range covering at least one number from each list.',
      problem: 'Given k sorted lists, find the smallest range [a, b] that contains at least one number from every list. Return that range.',
      example: `Input:   [4, 10, 15], [0, 9, 12], [5, 18, 22]
Output:  [4, 9]

4 from list 1, 9 from list 2, 5 from list 3.
[0, 5] and [5, 10] are equally small; nothing smaller
covers all three.`,
      reduces: 'the same heap of heads, PLUS carrying the running MAXIMUM by hand — the heap only ever exposes the minimum.',
      base: 'The template only tracks the minimum, at the heap top.',
      change: 'Track the running MAXIMUM pushed so far alongside it; the range is max minus heap top.',
      code: `cur_max = max(cur_max, nxt_val)
if cur_max - h[0][0] < best_span:
    best = (h[0][0], cur_max)`,
      why: 'The heap gives you one end of the window for free; the other has to be carried. One extra variable turns the merge into a range search.' },
  ],

  'dijkstra': [
    { q: 'Some edges have negative weight.',
      problem: 'Find shortest paths from a source on a graph where some edge weights are negative. There are no negative cycles.',
      example: `Input:   S-A 2,  S-B 5,  B-A -4
Output:  dist[A] = 1   (via B)

Dijkstra settles A at 2 and never revisits it, returning 2.`,
      reduces: 'nothing. Dijkstra finalises a node on pop, and a negative edge can cheapen a path afterwards — so the precondition is gone.',
      base: 'The template settles a node permanently the moment it pops.',
      change: 'That assumption breaks. Use Bellman-Ford: relax every edge V−1 times.',
      code: `for _ in range(V - 1):
    for u, v, w in edges:
        dist[v] = min(dist[v], dist[u] + w)`,
      why: 'With a negative edge, a longer route can still get cheaper later, so "settled" is a lie. O(V·E) instead of O(E log V), and one more pass detects a negative cycle.' },

    { q: 'Every edge costs the same.',
      problem: 'Shortest path from a source on a graph where every edge has weight 1. Dijkstra works; the question is whether it should be used.',
      example: `Input:   unweighted graph, S to T
Output:  the fewest edges, which is also the cheapest cost

Cost order and arrival order are now the same thing.`,
      reduces: 'nothing to add — it SIMPLIFIES to BFS, dropping the heap and the log factor.',
      base: 'The template pays log V per operation to order the frontier by cost.',
      change: 'Use BFS. The queue is already in cost order when all costs are equal.',
      code: `q = deque([start])       # no heap needed at all`,
      why: 'O(V+E) instead of O(E log V), and much less code. Recognising the degenerate case is worth saying even if you then keep Dijkstra for generality.' },

    { q: 'The weights are only 0 and 1.',
      problem: 'Shortest path where every edge costs either 0 or 1. Common in grids where some moves are free — for example, changing a cell versus walking through it.',
      example: `Input:   S-A 0,  S-B 1,  A-T 1
Output:  dist[T] = 1

Only two distinct distances are ever in flight at once.`,
      reduces: 'the same relaxation, PLUS a deque instead of a heap — appendleft for 0 and append for 1 keeps it sorted for free.',
      base: 'The template uses a heap to maintain cost order.',
      change: 'A deque does it: zero-weight edges go on the front, one-weight on the back.',
      code: `if weight == 0:
    dq.appendleft(v)          # free move: same distance, so handle it next
else:
    dq.append(v)              # costs 1: strictly further away`,
      why: 'The deque stays sorted by distance for free, so you get O(V+E). This is the trick for grids where some moves are free.' },

    { q: 'The graph is time-dependent — a flight is only usable after you arrive.',
      problem: 'Given flights with departure and arrival times, find the earliest possible arrival at a destination. A flight is only usable if it departs at or after you land.',
      example: `Input:   A->B dep 09:00 arr 10:00
         B->C dep 09:30 arr 11:00
Output:  C unreachable

The B->C edge exists and leaves before you can be at B.`,
      reduces: 'the same relaxation, PLUS filtering edges by departure time — and it stays correct only because waiting is free.',
      base: 'The template treats an edge as always available at a fixed cost.',
      change: 'The label becomes "earliest arrival", and edges are filtered by departure time.',
      code: `if best[u] + MCT <= departure:
    best[v] = min(best[v], arrival)`,
      why: 'It still works because waiting is free, so arriving earlier is never worse. Say that assumption out loud — the whole correctness argument rests on it, and a "no waiting over four hours" constraint would break it.' },
  ],

  'quickselect': [
    { q: 'Would a heap not be simpler here?',
      problem: 'Return the kth largest element, where k is small and n is very large. Quickselect gives O(n) average; the question is whether that is the right trade.',
      example: `Input:   n = 10^6,  k = 2
heap:         O(n log k), three words, no worst case
quickselect:  O(n) average, O(n^2) worst, mutates input`,
      reduces: 'nothing. Quickselect answers "can you beat O(n log k)" and is not the default for "find the kth largest".',
      base: 'The template partitions in place for expected O(n).',
      change: 'Often yes — use the heap and say why. Quickselect answers "can you beat O(n log k)", not "what is the obvious solution".',
      code: `heapq.nlargest(k, xs)        # O(n log k), no worst case, three words`,
      why: 'Quickselect has an O(n^2) worst case and mutates the input. Choosing the simpler tool and being able to justify the swap is the senior answer.' },

    { q: 'The input array must not be modified.',
      problem: 'Return the kth smallest element without reordering the caller\'s array. Quickselect partitions in place, which is intrinsic to how it works.',
      example: `Input:   [7, 2, 9, 4, 1, 6],  k = 3
Output:  4,  and the array unchanged

After one partition the array is already permuted.`,
      reduces: 'the same algorithm on a COPY, PLUS declaring the O(n) space that copy costs — there is no in-place-but-non-mutating version.',
      base: 'The template partitions in place, which reorders the caller\'s data.',
      change: 'Copy first, and declare the O(n) space that costs.',
      code: `xs = xs[:]        # and say that this is O(n) extra space`,
      why: 'In-place partitioning is intrinsic to the algorithm, so the copy is the only option. Naming the cost rather than hiding it is the point.' },

    { q: 'The data arrives as a stream and does not fit in memory.',
      problem: 'Return the kth largest element of a stream too large to hold in memory. Each element is seen once, in order.',
      example: `arrive: 7, 2, 9, 4, 1, 6 ...  k = 3

Quickselect needs random access to swap positions that
have already gone past.`,
      reduces: 'nothing. Partitioning requires the whole array, so the answer is a size-k heap holding only k items.',
      base: 'The template needs random access to partition.',
      change: 'Back to a size-k heap, which only ever holds k items.',
      code: `# quickselect cannot run without the whole array in hand`,
      why: 'Streaming rules out anything that reorders the input. This is the constraint that makes the heap the right answer rather than the fallback.' },
  ],

  // ============================================================ techniques ==

  'sorting': [
    { q: 'Sort by length, then alphabetically for ties.',
      problem: 'Sort words by length ascending, and alphabetically among words of equal length.',
      example: `Input:   ["bb", "a", "ccc", "dd"]
Output:  ["a", "bb", "dd", "ccc"]

"bb" and "dd" tie on length, so the letters decide.`,
      reduces: 'the same sort call, PLUS a tuple key — Python compares tuples element by element, so reading order is priority order.',
      base: 'The template sorts by one key.',
      change: 'Return a tuple from the key function — tuples compare element by element.',
      code: `words.sort(key=lambda w: (len(w), w))`,
      why: 'No custom comparator needed, and the reading order of the tuple is the priority order of the keys.' },

    { q: 'Descending on one field, ascending on another.',
      problem: 'Sort records by group ascending, and by score DESCENDING within each group.',
      example: `Input:   (A,90), (B,90), (C,70), (A,80)
Output:  (A,90), (A,80), (B,90), (C,70)

Two keys pulling in opposite directions.`,
      reduces: 'the same tuple key, PLUS negating the numeric field — and if the field is not numeric, two sorts exploiting stability instead.',
      base: 'The template sorts everything one way.',
      change: 'Negate the numeric field inside the tuple.',
      code: `items.sort(key=lambda x: (x.group, -x.score))`,
      why: 'Negation only works on numbers. For mixed directions on strings, exploit stability instead: sort by the secondary key first, then by the primary.' },

    { q: 'You must not lose the original positions.',
      problem: 'Return the index of the smallest element, where the caller needs the ORIGINAL index. Sorting the values discards exactly that.',
      example: `Input:   [30, 10, 20]
Output:  1

Sorting gives [10, 20, 30] and the smallest at index 0,
which is the wrong answer to the question asked.`,
      reduces: 'the same sort applied to the INDICES rather than the values, keyed by the values.',
      base: 'The template reorders the data in place.',
      change: 'Sort the indices rather than the values.',
      code: `order = sorted(range(len(xs)), key=lambda i: xs[i])`,
      why: 'The answer often needs original indices — "return the index of" is the tell. Sorting values first throws away exactly the thing being asked for.' },
  ],

  'counting-sort': [
    { q: 'The values range up to 10^9.',
      problem: 'Sort a small number of items whose values are enormous. Counting sort is O(n + k) — the question is what k is here.',
      example: `Input:   [5, 900000000, 42]   (n = 3, range = 10^9)

A bucket per possible value would be gigabytes, to sort
three numbers.`,
      reduces: 'nothing. Counting sort trades space for time, and the trade only pays while the range is comparable to n.',
      base: 'The template allocates one bucket per possible value.',
      change: 'Do not. Either sort normally, or compress the coordinates first.',
      code: `# an array of 10^9 buckets to sort 100 items is absurd
vals = sorted(set(xs))
rank = {}
for i, v in enumerate(vals):
    rank[v] = i`,
      why: 'Counting sort trades space for time, and the trade only pays while the range is comparable to n. Checking the range before reaching for it is the judgement being tested.' },

    { q: 'Sort objects by a small integer field, keeping equal ones in order.',
      problem: 'Sort records by a small integer score, and keep records with equal scores in their original relative order.',
      example: `Input:   A:2, B:1, C:2
Output:  B:1, A:2, C:2

A before C, exactly as in the input.`,
      reduces: 'the same counting, PLUS bucketing the OBJECTS rather than counting occurrences — which makes it stable by construction.',
      base: 'The template counts values, which discards the objects.',
      change: 'Bucket the objects themselves, appending in input order.',
      code: `buckets = [[] for _ in range(k)]
for obj in items:
    buckets[obj.score].append(obj)     # stable by construction`,
      why: 'Appending in input order makes it stable for free, which matters when it is a pass inside radix sort.' },
  ],

  'recursion': [
    { q: 'The input is 10^5 deep and it crashes.',
      problem: 'A correct recursive traversal over a structure 10^5 deep. It raises RecursionError. Produce the answer.',
      example: `Input:   a chain of 100000 nodes
Output:  100000

Python stops at roughly 1000 frames. The algorithm is
right and the runtime refuses it.`,
      reduces: 'the same traversal, PLUS moving the stack from call frames onto the heap — or raising the limit and saying why that is acceptable.',
      base: 'The template uses the call stack, which Python caps near a thousand frames.',
      change: 'An explicit stack, or raise the limit and justify it.',
      code: `import sys
sys.setrecursionlimit(10**6)      # quick, and say why it is safe
# or convert to an explicit stack, which always is`,
      why: 'Raising the limit works but risks a hard crash rather than a clean exception. Say which you chose and why — the interviewer is testing whether you noticed at all.' },

    { q: 'The same subproblem is being solved repeatedly.',
      problem: 'A recursive definition where the same argument is reached by many different routes — fib(n) being the smallest example. It is correct and exponential.',
      example: `Input:   fib(30)
Output:  832040

Without a cache: 2.7 million calls.
With one: 31.`,
      reduces: 'the same recursion, PLUS one decorator. Memoised recursion IS dynamic programming.',
      base: 'The template recomputes every call.',
      change: 'One decorator. That is the entire step from recursion to DP.',
      code: `@lru_cache(None)
def solve(...):`,
      why: 'Memoised recursion IS dynamic programming. Framing it that way makes DP a one-line upgrade rather than a separate technique to fear.' },

    { q: 'The recursion is tail-recursive. Will Python optimise it?',
      problem: 'A recursion whose recursive call is the last thing it does. In some languages the frame is reused and depth is O(1). Is that true in Python?',
      example: `def go(n):
    if n == 0: return
    go(n - 1)      # nothing happens after this

go(100000)  ->  RecursionError`,
      reduces: 'nothing. Python has no tail-call optimisation, so it converts mechanically to a while loop instead.',
      base: 'The template assumes each call gets a frame.',
      change: 'No — Python has no tail-call optimisation. Rewrite as a loop.',
      code: `while cond:          # what the tail call was doing
    state = step(state)`,
      why: 'A deliberate language fact worth knowing. Any tail recursion converts mechanically to a while loop with no stack cost.' },
  ],

  'kadane': [
    { q: 'Every number is negative.',
      problem: 'Maximum-sum contiguous subarray where every element is negative. The subarray must be non-empty.',
      example: `Input:   [-3, -1, -4]
Output:  -1

Initialising best = 0 returns 0, claiming an empty
subarray. It passes every test containing a positive.`,
      reduces: 'nothing — the base template is already correct BECAUSE it initialises from xs[0]. This is why.',
      base: 'The template initialises cur and best from the first element.',
      change: 'Nothing — but only because of that initialisation. Starting from 0 returns 0, which is wrong.',
      code: `best = cur = xs[0]      # NOT best = 0`,
      why: 'The empty subarray is not usually allowed, so the answer should be the least negative element. This one-token difference is the classic Kadane bug.' },

    { q: 'Maximum PRODUCT instead of sum.',
      problem: 'Find the contiguous subarray with the largest product. Values may be negative, and two negatives multiply to a positive.',
      example: `Input:   [2, -3, -4]
Output:  24   (the whole array)

Tracking only the running maximum misses this: -6 had to
be remembered to become 24.`,
      reduces: 'the same one-pass sweep, PLUS tracking the running MINIMUM too — and computing both from the old values.',
      base: 'The template tracks a single running value.',
      change: 'Track the running minimum too — a negative times a negative becomes the new maximum.',
      code: `# Compute BOTH from the OLD values before overwriting either one.
extend_max = cur_max * x
extend_min = cur_min * x

new_max = max(x, extend_max, extend_min)
new_min = min(x, extend_max, extend_min)

cur_max = new_max
cur_min = new_min`,
      why: 'Order matters: compute both from the OLD values, or the second line reads a variable you have already overwritten.' },

    { q: 'The array is circular.',
      problem: 'Maximum-sum contiguous subarray where the array wraps, so a subarray may run off the end and continue at the start.',
      example: `Input:   [5, -3, 5]
Output:  10

The wrapping subarray is [5, ..., 5] -- which is the
complement of the minimum middle chunk, -3.`,
      reduces: 'the same Kadane run TWICE — once for the maximum, once for the minimum — because a wrapping subarray is the complement of a non-wrapping one.',
      base: 'The template assumes the subarray does not wrap.',
      change: 'Two cases: the normal Kadane maximum, or the total minus the minimum subarray.',
      code: `return max(kadane_max(xs), total - kadane_min(xs))
# guard: if every element is negative, the second case gives an empty array`,
      why: 'A wrapping subarray is exactly the complement of a non-wrapping one. The all-negative guard is the edge case that makes it correct.' },
  ],

  'index-as-storage': [
    { q: 'The array must not be modified.',
      problem: 'Find all numbers in 1..n missing from an array of length n, without modifying the input.',
      example: `Input:   [3, 1, 3, 4, 1]
Output:  [2, 5]

The negation trick writes flags into the array, which is
now forbidden.`,
      reduces: 'nothing. The technique exists only to avoid O(n) space, so forbidding mutation removes its only advantage.',
      base: 'The template writes its bookkeeping into the input.',
      change: 'The technique does not apply. Use a set or a count array, and pay the O(n) space.',
      code: `seen = set()      # the honest alternative`,
      why: 'Index-as-storage exists only to avoid that space. Remove the constraint and the trick has no purpose.' },

    { q: 'Values can be zero or negative.',
      problem: 'The same find-the-missing question, but the array may contain zeros or negative values rather than being guaranteed to lie in 1..n.',
      example: `Input:   [0, 1, 2]

Negating 0 gives 0, so a marked zero is indistinguishable
from an unmarked one.`,
      reduces: 'nothing. The sign is the storage, so a value with no usable sign breaks it — offset the values, or use cyclic sort.',
      base: 'The template negates values to mark them, which needs a sign to flip.',
      change: 'Negation breaks. Offset the values, or use cyclic sort, or accept a count array.',
      code: `# 0 has no sign to flip, so it can never be marked`,
      why: '"n numbers in the range 1..n" is the phrasing that licenses this technique. Outside that range, check before committing.' },
  ],

  'sentinel': [
    { q: 'The head node itself might be deleted.',
      problem: 'Delete every node with a given value from a linked list, and return the new head. The head itself may need deleting, possibly several times over.',
      example: `Input:   1 -> 1 -> 2,  remove 1
Output:  2

Without a dummy, deleting the head means reassigning head
itself -- a branch no other position needs.`,
      reduces: 'the same traversal, PLUS a dummy node in front so every real node has a predecessor — and returning dummy.next, not head.',
      base: 'The template returns head.',
      change: 'Return dummy.next instead — head may no longer be the head.',
      code: `return dummy.next        # NOT head`,
      why: 'This is the bug the dummy node creates if you forget it: the deletion works and the function returns the removed node anyway.' },

    { q: 'Bars are left on the stack when the histogram scan ends.',
      problem: 'The histogram scan finishes with several bars still on the stack, waiting for a shorter bar that never arrives. Their rectangles are never measured.',
      example: `Input:   [2, 1, 5, 6]
Output:  10

Bars 5 and 6 are still waiting at the end. Without a fix
the answer comes out as 2.`,
      reduces: 'the same loop, PLUS a trailing zero — nothing is shorter, so every remaining bar pops through the existing path.',
      base: 'The template only pops when a smaller bar arrives.',
      change: 'Append a zero so every remaining bar is forced out.',
      code: `heights.append(0)        # nothing is shorter, so everything flushes`,
      why: 'Without it, the tallest trailing bars are never measured. One element removes an entire post-loop cleanup branch.' },
  ],

  'tabulation': [
    { q: 'The 2D table is too big for memory.',
      problem: 'Longest common subsequence of two strings each 10^4 long. The recurrence is right; an m x n table is 10^8 cells and will not fit.',
      example: `Input:   a = "abcde",  b = "ace"
Output:  3   ("ace")

At 10^4 x 10^4 the table is 100 million integers.`,
      reduces: 'the same recurrence, PLUS keeping only the rows it actually reads — usually the previous one.',
      base: 'The template allocates the whole grid.',
      change: 'Keep only the rows the recurrence actually reads — usually one.',
      code: `prev, cur = cur, [0] * (n + 1)     # O(n) instead of O(m*n)`,
      why: 'Only possible once you can see which cells the recurrence touches, which is why memoisation comes first. It also destroys the ability to reconstruct the path.' },

    { q: 'I need the actual sequence, not just its length.',
      problem: 'Same edit distance or LCS question, but return the actual operations or the actual subsequence rather than its length.',
      example: `Input:   a = "abcde",  b = "ace"
Output:  "ace"   (not 3)

The rolling-row version has overwritten every row but
the last.`,
      reduces: 'nothing that composes with the space optimisation — you keep the full table or store parent pointers, and the two goals are exclusive.',
      base: 'The rolling-array version has thrown away everything but the last row.',
      change: 'Keep the full table, or store parent pointers.',
      code: `# the space optimisation and path reconstruction are mutually exclusive`,
      why: 'Naming that trade-off is the answer to "can you do both?" — you cannot, and saying so is better than trying.' },

    { q: 'It gives the wrong answer and I cannot see why.',
      problem: 'A 0/1 knapsack fills its table and returns a value that is too large. The recurrence is correct and the code runs cleanly.',
      example: `Input:   capacity 5, item (w=2, v=3)
Expected: dp[5] = 3   (one copy fits)
Got:      dp[5] = 6   (it used the item twice)`,
      reduces: 'nothing — the recurrence is right. The ITERATION DIRECTION is wrong, and upward silently solves the unbounded problem instead.',
      base: 'The template fills the table in a fixed order.',
      change: 'Check the iteration direction. Reading a cell before it is written fails silently.',
      code: `for c in range(cap, w - 1, -1):    # 0/1 knapsack: DOWNWARD
for c in range(w, cap + 1):        # unbounded: UPWARD`,
      why: 'This is the most common tabulation bug, and the two loops above are the same problem with opposite semantics.' },
  ],

  'knapsack': [
    { q: 'Each item may be used any number of times.',
      problem: 'Maximise value within a capacity, where every item may be taken as many times as you like.',
      example: `Input:   capacity 4, item (w=2, v=3)
Output:  3   in 0/1        (one copy, and 2 capacity wasted)
         6   unbounded     (two copies)

Same table, same recurrence, one loop direction apart.`,
      reduces: 'the same DP with the capacity loop reversed — upward means the cell you read has already seen this item.',
      base: 'The template iterates capacity downward so each item is used once.',
      change: 'Iterate upward.',
      code: `for c in range(w, cap + 1):        # upward = reuse allowed`,
      why: 'Upward means the cell you read has already seen this item, so it can be taken again. One loop direction separates 0/1 from unbounded.' },

    { q: 'Can the set be split into two halves with equal sums?',
      problem: 'Decide whether an array can be partitioned into two subsets with equal sums.',
      example: `Input:   [1, 5, 11, 5]
Output:  True   ([11] and [1, 5, 5])

Input:   [1, 2, 3, 5]
Output:  False  (total 11 is odd)`,
      reduces: 'the same 0/1 knapsack with the value replaced by a boolean and the capacity set to total / 2.',
      base: 'The template maximises value under a capacity.',
      change: 'It is subset-sum in disguise: target = total / 2, and the value is a boolean.',
      code: `if total % 2 == 1:
    return False              # an odd total cannot split evenly

target = total // 2
reachable = [False] * (target + 1)
reachable[0] = True           # a sum of 0 needs no items

for x in nums:
    for c in range(target, x - 1, -1):
        if reachable[c - x]:
            reachable[c] = True

return reachable[target]`,
      why: 'Recognising partition, subset sum and coin change as one template is worth more than memorising three. The odd-total early exit is free.' },
  ],

  'bit-tricks': [
    { q: 'Every element appears three times except one.',
      problem: 'Every element appears exactly three times except one, which appears once. Find it in O(1) space.',
      example: `Input:   [2, 2, 3, 2]
Output:  3

XOR gives 2 ^ 2 ^ 3 ^ 2 = 3 here by luck, but
[2,2,2,5,5,5,7] would break it.`,
      reduces: 'the same idea generalised — XOR is "count occurrences mod 2", so three copies means counting set bits mod 3 per position.',
      base: 'XOR cancels PAIRS, so it does nothing useful against triples.',
      change: 'Count set bits per position and take them modulo 3.',
      code: `for b in range(32):
    if sum((x >> b) & 1 for x in xs) % 3:
        ans |= 1 << b`,
      why: 'The XOR trick is specific to pairs. Generalising to k copies means counting per bit position modulo k.' },

    { q: 'Write this in JavaScript instead.',
      problem: 'The same bit manipulation, implemented in JS for the front-end round. Plain numbers are exact to 2^53, so it looks safe.',
      example: `1 << 30  ->  1073741824    correct
1 << 31  ->  -2147483648   negative!
2 ** 31  ->  2147483648    fine

Only the BITWISE operators truncate.`,
      reduces: 'nothing. Every JS bitwise operator coerces to 32-bit signed first, so masks and hashes above 2^31 silently break.',
      base: 'The template assumes arbitrary-precision integers.',
      change: 'Every bitwise operator truncates to 32-bit signed. Guard anything above 2^31.',
      code: `1 << 31        // -2147483648 in JS, 2147483648 in Python
x >>> 0        // force unsigned interpretation`,
      why: 'Plain JS numbers are exact to 2^53, but bitwise operations are not — which makes hash and mask tricks fail silently on large values.' },
  ],

  'lru-cache': [
    { q: 'Implement it without OrderedDict.',
      problem: 'Build an LRU cache with O(1) get and put, without using OrderedDict or any ordered map. Capacity is fixed; a read counts as a use.',
      example: `capacity 2
put(1,1) put(2,2) get(1)=1 put(3,3)

Evicts key 2, not key 1 -- the get(1) made 1 recent.`,
      reduces: 'the same behaviour, PLUS building the ordering by hand — a hash map for lookup and a doubly linked list with sentinel head and tail.',
      base: 'The template leans on a language feature that does the ordering for you.',
      change: 'A dict for lookup plus a doubly linked list for order, with sentinel head and tail nodes.',
      code: `head <-> ... <-> tail         # sentinel nodes remove every edge case

def touch(node):
    unlink(node)              # take it out of wherever it currently is
    push_front(node)          # and put it back as most-recently-used`,
      why: 'This is the version usually asked for. The sentinels are what stop the unlink and insert code needing null checks — the same technique as a dummy head.' },

    { q: 'Make it LFU — least FREQUENTLY used — instead.',
      problem: 'Same cache, but evict the least FREQUENTLY used key, breaking ties by least recently used among those.',
      example: `capacity 2
put(1,1) put(2,2) get(1) put(3,3)

Evicts 2: key 1 has been used twice, key 2 once.
LRU would also evict 2 here -- the difference shows on
longer traces.`,
      reduces: 'the same map-plus-ordering, PLUS a second dimension — one recency list per frequency, and a tracked minimum frequency.',
      base: 'The template orders purely by recency.',
      change: 'Bucket by frequency, each bucket ordered by recency, and track the minimum frequency.',
      code: `freq[count] = OrderedDict()      # one recency list per frequency
min_freq = ...                   # so eviction is still O(1)`,
      why: 'Strictly harder, and the standard follow-up once LRU is done. Tracking min_freq is what keeps eviction constant rather than a scan.' },
  ],

  'coordinate-compression': [
    { q: 'The answer must be a real timestamp, not an index.',
      problem: 'After compressing timestamps to ranks and running a sweep, the answer must be reported as an actual timestamp.',
      example: `Input:   timestamps [100, 250, 900]
ranks:   0, 1, 2
algorithm returns rank 1  ->  must report 250

Returning 1 is a plausible-looking wrong answer.`,
      reduces: 'the same compression, PLUS the inverse lookup at the end. Counts need no inverse; values do.',
      base: 'The template works entirely in compressed index space.',
      change: 'Keep the sorted value list and map back at the end.',
      code: `answer = vals[compressed_index]      # <- the inverse mapping`,
      why: 'Compression is a change of coordinates, not of the problem. Forgetting to invert it returns a rank where a value was asked for.' },

    { q: 'The gaps between values matter — I am summing durations.',
      problem: 'Sum the total time covered by a set of intervals whose endpoints are huge but few. Compression makes the array affordable — and changes the arithmetic.',
      example: `Input:   positions [0, 10, 1000]
true gaps:       10 and 990
compressed gaps: 1 and 1

Total covered length becomes 2 instead of 1000.`,
      reduces: 'the same compression, PLUS carrying the real widths alongside — order survives compression, magnitude does not.',
      base: 'The template replaces values with their rank, which discards distance.',
      change: 'Do not compress, or compress but carry the real widths alongside.',
      code: `width[i] = vals[i + 1] - vals[i]     # keep the true spacing`,
      why: 'Ranks preserve order and destroy magnitude. Any problem that measures length, area or duration needs the widths kept explicitly.' },
  ],

  'divide-conquer': [
    { q: 'Count the inversions in an array.',
      problem: 'Count the pairs (i, j) with i < j and xs[i] > xs[j]. The brute force is O(n^2) over all pairs.',
      example: `Input:   [2, 5, 1, 8]
Output:  2

The pairs are (2,1) and (5,1).`,
      reduces: 'the same merge sort, PLUS counting during the merge — it already compares every cross-half pair implicitly.',
      base: 'The template merges two halves and returns the merged list.',
      change: 'Count during the merge — every time you take from the right half, it jumps everything left in the left half.',
      code: `if a[i] <= b[j]:
    out.append(a[i])
    i += 1
else:
    out.append(b[j])
    j += 1

    # b[j] came out before everything still left in a, so it was
    # smaller than all of them. That is len(a) - i inversions at once.
    inversions += len(a) - i`,
      why: 'The merge already compares every cross-half pair implicitly. Counting there is free, which turns an O(n^2) count into O(n log n).' },

    { q: 'The halves are not independent — each depends on the other.',
      problem: 'A recursive split where solving the left half needs results from the right. The T(n) = 2T(n/2) recurrence assumes independence.',
      example: `If solve(left) reads solve(right), each half is
recomputed inside the other -- and again one level down.

The recurrence undercounts the real work badly.`,
      reduces: 'nothing. Overlapping subproblems means DP: memoise on the state so each shared subproblem is computed once.',
      base: 'The template assumes each half can be solved alone.',
      change: 'It does not apply. Overlapping subproblems means DP.',
      code: `# if solve(left) needs solve(right), the recursion is not a division`,
      why: 'Independence is what makes the recurrence T(n) = 2T(n/2) + O(n) valid. Without it you are re-solving shared work and need a cache.' },
  ],

  'meet-in-middle': [
    { q: 'n is 40 and full enumeration times out.',
      problem: 'Choose a subset of 40 items whose sum is as close as possible to a target. 2^40 subsets is about a trillion.',
      example: `Input:   40 weights,  target T
Output:  the achievable sum closest to T

2^40 ~ 10^12.  Two lots of 2^20 ~ 2 x 10^6.`,
      reduces: 'the same enumeration, PLUS splitting in half and joining the two halves with sorting or a hash map.',
      base: 'Backtracking enumerates all 2^n subsets.',
      change: 'Split in half, enumerate 2^20 twice, then join with sorting or a hash map.',
      code: `A = subset_sums(xs[:20])              # 10^6, fine
B = sorted(subset_sums(xs[20:]))      # 10^6, fine
# then binary search B for each a in A`,
      why: '2^40 is a trillion; two lots of 2^20 is two million. The n ≈ 40 constraint is the tell, and naming the technique is usually enough.' },

    { q: 'n is 60.',
      problem: 'The same closest-subset-sum question with 60 items. Meet in the middle applies — the question is whether it is enough.',
      example: `2^60 ~ 10^18
split: 2^30 ~ 10^9 per half, plus 10^9 searches

Still far too slow, and gigabytes of memory.`,
      reduces: 'nothing. Halving the exponent roughly doubles the workable n; it does not rescue 60, so the intended solution is polynomial.',
      base: 'The template halves the exponent.',
      change: 'Still 2^30 per half — a billion. Too slow. Look for a polynomial structure instead.',
      code: `# halving the exponent buys you roughly double the n, not ten times`,
      why: 'Knowing the ceiling of a technique matters as much as knowing the technique. Meet in the middle roughly doubles the feasible n and no more.' },
  ],

  'expand-centre': [
    { q: 'Count all palindromic substrings, not just the longest.',
      problem: 'Count the palindromic substrings of a string. Substrings at different positions count separately even if identical.',
      example: `Input:   "aaa"
Output:  6

a, a, a, aa, aa, aaa`,
      reduces: 'the same expansion, PLUS a counter instead of a maximum — every successful step outward is one more palindrome.',
      base: 'The template keeps the best result.',
      change: 'Count every successful expansion instead of comparing lengths.',
      code: `while left >= 0 and right < len(s) and s[left] == s[right]:
    total += 1                # each valid expansion IS one more palindrome
    left -= 1
    right += 1`,
      why: 'Every step outward that still matches is one more palindrome centred there. Same loop, a counter instead of a max.' },

    { q: 'O(n^2) is too slow — n is 10^5.',
      problem: 'Longest palindromic substring where n is 10^5. Expand-around-centre is O(n^2) and the worst case — all identical characters — actually occurs.',
      example: `Input:   "aaaa...a"  (10^5 characters)

Every centre expands the full width, so 10^10
character comparisons.`,
      reduces: 'nothing that composes. Manacher gets O(n) by reusing radii across centres, and the honest answer is to name it.',
      base: 'The template tries all 2n−1 centres, each expanding up to n.',
      change: "Manacher's algorithm gets O(n). Name it, and say you would look it up rather than reconstruct it under pressure.",
      code: `# Manacher reuses previously computed radii to skip re-comparison`,
      why: 'Honesty about what you would look up is better received than a half-remembered attempt. It is rarely required at interview level.' },
  ],

  'bitmask-enum': [
    { q: 'Also give me the subsets of each subset.',
      problem: 'For every subset, iterate over all of its subsets. The naive nesting loops all masks inside all masks.',
      example: `n = 3, mask = 011
its submasks: 011, 010, 001, 000

Naive: 2^n x 2^n = 4^n, most iterations skipped.`,
      reduces: 'the same enumeration, PLUS the (sub - 1) & mask trick — total work becomes exactly 3^n rather than 4^n.',
      base: 'The template iterates 0 to 2^n − 1 once.',
      change: 'Enumerate submasks with a subtraction trick, which is O(3^n) overall rather than O(4^n).',
      code: `sub = mask
while sub:
    ...
    sub = (sub - 1) & mask       # next submask of mask`,
      why: 'The naive double loop over all masks and all masks is 4^n. This trick visits only actual submasks, and 3^n is the exact total.' },

    { q: 'n is 25.',
      problem: 'The same subset enumeration with 25 items rather than 20. The code is identical — the question is whether it finishes.',
      example: `n = 20  ->  1,048,576       comfortable
n = 25  ->  33,554,432      borderline
n = 30  ->  1,073,741,824   no`,
      reduces: 'nothing. The exponent is the whole budget, and knowing where it stops being viable is part of knowing the technique.',
      base: 'The template loops 2^n times.',
      change: '2^25 is 33 million — borderline. 2^30 is a billion and out of reach. Check the constraint before committing.',
      code: `# n <= 20 is comfortable, 25 is borderline, 30 is not happening`,
      why: 'The exponent is the whole budget. Knowing where it stops being viable is what stops you writing a solution that cannot finish.' },
  ],

  'bitmask-dp': [
    { q: 'The tour must return to the start (travelling salesman).',
      problem: 'Travelling salesman: visit every city exactly once and RETURN to the start, minimising total distance.',
      example: `Input:   3 cities with a distance matrix
Output:  the cheapest closed tour

The path version stops when all cities are visited and
never pays for the journey home.`,
      reduces: 'the same bitmask DP, PLUS charging the return edge at the base case — one line.',
      base: 'The template stops when every node is visited.',
      change: 'Add the return edge cost at the base case.',
      code: `if mask == FULL:
    return cost[pos][start]     # <- close the loop`,
      why: 'A Hamiltonian path becomes a cycle by charging the way home. One line, and it is the difference between the path and the tour variants.' },

    { q: 'n is 22 — will n·2^n fit?',
      problem: 'The same bitmask DP with 22 items. The state space is n x 2^n, which grows faster than the exponent alone suggests.',
      example: `n = 15  ->  15 x 32,768   = 491,520 states
n = 22  ->  22 x 4,194,304 = 92M states

Times n transitions each.`,
      reduces: 'nothing. Compute n x 2^n x transitions before starting; above about n = 20 the intended solution is something else.',
      base: 'The template caches one entry per (mask, position).',
      change: '22 × 4 million is 92 million states. Too many. Fifteen or so is the practical ceiling.',
      code: `# states = n * 2^n  ->  n=15: 500k (fine), n=22: 92M (no)`,
      why: 'Bitmask DP is the answer to a small-n exponential problem, not to a large one. Compute the state count before you start.' },
  ],

  'interval-dp': [
    { q: 'Burst balloons — the value depends on the neighbours that survive.',
      problem: 'Each balloon has a number. Bursting one scores left x it x right, where left and right are its current neighbours. Burst all of them, maximising the total.',
      example: `Input:   [3, 1, 5, 8]
Output:  167

Order matters, because bursting changes who neighbours whom.`,
      reduces: 'the same range DP, PLUS choosing the LAST balloon burst in each range rather than the first — which is what makes the two sides independent.',
      base: 'The template splits a range and combines the halves.',
      change: 'Think of the LAST balloon burst in the range, not the first. Then its neighbours are exactly the range boundaries.',
      code: `dp[i][j] = max(dp[i][k] + nums[i-1]*nums[k]*nums[j+1] + dp[k+1][j])
#                       ^ k is the LAST one burst in (i, j)`,
      why: 'Choosing the first burst leaves an unknown neighbour; choosing the last makes both neighbours fixed by the range. That reframing is the entire problem.' },

    { q: 'It reads cells that are still zero.',
      problem: 'An interval DP fills its table and returns a number that is too small. The recurrence is correct and nothing crashes.',
      example: `for i in ...:      # WRONG order
    for j in ...:
        dp[i][j] = ... dp[i][k] ...

dp[0][3] is computed before the shorter ranges it needs.`,
      reduces: 'nothing — the recurrence is right. Every range depends on strictly shorter ones, so LENGTH must be the outer loop.',
      base: 'The template iterates by increasing range LENGTH.',
      change: 'Nothing — but only because of that order. Looping i then j reads sub-ranges that have not been filled.',
      code: `for length in range(2, n + 1):    # <- outermost, not i`,
      why: 'Every dp[i][j] depends on strictly shorter ranges, so shorter ones must be computed first. The loop order encodes the dependency.' },
  ],

  'lis-patience': [
    { q: 'Non-decreasing instead of strictly increasing.',
      problem: 'Longest non-decreasing subsequence, where equal values may both be used.',
      example: `Input:   [1, 3, 3, 4]
strict:      3   ([1, 3, 4])
non-strict:  4   ([1, 3, 3, 4])`,
      reduces: 'the same algorithm with bisect_left swapped for bisect_right — which decides whether an equal value appends or replaces.',
      base: 'The template uses bisect_left, which replaces an equal value.',
      change: 'Use bisect_right, so an equal value extends rather than replaces.',
      code: `i = bisect.bisect_right(tails, x)     # was bisect_left`,
      why: 'One function name, and it flips strict to non-strict. Worth knowing which is which rather than guessing under pressure.' },

    { q: 'Return the actual subsequence, not its length.',
      problem: 'Return the longest increasing subsequence itself, not its length. The patience version keeps a tails array whose contents are not a subsequence.',
      example: `Input:   [1, 100, 2, 3]
tails ends as [1, 2, 3]   length 3, correct

But 100 was OVERWRITTEN, not chosen -- tails is
bookkeeping, not a path.`,
      reduces: 'the same algorithm, PLUS parent pointers recorded as each value is placed, then walked back.',
      base: 'The template keeps only the smallest tail per length, which is not a real subsequence.',
      change: 'Record a parent index each time you place a value, then walk the chain back.',
      code: `if tails:
    parent[i] = tails_index[len(tails) - 1]
else:
    parent[i] = -1            # this value starts a new subsequence`,
      why: 'The tails array is a bookkeeping device, not an answer. Being asked to reconstruct is the standard follow-up and it needs extra state.' },
  ],

  'zero-one-bfs': [
    { q: 'The weights are 0, 1 and 2.',
      problem: 'Shortest path where edge weights are 0, 1 or 2. The deque trick relies on there being exactly two distances in flight.',
      example: `An edge of weight 2 belongs neither at the front
(same distance) nor the back (distance + 1).

Appending it anyway breaks the deque ordering.`,
      reduces: 'either splitting each weight-2 edge into two unit edges through a dummy node, or abandoning the deque for a heap.',
      base: 'The template puts weight-0 on the front and weight-1 on the back, which keeps the deque sorted.',
      change: 'Three distinct weights break that. Back to Dijkstra — or split a weight-2 edge into two weight-1 edges through a dummy node.',
      code: `# u --2--> v   becomes   u --1--> dummy --1--> v`,
      why: 'The deque trick works only because there are exactly two possible distances in flight. Edge splitting is a neat way to preserve it.' },
  ],

  'bellman-ford': [
    { q: 'Is there a negative cycle?',
      problem: 'Decide whether a weighted directed graph contains a cycle of negative total weight — in which case no shortest path exists.',
      example: `Input:   A-B 1, B-C -3, C-A 1   (cycle total -1)
Output:  True

Currency arbitrage is this question with logs of
exchange rates.`,
      reduces: 'the same relaxation, PLUS one extra round — an improvement after V-1 rounds is impossible for any simple path.',
      base: 'The template relaxes every edge V−1 times, after which all shortest paths are settled.',
      change: 'Run one more pass. Any further improvement proves a negative cycle exists.',
      code: `for u, v, w in edges:
    if dist[u] + w < dist[v]:
        return True          # <- improved after V-1 rounds`,
      why: 'No simple path has more than V−1 edges, so nothing legitimate can improve on round V. Currency arbitrage is exactly this question.' },

    { q: 'At most k edges may be used.',
      problem: 'Cheapest path from source to target using at most k edges. Standard shortest path may use more.',
      example: `Input:   flights, src, dst, k = 1 stop
Output:  the cheapest 2-edge route

Round i of Bellman-Ford already means "at most i edges".`,
      reduces: 'the same relaxation run exactly k times, PLUS relaxing from a SNAPSHOT so one round cannot chain several edges.',
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
      problem: 'Minimum spanning tree on a dense graph where E is close to V^2. Kruskal works; the question is whether the sort dominates.',
      example: `V = 1000, E ~ 500,000
Kruskal: sort 500,000 edges
Prim:    grow one tree with a heap`,
      reduces: 'the same greedy idea via Prim instead — O(E log V) without a global sort. Both are correct and the choice is E relative to V.',
      base: 'Kruskal sorts every edge, which is O(E log E).',
      change: "Prim with a heap is O(E log V) and avoids sorting the whole edge list.",
      code: `# Kruskal: sort E edges       -- best on sparse graphs
# Prim:    grow one tree      -- best on dense graphs`,
      why: 'Both are correct; the choice is about E relative to V. Kruskal is the one to write because you already have greedy and Union-Find.' },

    { q: 'Some nodes must not be connected to each other.',
      problem: 'Split the nodes into exactly k clusters, minimising the total weight of the edges used inside clusters.',
      example: `Input:   4 nodes, edge weights 1, 2, 3, 4,  k = 2
Output:  3   (take 1 and 2, stop)

The k-1 most expensive edges are the ones NOT taken.`,
      reduces: 'the same Kruskal, stopped after V - k successful unions instead of V - 1. Single-linkage clustering is this algorithm.',
      base: 'The template connects everything into one tree.',
      change: 'Stop after the required number of unions, leaving a forest of k components.',
      code: `# stop at V - k successful unions instead of V - 1`,
      why: 'A minimum spanning forest is an MST stopped early. The greedy order means the k−1 most expensive edges are the ones you skip.' },
  ],

  'floyd-warshall': [
    { q: 'Detect a negative cycle with it.',
      problem: 'You already have the all-pairs distance table. Decide whether the graph contains a negative cycle, and say which nodes lie on one.',
      example: `Input:   A-B 1, B-C -3, C-A 1
After the triple loop: d[A][A] = -1

A path from A back to A with negative total.`,
      reduces: 'nothing — the table already contains the answer. One check of the diagonal, and it names every node on a negative cycle.',
      base: 'The template fills the all-pairs distance table.',
      change: 'Check the diagonal afterwards — a negative d[i][i] means i sits on a negative cycle.',
      code: `any(d[i][i] < 0 for i in range(n))`,
      why: 'A path from i back to i with negative total is precisely a negative cycle through i. One line after the triple loop.' },

    { q: 'I only need paths from one source.',
      problem: 'Shortest paths from a single source on a graph with 1000 nodes. Floyd-Warshall gives all pairs, which includes the row you want.',
      example: `V = 1000:  V^3 = 10^9        (Floyd-Warshall)
sparse E:  E log V ~ 10^4    (Dijkstra)

Five orders of magnitude for V-1 answers you discard.`,
      reduces: 'nothing to add — it SIMPLIFIES to Dijkstra from that source, or Dijkstra V times if you genuinely need all pairs on a sparse graph.',
      base: 'The template computes all V^2 pairs.',
      change: 'Use Dijkstra from that source. O(E log V) instead of O(V^3).',
      code: `# Floyd-Warshall pays for V^2 answers; do not buy them for one`,
      why: 'All-pairs is only worth it when you genuinely need all pairs, or V is small enough that n^3 is comfortable.' },
  ],

  'cycle-directed': [
    { q: 'The graph is undirected instead.',
      problem: 'Detect a cycle in an UNDIRECTED graph. The three-colour DFS is right there, and reusing it directly gives the wrong answer.',
      example: `Input:   a single edge A - B
Output:  False   (obviously no cycle)

Three-colour DFS says True: B sees A, and A is grey.
The edge B-A is the same edge you arrived by.`,
      reduces: 'the same DFS, PLUS skipping the parent — or Union-Find, which is cleaner for undirected connectivity.',
      base: 'The template uses grey to detect a back edge into the current path.',
      change: 'In an undirected graph every edge looks like a back edge to its own parent. Track the parent and skip it — or use Union-Find.',
      code: `for v in g[u]:
    if v == parent:
        continue          # the edge you arrived by is not a cycle`,
      why: 'Without the parent check, every single edge reports a false cycle. Union-Find is the cleaner answer for undirected connectivity.' },

    { q: 'I only need yes or no, not the cycle itself.',
      problem: 'Decide whether a directed graph has a cycle. You do not need to know which nodes, or in what order they loop.',
      example: `Input:   0->1, 1->2, 2->0
Output:  True

Three colours needs recursion, a colour array and two
states kept straight.`,
      reduces: 'nothing to add — it SIMPLIFIES to Kahn: emit nodes and compare the count to V. No colours, no recursion depth.',
      base: 'The template colours nodes and recurses.',
      change: 'Kahn is simpler: count what you emit and compare to V.',
      code: `return len(order) != n        # fewer emitted -> a cycle exists`,
      why: 'No recursion, no colours, no stack-depth risk. The three-colour DFS earns itself when you need to report which nodes form the cycle.' },
  ],

  'rolling-hash': [
    { q: 'Two different substrings hashed the same.',
      problem: 'Rabin-Karp reports a match at a position where the substring does not actually equal the pattern.',
      example: `hash("ab") == hash("xy") == 12345

The window hashes equal, so a naive check reports a
match. A wrong answer, not a slow one.`,
      reduces: 'the same rolling hash, PLUS verifying the characters on a hit — or two independent moduli so agreement by chance is negligible.',
      base: 'The template compares hashes and treats a match as a match.',
      change: 'Verify the characters on a hash hit, or use two independent moduli.',
      code: `if h_window == h_target and s[i-k:i] == target:   # <- verify`,
      why: 'A collision makes the answer wrong, not slow. Saying that unprompted is the thing being tested; verification costs O(k) only on hits.' },

    { q: 'Find the longest duplicated substring.',
      problem: 'Return the longest substring appearing at least twice in a string, or the empty string if none does.',
      example: `Input:   "banana"
Output:  "ana"

It appears at index 1 and index 3.`,
      reduces: 'binary search on the LENGTH, with rolling hash as the feasibility check — two patterns composed.',
      base: 'The template hashes windows of one fixed length.',
      change: 'Binary search the LENGTH, using the rolling hash as the feasibility check.',
      code: `# can(L) = "some substring of length L appears twice"
# monotonic in L, so binary search it`,
      why: 'Two patterns composed: binary search on the answer, with rolling hash as the predicate. O(n log n) instead of O(n^2).' },
  ],

  'lazy-deletion': [
    { q: 'The heap is growing to O(E) and I am worried about memory.',
      problem: 'Dijkstra on a graph with 10^6 edges. The heap accumulates obsolete entries rather than removing them, so it can hold up to E items instead of V.',
      example: `E = 10^6  ->  up to a million pairs of numbers

log E vs log V is at most a factor of 2.`,
      reduces: 'nothing, usually — accept it. An indexed heap with decrease-key keeps it at V, at the cost of more state to get wrong.',
      base: 'The template pushes an updated entry and abandons the old one.',
      change: 'Usually accept it — E entries of two numbers is cheap. If it truly matters, use an indexed heap with decrease-key.',
      code: `# stale entries are discarded on pop, not on push
if d > dist[u]:
    continue`,
      why: 'log E and log V differ by a constant factor, so the simpler code almost always wins. Knowing decrease-key exists is enough.' },

    { q: 'How do I know a popped entry is stale?',
      problem: 'The staleness check is `if d > dist[u]: continue`. For that to work, dist must already hold the better value when the worse entry pops.',
      example: `wrong: write dist[v] only when v POPS
       -> both entries look current

right: write dist[v] when you PUSH
       -> the later pop compares against the best`,
      reduces: 'nothing — the check is already in the template. What matters is that the recording happens at push time, on the adjacent line.',
      base: 'The template compares the popped distance against the recorded one.',
      change: 'Nothing — but the recorded value must be updated at PUSH time, not at pop, or the check has nothing to compare against.',
      code: `dist[v] = nd                  # record when you push
heapq.heappush(h, (nd, v))`,
      why: 'If you only write dist on pop, every duplicate entry looks current and the algorithm degrades to exponential re-expansion.' },
  ],
};
