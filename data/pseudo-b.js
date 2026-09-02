/* Pseudocode, batch B: the 25 techniques.
 *
 * Same rules as batch A. Control words in CAPS, plain English, no language,
 * and a WHY IT WORKS block -- because on a technique page the "why" is usually
 * the whole reason the trick is legal.
 *
 * Merged into the object batch A created, so the file order in index.html and
 * in tools/data-files.mjs matters: pseudo.js declares, this one adds.
 */
Object.assign(window.PSEUDO, {

  'sorting': `THE DECISION, not the algorithm

ASK  what invariant would make this problem easy?
     "the biggest is at the end"      -> sort by value
     "overlaps are adjacent"          -> sort by start time
     "cheapest choice comes first"    -> sort by cost

SORT by that key
     for two keys, put them in a pair -- the first is compared first
     to sort one field DOWNWARD, negate it

THEN  the single pass that the sort just made possible

WHY IT WORKS
    sorting costs n log n, which is usually free next to an n^2 scan
    you are buying an ORDER GUARANTEE that the pass can then rely on

STABILITY
    equal elements keep the order they were already in,
    so you can sort by the LESS important key first
    and by the more important key second

BEFORE YOU SORT
    check that order is not itself the answer -- if the input's
    existing order carries meaning, sorting destroys the problem`,

  'counting-sort': `SET UP
    one bucket for every possible value (or every possible count)

FOR each item
    drop it into the bucket for its value

THEN read the buckets in order
    empty each one into the output

ANSWER  the output

WHY IT WORKS
    no comparison ever happens, so the n log n lower bound does not apply
    cost is n to place plus k to read the buckets

ONLY WHEN
    the range of values k is small and known
    if k is huge, this is worse than sorting -- k empty buckets

THE TOP-K USE
    a count cannot exceed n, so bucket BY COUNT, walk from high to low,
    and stop once you have k -- linear where a heap would be n log k`,

  'coordinate-compression': `SET UP
    collect every value that appears anywhere in the input
    remove duplicates and sort them
    rank = a map from value -> its position in that sorted list

REPLACE every value in the problem with its rank

SOLVE the problem on the ranks instead

IF the answer is a value, map the rank back at the end

WHY IT WORKS
    only the ORDER of the values matters to the algorithm,
    never the values themselves -- so any order-preserving
    relabelling gives the same answer

WHAT IT BUYS
    an array of size "number of distinct values" instead of
    "size of the value range" -- 200 slots instead of a billion`,

  'recursion': `WRITE THREE THINGS, in this order

1  THE CONTRACT
       "given this input, I return exactly ___"
       write it down before any code -- everything else depends on it

2  THE BASE CASE
       the smallest input where the answer needs no recursion
       return the "nothing here" value for your contract

3  THE RECURSIVE STEP
       ask the smaller inputs for THEIR answers
       combine those answers into this one
       return it

WHY IT WORKS
    you never trace the whole tree in your head
    you only check: base case correct, and combine correct
    if both hold, every size follows by induction

PROGRESS
    each call must be on a STRICTLY smaller input,
    or it never reaches the base case`,

  'divide-conquer': `DEFINE solve(range)

    IF the range is one element or empty
        it is already solved -- return it

    split the range in half
    left  = solve(the left half)
    right = solve(the right half)

    COMBINE left and right into the answer for the whole range
    return it

ANSWER  solve(the whole input)

WHY IT WORKS
    the depth is log n halvings
    each level does the combine work across all n elements
    so the cost is (cost of combining) x log n

THE COMBINE IS THE PROBLEM
    merge sort's combine is a linear merge -> n log n
    the split is trivial; whatever cleverness exists lives in the combine`,

  'meet-in-middle': `SET UP
    cut the input into two halves

FOR the FIRST half
    enumerate every possibility -- there are 2^(n/2) of them
    keep them in a list

FOR the SECOND half
    enumerate every possibility
    sort them so they can be searched

FOR each possibility a from the first half
    binary search the second half for the best partner for a
    record the best combination

ANSWER  the best combination found

WHY IT WORKS
    2^40 is impossible, but 2^20 twice is a million each --
    and pairing them up is a search, not another enumeration

ONLY WHEN
    the two halves are INDEPENDENT and combine by a simple rule
    (a sum, a total weight) that a search can match on`,

  'kadane': `SET UP
    best = the first element
    cur  = the first element        (best subarray ENDING here)

FOR each remaining element x
    cur = the better of
              starting fresh at x
              extending the previous run:  cur + x
    best = the better of best and cur

ANSWER  best

WHY IT WORKS
    every subarray ends somewhere, so if you know the best one
    ending at each index, the overall best is among them

    and the best run ending at x either includes the run before it
    or it does not -- there is no third option

WHY START AT THE FIRST ELEMENT, not at zero
    starting from 0 would let the answer be an EMPTY subarray,
    which is wrong when every number is negative`,

  'index-as-storage': `THE IDEA
    the array you were given is n slots of scratch space --
    use position i to store the fact "value i+1 was seen"

MARKING BY SIGN
    FOR each value x
        i = the slot that x points at, which is |x| - 1
        IF that slot is still positive
            negate it -- the mark means "seen"
    THEN every slot still positive names a MISSING value

PUTTING VALUES HOME (cyclic sort)
    i = 0
    WHILE i is inside the array
        j = where xs[i] belongs
        IF xs[i] is not already home AND j is a real slot
            swap it into place -- do NOT advance i,
            because a new value just arrived at i
        ELSE
            i = i + 1

WHY IT WORKS
    each swap puts at least one value permanently home,
    so there are at most n swaps -- linear despite the inner loop

READ THE CONSTRAINTS FIRST
    this only applies when values are 1..n, and it MUTATES the input --
    say that out loud, and ask whether you are allowed to`,

  'sentinel': `THE MOVE
    find the special case
    add a fake element that makes it stop being special

FOR A LINKED LIST
    put a dummy node in front of the head
    now EVERY real node has a predecessor,
    so "remove the first node" is the same code as "remove any node"
    return dummy.next at the end -- never head, which may be gone

FOR A MONOTONIC STACK
    append a value that beats everything (0, or infinity)
    now the leftovers flush through the SAME popping path
    instead of needing a second cleanup loop

WHY IT WORKS
    the branch does not disappear, it moves out of the loop
    and into one line of setup -- one place to be right,
    instead of a condition tested on every iteration

COST
    remember to ignore or strip the sentinel from the answer`,

  'expand-centre': `FOR each possible CENTRE
    (every index, and every gap between two indices)

    l = the centre's left,  r = the centre's right
    WHILE both are inside the string AND the characters match
        l = l - 1
        r = r + 1

    the stretch between them is a palindrome -- keep it if it is longest

ANSWER  the longest kept

WHY IT WORKS
    every palindrome has exactly one centre,
    so trying every centre tries every palindrome

WHY TWO KINDS OF CENTRE
    odd lengths have a middle CHARACTER  ("aba")
    even lengths have a middle GAP       ("abba")
    miss the gap and every even palindrome disappears

COST
    n centres x up to n growth = O(n^2), with O(1) space`,

  'bit-tricks': `EXCLUSIVE OR CANCELS PAIRS
    running = 0
    FOR each x
        running = running XOR x
    ANSWER  running

    everything that appeared twice cancelled to zero,
    so what survives is the value that appeared once

THE FOUR WORTH MEMORISING
    clear the lowest set bit        x AND (x - 1)
    isolate the lowest set bit      x AND (minus x)
    halve                           shift right by 1
    double                          shift left by 1

TEST BIT i        x AND (1 shifted left i)  is non-zero
SET  BIT i        x OR  (1 shifted left i)

WHY IT WORKS
    XOR is its own inverse: doing it twice with the same value
    returns you exactly where you started, and the order does not matter

DO NOT overreach -- a handful of tricks is the whole useful set`,

  'bitmask-enum': `SET UP
    n = the number of items

FOR every number mask from 0 up to (2^n minus 1)
    subset = empty
    FOR each position i from 0 to n-1
        IF bit i of mask is set
            add item i to subset
    do whatever the problem asks with subset

WHY IT WORKS
    a subset is a yes/no choice per item, and so is a binary number --
    the integers 0..2^n-1 ARE the subsets, counted exactly once each

USEFUL COUNTS
    number of set bits   = the size of the subset
    mask = 2^n - 1       = every item chosen

ONLY WHEN n IS SMALL
    n up to about 20 is fine, 25 is the edge, 30 is hopeless`,

  'bitmask-dp': `THE STATE
    mask = which items have been used already (one bit each)
    pos  = where you currently are

DEFINE best(mask, pos)
    IF every bit in mask is set
        nothing left to do -- return 0 (or the cost of going home)

    IF this state is cached  -> return the cached answer

    answer = the cheapest of, over every UNUSED item j
                 cost of going from pos to j
               + best(mask with j now set, j)

    cache it and return it

ANSWER  best(nothing used, the start)

WHY IT WORKS
    the future depends only on WHICH items remain, never on the
    order you used the earlier ones -- so all those orders share one state

COST
    2^n masks x n positions x n choices
    workable to about n = 20, and that is the whole point:
    it turns n! into 2^n`,

  'tabulation': `INSTEAD OF recursing down, FILL UP

SET UP
    a table with one slot per state
    fill in the base cases by hand

FOR each state, in an order where its dependencies are ALREADY filled
    apply the same recurrence the recursion used
    write the result into the table

ANSWER  the slot for the state you actually asked about

THEN SQUEEZE THE SPACE
    look at which slots the recurrence actually reads
    if it only ever reads the PREVIOUS row,
    keep two rows and overwrite -- the rest was never needed

WHY IT WORKS
    it is the same recurrence; only the direction of travel changed
    no recursion means no stack depth limit

THE HARD PART
    the fill order. get it wrong and you read a slot
    that is still holding its initial value, silently`,

  'knapsack': `SET UP
    dp[c] = the best value achievable with capacity exactly c
    all zeroes to start

FOR each item, with weight w and value v
    FOR each capacity c that can fit the item

        dp[c] = the better of
                    not taking the item:  dp[c] unchanged
                    taking it:            dp[c - w] + v

ANSWER  dp[capacity]

THE DIRECTION IS THE WHOLE TRICK
    0/1 -- each item ONCE:      walk capacity DOWNWARD
        so dp[c - w] still describes a world without this item

    UNBOUNDED -- reuse allowed:  walk capacity UPWARD
        so dp[c - w] may already include this item, deliberately

WHY IT WORKS
    every item is either in or out; that binary choice is the recurrence
    and dp[c - w] is exactly "the best I could do with the room left over"

RECOGNISE IT
    "pick a subset under a limit" -- coin change, partition into equal
    halves, target sum. all of them are wearing this template`,

  'interval-dp': `THE STATE
    dp[i][j] = the best answer for the range i..j

SET UP
    every single element is a solved range of length 1

FOR each length, from SHORT to LONG
    FOR each start i, with j = the matching end

        dp[i][j] = the best over every split point k inside the range
                       dp[i][k]  +  dp[k+1][j]  +  the cost of joining them

ANSWER  dp[first][last]

WHY IT WORKS
    the last operation on a range splits it in two somewhere,
    and both halves are strictly SHORTER -- already computed

WHY SHORT LENGTHS FIRST
    that is the only order in which both halves are ready
    looping i and j directly reads unfilled slots

COST
    n^2 ranges x n split points = O(n^3), fine to a few hundred`,

  'lis-patience': `SET UP
    tails = empty
        tails[i] will hold the SMALLEST possible ending value
        for an increasing subsequence of length i+1

FOR each element x
    find the first entry in tails that is NOT smaller than x
        (binary search -- tails is always sorted)

    IF there is none
        x extends the longest run so far -- append it
    ELSE
        overwrite that entry with x -- same length, better ending

ANSWER  how many entries tails holds

WHY IT WORKS
    a smaller ending value can never hurt: anything that could follow
    the old ending can also follow a smaller one
    the length only grows on an append, so the count is the LIS length

CAREFUL
    tails is NOT the subsequence, only its length is meaningful --
    reconstructing the actual sequence needs a parent array

STRICT vs NON-STRICT
    "not smaller" gives strictly increasing;
    "strictly greater" allows equal values`,

  'zero-one-bfs': `SET UP
    distance to every node = infinity, except the start = 0
    a DOUBLE-ENDED queue holding just the start

WHILE the queue is not empty
    take a node u off the FRONT

    FOR each neighbour v, along an edge of cost 0 or 1
        IF going through u beats v's recorded distance
            record the better distance
            IF the edge cost 0   -> put v on the FRONT
            IF the edge cost 1   -> put v on the BACK

ANSWER  the recorded distances

WHY IT WORKS
    a free edge does not change the distance, so v belongs with the
    nodes being processed right now -- at the front

    a cost-1 edge puts v exactly one further out, which is where
    the back of the queue already is

    so the queue stays sorted by distance without any heap at all

WHAT IT BUYS
    Dijkstra's answer at BFS's price: no log factor`,

  'bellman-ford': `SET UP
    distance to every node = infinity, except the source = 0

REPEAT (number of nodes minus 1) times
    FOR every edge u -> v with weight w
        IF u is reachable AND distance[u] + w beats distance[v]
            record the better distance

ONE MORE ROUND, as a test
    IF anything still improves
        there is a NEGATIVE CYCLE -- no shortest path exists

ANSWER  the recorded distances

WHY IT WORKS
    after round k, every shortest path using at most k edges is correct
    no simple path uses more than (nodes - 1) edges, so that many rounds
    settle every real path

    and if a path can still improve after that, it must be revisiting
    a node -- going round a loop that makes things cheaper forever

WHY NOT ALWAYS USE IT
    it costs nodes x edges. Dijkstra is far faster,
    but Dijkstra is simply WRONG with a negative edge`,

  'mst': `SET UP
    sort every edge by weight, cheapest first
    every node starts in its own group

FOR each edge in that order
    IF its two ends are in DIFFERENT groups
        keep the edge, and merge the two groups
    ELSE
        skip it -- it would close a cycle

ANSWER  the kept edges, and their total weight

WHY IT WORKS
    the cut property: for any way of splitting the nodes in two,
    the cheapest edge crossing that split is safe to take
    taking edges cheapest-first only ever exercises that guarantee

CYCLES
    an edge inside one group adds no connectivity, only weight

STOP EARLY
    once you have kept (nodes - 1) edges, everything is connected`,

  'floyd-warshall': `SET UP
    d[i][j] = the direct edge cost from i to j
              (0 to itself, infinity where there is no edge)

FOR each node k                 -- the node allowed as a STOPOVER
    FOR each start i
        FOR each end j
            d[i][j] = the cheaper of
                          going directly as known so far
                          going i -> k -> j

ANSWER  the whole d table -- every pair at once

WHY IT WORKS
    after the k loop has passed value K, d[i][j] is the best route
    using only nodes up to K as stopovers
    when k has run through everything, every route is allowed

WHY k MUST BE OUTERMOST
    that ordering is the induction. put k inside and you use
    stopover information that has not been computed yet

COST
    n^3, so n in the low hundreds -- but it is four lines`,

  'cycle-directed': `THREE STATES per node
    UNSEEN        not visited yet
    IN PROGRESS   on the current path, still exploring below it
    DONE          fully explored, nothing left below it

DEFINE explore(u)
    mark u IN PROGRESS

    FOR each neighbour v
        IF v is IN PROGRESS   -> a CYCLE: you looped back onto your path
        IF v is UNSEEN and explore(v) found a cycle -> a cycle

    mark u DONE
    return no cycle

RUN explore on every UNSEEN node

WHY THREE STATES, not two
    "already visited" is not enough in a directed graph --
    reaching a DONE node means two separate paths converged,
    which is perfectly legal
    only reaching a node still ON YOUR PATH is a cycle

NOTE
    an UNDIRECTED graph needs a different test:
    any edge to a visited node that is not your parent`,

  'lru-cache': `THE TWO REQUIREMENTS
    find any key instantly
    know which key was used longest ago

SET UP
    an ordered collection of key -> value,
    kept in order of LAST USE, oldest first

TO GET a key
    IF it is absent  -> report a miss
    move it to the most-recent end
    return its value

TO PUT a key
    IF it already exists, move it to the most-recent end
    store the value
    IF the collection is now over capacity
        drop the entry at the OLDEST end

WHY IT WORKS
    a hash map gives the instant lookup but has no order
    a linked list gives the order but no lookup
    combine them and each operation is O(1)

IN AN INTERVIEW
    say you would use a hash map plus a doubly linked list,
    then ask whether the library's ordered dictionary is acceptable`,

  'rolling-hash': `SET UP  (window size k)
    hash the FIRST window the slow way, one character at a time
        h = h x BASE + this character

TO SLIDE one step
    remove the outgoing character
        subtract (its value x BASE to the power k-1)
    shift everything up
        multiply by BASE
    add the incoming character

    take a remainder by a large prime at every step

WHY IT WORKS
    the hash is just the window read as a number in base BASE,
    so dropping the leading digit and appending a new one
    is arithmetic, not a rescan -- O(1) per window instead of O(k)

COLLISIONS
    equal hashes are a CANDIDATE, not a match --
    say out loud that you would compare the strings to confirm`,

  'lazy-deletion': `THE PROBLEM
    a heap cannot remove something from its middle

SO DO NOT REMOVE ANYTHING
    when a value becomes obsolete, leave it in the heap
    push the new, better entry alongside it

ON THE WAY OUT
    take the top entry
    IF it disagrees with the truth you have recorded elsewhere
        it is STALE -- discard it and take the next one
    otherwise use it

WHY IT WORKS
    a stale entry is always WORSE than the fresh one for the same key,
    so it sits deeper in the heap and is popped later --
    by which time the recorded truth already reveals it as stale

    each push is popped at most once, so the total work is bounded
    by the number of pushes

WHERE YOU HAVE SEEN IT
    that "if d is worse than the recorded distance, skip" line
    at the top of Dijkstra's loop IS this technique`,
});
