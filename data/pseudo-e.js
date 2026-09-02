/* Pseudocode, batch E: deviations on the 25 techniques.
 *
 * Same three shapes as batches C and D. See data/pseudo-c.js for the rules.
 */
Object.assign(window.PSEUDO, {

  'sorting/0': `SAME AS THE TEMPLATE, except
    the key is a PAIR, not one field

    sort by (the length of the word, then the word itself)

WHY
    a pair is compared field by field: the first decides, and the
    second is consulted only on a tie

    so the reading order of the pair IS the priority order of the
    keys -- and no custom comparator is needed at all`,

  'sorting/1': `SAME AS THE TEMPLATE, except
    one field is NEGATED to reverse it

    sort by (the group ascending, the score NEGATED)

WHY
    negating a number turns "smallest first" into "largest first"
    within the same single sort

CAREFUL
    it only works on numbers -- there is no negative of a string

    for mixed directions on text, use STABILITY instead:
    sort by the secondary key first, then by the primary --
    equal primaries keep the order the first sort left them in`,

  'sorting/2': `SAME AS THE TEMPLATE, except
    you sort the INDEXES, not the values

    order = the positions 0, 1, 2 ... sorted by the value at each

WHY
    sorting the values throws away exactly what is being asked for

    "return the INDEX of" is the tell -- the moment you see it,
    sort positions and read values through them`,

  'counting-sort/0': `NOT THIS PATTERN

    a bucket per possible value means a billion buckets to sort a
    hundred items -- the space is the whole cost, and here it is absurd

INSTEAD
    sort normally, or COMPRESS the coordinates first:
    collect the distinct values, sort them, and use each value's
    rank in that list

WHY IT MATTERS
    counting sort trades space for time, and the trade only pays
    while the range of values is comparable to n

    checking the range before reaching for it is the judgement
    being tested`,

  'counting-sort/1': `SAME AS THE TEMPLATE, except
    the buckets hold the OBJECTS, not counts

FOR each object, in input order
    append it to the bucket for its score

THEN read the buckets in order, emptying each

WHY
    counting only tallies how many; keeping the objects is what
    makes it a sort rather than a histogram

    appending in input order makes it STABLE for free, which is
    exactly the property radix sort depends on when it runs this
    as one of several passes`,

  'coordinate-compression/0': `SAME AS THE TEMPLATE, PLUS the inverse

    keep the sorted list of distinct values

    at the very end, the answer is that list read at the index
    the algorithm produced

WHY
    compression is a change of COORDINATES, not of the problem

    forgetting to invert it returns a rank where a value was asked
    for -- and a rank looks plausible, so it is easy to miss`,

  'coordinate-compression/1': `NOT THIS PATTERN, or not on its own

    ranks preserve ORDER and destroy MAGNITUDE
    after compression, 10 and 1000000 are simply "next to each other"

    and a duration, a length or an area is a magnitude

INSTEAD
    do not compress -- or compress, and carry the TRUE WIDTH between
    each pair of neighbouring values alongside the ranks

THE TELL
    the question measures something (time spent, area covered)
    rather than merely comparing`,

  'recursion/0': `SAME AS THE TEMPLATE, except
    the stack has to come from somewhere else

    either raise the recursion limit, and say why that is acceptable
    here, or convert to an explicit stack, which always is

WHY
    the call stack caps out near a thousand frames, and this input
    is a hundred times that

    raising the limit works but risks a hard crash instead of a
    clean exception -- so say WHICH you chose and why

    the interviewer is mostly testing whether you noticed at all`,

  'recursion/1': `SAME AS THE TEMPLATE, PLUS a cache

    before doing any work, look the state up
    after computing it, store it

WHY
    that is the ENTIRE step from recursion to dynamic programming

    memoised recursion IS DP -- framing it that way makes DP a
    one-line upgrade rather than a separate technique to fear`,

  'recursion/2': `NO -- and the rewrite is mechanical

    Python does not eliminate tail calls; every call still gets a frame

INSTEAD, a loop carrying the state
    WHILE the base case has not been reached
        state = the next state
    ANSWER  the state

WHY
    a tail call is a call whose result is returned unchanged, so
    nothing is waiting on the frame -- which is exactly what a loop
    expresses, at no stack cost

    worth knowing as a deliberate language fact rather than
    discovering it as a crash`,

  'divide-conquer/0': `SAME AS THE TEMPLATE, except
    the COMBINE step also counts

DURING THE MERGE of a sorted left half and a sorted right half
    taking from the left half -> nothing to count

    taking from the right half
        that value came out BEFORE everything still waiting in the
        left half, so it is smaller than all of them
        add HOWEVER MANY are still waiting there, all at once

ANSWER  the total counted, plus the counts from both halves

WHY
    the merge already compares every cross-half pair implicitly, so
    counting there is free

    that turns a quadratic count into n log n, and the counting
    lives entirely inside a step you were running anyway`,

  'divide-conquer/1': `NOT THIS PATTERN

    dividing is only valid when the halves are INDEPENDENT -- that
    is what makes "two half-size problems plus a linear combine"
    an honest description of the work

    if solving the left half needs the right half's answer, the
    recursion re-solves shared work over and over

INSTEAD, DP -- give the overlapping subproblems a cache

THE TELL
    you cannot state the recurrence without one side referring
    to the other`,

  'meet-in-middle/0': `SAME AS BACKTRACKING, except
    you enumerate each HALF and then JOIN

    enumerate every possibility for the first half   (a million)
    enumerate every possibility for the second half  (a million)
    sort the second half

FOR each possibility in the first half
    binary search the second for its best partner

ANSWER  the best pairing found

WHY
    2^40 is a trillion; two lots of 2^20 is two million,
    and pairing them up is a SEARCH rather than a third enumeration

THE TELL
    n around 40 -- too big for 2^n, suspiciously exactly twice
    what 2^n can handle`,

  'meet-in-middle/1': `TOO BIG -- the technique has a ceiling

    halving the exponent leaves 2^30 per half: a billion each,
    which is out of reach again

WHAT IT ACTUALLY BUYS
    halving the exponent roughly DOUBLES the feasible n --
    it does not multiply it by ten

    so if 2^n works to about 20, this works to about 40, and no further

WHAT TO DO
    look for polynomial structure instead, and say why the
    exponential family is exhausted`,

  'kadane/0': `SAME AS THE TEMPLATE -- and the initialisation is why

    best and current both START at the first element,
    never at zero

WHY
    starting at zero silently allows the EMPTY subarray as an answer,
    so an all-negative input returns 0

    the intended answer is the least negative single element

    one token, and it is the classic Kadane bug -- worth saying out
    loud that you checked it`,

  'kadane/1': `SAME AS THE TEMPLATE, except
    you carry the running MINIMUM as well

FOR each element x
    work out both extensions FIRST, from the OLD values
        max extended = old maximum x x
        min extended = old minimum x x

    the new maximum is the best of: x alone, either extension
    the new minimum is the worst of: x alone, either extension

    only NOW overwrite both

WHY
    a big negative times a negative becomes the new maximum, so the
    most negative product has to be tracked too -- it is a candidate,
    not noise

ORDER MATTERS
    compute both from the old values, or the second line reads a
    variable the first has already overwritten`,

  'kadane/2': `TWO CASES, both from the template

    the best subarray either WRAPS or it does not

    does not wrap -> the ordinary Kadane maximum
    wraps         -> everything EXCEPT some middle stretch,
                     which is the total minus the minimum subarray

ANSWER  the better of the two

GUARD
    if every element is negative, the second case removes the whole
    array and leaves nothing -- fall back to the first

WHY
    a wrapping subarray is exactly the complement of a
    non-wrapping one, so the same two scans answer both`,

  'index-as-storage/0': `NOT THIS PATTERN

    the entire purpose of the technique is to avoid extra space by
    writing into the input -- and that is now forbidden

INSTEAD, be honest about it
    a set, or a count array, and pay the n extra space

WHY IT MATTERS
    with the constraint removed, the trick has no purpose left --
    it was never clearer, only smaller`,

  'index-as-storage/1': `NOT THIS PATTERN, as written

    marking by SIGN needs a sign to flip, and zero has none --
    so a zero can never be marked, and a negative is already marked

INSTEAD
    offset every value into a safe positive range first,
    or use cyclic sort, or accept a count array

THE TELL
    "n numbers in the range 1 to n" is the phrasing that licenses
    this technique -- check for it before committing`,

  'sentinel/0': `SAME AS THE TEMPLATE -- and the return is why

    return the node AFTER the dummy, never the original head

WHY
    if the head was the node removed, the original head variable
    still points at the removed node

    the function then works perfectly and returns the one thing it
    was asked to delete -- which is the bug the dummy itself creates
    if you forget this line`,

  'sentinel/1': `SAME AS THE TEMPLATE, PLUS a trailing sentinel

    append a bar of height zero to the input

WHY
    nothing is shorter than zero, so every bar still on the stack is
    forced out through the ordinary popping path

    without it the tallest trailing bars are never measured at all

    one element removes an entire post-loop cleanup branch --
    and a cleanup branch is a second place for the same logic to be
    wrong in a different way`,

  'expand-centre/0': `SAME AS THE TEMPLATE, except
    a COUNTER replaces the comparison

FOR each centre
    WHILE both sides are inside the string AND the characters match
        add one to the total
        step both outwards

ANSWER  the total

WHY
    every step outward that still matches IS one more palindrome
    centred there -- so the successful expansions are already the count

    same loop, a counter instead of a max`,

  'expand-centre/1': `TOO SLOW -- name the better algorithm and stop

    trying every centre is n centres each expanding up to n

    Manacher's algorithm is linear: it reuses the radii already
    computed to skip comparisons a mirrored centre has done

WHAT TO SAY
    name it, and say you would look it up rather than reconstruct it
    under pressure

WHY
    honesty about what you would look up is received better than a
    half-remembered attempt, and this is rarely required at
    interview level`,

  'bit-tricks/0': `NOT THE XOR TRICK -- it cancels PAIRS, not triples

INSTEAD, count per bit position

FOR each bit position
    add up that bit across every number
    IF the total does not divide by three
        that bit belongs to the answer

WHY
    every value appearing three times contributes a multiple of
    three to each position it occupies -- so it vanishes modulo 3

    the lone value's bits are what is left over

GENERALLY
    k copies -> count per position, modulo k
    the XOR trick is just the k = 2 case`,

  'bit-tricks/1': `SAME LOGIC, DIFFERENT LIMITS -- and they bite

    every bitwise operator in JavaScript first truncates its operands
    to 32-BIT SIGNED integers

    so 1 shifted left 31 places is NEGATIVE there, where in Python
    it is simply a larger number

TO WORK AROUND IT
    force an unsigned reading with an unsigned right shift by zero
    or stay under 2^31 by construction

WHY IT MATTERS
    plain numbers are exact up to 2^53, so ordinary arithmetic is
    fine -- it is only the BITWISE operators that truncate

    which means a mask or hash trick fails SILENTLY on large values
    while every test with small numbers passes`,

  'bitmask-enum/0': `SAME AS THE TEMPLATE, PLUS an inner walk

FOR every mask, as usual
    inner = mask
    WHILE inner is not zero
        that is one subset OF this subset
        inner = (inner - 1) AND mask       <- the next one down

    (and once more for the empty subset, if it counts)

WHY
    subtracting one flips the lowest set bit off and everything
    below it on; masking discards the bits that were never in mask

    so it steps through the submasks in decreasing order,
    visiting each exactly once

COST
    every item is in, out, or in the outer mask only --
    three states each, so 3^n in total, not 4^n`,

  'bitmask-enum/1': `AT THE EDGE -- check the exponent before committing

    2^20 is a million       -- comfortable
    2^25 is 33 million      -- borderline, and only with a cheap body
    2^30 is a billion       -- not happening

WHY IT MATTERS
    the exponent IS the whole budget, and no amount of tidying the
    inner loop moves it

    knowing where it stops being viable is what stops you writing a
    solution that cannot finish`,
});

/* --------------------------------------------- techniques 13-25 continued -- */
Object.assign(window.PSEUDO, {

  'bitmask-dp/0': `SAME AS THE TEMPLATE, except
    the base case CHARGES THE WAY HOME

    when every item is used
        return the cost of going from where you are back to the start
        (rather than zero)

WHY
    a path becomes a CYCLE by paying for the return leg

    one line, and it is the whole difference between the
    Hamiltonian path and the travelling-salesman tour`,

  'bitmask-dp/1': `TOO BIG -- count the states before you start

    states = positions x masks = n x 2^n

    n = 15  ->  about 500 thousand   -- fine
    n = 22  ->  about 92 million     -- no

WHY IT MATTERS
    bitmask DP is the answer to a SMALL-n exponential problem,
    not to a large one

    it turns n! into 2^n, which is an enormous win and still
    an exponential`,

  'tabulation/0': `SAME AS THE TEMPLATE, except
    only the rows the recurrence READS are kept

    look at which cells the recurrence touches
    if it never reaches further than one row back,
    keep two rows and overwrite as you go

WHY
    this is only possible once you can SEE the dependencies,
    which is why memoising first and squeezing second is the
    right order

    and it costs you something -- see the next deviation`,

  'tabulation/1': `NOT WITH THE SPACE OPTIMISATION -- they are exclusive

    reconstructing the sequence needs the trail: either the full
    table, or a parent pointer recorded per cell

    the rolling version has thrown that away by design

WHAT TO SAY
    name the trade-off. "I can have linear space OR the actual
    sequence, not both" is the complete answer to "can you do both?"
    -- and it is better than trying`,

  'tabulation/2': `CHECK THE DIRECTION OF THE FILL

    the classic failure is reading a cell that has not been
    written yet -- it holds its initial value, so the answer is
    wrong and nothing crashes

    0/1 knapsack, each item once   -> walk capacity DOWNWARD
    unbounded, reuse allowed       -> walk capacity UPWARD

WHY
    downward means the cell you read still describes a world
    WITHOUT this item; upward means it may already include it

    the two loops are the same problem with opposite meanings,
    which is why this is the most common tabulation bug`,

  'knapsack/0': `SAME AS THE TEMPLATE, except
    the capacity loop runs UPWARD

WHY
    going upward, the cell you read at (capacity - weight) has
    ALREADY been offered this item -- so taking it again is exactly
    what you want

    going downward, that cell still predates the item, so it can
    only be taken once

    one loop direction is the entire difference between the
    0/1 and unbounded variants`,

  'knapsack/1': `SAME AS THE TEMPLATE, except
    the value is a YES/NO instead of an amount

    IF the total is odd -> impossible, stop
    target = half the total

SET UP  reachable[0] = true, everything else false

FOR each number
    FOR each capacity, DOWNWARD to the number
        IF (capacity - number) was reachable
            mark capacity reachable

ANSWER  whether the target is reachable

WHY
    "split into two equal halves" is subset-sum in disguise:
    if one half reaches the target, the rest is the other half

    recognising partition, subset sum and coin change as ONE
    template is worth more than memorising three

    the odd-total exit is free -- take it`,

  'interval-dp/0': `SAME AS THE TEMPLATE, except
    you split on the LAST action, not the first

FOR each range, shortest first
    FOR each position k inside it
        suppose k is the LAST one burst in this range
        then its surviving neighbours are exactly the range's
        two boundaries -- which are KNOWN

        value = the left sub-range + the right sub-range
                + this balloon times both boundaries

WHY
    choosing the FIRST burst leaves an unknown neighbour, because
    what sits next to it depends on what is burst later

    choosing the LAST fixes both neighbours by the range itself,
    and that reframing IS the problem`,

  'interval-dp/1': `CHECK THE LOOP ORDER -- LENGTH must be outermost

    every range depends on strictly SHORTER ranges, so shorter ones
    have to exist first

    looping the start and the end directly reads sub-ranges that
    have not been filled -- they hold zero, and the answer is
    quietly wrong

WHY
    the loop order IS the dependency graph here; there is nothing
    else enforcing it`,

  'lis-patience/0': `SAME AS THE TEMPLATE, except
    which side of an EQUAL value you land on

    strictly increasing -> find the first pile whose top is NOT
                           SMALLER than x: an equal top gets replaced
    non-decreasing      -> find the first pile whose top is
                           STRICTLY GREATER: an equal top is extended

WHY
    that is the entire difference -- whether an equal value counts
    as continuing the run or as restarting it

    worth knowing which is which rather than guessing under pressure,
    because both versions run and only one is right`,

  'lis-patience/1': `SAME AS THE TEMPLATE, PLUS a trail

    each time you place a value on a pile
        record which value was on top of the PREVIOUS pile
        (or nothing, if it started a new pile)

AT THE END
    start from the value that made the last pile and
    follow the recorded trail backwards, then reverse it

WHY
    the piles are a BOOKKEEPING device, not an answer -- their tops
    are the smallest possible endings, which is usually not a real
    subsequence at all

    being asked to reconstruct is the standard follow-up, and it
    needs state the length-only version never kept`,

  'zero-one-bfs/0': `NOT THIS PATTERN, as written

    the deque works because only TWO distances are ever in flight:
    the current one at the front, and one more at the back

    a third weight has nowhere to go

TWO WAYS OUT
    go back to Dijkstra with a heap, OR
    SPLIT the weight-2 edge into two weight-1 edges through a
    dummy node, and keep the deque

WHY THE SPLIT IS WORTH KNOWING
    it preserves the linear cost by changing the graph rather than
    the algorithm -- and small weights make that cheap`,

  'bellman-ford/0': `SAME AS THE TEMPLATE, PLUS one extra round

    after the (nodes - 1) rounds, run the edges ONE more time
    IF anything still improves -> a negative cycle exists

WHY
    no simple path uses more than (nodes - 1) edges, so after that
    many rounds every legitimate path is already settled

    an improvement on the next round therefore must be revisiting a
    node -- going round a loop that gets cheaper each time

WHERE YOU MEET IT
    currency arbitrage is exactly this question`,

  'bellman-ford/1': `SAME AS THE TEMPLATE, except
    exactly k rounds -- and you read a SNAPSHOT

REPEAT k times
    take a copy of the distances as they stand
    FOR every edge, improve the destination using the COPY only

WHY
    round i of the ordinary algorithm already means "the best path
    using at most i edges", which makes the k-edge limit almost free

    but reading your OWN WRITES within a round lets one round chain
    several edges -- so the path quietly exceeds k

    the snapshot is what keeps each round worth exactly one edge`,

  'mst/0': `SAME ANSWER, different algorithm

    Kruskal sorts every edge: edges x log edges
    on a dense graph that is a lot of sorting

    Prim grows ONE tree instead
        keep a heap of edges leaving the tree
        repeatedly take the cheapest that reaches a new node

WHY
    both are correct -- the choice is about edges relative to nodes

    Kruskal is still the one to WRITE, because you already have
    greedy and Union-Find and it is five lines`,

  'mst/1': `SAME AS THE TEMPLATE, except
    you STOP EARLY

    stop after (nodes - k) successful unions instead of (nodes - 1),
    leaving k separate components

WHY
    a minimum spanning FOREST is just an MST stopped early

    and because the edges arrive cheapest-first, the ones you never
    reach are the (k - 1) most expensive -- which is exactly what
    you want left out`,

  'floyd-warshall/0': `SAME AS THE TEMPLATE, PLUS reading the DIAGONAL

    after the triple loop, look at the distance from each node to
    ITSELF
    any negative value means that node sits on a negative cycle

WHY
    a route from i back to i with a negative total IS a negative
    cycle through i -- there is nothing else it could be

    one line after an algorithm you were running anyway`,

  'floyd-warshall/1': `NOT WORTH THE PATTERN

    this computes every pair, and you asked for one source
    that is nodes-cubed work to answer a nodes-sized question

INSTEAD  Dijkstra from that source

WHY IT MATTERS
    all-pairs is only worth buying when you genuinely need all
    pairs -- or when the graph is small enough that cubed is
    comfortable and four lines beats a heap`,

  'cycle-directed/0': `NOT THIS TEST -- undirected needs a different one

    in an undirected graph, the edge you arrived BY looks exactly
    like an edge back into your own path

    so the three-colour test reports a cycle for every single edge

INSTEAD
    carry the node you came from, and skip that one neighbour
    (or use Union-Find: an edge whose ends already share a leader
     closes a cycle)

WHY
    Union-Find is the cleaner answer for undirected connectivity,
    and it is the one to reach for when edges arrive over time`,

  'cycle-directed/1': `SIMPLER: use the topological sort's own count

    run Kahn's algorithm and compare how many nodes came out
    against how many exist

    fewer emitted -> something was never freed -> a cycle

WHY
    no recursion, no colours, no stack-depth risk

    the three-colour DFS earns itself when you need to REPORT which
    nodes form the cycle -- for yes or no, this is less to get wrong`,

  'lru-cache/0': `SAME BEHAVIOUR, built by hand

    a map from key -> its node, for the instant lookup
    a doubly linked list for the order, with SENTINEL nodes
    permanently at each end

TO TOUCH a node
    unlink it from wherever it sits
    put it back at the most-recent end

TO EVICT
    take the node next to the oldest sentinel

WHY THE SENTINELS
    every node then has both a previous and a next, always --
    so unlink and insert need no "is this the first / last one"
    checks at all

    exactly the dummy-head technique, applied at both ends`,

  'lru-cache/1': `HARDER -- order by COUNT first, then recency

SET UP
    one recency list per use-count
    a note of the SMALLEST count currently present

TO TOUCH a key
    move it out of its count's list and into the next count up
    if its old list is now empty AND it held the smallest count,
    the smallest count goes up by one

TO EVICT
    take the oldest entry from the smallest count's list

WHY
    the smallest count is tracked rather than searched for, and
    that is what keeps eviction constant instead of a scan

    the standard follow-up once LRU is done`,

  'rolling-hash/0': `SAME AS THE TEMPLATE, PLUS verification

    on a hash match, COMPARE THE CHARACTERS before believing it

    (or hash under two independent moduli, and require both)

WHY
    a collision makes the answer WRONG, not slow -- and the code
    looks perfectly correct

    verification costs the window's length, but only on a hit,
    so the average stays linear

    saying this unprompted is the thing actually being tested`,

  'rolling-hash/1': `TWO PATTERNS COMPOSED

    BINARY SEARCH the length L
        CAN(L) = "some substring of length L appears twice"
                 -- answered by rolling every window of length L
                    into a set and watching for a repeat

    if a length works, every shorter length works too,
    so CAN is monotonic and the search is valid

ANSWER  the longest L that works, and the substring found there

WHY
    binary search on the answer, with rolling hash as the predicate:
    n log n instead of n squared

    and remember the verification from the previous deviation --
    a collision here silently invents a duplicate`,

  'lazy-deletion/0': `USUALLY JUST ACCEPT IT

    the heap can hold one entry per edge, and an entry is two
    numbers -- that is cheap

    log(edges) and log(nodes) differ by a constant factor, so the
    simpler code almost always wins

IF IT GENUINELY MATTERS
    an indexed heap with decrease-key keeps it at one entry per node

WHY IT MATTERS
    knowing decrease-key EXISTS, and that you are choosing not to
    use it, is the whole answer here`,

  'lazy-deletion/1': `SAME AS THE TEMPLATE -- and WHEN you record is why

    write the improved distance at PUSH time, never at pop

THE CHECK then works
    a popped entry whose distance is worse than the recorded one
    was superseded after it was pushed -- discard it

WHY
    if the recorded value is only written on pop, every duplicate
    entry still looks current when it surfaces

    nothing is ever recognised as stale, so nodes are re-expanded
    over and over and the whole thing degrades exponentially`,
});
