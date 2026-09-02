/* Pseudocode, batch D: deviations on patterns 12-22.
 *
 * Same three shapes as batch C -- deviation, reduces-to-two-calls, or
 * not-this-pattern. See data/pseudo-c.js for the rules.
 */
Object.assign(window.PSEUDO, {

  'memo/0': `SAME AS THE TEMPLATE, except
    THE TWO LOOPS SWAP PLACES

    template  ->  FOR each amount
                      FOR each coin          (counts ORDERINGS)
    here      ->  FOR each coin
                      FOR each amount        (counts COMBINATIONS)

    the body does not change at all

WHY
    with coins on the OUTSIDE, each coin is offered to the whole
    table once and then never again -- so 1 then 2 and 2 then 1
    can never both be counted

    the loop order IS the semantics here, which is exactly why
    this variant catches people`,

  'memo/1': `SAME AS THE TEMPLATE, except
    the STATE grows a dimension

    template  ->  the answer depends on WHERE you are
    here      ->  it also depends on how many trades are left,
                  and on whether you are currently holding

    so the cache key becomes (position, trades left, holding)

WHY
    a missing dimension fails SILENTLY: two genuinely different
    situations collide on one key, and the cache hands back a
    confident wrong answer

    the rule is absolute -- if the answer depends on it,
    it belongs in the key. this is the number-one DP bug`,

  'memo/2': `NOTHING TO CODE -- this is the test you run BEFORE choosing

TRY TO BREAK GREEDY
    coins of 1, 3 and 4, making 6
        greedy takes the biggest first:  4 + 1 + 1  = three coins
        the best answer is:              3 + 3      = two coins
    greedy is wrong here, so the DP stays

IF IT SURVIVES two honest attempts
    state the exchange argument out loud, then use greedy

WHY
    producing that counterexample takes fifteen seconds and settles
    the question outright

    guessing costs the whole problem`,

  'memo/3': `SAME AS THE TEMPLATE, except
    only ONE ROW is ever alive

    look at what the recurrence actually reads -- if it only ever
    reaches one row back, keep two rows and overwrite

    previous = the row just finished
    current  = the row being filled
    at the end of each row, previous = current

WHY
    the rest of the table is dead weight the moment the recurrence
    stops reaching into it -- n instead of n x n

WHEN EVEN THAT IS TOO BIG
    the state space itself is wrong, and the answer is a different
    formulation -- for longest increasing subsequence, patience
    piles with a binary search: n log n and no table at all`,

  'backtracking/0': `SAME AS THE TEMPLATE, except
    a repeated value is skipped AT THE SAME LEVEL

SORT the input first, so equal values sit together

FOR each candidate at this level
    SKIP it if it equals the previous one AND it is not the first
    choice AT THIS LEVEL

    otherwise choose, recurse, un-choose as usual

WHY
    "not the first choice at this level" is the whole fix

    skipping whenever a value equals its predecessor ANYWHERE would
    also forbid legitimately using the same value again DEEPER in the
    path -- which is a different thing entirely`,

  'backtracking/1': `SAME AS THE TEMPLATE, except
    ONE character: recurse from i, not from i + 1

    i + 1  ->  the element is consumed, each may be used once
    i      ->  the element stays available, it may be reused

WHY
    where you recurse from is what says "used up" or "still on the table"

    combination sum I and II differ by exactly this and the
    duplicate skip -- nothing else`,

  'backtracking/2': `NOT THIS PATTERN

    the question asks HOW MANY, not WHICH
    enumerating 2^n arrangements to return one integer is
    exponential work for a polynomial answer

INSTEAD, count with DP
    state = the number of ways to reach this situation
    add the ways together rather than listing the paths

THE TELL
    "how many" -> count with DP
    "list them" / "return all" -> backtracking, and exponential
    output is then expected rather than a failure`,

  'backtracking/3': `SAME AS THE TEMPLATE, except
    you PRUNE ON THE WAY DOWN instead of checking at the leaf

KEEP three sets: the columns, and both diagonal directions,
that are currently under attack

FOR each square at this level
    IF its column or either of its diagonals is attacked
        skip it -- do not recurse at all

    otherwise: mark the three, recurse, un-mark the three

WHY
    checking validity only at the LEAF explores the entire tree and
    rejects at the very end -- the pruning is what makes it finish

    the sets make each test one lookup rather than a rescan of the
    board, and a diagonal is identified by row minus column
    (or row plus column) staying constant`,

  'deque-mono/0': `SAME AS THE TEMPLATE, except
    the pop computes an AREA, and a sentinel forces the flush

APPEND a zero-height bar to the end of the input

FOR each index i
    WHILE the bar on top of the stack is taller than this one
        pop it -- its rectangle ends here

        its height is the popped bar's height
        its width runs from just AFTER the bar now on top of the
        stack, up to just BEFORE i
            (if the stack is empty, it spans everything to the left)

        keep the area if it is the best

    push i

WHY
    the sentinel is what makes the leftovers measurable -- without
    it, every bar still on the stack at the end is never measured

    and the width comes from the index BELOW the popped one, not
    from the popped index itself: that neighbour is the first bar
    short enough to stop the rectangle`,

  'deque-mono/1': `SAME AS THE TEMPLATE, except
    you pop from BOTH ends, for two different reasons

FOR each index i
    FROM THE BACK, on VALUE
        drop anything beaten by xs[i] -- smaller and older can
        never win again
    add i to the back

    FROM THE FRONT, on POSITION
        drop the front if it has fallen out of the window

    the front is the window's maximum

WHY
    two independent reasons to discard, so you need two ends

    a stack cannot express expiry by position at all -- that is
    what makes this a deque rather than a monotonic stack`,

  'deque-mono/2': `SAME AS THE TEMPLATE, except
    the comparison flips

    next GREATER   -> pop while the top is SMALLER than the new value
    previous SMALLER -> pop while the top is BIGGER, scanning the
                        other way

WHY
    all four variants -- next or previous, greater or smaller -- are
    this one piece of code with two knobs: the comparison, and the
    direction of the scan

    say out loud which of the four you are building BEFORE writing
    the while, because writing the opposite by accident is easy and
    the code still runs`,

  'deque-mono/3': `TWO VALID ANSWERS -- mention both, code the simpler

WITH A MONOTONIC STACK
    each pop closes a horizontal layer of water and you add its area

WITH TWO POINTERS  (shorter, and easier to defend)
    carry the tallest wall seen from each side
    WHILE the pointers have not met
        step the side whose running maximum is SMALLER
        the water above that cell is its side's running maximum
        minus the cell's own height

WHY
    the smaller running maximum is what caps the level, so that side
    can be settled without knowing anything more about the other

    both are linear. choosing the one you can explain under pressure
    is a real interview skill, and saying the other exists costs one
    sentence`,

  'union-find/0': `SAME AS THE TEMPLATE, except
    you must decide WHAT A NODE IS, and label it

KEEP a map from label -> index
    the first time a label is seen, give it the next index and make
    it its own leader

THEN union and find on the indexes, exactly as before

WHY
    the real problem is the choice, not the code: in accounts-merge
    the nodes are the EMAILS, not the accounts

    unioning every email inside one record is what merges the people
    who share any of them -- getting that choice right is most of
    the solution`,

  'union-find/1': `SAME AS THE TEMPLATE -- it already does this

    union already reports FALSE when both ends share a leader

FOR each edge in order
    IF union reports "already connected"
        this is the edge that closes the loop -- answer it

WHY
    the cycle detector is a by-product you already have

    adding a separate check would be duplicated logic that can
    disagree with itself -- and one of the two will be the one
    you forget to update`,

  'union-find/2': `NOT THIS PATTERN

    Union-Find stores SYMMETRIC membership: after joining u and v,
    it cannot tell you which way round they were

    direction is information the structure is designed to discard

INSTEAD
    directed cycles need the three-colour DFS, or Kahn's count check

WHY IT MATTERS
    recognising that a tool does not fit is worth as much as
    using one that does`,

  'union-find/3': `SAME AS THE TEMPLATE, except
    the edges are SORTED BY WEIGHT first

FOR each edge, cheapest first
    IF union succeeds, add its weight to the total
    (a failure means it would close a cycle -- skip it)

ANSWER  the total

WHY
    that is Kruskal, and it is greedy plus Union-Find -- both of
    which you already have

    two lines on top of this template, which is why minimum
    spanning tree is a good follow-up rather than a new question`,

  'prefix/0': `SAME AS THE TEMPLATE, except
    two dimensions, and INCLUSION-EXCLUSION

TO BUILD each cell of the table
    this cell's value
      + the total above it
      + the total to its left
      - the total above AND left      <- counted twice, remove once

TO QUERY a rectangle
    the whole area up to the bottom-right corner
      - the strip above it
      - the strip to its left
      + the corner where those two strips overlap

WHY
    the two strips you subtract overlap in one rectangle, so it is
    removed twice and must be added back

    that final term is the one people drop -- draw the rectangle
    before coding it`,

  'prefix/1': `SAME AS THE TEMPLATE, but with the ROLES SWAPPED

    template  ->  build once (n), then each read is instant
    here      ->  each update is instant, then ONE sweep at the end

FOR each update, adding v across l..r
    marks[l]     = marks[l]     + v
    marks[r + 1] = marks[r + 1] - v         <- the +1 matters

AFTER every update
    one running-total pass turns the marks into the real array

WHY
    the mark at l starts the addition and the mark at r+1 cancels
    it, so the running total carries v across exactly l..r

    same idea, opposite direction. choose by which operation
    dominates -- many reads, or many writes`,

  'prefix/2': `SAME AS THE TEMPLATE, except
    run it from BOTH ends and MULTIPLY

    one pass forward:  the product of everything BEFORE each index
    one pass backward: the product of everything AFTER each index

    the answer at each index is those two multiplied

WHY
    subtraction is what removes a prefix from a sum; the equivalent
    for a product is DIVISION -- and division is unusable here,
    because a single zero destroys it

    the problem usually forbids division for exactly that reason,
    and two passes sidestep the issue entirely`,

  'prefix/3': `NOT THIS PATTERN

    a prefix table assumes the array is STATIC between reads
    one update invalidates everything after the point it touched,
    which is a linear repair per write

    a difference array inverts the problem rather than fixing it --
    it is fast to write and slow to read

INSTEAD
    say you would reach for a Fenwick tree or a segment tree:
    log n per update AND log n per query

WHY IT MATTERS
    naming the structure and its cost is usually enough at
    interview level -- you will rarely be asked to implement one

    knowing WHEN prefix sums break is the part being tested`,

  'trie/0': `SAME AS THE TEMPLATE, except
    the answer is stored AT each node

WHILE INSERTING  (with the words fed in sorted order)
    at every node along the way
        IF it is holding fewer than three suggestions
            append this word

ON EACH KEYSTROKE
    step one node down and read its stored list

WHY
    walking the subtree below the current node on every keystroke is
    far too slow for a search box

    inserting in sorted order means the first three to arrive at a
    node ARE the best three, so a keystroke becomes a single
    pointer move`,

  'trie/1': `SAME AS THE TEMPLATE, except
    a wildcard BRANCHES into every child

WALK the pattern as usual
    an ordinary character -> follow that one child
    a wildcard            -> try EVERY child, and succeed if any
                             of those searches succeeds

WHY
    the trie stops being a lookup and becomes a search space

    the worst case -- a pattern of nothing but wildcards -- degrades
    towards scanning the whole dictionary, and saying that out loud
    is part of the answer`,

  'trie/2': `TWO PATTERNS TOGETHER: backtracking over the grid,
carrying the trie alongside

FROM each cell, walk in every direction
    step the trie node in step with the path

    IF the current letter has NO child at this node
        stop immediately -- no word in the dictionary starts this way

    IF the node is marked end-of-word, record the word

    mark the cell used, recurse, un-mark it

WHY
    that one prune is the entire performance story

    searching the grid once per word is hopeless; one traversal
    carrying the trie kills dead branches at the first letter --
    which is why word search II is a trie problem rather than a
    backtracking one`,

  'trie/3': `NOT WORTH THE PATTERN

    a trie pays -- in code and in memory -- for PREFIX structure
    and exact membership uses none of it

INSTEAD  put the words in a set

WHY IT MATTERS
    a set is one line, less memory, and no slower for exact lookup

    saying so demonstrates judgement rather than pattern-matching,
    which is the thing actually being scored`,
});

/* -------------------------------------------- patterns 18-22 continued -- */
Object.assign(window.PSEUDO, {

  'fast-slow/0': `SAME AS THE TEMPLATE, PLUS a second phase

ONCE THEY MEET inside the cycle
    put the slow pointer back at the start
    move BOTH one step at a time
    where they meet again is the cycle's ENTRANCE

WHY
    the distance from the start to the entrance is the same as the
    distance from the meeting point round to the entrance

    worth knowing the RESULT even if you cannot reproduce the proof
    under pressure -- state it as a known property and move on`,

  'fast-slow/1': `SAME AS THE TEMPLATE, except
    a fixed GAP at ONE speed, instead of two speeds

SET UP  a dummy node in front of the head, both pointers on it

OPEN THE GAP
    move the fast pointer n steps forward

THEN move BOTH one step at a time
    until the fast pointer runs off the end

    the slow pointer is now exactly n from the end --
    so the node after it is the one to remove

WHY
    the gap is fixed, so where fast stops tells you where slow is

    the dummy node is what removes the "delete the head"
    special case, which is the other half of this question`,

  'fast-slow/2': `SAME AS THE TEMPLATE, except
    "the next node" becomes A FUNCTION

    next(n) = the sum of the squares of the digits of n

    slow takes one step, fast takes two, exactly as before
    they meet if and only if the sequence cycles

WHY
    ANY deterministic successor function defines a linked list --
    each value has exactly one next

    recognising a number sequence as a linked list is the entire
    point of these problems, and nothing about the loop changes`,

  'fast-slow/3': `TWO TECHNIQUES COMPOSED

FIND THE MIDDLE with the fast and slow pointers, as usual

REVERSE the second half in place

WALK the two halves together
    any mismatch means it is not a palindrome

WHY
    the template only LOCATES a position; the answer needs the two
    halves compared, and reversal is what makes them walkable in
    the same direction

SAY THIS OUT LOUD
    you are mutating the input, and could restore it afterwards --
    that is the part interviewers listen for`,

  'greedy/0': `SAME AS THE TEMPLATE, except
    the SORT KEY -- which is the whole solution

    sort by END time, not by start

WHY, WITH THE COUNTEREXAMPLE
    intervals [0,10], [1,2], [3,4]
        by start: take [0,10] first, and it blocks both others -> 1
        by end:   take [1,2] then [3,4]                       -> 2

    the earliest END leaves the most room for everything after it

    that counterexample takes ten seconds to produce and settles
    the question completely`,

  'greedy/1': `NOTHING TO CODE -- three sentences, separately scored

THE EXCHANGE ARGUMENT
    take any optimal solution
    if it does NOT contain the greedy choice x,
        swap its first item for x
    the result is still valid, and exactly the same size
    so SOME optimal solution contains x -- taking x cost nothing

    repeat the argument on what remains

WHY IT MATTERS
    an unjustified greedy reads as a guess that happened to work

    this is three sentences, and it is what turns a correct answer
    into a complete one`,

  'greedy/2': `NOT THIS PATTERN

    greedy assumes a locally best choice cannot cost you globally,
    and here it does

    coins of 1, 3 and 4, making 6
        greedy: 4 + 1 + 1 = three coins
        best:   3 + 3     = two coins

INSTEAD, DP -- consider both taking and not taking

THE HABIT
    test greedy against a small adversarial case BEFORE committing
    discovering this at minute thirty costs the problem`,

  'greedy/3': `SAME AS THE TEMPLATE, except
    a HEAP replaces the sort

    a single sort fixes the order up front, and here the best
    choice CHANGES as items get consumed

REPEAT while the heap is not empty
    take the most urgent item out
    use it, and update it
    put it back if it still has work left

WHY
    a static sort cannot express a priority that moves

    task scheduler and reorganise-string are both this shape:
    greedy in structure, heap in mechanism -- and that is where
    this pattern and heap / top-k merge`,

  'kway/0': `SIMPLER THAN THE TEMPLATE

    a heap of two is pure overhead -- two pointers do it directly

    one pointer per list, append whichever front is smaller,
    then flush the remainder

WHY IT MATTERS
    reaching for the general tool when the specific one is simpler
    reads as pattern-matching without thinking

    it is linear either way, but one of them needs no explanation`,

  'kway/1': `SAME AS THE TEMPLATE, except
    you STOP after k

    pop k - 1 times, pushing each row's successor as usual
    the next thing on top is the answer

OR SEARCH THE VALUE RANGE INSTEAD
    binary search between the smallest and largest values
    for each candidate, count how many cells are at most that --
    walking one staircase across the matrix, in linear time
    the smallest candidate whose count reaches k is the answer

WHY
    you never need the full merge to produce ONE element

    the value-search version costs n log(range) and often beats the
    heap on a large matrix, because it never touches most cells`,

  'kway/2': `SAME AS THE TEMPLATE, except
    you carry the running MAXIMUM by hand

    the heap top is the smallest head -- one end of the range
    the largest value pushed so far is the other end

WHILE every list still has a head in the heap
    the current range is (heap top) to (largest pushed)
    keep it if it is narrower than the best
    take the smallest out, push its successor, updating the maximum

WHY
    the heap exposes the minimum for free and the maximum not at all

    one extra variable turns the merge into a range search`,

  'dijkstra/0': `NOT THIS PATTERN

    Dijkstra SETTLES a node the moment it pops it, and a negative
    edge can make a path cheaper afterwards -- so "settled" is a lie
    and the answer can be wrong, not merely slow

INSTEAD, Bellman-Ford
    repeat (nodes - 1) times
        try to improve EVERY edge
    one more pass: anything still improving means a negative cycle

WHY
    it costs nodes x edges rather than edges x log nodes,
    and that is the price of dropping the assumption`,

  'dijkstra/1': `SIMPLER THAN THE TEMPLATE

    every edge costing the same means arrival order IS cost order,
    which is exactly what a plain queue already gives you

    drop the heap, use BFS

WHY
    linear instead of a log factor, and much less code

    recognising the degenerate case is worth saying out loud even if
    you then keep Dijkstra for generality`,

  'dijkstra/2': `SAME AS THE TEMPLATE, except
    a DOUBLE-ENDED QUEUE replaces the heap

    an edge costing 0 -> put the neighbour on the FRONT
    an edge costing 1 -> put it on the BACK

WHY
    a free edge does not change the distance, so the neighbour
    belongs with what is being processed right now

    a cost-1 edge puts it exactly one further out, which is where
    the back of the queue already sits

    so the queue stays in distance order for free -- linear, no heap`,

  'dijkstra/3': `SAME AS THE TEMPLATE, except
    edges are FILTERED BY TIME rather than always available

    the label on a node becomes "the earliest I can be here"

FOR each flight leaving the node you just settled
    IF you can be there in time to board it
        (your arrival, plus the minimum connection, is not after
         its departure)
        try to improve the destination's earliest arrival

WHY IT STILL WORKS
    WAITING IS FREE, so arriving earlier is never worse --
    which is what lets one number per node stand for the whole state

    say that out loud: the entire correctness argument rests on it,
    and a rule like "no layover over four hours" would break it`,

  'quickselect/0': `PROBABLY NOT WORTH THE PATTERN

    a size-k heap is n log k, has no bad worst case, and does not
    touch the caller's data

    quickselect answers "can you beat n log k" -- it is not the
    obvious solution to "find the kth largest"

WHY IT MATTERS
    quickselect has a quadratic worst case and MUTATES the input

    choosing the simpler tool, and being able to justify the swap
    in one sentence, is the senior answer`,

  'quickselect/1': `SAME AS THE TEMPLATE, except
    you work on a COPY -- and you say what that costs

    copy the input first, then partition the copy exactly as before

WHY
    partitioning in place is intrinsic to the algorithm; there is no
    in-place-but-non-mutating version to reach for

    so the copy is the only option, and it costs n extra space

    naming that cost rather than hiding it is the point of the
    question`,

  'quickselect/2': `NOT THIS PATTERN

    partitioning needs the whole array in hand, and random access
    to it -- a stream gives you neither

INSTEAD, a size-k heap
    it holds only k items at a time, however long the stream is

WHY IT MATTERS
    "streaming" rules out anything that reorders the input

    this is the constraint that makes the heap the RIGHT answer
    rather than the fallback`,
});
