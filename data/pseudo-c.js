/* Pseudocode, batch C: deviations on patterns 1-11.
 *
 * Keyed "pageId/index", the same convention the animations use.
 *
 * A deviation's code is a DIFF, so its plain-English version is a DELTA too:
 * what the template already does, and the part that moves. Restating the whole
 * framework here would bury the one thing that changed, which is the only thing
 * worth reading twice.
 *
 * Three shapes, and which one applies is itself information:
 *   SAME AS THE TEMPLATE, except ...   a real deviation
 *   RUN THE TEMPLATE TWICE ...          the variant reduces to two easy calls
 *   NOT THIS PATTERN ...                the precondition is absent -- say so
 */
Object.assign(window.PSEUDO, {

  'hash-count/0': `SAME AS THE TEMPLATE, except
    the key is DERIVED, not the value itself

FOR each word
    key = the word's letters in sorted order
    add the word to the group under that key

ANSWER  every group

WHY
    two words are anagrams exactly when they hold the same letters,
    and sorting is the cheapest way to write that down identically
    -- so equivalent-but-different things collide ON PURPOSE`,

  'hash-count/1': `SAME AS THE TEMPLATE, except
    the map stores COUNTS, keyed on a RUNNING TOTAL

SET UP
    counts = a map from running-total -> how many times it occurred
    counts[0] = 1               <- the empty prefix, seen once already
    running = 0
    answer = 0

FOR each element x
    running = running + x

    needed = running - k
    answer = answer + however many earlier prefixes equalled needed

    record this running total: counts[running] = counts[running] + 1

ANSWER  answer

WHY
    a stretch ending here sums to k exactly when some earlier
    running total equals (running - k), so counting those earlier
    totals counts the stretches

    the counts[0] = 1 seed is what lets a stretch that starts at
    the very beginning be counted at all -- without it, missed`,

  'hash-count/2': `SAME AS THE TEMPLATE, except
    the map cannot answer the question on its own

COUNT with the map, as usual

THEN GET THE ORDER FROM SOMEWHERE ELSE
    k is small          -> a heap of size k
    k is near n         -> just sort the counts
    counts are bounded  -> buckets, which is linear

ANSWER  the top k from whichever you chose

WHY
    a hash map has no order, and no amount of arranging will give it one
    do not fight that -- count in the map, order elsewhere`,

  'hash-count/3': `SAME AS THE TEMPLATE, except
    the container changes, not the method

SET UP
    counts = 26 slots, all zero      (one per lowercase letter)

FOR each character
    counts[position of the letter in the alphabet] += 1

ANSWER  compare the two count lists directly

WHY
    nothing is hashed any more, and the slots sit next to each
    other in memory
    two fixed-size lists also compare in one step,
    which turns "are these anagrams" into a single equality`,

  'two-pointers/0': `SAME AS THE TEMPLATE, except
    the pair search runs once per FIXED first element,
    and duplicates must be suppressed

SORT the input

FOR each index i as the fixed first element
    SKIP i if it holds the same value as the previous i
        (every triplet starting with this value is already recorded)

    run the ordinary two-pointer pair search over everything after i,
    looking for a pair that completes the total

    ON A MATCH
        record the triplet
        move BOTH pointers inward
        SKIP FORWARD while the left pointer keeps landing
        on the value just used

ANSWER  every recorded triplet

WHY
    two skips, because one value can repeat in TWO roles:
    as the fixed element, and as the middle one after a match
    doing only the outer skip still emits repeated triplets --
    that is the usual failure here`,

  'two-pointers/1': `SAME AS THE TEMPLATE, except
    the rule for WHICH pointer moves

    template  -> move whichever side brings the SUM nearer the target
    here      -> move whichever side LIMITS the result: the shorter line

WHY
    the width shrinks whichever pointer you move, so the only
    possible improvement is a taller limiting side

    moving the TALLER line can never help -- the short one still
    caps the height, and the width just got smaller

    being able to say that sentence IS the answer to this question`,

  'two-pointers/2': `NOT THIS PATTERN

    two pointers converge because sortedness makes one direction
    safe to throw away -- and here ORDER IS THE PROBLEM, not an aid

INSTEAD, one forward pass carrying the best so far
    lowest = the first price
    best = 0

    FOR each later price
        selling today earns  price - lowest
        keep it if it beats best
        IF price is below lowest, lowest = price

ANSWER  best

THE TELL
    reordering the input changes the answer
    whenever that is true, NO sort-based pattern can be correct --
    and noticing it is worth as much as applying a pattern`,

  'two-pointers/3': `SAME AS THE TEMPLATE, except
    the geometry: one pointer per array, BOTH moving forward

SET UP
    i = start of the first list,  j = start of the second

WHILE both lists still have elements
    append whichever front element is smaller
    advance only THAT pointer

THEN flush whichever list still has elements left

ANSWER  the output

WHY
    the smallest element not yet taken must be at the front of one
    list or the other, so only two candidates ever need comparing

WORTH HAVING COLD
    this is the merge step inside merge sort and k-way merge`,

  'window/0': `SAME AS THE TEMPLATE, except
    WHERE THE ANSWER IS RECORDED

    template  -> record AFTER the window has been made valid again
                 (the biggest valid window: LONGEST)
    here      -> record INSIDE the shrink loop, while still valid
                 (the smallest valid window: SHORTEST)

    WHILE the window is VALID
        record it if it is shorter than best     <- moved to here
        remove the leftmost element
        left = left + 1

WHY
    for LONGEST you want the moment before shrinking becomes necessary
    for SHORTEST you want the moment before validity is lost

    same loop, opposite instant -- and getting this backwards is
    the single most common window failure`,

  'window/1': `SAME AS THE TEMPLATE, except
    the definition of INVALID

    template  -> invalid when one character repeats
    here      -> invalid when there are TOO MANY DISTINCT characters

    WHILE the window holds more than K distinct
        remove the leftmost element
        IF its count has reached zero
            DELETE the key outright        <- not merely zero
        left = left + 1

WHY
    a key left sitting at zero still counts towards "how many
    distinct", so the window silently allows K+1 of them

    the deletion is the entire fix`,

  'window/2': `RUN THE TEMPLATE TWICE, and subtract

    exactly K  =  (at most K)  minus  (at most K-1)

    write ONE at-most-K window, call it twice

WHY
    a window is naturally monotonic in "at most" -- it shrinks until
    the count is legal -- and has no way at all to be told it is TOO SMALL

    so do not write a new loop. this subtraction turns a hard
    variant into two calls of an easy one, and is worth memorising outright`,

  'window/3': `SAME AS THE TEMPLATE, except
    the maintained quantity cannot be updated by arithmetic

    template  -> maintains a SUM: add one, remove one, done
    here      -> a MAXIMUM, which does not work that way

REPLACE the counter with a queue of INDICES, biggest at the front

FOR each index i
    WHILE the back of the queue holds a value that loses to xs[i]
        drop it -- smaller AND older can never win again
    add i to the back

    IF the front index has fallen out of the window
        drop it -- expired by POSITION, not by value

    the front is the maximum of the current window

WHY
    removing an element from a sum is arithmetic
    removing the maximum leaves you with no idea what the new maximum is

    the queue keeps exactly the candidates that could still become
    the max, already in order`,

  'window/4': `NOT THIS PATTERN

    a window rests on CONTIGUITY -- that is what makes
    "leaving the window" a meaningful event at all
    and here the elements need not be adjacent

INSTEAD, go to DP
    state = the best answer considering the first i elements
    at each element, the choice is TAKE IT or SKIP IT, independently

THE TELL
    the word "contiguous" is what licenses the whole pattern
    "subsequence" removes it, and no amount of window bookkeeping
    puts it back`,

  'binary-index/0': `SAME AS THE TEMPLATE, except
    one extra comparison to find out which half you can trust

WHILE the range is not empty
    mid = halfway

    IF the LEFT half is sorted        (first value <= mid value)
        IF the target lies inside that sorted range
            keep the left half
        ELSE
            keep the right half
    ELSE the RIGHT half is sorted
        the same test, mirrored

WHY
    a rotated sorted array is always TWO sorted runs,
    so at least one side of any midpoint is fully sorted

    that side you can reason about exactly -- the other you simply
    step into, and the same argument applies again`,

  'binary-index/1': `RUN THE TEMPLATE TWICE, and subtract

    first = the boundary where values become >= target
    after = the boundary where values become >  target

ANSWER  after - first

WHY
    nothing new is written -- two boundary searches with two
    different tests

    do NOT walk outwards from a hit to count the run: that is O(n)
    when every element is the target. two searches stay logarithmic`,

  'binary-index/2': `SAME AS THE TEMPLATE, except
    the upper bound has to be MANUFACTURED first

FIND A BOUND
    hi = 1
    WHILE the test still fails at hi
        hi = hi x 2
    lo = hi / 2          (the last position known to fail)

THEN run the ordinary search inside lo..hi

WHY
    doubling reaches n in about log n probes, and the search that
    follows costs another log n -- so the total is still logarithmic

    this is the shape for an infinite or unknown-length input`,

  'binary-index/3': `SAME AS THE TEMPLATE, except
    the test compares mid with its NEIGHBOUR, not with a target

WHILE the range is not one element
    mid = halfway
    IF xs[mid] is below xs[mid + 1]
        the ground rises to the right -- keep the right half
    ELSE
        keep the left half, mid included

ANSWER  wherever the range collapsed to

WHY
    binary search needs a monotonic PREDICATE, never a sorted array

    "a peak exists to my right" is monotonic here: walking uphill
    must end at a peak, because the ends are treated as falling away

    noticing that generalises the pattern far beyond sorted input`,

  'binary-answer/0': `SAME AS THE TEMPLATE, except
    you search for the first FAILURE and step back one

    template  -> find the first x where CAN(x) is true   (a minimum)
    here      -> find the first x where CAN(x) is FALSE, then answer x - 1

    the loop body is UNCHANGED -- only which side keeps mid, and the
    subtraction at the end

WHY
    rewriting the loop for maximisation is exactly where off-by-ones
    come from

    reusing the one template you have memorised, and adjusting the
    ANSWER afterwards, is far safer under time pressure`,

  'binary-answer/1': `SAME AS THE TEMPLATE, except
    the termination rule -- floats never reach equality

REPEAT a FIXED number of times (100 halvings is far past any precision asked)
    mid = halfway between lo and hi, as a real number
    IF CAN(mid)   -> hi = mid
    ELSE          -> lo = mid

ANSWER  lo

WHY
    "loop while lo is below hi" can spin forever on floats,
    because halving an interval never makes the ends equal

    a fixed iteration count is also easier to defend out loud
    than an epsilon comparison`,

  'binary-answer/2': `NOT THIS PATTERN

    the whole method rests on CAN being monotonic --
    false, false, ..., true, true

    if CAN(3) is true but CAN(4) is false, then throwing away half
    the range throws away the answer. the search is not slow, it is WRONG

WHAT TO DO
    say that out loud, and go and find another approach

WHY IT MATTERS
    this is the trap inside the pattern, and interviewers plant it
    stating why monotonicity HOLDS, before writing code, is the whole
    difference between using the pattern and pattern-matching`,

  'binary-answer/3': `SAME AS THE TEMPLATE, except
    the bounds are DERIVED rather than handed to you

    lo = the smallest value that could possibly work
         (you cannot ship a package smaller than itself: the largest item)
    hi = a value that OBVIOUSLY works
         (everything at once: the total)

    or: double upward until CAN succeeds, then search inside

WHY
    the search is only well-formed when the bottom end obviously
    fails and the top end obviously works

    say why each end is safe -- that sentence is half the answer`,

  'tree-dfs/0': `SAME AS THE TEMPLATE, except
    a constraint travels DOWN instead of an answer coming UP

DEFINE valid(node, lowest allowed, highest allowed)
    IF the node is empty              -> true, nothing to break
    IF its value is outside the allowed range  -> false

    check the left child, with the ceiling lowered to this value
    check the right child, with the floor raised to this value

    both must hold

WHY
    a node can be bigger than its parent and still break the rule
    against a GRANDPARENT

    comparing only with the parent is the classic wrong answer --
    the narrowing range is what fixes it`,

  'tree-dfs/1': `SAME AS THE TEMPLATE, except
    you RETURN one quantity while RECORDING a different one

SET UP  best = 0, kept outside the recursion

DEFINE height(node)
    ask both children for their heights

    RECORD  left height + right height        <- the answer
    RETURN  1 + the taller of the two         <- the contract

ANSWER  best

WHY
    the longest path THROUGH a node is not the value its parent needs;
    the parent only needs a depth

    recognising when those two quantities differ is the core tree skill,
    and it comes back in maximum path sum and longest same-value path`,

  'tree-dfs/2': `SAME AS THE TEMPLATE, except
    the call stack becomes an EXPLICIT list

SET UP  stack = the root, tagged NOT YET PROCESSED

WHILE the stack is not empty
    take the top entry off

    IF it is tagged PROCESSED
        visit it -- this is the postorder moment
    ELSE
        push it back, now tagged PROCESSED
        push its children, tagged NOT YET

WHY
    a node must be visited AFTER its children, and a plain stack
    cannot express that -- it hands you the node before them

    the tag is the trick: each node passes through the stack twice,
    once to schedule its children and once to be visited`,

  'tree-dfs/3': `SAME AS THE TEMPLATE, except
    add a SEEN SET

DEFINE walk(node)
    IF the node is already seen   -> stop
    mark it seen
    ... otherwise exactly as before

WHY
    tree DFS is graph DFS MINUS the seen set -- a tree just
    guarantees no node is reachable twice, so the set is redundant

    take that guarantee away and a cycle makes the recursion
    run forever

    being asked to relax "it is a tree" is a common follow-up,
    and the fix should be immediate`,
});

/* ---------------------------------------------- patterns 7-11 continued -- */
Object.assign(window.PSEUDO, {

  'tree-bfs/0': `SAME AS THE TEMPLATE, except
    the queue starts with EVERY source, not one

SET UP
    queue = every already-rotten cell, all marked seen
    minutes = 0

then the ordinary level-by-level BFS, unchanged

WHY
    running a separate BFS from each source would cost
    sources x cells

    starting them all together still measures time correctly,
    because everything at level L is exactly L minutes away
    from the NEAREST source -- which is what the question asks`,

  'tree-bfs/1': `SAME AS THE TEMPLATE, except
    you record WHO reached each node first

SET UP  parent = a map, with the start pointing at nothing

WHEN you put a neighbour into the queue
    parent[neighbour] = the node you came from

ONCE THE GOAL IS REACHED
    walk parents backwards from the goal to the start
    reverse what you collected

ANSWER  that path

WHY
    the FIRST arrival at a node is along a shortest route,
    so the first parent recorded is already the right one

    no second search is needed -- only the bookkeeping`,

  'tree-bfs/2': `NOT THIS PATTERN

    BFS orders by NUMBER OF EDGES, and with weights that is no
    longer cost order -- a longer route can be cheaper, so
    first-arrival stops meaning cheapest

INSTEAD, change the frontier
    weights are arbitrary  -> a heap, cheapest first: that is Dijkstra
    weights are only 0 / 1 -> a double-ended queue,
                              free moves to the FRONT, costly to the BACK

WHY THE 0/1 CASE IS WORTH KNOWING
    it keeps BFS's linear cost with no log factor at all`,

  'tree-bfs/3': `SAME AS THE TEMPLATE, except
    the neighbours have to be MADE cheap to find

BEFORE SEARCHING
    FOR each word, and each position in it
        file the word under the word with that position blanked out
        ("hot" files under "*ot", "h*t", "ho*")

DURING THE SEARCH
    the neighbours of a word are everything filed under
    the same blanked-out forms

WHY
    comparing every pair of words is words x words x length

    the buckets make neighbour lookup cost only the length of the word,
    which is the difference between passing and timing out`,

  'graph-dfs/0': `SAME AS THE TEMPLATE, except
    the DIRECTION of the search is reversed

INSTEAD OF asking of each cell "can it reach the ocean?"
    flood INWARD from one ocean's border, marking everything reached
    flood INWARD from the other ocean's border, marking separately

ANSWER  the cells marked BOTH times

WHY
    outward from every cell is cells x cells in the worst case

    reversing it makes two floods over the whole grid, which is
    linear -- and the answer becomes an intersection`,

  'graph-dfs/1': `SAME AS THE TEMPLATE, except
    THREE node states instead of one seen set

    UNSEEN / IN PROGRESS / FINISHED

DURING THE WALK from u
    a neighbour IN PROGRESS  -> you have looped back onto your
                                own path: that is a CYCLE
    a neighbour UNSEEN       -> walk it, and pass the verdict up
    a neighbour FINISHED     -> perfectly fine, ignore it

    mark u FINISHED on the way out

WHY
    one seen set reports a cycle for ANY re-visit, including a
    legitimate diamond where two paths simply converge

    only a node still ON YOUR PATH is a cycle, and the third
    state is what expresses that`,

  'graph-dfs/2': `NOT THIS PATTERN

    a traversal has no memory between queries, so answering m
    of them costs m full walks of the graph

INSTEAD, change the structure
    on each new edge   -> UNION its two ends
    on each query      -> compare the two LEADERS

WHY
    Union-Find merges incrementally and answers in effectively
    constant time, where re-running the walk is linear per query

THE TELL
    "edges arrive one at a time" -- anything incremental
    is asking for Union-Find`,

  'graph-dfs/3': `SAME AS THE TEMPLATE, except
    the stack moves out of the call frames

SET UP  stack = the first cell

WHILE the stack is not empty
    take a cell off
    IF already seen -> skip it
    mark it seen
    push its unseen neighbours

WHY
    one component spanning a million cells recurses a million
    frames deep and crashes -- the recursion limit is about a thousand

    say you noticed BEFORE the interviewer does; that is most of
    what this follow-up is testing`,

  'topo/0': `SAME AS THE TEMPLATE -- it already does this

    the yes/no version builds the order and then throws it away

    RETURN the emitted list
    RETURN nothing at all when the count check fails

WHY
    one piece of machinery answers both questions
    noticing that "can it be done" and "how" are the same algorithm
    is the entire point of the pair`,

  'topo/1': `SAME AS THE TEMPLATE, except
    the queue is drained LEVEL BY LEVEL

WHILE the queue is not empty
    note how many are in it right now -- that is one semester

    REPEAT that many times
        take one out, release its dependants as usual

    semesters = semesters + 1

ANSWER  semesters

WHY
    everything sitting at zero prerequisites can be taken at the
    same time, so one drained level is one semester

    this is the same level snapshot that turns BFS into a distance count`,

  'topo/2': `SAME AS THE TEMPLATE, except
    the edges must be DERIVED -- all the difficulty is upstream

FOR each ADJACENT pair of words
    scan them together until the characters differ
        the FIRST difference gives ONE edge: earlier letter before later
        then STOP -- take nothing more from this pair

    IF one word ran out and it is the LONGER one
        the input is invalid ("abc" cannot precede "ab")

THEN run the ordinary topological sort

WHY
    taking more than the first difference invents constraints the
    input never implied -- the letters after the first difference
    tell you nothing at all

    the prefix case is the edge case interviewers check for`,

  'topo/3': `SAME AS THE TEMPLATE, except
    the queue becomes a HEAP

    take out the SMALLEST ready node rather than the
    longest-waiting one

WHY
    nothing about the logic changes -- only which of the equally
    valid ready nodes you pick

    the cost gains a log factor, in exchange for a defined tie-break
    one structure swap, no new reasoning`,

  'sweep/0': `SAME AS THE TEMPLATE, except
    the ORDER of two events sharing a timestamp

    ends first   -> a room frees at 10 and is retaken at 10:
                    [9,10] and [10,11] DO NOT overlap   (half-open)
    starts first -> it is taken before it is freed:
                    they DO overlap                     (closed)

WHY
    it is one term in the sort key, and it changes the answer on
    every touching pair

    ASK before coding -- this is the planted ambiguity in
    essentially every interval problem`,

  'sweep/1': `SAME AS THE TEMPLATE, except
    reverse the question, and sort by END

    counting overlap does not tell you what to KEEP,
    so ask instead: how many can I keep?

SORT by END time, earliest first

FOR each interval in that order
    IF it starts at or after the last kept end
        keep it, and remember its end

ANSWER  total minus kept

WHY
    sorting by START is the intuitive choice and it is WRONG:
    one long early interval blocks two short ones behind it

    earliest END leaves the most room for everything after it,
    and that is the exchange argument you say out loud`,

  'sweep/2': `SAME AS THE TEMPLATE, except
    one added term in the boarding test

    can I board this flight?
        template  ->  my arrival  <=  its departure
        here      ->  my arrival + the minimum gap  <=  its departure

WHY
    one term, and it changes the answer on every tight connection

    interviewers WAIT to see whether you ask about it,
    so raise it in the clarifying round rather than discovering
    it halfway through the code`,

  'sweep/3': `SAME AS THE TEMPLATE, except
    the sort disappears

SET UP  one slot per minute of the day, all zero

FOR each meeting
    slots[start] = slots[start] + 1
    slots[end]   = slots[end]   - 1

ONE running-total pass over the slots
    the largest running value is the answer

WHY
    the sort existed only to put the events in time order,
    and indexing by the time itself already does that

    "bounded small integers" is always the hint to stop sorting`,

  'sweep/4': `SAME AS THE TEMPLATE, except
    the heap carries IDENTITY, not just a count

SET UP  a heap of (when it frees up, WHICH room)

FOR each meeting, in start order
    IF the earliest-freeing room is free by now
        take that exact room out -- record it as this meeting's room
    ELSE
        open a brand new room

    put the room back, with this meeting's end time

ANSWER  the room recorded against each meeting

WHY
    a counter answers "how many rooms" and nothing more;
    naming one requires carrying the name along

    this is the standard follow-up once you give the sweep answer`,

  'heap-topk/0': `NOT WORTH THE PATTERN ANY MORE

    the heap costs n log k, and it only beats a sort while k is SMALL
    at k near n, log k is log n -- the same factor, plus overhead

INSTEAD  just sort, and take the last k

WHY IT MATTERS
    naming the crossover shows you know WHY the heap was there,
    rather than reaching for it reflexively`,

  'heap-topk/1': `SAME AS THE TEMPLATE, except
    TWO heaps, facing each other

    a low half, largest on top
    a high half, smallest on top

FOR each new value
    push it into the low half
    move the low half's top across into the high half
    IF the high half is now the larger, move its top back

    the two tops are the middle of everything seen

ANSWER  one top, or the average of both, by whether the count is odd

WHY
    a heap hands you an EXTREME, and a median is not an extreme

    but the median sits exactly between the halves -- so split the
    data in two and it becomes an extreme of each`,

  'heap-topk/2': `SAME AS THE TEMPLATE, except
    bucket by COUNT instead of heaping

COUNT every value as usual

SET UP  one bucket per possible count, 0 up to n

FOR each value, drop it into the bucket for its count

READ the buckets from the highest count downward
    stop once you have k

WHY
    a count cannot exceed n, so the thing being ordered is a
    bounded small integer -- and that is counting sort, not sorting

    whenever the values you are ordering are bounded by n,
    the log factor is avoidable entirely`,

  'heap-topk/3': `SAME AS THE TEMPLATE, except
    every heap entry carries a TIE-BREAK

    push (the value, a unique counter, the payload)

WHY
    entries are compared field by field, so two equal values make
    the comparison fall through to the PAYLOAD -- and a list node
    has no ordering, so it raises

    the counter is always decidable, so the comparison never
    reaches the payload at all

    this is a crash, not a wrong answer, which is why it is
    worth recognising instantly`,
});
