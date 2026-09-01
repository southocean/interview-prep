/* The front-end domain round. Separate skill from DSA, separate prep. */
window.FRONTEND = {
  note: 'Not every loop has one of these, but web-specialised roles often swap a coding slot for it. Unlike DSA these are things you have genuinely done — the risk is being asked to implement from scratch what you normally import.',
  groups: [
    {
      name: 'Implement-from-scratch classics',
      why: 'The most common front-end round format: "write me X, no libraries". All of these are 10–25 lines and all of them have a trap.',
      items: [
        ['debounce(fn, ms)', 'Trap: preserving `this` and arguments, and whether trailing or leading edge. Say which you are implementing.'],
        ['throttle(fn, ms)', 'Trap: the difference from debounce. Throttle guarantees a rate; debounce waits for quiet.'],
        ['deepClone(obj)', 'Trap: CYCLES. Needs a WeakMap of seen objects. Also Date, Map, Set, Array — structuredClone exists now, say so, then implement anyway.'],
        ['deepEqual(a, b)', 'Trap: NaN !== NaN, null vs undefined, key-count check before recursing.'],
        ['EventEmitter', 'on / off / emit / once. Trap: removing a listener during emit — iterate over a copy.'],
        ['Promise.all polyfill', 'Trap: preserving result ORDER while resolving concurrently, and empty-array resolves immediately.'],
        ['retry(fn, n) with backoff', 'Trap: distinguishing a rejected promise from a thrown sync error; exponential delay with jitter.'],
        ['Concurrency pool (run n at a time)', 'The senior version of Promise.all. Trap: starting the next task the moment ANY finishes, not in batches.'],
        ['memoize(fn)', 'Trap: cache key for multiple/object arguments. JSON.stringify is the honest cheap answer — say its limits.'],
        ['curry(fn)', 'Trap: using fn.length to know when to invoke.'],
        ['Array.prototype.map / reduce / flat polyfills', 'Trap: sparse arrays, the thisArg parameter, and flat with a depth argument.'],
      ],
    },
    {
      name: 'DOM and browser',
      why: 'Where your Meet-cloning work is directly bankable — you have measured this rather than read about it.',
      items: [
        ['Event bubbling, capturing, delegation', 'You have this cold already. See INTERVIEW-PREP.md in the callback repo.'],
        ['Traverse and render a tree structure', 'The DSA tree round in front-end clothing — render nested comments, a file explorer, a menu.'],
        ['Virtual DOM diff, simplified', 'Compare two trees, emit patches. Keys and why they matter is the follow-up.'],
        ['Live vs static NodeLists', 'getElementsByClassName is live, querySelectorAll is not. Mutating while iterating a live list is a classic bug.'],
        ['Reflow vs repaint', 'Which property reads force synchronous layout (offsetHeight, getBoundingClientRect) and why batching matters.'],
        ['requestAnimationFrame vs setTimeout', 'Frame alignment, and why rAF is right for animation and wrong for data polling.'],
        ['Event loop: macrotasks vs microtasks', 'Given setTimeout, a Promise.then and synchronous code, state the output order. Extremely common.'],
      ],
    },
    {
      name: 'Language depth',
      why: 'The "do you actually know JS" screen. Fast to review, embarrassing to fumble.',
      items: [
        ['`this` binding rules', 'Call-site rules, arrow functions capturing lexically, and losing `this` when passing a method as a callback.'],
        ['Closures', 'The loop-variable classic (var vs let), and closures as private state.'],
        ['Prototype chain', 'How lookup walks it, class syntax as sugar, and what `new` actually does.'],
        ['Hoisting and TDZ', 'var vs let vs const, function vs class declarations.'],
        ['== vs ===, and coercion', 'Know the handful of rules rather than "never use =="'],
        ['Modules', 'ESM vs CommonJS, static analysis and tree-shaking, why import is hoisted.'],
      ],
    },
    {
      name: 'Performance and accessibility',
      why: 'The senior differentiator. Juniors talk about frameworks; seniors talk about measurement.',
      items: [
        ['Core Web Vitals', 'LCP, INP (which replaced FID), CLS — what each measures and one concrete way to improve each.'],
        ['Bundle strategy', 'Code splitting, route-level chunks, tree shaking, cache-busting by content hash. Your callback repo enforces a gzip budget in CI — a strong, specific story.'],
        ['Rendering cost', 'Long tasks, main-thread blocking, virtualising long lists.'],
        ['Caching', 'Cache-Control, immutable assets with hashed names, service workers at a high level.'],
        ['Keyboard and focus management', 'Focus traps in dialogs, restoring focus on close, visible focus rings. You have implemented this.'],
        ['ARIA basics', 'Roles, aria-label, aria-live, and the rule that native semantics beat ARIA.'],
      ],
    },
    {
      name: 'Component / API design',
      why: 'Sometimes replaces the system-design round for front-end candidates.',
      items: [
        ['Design a reusable component API', 'Controlled vs uncontrolled, composition over configuration, sensible defaults, escape hatches.'],
        ['Design an autocomplete', 'Debounced input, request cancellation, out-of-order responses, keyboard nav, ARIA, caching. Hits DSA (trie) and front-end at once — a very likely question for you.'],
        ['Design an infinite list', 'Windowing, scroll anchoring, loading states, restoring position.'],
        ['Design a design system', 'Tokens, theming, dark mode. Your DESIGN-PRINCIPLES.md is exactly this artefact.'],
      ],
    },
  ],
};
