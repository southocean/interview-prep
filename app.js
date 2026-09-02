/* Router, sidebar, and page renderers.
 *
 * No modules and no build step, so this runs straight off the filesystem.
 *
 * CROSS-LINKS ARE DERIVED, NOT DECLARED TWICE. Patterns name the structures they
 * use; problems name their pattern. Everything else -- which patterns touch a
 * structure, which problems belong to a pattern -- is inverted here at load, so
 * the two directions cannot drift apart as content is added.
 */
(function () {
  'use strict';

  var main = document.getElementById('main');
  var side = document.getElementById('side');

  // ----------------------------------------------------------------- helpers
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function frag(kids) {
    var f = document.createDocumentFragment();
    (kids || []).forEach(function (c) { if (c) f.appendChild(c); });
    return f;
  }
  function a(href, text, cls) { return el('a', { href: href, class: cls || '', text: text }); }
  function pre(codeText) {
    return el('pre', {}, [el('code', { text: codeText })]);
  }
  function rowsOf(pairs) {
    return el('div', { class: 'rows' }, pairs.filter(Boolean).map(function (p) {
      return el('div', { class: 'row' + (p[2] ? ' ' + p[2] : '') }, [
        el('b', { text: p[0] }), el('span', { text: p[1] }),
      ]);
    }));
  }
  function quizOf(pairs) {
    if (!pairs || !pairs.length) return null;
    return frag([el('h2', { class: 'sec', text: 'Self-test' })].concat(pairs.map(function (qa) {
      return el('details', { class: 'qa' }, [
        el('summary', { text: qa[0] }), el('p', { text: qa[1] }),
      ]);
    })));
  }
  function chipsOf(items) {
    if (!items.length) return el('p', { class: 'meta', text: 'None yet.' });
    return el('div', { class: 'chips' }, items);
  }

  // --------------------------------------------------------------- linkifier
  /*
   * Turns technique names in prose into links to the page that explains them,
   * from the vocabulary in data/lexicon.js. Applied only to the index-like
   * tables -- the constraint lookup, the study tiers, the cue-to-reflex table --
   * because those are the places you are scanning for "which technique is this",
   * and because prose linked on every other word reads worse, not better.
   *
   * Alternatives are sorted longest-first so "binary search on the answer" wins
   * over "binary search". Matching is case-insensitive but the original casing
   * is preserved in the output.
   */
  var LEX = {}, LEX_RE = null;
  (function buildLexicon() {
    var lex = window.LEXICON || {};
    var phrases = Object.keys(lex);
    phrases.forEach(function (ph) {
      var v = lex[ph], bits = v.split(':');
      var href = bits[0] === 'pat' ? '#/dsa/pattern/' + bits[1]
        : bits[0] === 'tech' ? '#/dsa/technique/' + bits[1]
        : '#/dsa/structure/' + bits[1];
      LEX[ph.toLowerCase()] = href;
    });
    var keys = Object.keys(LEX).sort(function (x, y) { return y.length - x.length; });
    if (!keys.length) return;
    var esc = keys.map(function (k) { return k.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&'); });
    LEX_RE = new RegExp('\\b(' + esc.join('|') + ')\\b', 'gi');
  })();

  /** Returns a fragment with known technique names wrapped in links. */
  function linkify(text) {
    var out = document.createDocumentFragment();
    if (!LEX_RE) { out.appendChild(document.createTextNode(text)); return out; }
    LEX_RE.lastIndex = 0;
    var last = 0, m;
    while ((m = LEX_RE.exec(text)) !== null) {
      var href = LEX[m[0].toLowerCase()];
      if (!href) continue;
      if (m.index > last) out.appendChild(document.createTextNode(text.slice(last, m.index)));
      out.appendChild(a(href, m[0], 'xref'));
      last = m.index + m[0].length;
    }
    out.appendChild(document.createTextNode(text.slice(last)));
    return out;
  }

  /** A <td>/<span> whose text has been linkified. */
  function linked(tag, cls, text) {
    var n = el(tag, cls ? { class: cls } : {});
    n.appendChild(linkify(text));
    return n;
  }

  // ------------------------------------------------------- indexes (derived)
  var P = window.PATTERNS.items;
  var S = window.STRUCTURES.items;
  var PR = window.PROBLEMS.items;
  var T = (window.TECHNIQUES || { items: [] }).items;
  var REFS = window.REFS || {};
  var ANIMS = window.ANIMS || {};
  var PSEUDO = window.PSEUDO || {};

  var patById = {}, strById = {}, techById = {};
  P.forEach(function (p) { patById[p.id] = p; });
  S.forEach(function (s) { strById[s.id] = s; });
  T.forEach(function (t) { techById[t.id] = t; });

  /* One resolver for every kind of page, so a [kind, id] pair from any data
     file becomes a link without the caller knowing which collection it is in. */
  function ref(kind, id) {
    if (kind === 'pat') return patById[id] && { href: '#/dsa/pattern/' + id, name: patById[id].name, kind: 'Pattern' };
    if (kind === 'str') return strById[id] && { href: '#/dsa/structure/' + id, name: strById[id].name, kind: 'Structure' };
    if (kind === 'tech') return techById[id] && { href: '#/dsa/technique/' + id, name: techById[id].name, kind: 'Technique' };
    return null;
  }
  function refChip(pair, cls) {
    var r = ref(pair[0], pair[1]);
    return r ? a(r.href, r.name, cls || 'chip') : null;
  }

  /* Family is declared downward only (a technique names its parent); the list
     of children is inverted here, same rule as everywhere else. */
  var childrenOf = {};
  T.forEach(function (t) {
    if (!t.family) return;
    var key = t.family[0] + ':' + t.family[1];
    (childrenOf[key] = childrenOf[key] || []).push(t);
  });

  var probsByPat = {}, probsByStr = {}, patsByStr = {}, probsByTech = {};
  P.forEach(function (p) {
    (p.structures || []).forEach(function (sid) {
      (patsByStr[sid] = patsByStr[sid] || []).push(p);
    });
  });
  PR.forEach(function (pr, i) {
    pr.n = i + 1;
    (pr.pat || []).forEach(function (pid) {
      (probsByPat[pid] = probsByPat[pid] || []).push(pr);
      // A problem also belongs to the structures its pattern uses.
      ((patById[pid] || {}).structures || []).forEach(function (sid) {
        probsByStr[sid] = probsByStr[sid] || [];
        if (probsByStr[sid].indexOf(pr) === -1) probsByStr[sid].push(pr);
      });
    });
    (pr.str || []).forEach(function (sid) {
      probsByStr[sid] = probsByStr[sid] || [];
      if (probsByStr[sid].indexOf(pr) === -1) probsByStr[sid].push(pr);
    });
    (pr.tech || []).forEach(function (tid) {
      (probsByTech[tid] = probsByTech[tid] || []).push(pr);
    });
  });

  var patsSorted = P.slice().sort(function (x, y) { return x.rank - y.rank; });
  var strsSorted = S.slice().sort(function (x, y) { return x.rank - y.rank; });
  var techSorted = T.slice().sort(function (x, y) { return x.rank - y.rank; });

  // -------------------------------------------------------- animation player
  /*
   * One generic player for every animation: a row of cells, named pointers
   * underneath, and a frame list. Starts PAUSED -- an animation that begins
   * moving while you are still reading the code above it is an interruption,
   * not an explanation -- and steps at a deliberately slow 1.4s so the note has
   * time to be read.
   */
  function animBlock(id, inline) {
    var spec = ANIMS[id];
    if (!spec) return null;

    var i = 0, timer = null;
    var cells = spec.cells.map(function (v) {
      return el('div', { class: 'cell' }, [el('span', { text: String(v) })]);
    });
    var slots = spec.cells.map(function () { return el('div', { class: 'slot' }); });

    // Optional second row, for animations that walk two sequences at once.
    var cells2 = (spec.cells2 || []).map(function (v) {
      return el('div', { class: 'cell' }, [el('span', { text: String(v) })]);
    });
    var slots2 = (spec.cells2 || []).map(function () { return el('div', { class: 'slot' }); });

    var stat = el('div', { class: 'anim-stat' });
    var note = el('p', { class: 'anim-note' });
    var counter = el('span', { class: 'anim-count' });

    function paint() {
      var f = spec.frames[i];
      cells.forEach(function (c, k) {
        var inRange = f.range && k >= f.range[0] && k <= f.range[1];
        c.classList.toggle('in', !!inRange);
        c.classList.toggle('mark', !!(f.mark && f.mark.indexOf(k) !== -1));
      });
      slots.forEach(function (s, k) {
        var names = Object.keys(f.ptrs || {}).filter(function (n) { return f.ptrs[n] === k; });
        s.textContent = names.join(' ');
        s.classList.toggle('on', names.length > 0);
      });
      cells2.forEach(function (c, k) {
        var inRange = f.range2 && k >= f.range2[0] && k <= f.range2[1];
        c.classList.toggle('in', !!inRange);
        c.classList.toggle('mark', !!(f.mark2 && f.mark2.indexOf(k) !== -1));
      });
      slots2.forEach(function (s2, k) {
        var names = Object.keys(f.ptrs2 || {}).filter(function (n) { return f.ptrs2[n] === k; });
        s2.textContent = names.join(' ');
        s2.classList.toggle('on', names.length > 0);
      });
      stat.textContent = f.stat || '';
      note.textContent = f.note || '';
      counter.textContent = (i + 1) + ' / ' + spec.frames.length;
      playBtn.textContent = timer ? 'Pause' : (i === spec.frames.length - 1 ? 'Replay' : 'Play');
    }
    function go(n) {
      i = Math.max(0, Math.min(spec.frames.length - 1, n));
      paint();
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } paint(); }
    function play() {
      if (timer) return stop();
      if (i === spec.frames.length - 1) i = -1;
      timer = setInterval(function () {
        if (i >= spec.frames.length - 1) return stop();
        go(i + 1);
      }, 1400);
      go(i + 1);
    }

    var backBtn = el('button', { class: 'ghost', type: 'button', 'aria-label': 'Previous step', text: '‹' });
    var playBtn = el('button', { class: 'ghost', type: 'button', text: 'Play' });
    var nextBtn = el('button', { class: 'ghost', type: 'button', 'aria-label': 'Next step', text: '›' });
    backBtn.addEventListener('click', function () { stop(); go(i - 1); });
    nextBtn.addEventListener('click', function () { stop(); go(i + 1); });
    playBtn.addEventListener('click', play);

    // Leaving the page must not leave an interval running behind it.
    animTimers.push(function () { if (timer) clearInterval(timer); });

    var box = el('div', { class: 'anim' + (inline ? ' anim-inline' : '') }, [
      el('div', { class: 'anim-title', text: spec.title }),
      spec.contrast ? el('div', { class: 'anim-contrast' }, [
        el('b', { text: 'Against the template: ' }),
        document.createTextNode(spec.contrast),
      ]) : null,
      spec.label ? el('div', { class: 'anim-row-label', text: spec.label }) : null,
      el('div', { class: 'anim-cells' }, cells),
      el('div', { class: 'anim-slots' }, slots),
      spec.cells2 ? el('div', { class: 'anim-row-label', text: spec.label2 || '' }) : null,
      spec.cells2 ? el('div', { class: 'anim-cells' }, cells2) : null,
      spec.cells2 ? el('div', { class: 'anim-slots' }, slots2) : null,
      stat,
      note,
      el('div', { class: 'anim-ctl' }, [backBtn, playBtn, nextBtn, counter]),
    ]);
    paint();

    // Inside a deviation card there is already a heading above; a second
    // h2 would break the page's outline.
    if (inline) return box;
    return frag([el('h2', { class: 'sec', text: 'Watch it run' }), box]);
  }
  var animTimers = [];
  function clearAnims() {
    animTimers.forEach(function (f) { f(); });
    animTimers = [];
  }

  // ----------------------------------------------------------- deviations
  /*
   * Deviations as question and answer. Each one is a real question, then the
   * DIFF from the template on this page -- what it already does, what you
   * change, the changed lines only, and why that is correct.
   *
   * The code block being a diff rather than a whole solution is the point:
   * reprinting four full solutions teaches four solutions, whereas showing the
   * two lines that move teaches one solution and three adaptations, which is
   * what an interview actually tests.
   *
   * Prefers DEVIATIONS[id]; falls back to the older inline [name, tell, do]
   * array so a page that has not been migrated still renders.
   */
  function deviationsBlock(id, inline) {
    var qa = (window.DEVIATIONS || {})[id];

    if (!qa) {
      if (!inline || !inline.length) return null;
      return frag([
        el('h2', { class: 'sec', text: 'Deviations' }),
        el('p', { class: 'meta', text: 'Not yet rewritten as question and answer.' }),
        frag(inline.map(function (d) {
          return el('div', { class: 'dev' }, [
            el('h4', { text: d[0] }),
            el('p', { class: 'tell', text: 'Tell: ' + d[1] }),
            el('p', { class: 'do', text: d[2] }),
          ]);
        })),
      ]);
    }

    return frag([
      el('h2', { class: 'sec', text: 'Deviations — ' + qa.length + ' questions on top of the template' }),
      el('p', { class: 'meta', text: 'The template is the textbook version. These are the questions actually asked, each with the diff: what changes, and why that change is correct.' }),
      frag(qa.map(function (d, n) {
        return el('div', { class: 'dev qa-dev' }, [
          el('div', { class: 'dev-q' }, [
            el('span', { class: 'dev-n', text: 'Q' + (n + 1) }),
            el('h4', { text: d.q }),
          ]),
          el('div', { class: 'dev-body' }, [
            // The full statement, so the reader is solving a real problem
            // rather than a one-line hint at one.
            d.problem ? el('p', { class: 'dev-problem', text: d.problem }) : null,
            d.example ? el('pre', { class: 'dev-example' }, [el('code', { text: d.example })]) : null,
            d.reduces ? el('p', { class: 'dev-reduces' }, [
              el('b', { text: 'Reduces to: ' }), document.createTextNode(d.reduces),
            ]) : null,
            el('p', { class: 'dev-base' }, [el('b', { text: 'Template already does: ' }), document.createTextNode(d.base)]),
            el('p', { class: 'dev-change' }, [el('b', { text: 'You change: ' }), document.createTextNode(d.change)]),
            shapeCount(d.code) > 1 ? el('p', { class: 'meta', text: 'Two shapes below, and they are ALTERNATIVES -- pick the one whose conditions your problem meets. Neither calls the other.' }) : null,
            codeBlock(id + '/' + n, d.code),
            animBlock(id + '/' + n, true),
            el('p', { class: 'dev-why' }, [el('b', { text: 'Why: ' }), document.createTextNode(d.why)]),
          ]),
        ]);
      })),
    ]);
  }

  // ------------------------------------------------------------ pseudocode
  /*
   * The framework in words: control words in caps, no language at all -- the
   * point is that it reads aloud and still makes sense.
   *
   * The two versions OCCUPY THE SAME SPACE, switched by a tab strip, rather
   * than stacking. Two full-height code blocks per section pushed the
   * deviations off the screen, and the whole value of the plain-English version
   * is that you read it INSTEAD of the code, not alongside it.
   *
   * Both are always in the DOM and one is hidden by CSS, so switching is
   * instant, keeps scroll position, and costs no re-render.
   */
  function pseudoWanted() {
    // Default WORDS: only an explicit 'off' opens on the code.
    try { return localStorage.getItem('prep-pseudo') !== 'off'; } catch (e) { return true; }
  }

  /** A code block, paired with its plain-English version where one exists. */
  /**
   * How many independent SHAPES a template holds. A pattern whose block has
   * several is a gallery of alternatives, not one program, and the page has to
   * say so -- readers otherwise hunt for the call that joins them.
   */
  function shapeCount(codeText) {
    return (String(codeText || "").match(/^# ---- SHAPE /gm) || []).length;
  }

  function codeBlock(id, codeText) {
    var text = PSEUDO[id];
    if (!text) return pre(codeText);

    function tab(which, label) {
      return el('button', {
        type: 'button', class: 'dual-tab', 'data-w': which,
        role: 'tab', 'aria-selected': 'false',
      }, [el('span', { text: label })]);
    }
    var box = el('div', { class: 'dual', 'data-show': pseudoWanted() ? 'words' : 'code' }, [
      el('div', { class: 'dual-tabs', role: 'tablist' }, [
        tab('words', 'In words'), tab('code', 'Code'),
      ]),
      el('pre', { class: 'dual-words' }, [el('code', { text: text })]),
      el('pre', { class: 'dual-code' }, [el('code', { text: codeText })]),
    ]);
    markTabs(box);
    return box;
  }

  /** Keeps the tab strip's aria state in step with the container. */
  function markTabs(box) {
    var show = box.getAttribute('data-show');
    var tabs = box.querySelectorAll('.dual-tab');
    Array.prototype.forEach.call(tabs, function (t) {
      t.setAttribute('aria-selected', t.dataset.w === show ? 'true' : 'false');
    });
  }

  // -------------------------------------------------------- worked example
  /*
   * The concrete problem, reasoned through, placed BEFORE the template. Reading
   * a template you have no problem for is memorisation; reading one after you
   * have watched it solve something is understanding.
   */
  function workedBlock(id) {
    var w = (window.WORKED || {})[id];
    if (!w) return null;
    return frag([
      el('h2', { class: 'sec', text: 'Worked example' }),
      el('div', { class: 'worked' }, [
        el('p', { class: 'w-problem', text: w.problem }),
        el('p', { class: 'w-tell' }, [el('b', { text: 'How you know: ' }), document.createTextNode(w.tell)]),
      ]),
      el('ul', { class: 'steps' }, w.walk.map(function (step) {
        return el('li', {}, [el('b', { text: step[0] }), linked('span', '', step[1])]);
      })),
    ]);
  }

  // ------------------------------------------------------------------- refs
  function refsBlock(id) {
    var list = REFS[id];
    if (!list || !list.length) return null;
    return frag([
      el('h2', { class: 'sec', text: 'Further reading' }),
      el('ul', { class: 'refs' }, list.map(function (r) {
        return el('li', {}, [
          el('span', { class: 'ref-kind ' + r[2], text: r[2] === 'viz' ? 'visual' : r[2] }),
          el('a', { href: r[1], target: '_blank', rel: 'noopener noreferrer', text: r[0] }),
        ]);
      })),
    ]);
  }

  // ----------------------------------------------------------------- family
  function familyBlock(kind, id, item) {
    var out = [];
    if (item && item.family) {
      var par = ref(item.family[0], item.family[1]);
      if (par) {
        out.push(el('p', { class: 'family' }, [
          document.createTextNode('A deviation of '),
          a(par.href, par.name),
          document.createTextNode(' — read that first if it is not already familiar.'),
        ]));
      }
    }
    var kids = childrenOf[kind + ':' + id] || [];
    if (kids.length) {
      out.push(el('h2', { class: 'sec', text: 'Specialisations of this' }));
      out.push(chipsOf(kids.map(function (k) {
        return a('#/dsa/technique/' + k.id, k.name, 'chip');
      })));
    }
    return out.length ? frag(out) : null;
  }

  // ------------------------------------------------------------- persistence
  function store(key) {
    var data = {};
    try { data = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) {}
    return {
      get: function (k) { return !!data[k]; },
      // Distinguishes "never chosen" from "chosen false", which the sidebar
      // needs: an unset group falls back to its default, a set one does not.
      has: function (k) { return Object.prototype.hasOwnProperty.call(data, k); },
      set: function (k, v) {
        data[k] = v;
        try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
      },
      count: function () { return Object.keys(data).filter(function (k) { return data[k]; }).length; },
    };
  }
  var reviewed = store('prep-progress');
  var solved = store('prep-problems');
  var sideOpen = store('prep-side');

  // ------------------------------------------------------------------- theme
  (function theme() {
    var btns = Array.prototype.slice.call(document.querySelectorAll('.theme button'));
    function current() {
      try { return localStorage.getItem('prep-theme') || 'auto'; } catch (e) { return 'auto'; }
    }
    function apply(mode) {
      if (mode === 'auto') delete document.documentElement.dataset.theme;
      else document.documentElement.dataset.theme = mode;
      try { localStorage.setItem('prep-theme', mode); } catch (e) {}
      btns.forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.theme === mode ? 'true' : 'false');
      });
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () { apply(b.dataset.theme); });
    });
    apply(current());
  })();

  // --------------------------------------------------------- tab strip wiring
  /*
   * The control lives ON THE BLOCK -- there is no site-wide switch. Nam:
   * "I want the toggler to be on the code itself, so each code block comes with
   * a toggler, pseudo code or regular code." A header button was the wrong
   * shape: which version you want is a per-block decision, and reaching for the
   * top of the page to answer it is friction in the wrong place.
   *
   * A click still records the choice, so blocks rendered LATER open the same
   * way -- otherwise every page would reset you to words and you would flip the
   * same switch on all 47 of them. It changes only the starting state of blocks
   * yet to be built, never a block already on screen.
   *
   * Delegated on #main, so it survives every re-render without a rewire step
   * that a new page renderer could forget.
   */
  main.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('.dual-tab') : null;
    if (!t) return;
    var box = t.closest('.dual');
    box.setAttribute('data-show', t.dataset.w);
    markTabs(box);
    try { localStorage.setItem('prep-pseudo', t.dataset.w === 'words' ? 'on' : 'off'); } catch (e) {}
  });

  // ------------------------------------------------------------------ router
  function parse() {
    var raw = location.hash.replace(/^#\/?/, '');
    var bits = raw.split('/').filter(Boolean);
    return { sec: bits[0] || 'dsa', kind: bits[1] || '', id: bits[2] || '' };
  }

  // ============================================================ DSA section
  var FOUND = [
    { id: 'round', title: 'How a round runs', blurb: 'Five beats, all of them scored.' },
    { id: 'constraints', title: 'Constraint → complexity', blurb: 'The lookup that replaces guessing.' },
    { id: 'tiers', title: 'What to study, in order', blurb: 'Three tiers with honest likelihoods.' },
    { id: 'python', title: 'Python toolkit', blurb: 'The standard library you are allowed.' },
    { id: 'js', title: 'JS / TS toolkit', blurb: 'Gaps and traps for the front-end round.' },
  ];

  function dsaHome() {
    return frag([
      el('h1', { class: 'title', text: 'DSA' }),
      el('p', { class: 'tagline', text: P.length + ' patterns, ' + S.length + ' structures, and the foundations underneath them. Read the foundations once, then live in the patterns — they are ordered so the first eight cover roughly 70% of what you will be asked.' }),

      el('h2', { class: 'sec', text: 'Foundations — read these first' }),
      el('div', { class: 'grid' }, FOUND.map(function (f) {
        return el('a', { class: 'tile', href: '#/dsa/found/' + f.id }, [
          el('b', { text: f.title }), el('span', { text: f.blurb }),
        ]);
      })),

      el('h2', { class: 'sec', text: 'Patterns — ordered by how likely you are to need them' }),
      el('p', { class: 'meta', text: window.PATTERNS.note }),
      el('div', { class: 'grid' }, patsSorted.map(function (p) {
        return el('a', { class: 'tile', href: '#/dsa/pattern/' + p.id }, [
          el('b', { text: p.rank + '. ' + p.name }), el('span', { text: p.signal }),
        ]);
      })),

      el('h2', { class: 'sec', text: 'Structures' }),
      el('p', { class: 'meta', text: window.STRUCTURES.note }),
      el('div', { class: 'grid' }, strsSorted.map(function (s) {
        return el('a', { class: 'tile', href: '#/dsa/structure/' + s.id }, [
          el('b', { text: s.name }), el('span', { text: s.one }),
        ]);
      })),

      el('h2', { class: 'sec', text: 'Techniques' }),
      el('p', { class: 'meta', text: window.TECHNIQUES.note }),
      el('div', { class: 'grid' }, techSorted.map(function (t) {
        return el('a', { class: 'tile', href: '#/dsa/technique/' + t.id }, [
          el('b', { text: t.name }), el('span', { text: t.one }),
        ]);
      })),
    ]);
  }

  function reviewToggle(key, label) {
    var cb = el('input', { type: 'checkbox' });
    cb.checked = reviewed.get(key);
    cb.addEventListener('change', function () {
      reviewed.set(key, cb.checked);
      buildSidebar(parse());
    });
    var lab = el('label', { class: 'solve' }, [cb]);
    lab.appendChild(document.createTextNode(label));
    return lab;
  }

  function probChips(list) {
    return chipsOf((list || []).map(function (pr) {
      return a('#/problems/pattern/' + ((pr.pat || [])[0] || ''), '#' + pr.n + ' ' + pr.t, 'chip plain');
    }));
  }

  function patternPage(id) {
    var p = patById[id];
    if (!p) return notFound();
    var structs = (p.structures || []).map(function (sid) {
      return a('#/dsa/structure/' + sid, (strById[sid] || {}).name || sid, 'chip');
    });
    var also = (p.also || []).filter(function (x) { return patById[x]; }).map(function (x) {
      return a('#/dsa/pattern/' + x, patById[x].name, 'chip');
    });

    return frag([
      el('p', { class: 'crumb' }, [a('#/dsa', 'DSA'), document.createTextNode(' / Patterns')]),
      el('h1', { class: 'title', text: p.name }),
      el('div', { class: 'pill-row' }, [
        el('span', { class: 'tag t' + p.tier, text: 'Tier ' + p.tier }),
        el('span', { class: 'meta', text: 'Rank ' + p.rank + ' of ' + P.length }),
        reviewToggle('pat-' + p.id, 'reviewed'),
      ]),

      rowsOf([
        ['Signal', p.signal],
        ['Idea', p.idea],
        ['Cost', p.cost],
      ]),

      workedBlock(p.id),
      animBlock(p.id),

      el('h2', { class: 'sec', text: shapeCount(p.template) > 1 ? 'Template — ' + shapeCount(p.template) + ' shapes' : 'Template' }),
      shapeCount(p.template) > 1 ? el('p', { class: 'meta', text: 'This pattern carries more than one shape. They are ALTERNATIVES, not steps — no snippet below calls another. Pick the one whose direction of information flow matches your problem.' }) : null,
      codeBlock(p.id, p.template),

      deviationsBlock(p.id, p.deviations),

      el('h2', { class: 'sec', text: 'Common bugs' }),
      el('ul', {}, (p.bugs || []).map(function (b) { return el('li', { text: b }); })),

      el('h2', { class: 'sec', text: 'Structures it uses' }),
      chipsOf(structs),

      el('h2', { class: 'sec', text: 'Related patterns' }),
      chipsOf(also),

      el('h2', { class: 'sec', text: 'Problems on this pattern' }),
      probChips(probsByPat[p.id]),

      familyBlock('pat', p.id, null),
      refsBlock(p.id),
    ]);
  }

  function structurePage(id) {
    var s = strById[id];
    if (!s) return notFound();
    var pats = (patsByStr[id] || []).sort(function (x, y) { return x.rank - y.rank; }).map(function (p) {
      return a('#/dsa/pattern/' + p.id, p.name, 'chip');
    });

    var opsTable = el('table', {}, [el('tr', {}, [
      el('th', { text: 'Operation' }), el('th', { text: 'Cost' }), el('th', { text: 'Note' }),
    ])]);
    s.ops.forEach(function (o) {
      opsTable.appendChild(el('tr', {}, [
        el('td', { text: o[0] }), el('td', { class: 'n', text: o[1] }), el('td', { text: o[2] || '' }),
      ]));
    });

    return frag([
      el('p', { class: 'crumb' }, [a('#/dsa', 'DSA'), document.createTextNode(' / Structures')]),
      el('h1', { class: 'title', text: s.name }),
      el('p', { class: 'tagline', text: s.one }),
      el('div', { class: 'pill-row' }, [
        el('span', { class: 'tag t' + s.tier, text: 'Tier ' + s.tier }),
        reviewToggle('str-' + s.id, 'reviewed'),
      ]),

      el('h2', { class: 'sec', text: 'When to reach for it' }),
      el('p', { text: s.why }),

      el('h2', { class: 'sec', text: 'How it is built' }),
      pre(s.build),

      el('h2', { class: 'sec', text: 'Costs' }),
      opsTable,

      el('h2', { class: 'sec', text: 'Know cold' }),
      el('ul', {}, s.cold.map(function (c) { return el('li', { text: c }); })),

      el('h2', { class: 'sec', text: 'Pitfalls' }),
      el('p', { text: s.pitfalls }),

      el('h2', { class: 'sec', text: 'Patterns built on it' }),
      chipsOf(pats),

      el('h2', { class: 'sec', text: 'Problems that use it' }),
      probChips(probsByStr[id]),

      familyBlock('str', s.id, null),
      animBlock(s.id),
      refsBlock(s.id),
      quizOf(s.quiz),
    ]);
  }

  // ------------------------------------------------------------- techniques
  function techniquePage(id) {
    var t = techById[id];
    if (!t) return notFound();
    var also = (t.also || []).map(function (pair) { return refChip(pair); }).filter(Boolean);

    return frag([
      el('p', { class: 'crumb' }, [a('#/dsa', 'DSA'), document.createTextNode(' / Techniques')]),
      el('h1', { class: 'title', text: t.name }),
      el('p', { class: 'tagline', text: t.one }),

      familyBlock('tech', t.id, t),

      el('h2', { class: 'sec', text: 'What it is' }),
      el('p', { text: t.what }),

      el('h2', { class: 'sec', text: 'When to reach for it' }),
      el('p', { text: t.when }),

      workedBlock(t.id),
      animBlock(t.id),

      el('h2', { class: 'sec', text: 'Code' }),
      codeBlock(t.id, t.code),

      deviationsBlock(t.id, null),

      el('h2', { class: 'sec', text: 'The thing that goes wrong' }),
      el('p', { class: 'gotcha', text: t.gotcha }),

      el('h2', { class: 'sec', text: 'Related' }),
      chipsOf(also),

      el('h2', { class: 'sec', text: 'Problems that touch it' }),
      probChips(probsByTech[t.id]),

      refsBlock(t.id),
    ]);
  }

  // ------------------------------------------------------- the whole index
  function indexPage() {
    function group(title, blurb, items, hrefFor, extra) {
      var sorted = items.slice().sort(function (x, y) { return x.name.localeCompare(y.name); });
      return frag([
        el('h2', { class: 'sec', text: title + ' — ' + items.length }),
        el('p', { class: 'meta', text: blurb }),
        el('div', { class: 'rows' }, sorted.map(function (it) {
          return el('div', { class: 'row' }, [
            el('b', {}, [a(hrefFor(it), it.name)]),
            el('span', { text: extra(it) }),
          ]);
        })),
      ]);
    }

    return frag([
      el('h1', { class: 'title', text: 'Index' }),
      el('p', { class: 'tagline', text: 'Everything on the site with a page of its own, in one list. ' +
        P.length + ' patterns, ' + S.length + ' structures and ' + T.length + ' techniques — ' +
        (P.length + S.length + T.length) + ' pages. Alphabetical here rather than ranked, because this is for looking something up, not for deciding what to study next.' }),

      group('Patterns', 'How you recognise a problem. Each page carries the signal, a template, and the deviations interviewers actually ask.',
        P, function (x) { return '#/dsa/pattern/' + x.id; }, function (x) { return x.signal; }),

      group('Structures', 'What the data sits in. Each page carries how it is built, a costs table, and what to know cold.',
        S, function (x) { return '#/dsa/structure/' + x.id; }, function (x) { return x.one; }),

      group('Techniques', 'The moves you make once you have recognised the problem. Smaller than a pattern, and often the whole difference between working and fast enough.',
        T, function (x) { return '#/dsa/technique/' + x.id; }, function (x) { return x.one; }),
    ]);
  }

  function foundationPage(id) {
    var B = window.BASE, T = window.TIERS;
    var head = function (title) {
      return frag([
        el('p', { class: 'crumb' }, [a('#/dsa', 'DSA'), document.createTextNode(' / Foundations')]),
        el('h1', { class: 'title', text: title }),
      ]);
    };

    if (id === 'round') {
      return frag([head(B.loop.title), el('p', { class: 'tagline', text: B.loop.note }),
        el('ul', { class: 'steps' }, B.loop.steps.map(function (s) {
          return el('li', {}, [el('b', { text: s[0] }), el('span', { text: s[1] })]);
        }))]);
    }
    if (id === 'constraints') {
      var t = el('table', {}, [el('tr', {}, [
        el('th', { text: 'Input size' }), el('th', { text: 'Target' }), el('th', { text: 'What it means' }),
      ])]);
      B.constraints.rows.forEach(function (r) {
        t.appendChild(el('tr', {}, [
          el('td', { class: 'n', text: r[0] }), el('td', { class: 'k', text: r[1] }), linked('td', '', r[2]),
        ]));
      });
      return frag([head(B.constraints.title), el('p', { class: 'tagline', text: B.constraints.note }), t]);
    }
    if (id === 'python' || id === 'js') {
      var kit = id === 'python' ? B.python : B.js;
      var kt = el('table', {});
      kit.rows.forEach(function (r) {
        kt.appendChild(el('tr', {}, [el('td', { class: 'k', text: r[0] }), el('td', { text: r[1] })]));
      });
      return frag([head(kit.title), el('p', { class: 'tagline', text: kit.note }), kt]);
    }
    if (id === 'tiers') {
      return frag([head('What to study, in order'), el('p', { class: 'tagline', text: T.note }),
        frag(T.tiers.map(function (tier) {
          return frag([
            el('h2', { class: 'sec', text: tier.name + ' — ' + tier.odds }),
            el('div', { class: 'rows' }, tier.topics.map(function (x) {
              return el('div', { class: 'row' }, [linked('b', '', x[0]), linked('span', '', x[1])]);
            })),
          ]);
        }))]);
    }
    return notFound();
  }

  // ======================================================= reflexes section
  var REF_PAGES = [
    { id: 'cues', get: function () { return window.REFLEXES.cues; } },
    { id: 'triage', get: function () { return window.REFLEXES.triage; } },
    { id: 'moves', get: function () { return window.REFLEXES.moves; } },
    { id: 'translate', get: function () { return window.REFLEXES.translate; } },
    { id: 'learning', get: function () { return window.REFLEXES.learning; } },
  ];

  function reflexesHome() {
    return frag([
      el('h1', { class: 'title', text: 'Reflexes' }),
      el('p', { class: 'tagline', text: window.REFLEXES.note }),
      el('div', { class: 'grid' }, REF_PAGES.map(function (r) {
        var d = r.get();
        return el('a', { class: 'tile', href: '#/reflexes/' + r.id }, [
          el('b', { text: d.title }), el('span', { text: d.note }),
        ]);
      })),
    ]);
  }

  function reflexPage(id) {
    var R = window.REFLEXES;
    var head = function (title, note) {
      return frag([
        el('p', { class: 'crumb' }, [a('#/reflexes', 'Reflexes')]),
        el('h1', { class: 'title', text: title }),
        el('p', { class: 'tagline', text: note }),
      ]);
    };

    if (id === 'cues') {
      var t = el('table', {}, [el('tr', {}, [el('th', { text: 'Cue' }), el('th', { text: 'Reach for' })])]);
      R.cues.rows.forEach(function (r) {
        t.appendChild(el('tr', {}, [el('td', { class: 'cue', text: r[0] }), linked('td', '', r[1])]));
      });
      return frag([head(R.cues.title, R.cues.note), t]);
    }
    if (id === 'triage') {
      return frag([head(R.triage.title, R.triage.note),
        el('ul', { class: 'steps' }, R.triage.steps.map(function (s) {
          return el('li', {}, [el('b', { text: s[0] }), el('span', { text: s[1] })]);
        }))]);
    }
    if (id === 'moves') {
      return frag([head(R.moves.title, R.moves.note),
        frag(R.moves.items.map(function (m) {
          return el('div', { class: 'dev' }, [
            el('h4', { text: m[0] }), el('p', { class: 'do', text: m[1] }),
          ]);
        }))]);
    }
    if (id === 'translate') {
      return frag([head(R.translate.title, R.translate.note),
        el('ul', { class: 'steps' }, R.translate.steps.map(function (s) {
          return el('li', {}, [el('b', { text: s[0] }), el('span', { text: s[1] })]);
        })),
        el('h2', { class: 'sec', text: 'The six translation bugs' }),
        rowsOf(R.translate.bugs)]);
    }
    if (id === 'learning') {
      var lt = el('table', {});
      R.learning.rows.forEach(function (r) {
        lt.appendChild(el('tr', {}, [el('td', { class: 'k', text: r[0] }), el('td', { text: r[1] })]));
      });
      return frag([head(R.learning.title, R.learning.note), lt]);
    }
    return notFound();
  }

  // ======================================================= problems section
  function problemsPage(filterPat) {
    var list = filterPat ? (probsByPat[filterPat] || []) : PR;
    var out = [];

    out.push(el('h1', { class: 'title', text: filterPat ? 'Problems — ' + patById[filterPat].name : 'Problems' }));

    if (filterPat) {
      out.push(el('p', { class: 'crumb' }, [
        a('#/problems', 'All problems'),
        document.createTextNode(' / '),
        a('#/dsa/pattern/' + filterPat, patById[filterPat].name + ' pattern'),
      ]));
    } else {
      out.push(el('p', { class: 'tagline', text: 'Sixty-one problems, deliberately shuffled. Grouping them by pattern would train execution while destroying the thing being trained — recognition.' }));
      out.push(el('h2', { class: 'sec', text: window.PROBLEMS.howto.title }));
      out.push(el('ul', { class: 'steps' }, window.PROBLEMS.howto.steps.map(function (s, i) {
        return el('li', {}, [el('b', { text: String(i + 1) + '.' }), el('span', { text: s })]);
      })));
      out.push(el('p', { class: 'meta', text: window.PROBLEMS.howto.note }));
      out.push(el('h2', { class: 'sec', text: 'The list' }));
    }

    var count = el('p', { class: 'count' });
    function tally() {
      var n = list.filter(function (pr) { return solved.get(pr.n); }).length;
      count.textContent = n + ' of ' + list.length + ' marked solved.';
    }
    out.push(count);

    list.forEach(function (pr) {
      var card = el('div', { class: 'prob' });
      card.appendChild(el('div', { class: 'prob-top' }, [
        el('span', { class: 'num', text: '#' + pr.n }),
        el('h3', { text: pr.t }),
      ]));
      card.appendChild(el('p', { class: 'ask', text: pr.ask }));

      var links = (pr.pat || []).map(function (pid) {
        return a('#/dsa/pattern/' + pid, patById[pid].name, 'chip');
      }).concat((pr.str || []).map(function (sid) {
        return a('#/dsa/structure/' + sid, (strById[sid] || {}).name || sid, 'chip plain');
      }));

      var answer = el('div', { class: 'answer' }, [
        rowsOf([['Difficulty', pr.d], ['Key insight', pr.i]]),
        el('h2', { class: 'sec', text: 'Read next' }),
        chipsOf(links),
      ]);

      function show(on) { answer.classList.toggle('open', on); }

      var cb = el('input', { type: 'checkbox' });
      cb.checked = solved.get(pr.n);
      var lab = el('label', { class: 'solve' }, [cb]);
      lab.appendChild(document.createTextNode('solved'));

      var rev = el('button', { class: 'ghost', type: 'button', text: 'Stuck — reveal' });

      cb.addEventListener('change', function () {
        solved.set(pr.n, cb.checked);
        card.classList.toggle('is-solved', cb.checked);
        show(cb.checked);
        rev.textContent = cb.checked ? 'Hide' : 'Stuck — reveal';
        tally();
        buildSidebar(parse());
      });
      rev.addEventListener('click', function () {
        var on = !answer.classList.contains('open');
        show(on);
        rev.textContent = on ? 'Hide' : 'Stuck — reveal';
      });

      card.appendChild(el('div', { class: 'acts' }, [lab, rev]));
      card.appendChild(answer);
      if (solved.get(pr.n)) { card.classList.add('is-solved'); show(true); rev.textContent = 'Hide'; }
      out.push(card);
    });

    tally();
    return frag(out);
  }

  // ====================================================== front-end section
  function frontendHome() {
    return frag([
      el('h1', { class: 'title', text: 'Front-end round' }),
      el('p', { class: 'tagline', text: window.FRONTEND.note }),
      el('div', { class: 'grid' }, window.FRONTEND.groups.map(function (g, i) {
        return el('a', { class: 'tile', href: '#/frontend/g/' + i }, [
          el('b', { text: g.name }), el('span', { text: g.why }),
        ]);
      })),
    ]);
  }

  function frontendGroup(i) {
    var g = window.FRONTEND.groups[Number(i)];
    if (!g) return notFound();
    return frag([
      el('p', { class: 'crumb' }, [a('#/frontend', 'Front-end round')]),
      el('h1', { class: 'title', text: g.name }),
      el('p', { class: 'tagline', text: g.why }),
      rowsOf(g.items),
    ]);
  }

  // ---------------------------------------------------------------- generic
  function todo(title, body) {
    return el('div', { class: 'todo' }, [el('h3', { text: title }), el('p', { text: body })]);
  }
  function notFound() {
    return frag([
      el('h1', { class: 'title', text: 'Nothing here' }),
      el('p', {}, [document.createTextNode('That link does not resolve. '), a('#/dsa', 'Back to DSA')]),
    ]);
  }

  // ---------------------------------------------------------------- sidebar
  /**
   * A collapsible sidebar group.
   *
   * Open state resolves in three steps, in this order:
   *   1. If the current page is inside the group, it is FORCED open. Otherwise a
   *      cross-link from a pattern page to a structure page would land you in a
   *      collapsed section with no visible context.
   *   2. Otherwise, whatever the user last chose for this group.
   *   3. Otherwise the default -- Foundations open, the long lists shut.
   *
   * A forced-open group is not persisted, so navigating somewhere never
   * silently rewrites a preference the user set deliberately.
   */
  function sGroup(key, title, links, defaultOpen) {
    var hasActive = links.some(function (l) { return l.getAttribute('aria-current'); });
    var open = hasActive ? true
      : sideOpen.has(key) ? sideOpen.get(key)
      : defaultOpen !== false;

    var d = el('details', { class: 's-group' });
    if (open) d.setAttribute('open', '');
    d.dataset.key = key;
    d.dataset.forced = hasActive ? '1' : '';

    d.appendChild(el('summary', { class: 's-title' }, [
      el('span', { class: 's-name', text: title }),
      el('span', { class: 's-count', text: String(links.length) }),
    ]));
    links.forEach(function (l) { d.appendChild(l); });
    return d;
  }

  /* `toggle` is dispatched ASYNCHRONOUSLY, so setting `open` before the listener
     exists still delivers an event afterwards. Comparing against the state we
     rendered tells the two apart exactly: a real user toggle always differs from
     it, the spurious initial event never does. Without this, merely visiting a
     page rewrites the preference for every group on it. */
  function wireGroups() {
    side.querySelectorAll('details.s-group').forEach(function (d) {
      d.dataset.was = d.open ? '1' : '0';
      d.addEventListener('toggle', function () {
        var now = d.open ? '1' : '0';
        if (now === d.dataset.was) return;      // the initial echo, not a click
        d.dataset.was = now;
        if (d.dataset.forced === '1' && d.open) return;  // opened for you, not by you
        sideOpen.set(d.dataset.key, d.open);
      });
    });
  }
  function sLink(href, label, opts) {
    opts = opts || {};
    var kids = [];
    if (opts.n) kids.push(el('span', { class: 'n', text: opts.n }));
    kids.push(el('span', { text: label }));
    var link = el('a', { href: href, class: 's-link' + (opts.done ? ' is-done' : '') }, kids);
    if (opts.active) link.setAttribute('aria-current', 'page');
    return link;
  }

  function patLink(p, r) {
    return sLink('#/dsa/pattern/' + p.id, p.name, {
      n: String(p.rank), active: r.kind === 'pattern' && r.id === p.id, done: reviewed.get('pat-' + p.id),
    });
  }

  function buildSidebar(r) {
    side.innerHTML = '';

    if (r.sec === 'dsa') {
      /* Patterns split by tier rather than listed as one run of 22. The split
         is the importance signal: the first group is what you will actually be
         asked, and it stays a readable length when open. */
      var t1 = patsSorted.filter(function (p) { return p.tier === 1; });
      var t23 = patsSorted.filter(function (p) { return p.tier !== 1; });

      side.appendChild(sGroup('dsa-found', 'Foundations',
        FOUND.map(function (f) {
          return sLink('#/dsa/found/' + f.id, f.title, { active: r.kind === 'found' && r.id === f.id });
        }), true));

      side.appendChild(sGroup('dsa-pat1', 'Patterns · expect these',
        t1.map(function (p) { return patLink(p, r); }), false));

      side.appendChild(sGroup('dsa-pat2', 'Patterns · likely and rarer',
        t23.map(function (p) { return patLink(p, r); }), false));

      side.appendChild(sGroup('dsa-tech', 'Techniques',
        techSorted.map(function (t) {
          return sLink('#/dsa/technique/' + t.id, t.name, {
            active: r.kind === 'technique' && r.id === t.id, done: reviewed.get('tech-' + t.id),
          });
        }), false));

      side.appendChild(sGroup('dsa-str', 'Structures',
        strsSorted.map(function (s) {
          return sLink('#/dsa/structure/' + s.id, s.name, {
            active: r.kind === 'structure' && r.id === s.id, done: reviewed.get('str-' + s.id),
          });
        }), false));

    } else if (r.sec === 'reflexes') {
      side.appendChild(sGroup('ref', 'Reflexes', REF_PAGES.map(function (x) {
        return sLink('#/reflexes/' + x.id, x.get().title, { active: r.kind === x.id });
      }), true));

    } else if (r.sec === 'problems') {
      side.appendChild(sGroup('prob-all', 'All problems', [
        sLink('#/problems', 'The full list', { active: !r.kind, n: String(solved.count()) }),
      ], true));
      side.appendChild(sGroup('prob-pat', 'Drill one pattern', patsSorted.filter(function (p) {
        return (probsByPat[p.id] || []).length;
      }).map(function (p) {
        var mine = probsByPat[p.id];
        var got = mine.filter(function (pr) { return solved.get(pr.n); }).length;
        return sLink('#/problems/pattern/' + p.id, p.name, {
          n: got + '/' + mine.length, active: r.kind === 'pattern' && r.id === p.id,
        });
      }), false));

    } else if (r.sec === 'index') {
      side.appendChild(sGroup('idx', 'Everything', [
        sLink('#/index', 'The full index', { active: true, n: String(P.length + S.length + T.length) }),
      ], true));

    } else if (r.sec === 'frontend') {
      side.appendChild(sGroup('fe', 'Front-end round', window.FRONTEND.groups.map(function (g, i) {
        return sLink('#/frontend/g/' + i, g.name, { active: r.kind === 'g' && r.id === String(i) });
      }), true));

    } else {
      side.appendChild(sGroup('todo', 'Not written yet', [
        sLink('#/' + r.sec, r.sec === 'design' ? 'System design' : 'Googleyness', { active: true }),
      ], true));
    }

    wireGroups();
  }

  // ------------------------------------------------------------------ render
  function render() {
    var r = parse();

    document.querySelectorAll('.nav-a').forEach(function (n) {
      if (n.dataset.sec === r.sec) n.setAttribute('aria-current', 'page');
      else n.removeAttribute('aria-current');
    });

    clearAnims();
    buildSidebar(r);
    main.innerHTML = '';

    var page;
    if (r.sec === 'dsa') {
      page = r.kind === 'pattern' ? patternPage(r.id)
        : r.kind === 'structure' ? structurePage(r.id)
        : r.kind === 'technique' ? techniquePage(r.id)
        : r.kind === 'found' ? foundationPage(r.id)
        : dsaHome();
    } else if (r.sec === 'reflexes') {
      page = r.kind ? reflexPage(r.kind) : reflexesHome();
    } else if (r.sec === 'problems') {
      page = problemsPage(r.kind === 'pattern' && patById[r.id] ? r.id : null);
    } else if (r.sec === 'frontend') {
      page = r.kind === 'g' ? frontendGroup(r.id) : frontendHome();
    } else if (r.sec === 'index') {
      page = indexPage();
    } else if (r.sec === 'design') {
      page = frag([el('h1', { class: 'title', text: 'System design' }),
        todo('Not written yet', 'Planned: the round format, the client-side to distributed gap, a reusable answer skeleton, and back-of-envelope numbers worth memorising. The real-time multiplayer client is the raw material.')]);
    } else if (r.sec === 'behaviour') {
      page = frag([el('h1', { class: 'title', text: 'Googleyness and Leadership' }),
        todo('Not written yet', 'Planned: the attributes actually scored, a bank of ten to twelve STAR stories from real history, and the level/scope framing for a senior packet.')]);
    } else {
      page = notFound();
    }

    main.appendChild(page);
    applyFilter();
    window.scrollTo(0, 0);
  }

  // ------------------------------------------------------------------ filter
  var q = document.getElementById('q');
  function applyFilter() {
    var term = (q.value || '').trim().toLowerCase();
    // `.rows .row` included so the filter also bites on the tier lists and the
    // signal/idea/cost blocks, which were previously untouched by it.
    var blocks = main.querySelectorAll('.tile, .prob, .dev, .card, .rows .row, .steps > li');
    blocks.forEach(function (b) {
      b.classList.toggle('hidden', !!term && b.textContent.toLowerCase().indexOf(term) === -1);
    });
    main.querySelectorAll('table tr').forEach(function (tr, i) {
      if (i === 0 && tr.querySelector('th')) return;
      tr.classList.toggle('hidden', !!term && tr.textContent.toLowerCase().indexOf(term) === -1);
    });
  }
  q.addEventListener('input', applyFilter);

  window.addEventListener('hashchange', render);
  if (!location.hash) location.replace('#/dsa');
  render();
})();
