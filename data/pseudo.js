/* Pseudocode, batch A: the 22 patterns.
 *
 * The framework in words, so the logic can be read before the syntax. Control
 * words in CAPS, everything else plain English, no language at all. The point
 * is that you can read one of these aloud and it still makes sense.
 *
 * Deliberately NOT a transliteration of the Python. Where the code has an
 * idiom, this has the intent -- "record the answer while the window is valid"
 * rather than "best = max(best, right - left + 1)".
 *
 * Keyed by page id, shown above the real code with a toggle in the header.
 */
window.PSEUDO = {

  'hash-count': `SET UP
    seen = empty map          (value -> what you need to remember)

FOR each element x
    IF the thing you need is already in seen
        you are done -- use it
    put x into seen

ANSWER  whatever seen let you find

WHY IT WORKS
    the inner loop of the brute force asked "does X exist?"
    a map answers that in one step instead of a scan`,

  'two-pointers': `SET UP  (input must be sorted)
    lo = first index
    hi = last index

WHILE lo is still left of hi
    look at the pair (lo, hi)
    IF it is the answer          -> done
    IF it is too small           -> lo = lo + 1
    IF it is too big             -> hi = hi - 1

ANSWER  the pair, or none found

WHY IT WORKS
    when you move a pointer inward, everything it skipped
    can never be part of an answer -- so neither pointer
    ever needs to go back`,

  'window': `SET UP
    left = 0
    best = nothing yet
    window = empty

REPEAT, moving right one step at a time
    add the new element to the window

    WHILE the window is INVALID
        remove the leftmost element
        left = left + 1

    the window is now valid -- record it if it beats best

ANSWER  best

WHY IT WORKS
    every index is added once and removed once,
    so the whole scan is linear however much the window moves

NOTE
    for SHORTEST, record inside the shrink loop instead --
    the moment before the window stops being valid`,

  'binary-index': `SET UP
    lo = 0
    hi = one PAST the last index

WHILE lo is still below hi
    mid = halfway between them
    IF mid satisfies the test
        hi = mid              (mid might be the answer -- keep it)
    ELSE
        lo = mid + 1          (mid is definitely not)

ANSWER  lo

WHY IT WORKS
    the test must be false...false, true...true across the range
    each step throws away half of what is left`,

  'binary-answer': `SET UP
    define CAN(x) = "is x good enough?"
    lo = smallest x worth trying
    hi = an x that definitely works

WHILE lo is still below hi
    mid = halfway between them
    IF CAN(mid)               -> hi = mid
    ELSE                      -> lo = mid + 1

ANSWER  lo

WHY IT WORKS
    you are searching the ANSWER, not the input
    CAN must be monotonic: if x works, everything bigger works
    say that out loud before coding -- without it this is invalid`,

  'tree-dfs': `FOR each node, recursively

    IF the node is empty
        return the "nothing here" value

    ask the left child for its answer
    ask the right child for its answer

    combine them into THIS node's answer
    return it to the parent

ANSWER  what the root returned

WHY IT WORKS
    each node is visited once and trusts its children

TWO SHAPES
    information from BELOW -> return it upward
    a constraint from ABOVE -> pass it down as an argument
    and sometimes you return one thing while RECORDING another`,

  'tree-bfs': `SET UP
    queue = the starting node (or ALL starting nodes)
    mark them seen as you put them in
    steps = 0

WHILE the queue is not empty
    note how many are in the queue right now -- that is one level

    REPEAT that many times
        take one out
        IF it is the goal        -> answer is steps
        FOR each unseen neighbour
            mark it seen
            put it in the queue

    steps = steps + 1

ANSWER  steps, or unreachable

WHY IT WORKS
    the first time you reach something is by the fewest steps
    mark seen when you PUT IN, not when you take out`,

  'graph-dfs': `SET UP
    seen = empty
    groups = 0

FOR each node in the graph
    IF it has been seen already   -> skip it
    groups = groups + 1
    flood outward from it, marking everything reachable as seen

ANSWER  groups

TO FLOOD
    put the node on a stack
    WHILE the stack is not empty
        take one off
        mark it seen
        push its unseen neighbours

WHY IT WORKS
    each flood claims one whole connected group,
    so the outer loop starts a flood once per group`,

  'topo': `SET UP
    count how many prerequisites each node has
    queue = every node with a count of zero
    order = empty

WHILE the queue is not empty
    take one out and add it to order
    FOR each node depending on it
        reduce that node's count by one
        IF the count reaches zero -> put it in the queue

IF order holds every node    -> ANSWER order
ELSE                         -> there is a CYCLE

WHY IT WORKS
    nothing is emitted before its prerequisites
    the count check IS the cycle detector -- do not add a second one`,

  'sweep': `SET UP
    turn each object into two EVENTS
        (start time, +1)  and  (end time, -1)
    sort all events by time

REPLAY time in order
    running = running + the event's value
    best = max(best, running)

ANSWER  best

WHY IT WORKS
    two-dimensional overlap becomes a one-dimensional counter

ASK FIRST
    at the same timestamp, does an end come before a start?
    that decision changes the answer for touching intervals`,

  'heap-topk': `SET UP
    heap = empty        (a MIN-heap, even for k largest)

FOR each element x
    put x in the heap
    IF the heap now holds more than k
        throw away the smallest (which is on top)

ANSWER  the heap holds the k largest; its top is the kth

WHY IT WORKS
    the weakest of your current best sits on top,
    so each new element is ONE comparison away from a decision
    the heap never grows past k, so each step costs log k`,

  'memo': `SET UP
    cache = empty

DEFINE solve(state)
    IF the answer for state is in the cache   -> return it
    IF state is a base case                   -> return its known answer

    try every choice available from state
    combine the results of solve(smaller state)
    put the answer in the cache
    return it

ANSWER  solve(starting state)

WHY IT WORKS
    the same state is reached by many routes; the cache pays once

THE HARD PART
    the state must capture EVERYTHING the answer depends on
    a missing dimension fails silently`,

  'backtracking': `DEFINE explore(position)
    record the current path as one result

    FOR each choice from position
        CHOOSE it       -> add to the path
        explore(next position)
        UN-CHOOSE it    -> remove it from the path

ANSWER  every recorded path

WHY IT WORKS
    the un-choose is what makes the state clean for the next branch
    record a COPY of the path -- otherwise every result is the same list

NOTE
    exponential by nature; that is expected when the output is too`,

  'deque-mono': `SET UP
    stack = empty      (holds INDICES, kept in order by value)

FOR each index i
    WHILE the stack is not empty AND the top loses to xs[i]
        pop it -- and THAT is where you compute its answer
    push i

WHATEVER IS LEFT on the stack has no answer
    (or: append a sentinel so it flushes through the same path)

WHY IT WORKS
    each index is pushed once and popped once, so it is linear
    even though there is a loop inside a loop`,

  'union-find': `SET UP
    every node is its own group leader

TO FIND a node's leader
    follow the chain of leaders to the top
    point everything you passed straight at the top (flattening)

TO UNION two nodes
    find both leaders
    IF they are the same    -> already joined, this edge makes a CYCLE
    ELSE                    -> hang the smaller group under the larger

ANSWER  count the nodes that are their own leader

WHY IT WORKS
    two nodes are connected exactly when they share a leader
    always compare LEADERS, never the nodes you were handed`,

  'prefix': `TO BUILD  (once)
    running = 0
    FOR each index i
        running = running + xs[i]
        pre[i + 1] = running

TO QUERY  a range l..r
    ANSWER  pre[r + 1] - pre[l]

WHY IT WORKS
    everything before l appears in both totals and cancels out

MIRROR IMAGE  (many updates, one read)
    to add v across l..r:  diff[l] = diff[l] + v,  diff[r+1] = diff[r+1] - v
    then ONE running-total pass turns diff into the real array`,

  'trie': `TO INSERT a word
    start at the root
    FOR each character
        IF there is no child for it -> make one
        step into that child
    mark this node as END OF WORD

TO SEARCH a word
    walk the same way
    IF a character has no child     -> not present
    at the end: exact match needs the END mark
                prefix match just needs to have arrived

WHY IT WORKS
    a shared prefix is stored once
    cost is the length of the word, not the size of the dictionary`,

  'fast-slow': `SET UP
    slow = start
    fast = start

WHILE fast can still take two steps
    slow moves ONE
    fast moves TWO
    IF they are now at the same place  -> there is a CYCLE

IF fast ran off the end                -> there is NO cycle

WHY IT WORKS
    inside a cycle the gap between them closes by one each step,
    so it must reach zero -- it cannot be stepped over

TO FIND THE ENTRANCE
    put slow back at the start, then move BOTH one step at a time
    they meet at the cycle entrance`,

  'greedy': `SET UP
    sort the items by the RIGHT key
        (choosing that key is the actual problem)

FOR each item in that order
    IF it is compatible with what you have kept
        keep it, and update what "compatible" now means

ANSWER  what you kept

WHY IT WORKS  (say this out loud)
    the exchange argument: swapping your greedy choice into any
    optimal solution leaves it just as good and just as large,
    so the greedy choice never costs you the optimum

BEFORE COMMITTING
    try to break it with a small counterexample -- if it breaks, use DP`,

  'kway': `SET UP
    heap = the FIRST element of every list
        each entry tagged with which list it came from

WHILE the heap is not empty
    take the smallest out and append it to the output
    IF that list has a next element
        put the next one in the heap

ANSWER  the output

WHY IT WORKS
    the overall smallest must be at the head of SOME list,
    so k candidates are all you ever need in play

NOTE
    tag the entries -- otherwise the heap compares the payloads`,

  'dijkstra': `SET UP
    distance to every node = infinity, except the start = 0
    heap = (0, start)

WHILE the heap is not empty
    take out the CHEAPEST entry (d, u)
    IF d is worse than the recorded distance to u  -> skip, it is stale
    IF u is the goal                               -> answer is d

    FOR each neighbour v with edge cost w
        IF d + w beats the recorded distance to v
            record it AND put (d + w, v) in the heap

ANSWER  the recorded distances

WHY IT WORKS
    the cheapest unsettled node cannot be improved by any other route
    -- but ONLY because no edge is negative`,

  'quickselect': `SET UP
    lo = 0,  hi = last index

REPEAT
    pick a RANDOM pivot in lo..hi
    partition: smaller than pivot to the left, larger to the right
    the pivot is now at its final sorted position p

    IF p is the index you want   -> ANSWER xs[p]
    IF p is below it             -> lo = p + 1
    IF p is above it             -> hi = p - 1

WHY IT WORKS
    only ONE side can contain the answer, so the other is discarded
    the work halves each round: n + n/2 + n/4 ... = 2n

NOTE
    random pivot, or a sorted input makes it quadratic`,
};
