/* Tabs, rendering, filter, review mode, progress. No modules, so this opens
   straight off the filesystem with no server. */
(function () {
  'use strict';

  var main = document.getElementById('main');
  var TABS = ['dsa', 'reflexes', 'problems', 'frontend', 'design', 'behaviour'];

  // ------------------------------------------------------------ tiny helpers
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'html') n.innerHTML = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function rows(pairs, cls) {
    return el('div', { class: cls || '' }, pairs.map(function (p) {
      return el('div', { class: 'row' + (p[2] ? ' ' + p[2] : '') }, [
        el('b', { text: p[0] }), el('span', { text: p[1] }),
      ]);
    }));
  }

  // -------------------------------------------------------------- progress
  var KEY = 'prep-progress';
  var done = {};
  try { done = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { done = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {} }

  function doneBox(id, host) {
    var cb = el('input', { type: 'checkbox' });
    cb.checked = !!done[id];
    if (cb.checked) host.classList.add('is-done');
    cb.addEventListener('change', function () {
      done[id] = cb.checked;
      host.classList.toggle('is-done', cb.checked);
      save();
    });
    cb.addEventListener('click', function (e) { e.stopPropagation(); });
    var lab = el('label', { class: 'done' }, [cb]);
    lab.appendChild(document.createTextNode('reviewed'));
    lab.addEventListener('click', function (e) { e.stopPropagation(); });
    return lab;
  }

  function quiz(pairs) {
    if (!pairs || !pairs.length) return null;
    var box = el('div', { class: 'quiz' }, [el('b', { text: 'Self-test' })]);
    pairs.forEach(function (qa) {
      var d = el('details', { class: 'qa' }, [
        el('summary', { text: qa[0] }),
        el('p', { text: qa[1] }),
      ]);
      box.appendChild(d);
    });
    return box;
  }

  // ------------------------------------------------------------------- DSA
  function renderDsa() {
    var f = document.createDocumentFragment();
    var B = window.BASE, T = window.TIERS, P = window.PATTERNS, TP = window.TOPICS;

    f.appendChild(el('p', { class: 'lead', text:
      'Everything here is aimed at one thing: recognising which of about seventeen patterns a problem is wearing, then executing it under time pressure while talking. Work top to bottom the first time; after that, use it as review.' }));

    // 1. the round
    f.appendChild(el('h2', { class: 'sec', text: B.loop.title }));
    var loopCard = el('div', { class: 'card' });
    loopCard.appendChild(el('p', { class: 'meta', text: B.loop.note }));
    loopCard.appendChild(el('ul', { class: 'steps' }, B.loop.steps.map(function (s) {
      return el('li', {}, [el('b', { text: s[0] }), el('span', { text: s[1] })]);
    })));
    f.appendChild(loopCard);

    // 2. constraints table
    f.appendChild(el('h2', { class: 'sec', text: B.constraints.title }));
    var cc = el('div', { class: 'card' });
    cc.appendChild(el('p', { class: 'meta', text: B.constraints.note }));
    var tbl = el('table', {}, [el('tr', {}, [
      el('th', { text: 'Input size' }), el('th', { text: 'Target' }), el('th', { text: 'What it means' }),
    ])]);
    B.constraints.rows.forEach(function (r) {
      tbl.appendChild(el('tr', {}, [
        el('td', { class: 'n', text: r[0] }), el('td', { class: 'k', text: r[1] }), el('td', { text: r[2] }),
      ]));
    });
    cc.appendChild(tbl);
    f.appendChild(cc);

    // 3. toolkits
    [B.python, B.js].forEach(function (kit) {
      f.appendChild(el('h2', { class: 'sec', text: kit.title }));
      var k = el('div', { class: 'card' });
      k.appendChild(el('p', { class: 'meta', text: kit.note }));
      var t = el('table', {});
      kit.rows.forEach(function (r) {
        t.appendChild(el('tr', {}, [el('td', { class: 'k', text: r[0] }), el('td', { text: r[1] })]));
      });
      k.appendChild(t);
      f.appendChild(k);
    });

    // 4. priority tiers
    f.appendChild(el('h2', { class: 'sec', text: 'What to study, in order' }));
    f.appendChild(el('p', { class: 'meta', text: T.note }));
    T.tiers.forEach(function (tier) {
      var box = el('div', { class: 'card tier' }, [
        el('h3', {}, [
          el('span', { text: tier.name }),
          el('span', { class: 'odds', text: tier.odds }),
        ]),
      ]);
      box.appendChild(el('ul', { class: 'tlist' }, tier.topics.map(function (t) {
        return el('li', {}, [el('b', { text: t[0] }), el('span', { text: t[1] })]);
      })));
      f.appendChild(box);
    });

    // 5. patterns
    f.appendChild(el('h2', { class: 'sec', text: 'Pattern catalogue — ' + P.items.length + ' patterns' }));
    f.appendChild(el('p', { class: 'meta', text: P.note }));
    P.items.forEach(function (p, i) {
      var d = el('details', { class: 'pat' });
      var s = el('summary', {}, [
        el('span', { text: p.name }),
        el('span', { class: 'sig', text: p.signal }),
      ]);
      s.appendChild(doneBox('pat-' + i, d));
      d.appendChild(s);
      d.appendChild(rows([
        ['Signal', p.signal],
        ['How', p.how],
        ['Cost', p.big],
        ['Problems', p.probs],
        ['Common bug', p.bug, 'bad'],
      ], 'pat-body'));
      f.appendChild(d);
    });

    // 6. topic cards
    f.appendChild(el('h2', { class: 'sec', text: 'Structures, one card each' }));
    f.appendChild(el('p', { class: 'meta', text: TP.note }));
    TP.items.forEach(function (t, i) {
      var d = el('details', { class: 'top' });
      var s = el('summary', {}, [
        el('span', { text: t.name }),
        el('span', { class: 'tag t' + t.tier, text: 'Tier ' + t.tier }),
      ]);
      s.appendChild(doneBox('top-' + i, d));
      d.appendChild(s);

      var body = el('div', { class: 'top-body' });
      body.appendChild(el('p', { class: 'meta', text: t.why }));
      body.appendChild(el('div', { class: 'row' }, [
        el('b', { text: 'Cold' }),
        el('span', {}, [el('ul', { class: 'cold' }, t.cold.map(function (c) {
          return el('li', { text: c });
        }))]),
      ]));
      body.appendChild(rows([
        ['Problems', t.probs],
        ['Pitfalls', t.traps, 'bad'],
      ]));
      var q = quiz(t.quiz);
      if (q) body.appendChild(q);
      d.appendChild(body);
      f.appendChild(d);
    });

    return f;
  }

  // --------------------------------------------------------------- reflexes
  function renderReflexes() {
    var f = document.createDocumentFragment();
    var R = window.REFLEXES;
    f.appendChild(el('p', { class: 'lead', text: R.note }));

    // cue -> reflex table
    f.appendChild(el('h2', { class: 'sec', text: R.cues.title }));
    var c = el('div', { class: 'card' });
    c.appendChild(el('p', { class: 'meta', text: R.cues.note }));
    var t = el('table', {}, [el('tr', {}, [
      el('th', { text: 'Cue' }), el('th', { text: 'Reach for' }),
    ])]);
    R.cues.rows.forEach(function (r) {
      t.appendChild(el('tr', {}, [el('td', { class: 'cue', text: r[0] }), el('td', { text: r[1] })]));
    });
    c.appendChild(t);
    f.appendChild(c);

    // the nine questions
    f.appendChild(el('h2', { class: 'sec', text: R.triage.title }));
    var tri = el('div', { class: 'card' });
    tri.appendChild(el('p', { class: 'meta', text: R.triage.note }));
    tri.appendChild(el('ul', { class: 'steps' }, R.triage.steps.map(function (s) {
      return el('li', {}, [el('b', { text: s[0] }), el('span', { text: s[1] })]);
    })));
    f.appendChild(tri);

    // the moves
    f.appendChild(el('h2', { class: 'sec', text: R.moves.title }));
    f.appendChild(el('p', { class: 'meta', text: R.moves.note }));
    R.moves.items.forEach(function (m, i) {
      var d = el('details', { class: 'pat' });
      var s = el('summary', {}, [el('span', { text: m[0] })]);
      s.appendChild(doneBox('move-' + i, d));
      d.appendChild(s);
      d.appendChild(el('div', { class: 'pat-body' }, [
        el('div', { class: 'row' }, [el('b', { text: 'What it is' }), el('span', { text: m[1] })]),
      ]));
      f.appendChild(d);
    });

    // reasoning -> code
    f.appendChild(el('h2', { class: 'sec', text: R.translate.title }));
    var tr = el('div', { class: 'card' });
    tr.appendChild(el('p', { class: 'meta', text: R.translate.note }));
    tr.appendChild(el('ul', { class: 'steps' }, R.translate.steps.map(function (s) {
      return el('li', {}, [el('b', { text: s[0] }), el('span', { text: s[1] })]);
    })));
    f.appendChild(tr);

    var bg = el('div', { class: 'card' });
    bg.appendChild(el('p', { class: 'meta', text: 'The six translation bugs, and the fix for each.' }));
    bg.appendChild(rows(R.translate.bugs.map(function (b) { return [b[0], b[1]]; })));
    f.appendChild(bg);

    // learning method
    f.appendChild(el('h2', { class: 'sec', text: R.learning.title }));
    var lc = el('div', { class: 'card' });
    lc.appendChild(el('p', { class: 'meta', text: R.learning.note }));
    var lt = el('table', {});
    R.learning.rows.forEach(function (r) {
      lt.appendChild(el('tr', {}, [el('td', { class: 'k', text: r[0] }), el('td', { text: r[1] })]));
    });
    lc.appendChild(lt);
    f.appendChild(lc);

    return f;
  }

  // --------------------------------------------------------------- problems
  var PKEY = 'prep-problems';
  var solved = {};
  try { solved = JSON.parse(localStorage.getItem(PKEY) || '{}'); } catch (e) { solved = {}; }
  function saveSolved() { try { localStorage.setItem(PKEY, JSON.stringify(solved)); } catch (e) {} }

  function renderProblems() {
    var f = document.createDocumentFragment();
    var P = window.PROBLEMS;

    // how to use
    f.appendChild(el('h2', { class: 'sec', text: P.howto.title }));
    var h = el('div', { class: 'card' });
    h.appendChild(el('ul', { class: 'steps howto' }, P.howto.steps.map(function (s, i) {
      return el('li', {}, [el('b', { text: String(i + 1) + '.' }), el('span', { text: s })]);
    })));
    h.appendChild(el('p', { class: 'meta pad', text: P.howto.note }));
    f.appendChild(h);

    // counter
    var count = el('p', { class: 'lead count' });
    function tally() {
      var n = P.items.filter(function (_, i) { return solved[i]; }).length;
      count.textContent = n + ' of ' + P.items.length + ' marked solved.'
        + (n === 0 ? ' Start with #1.' : '');
    }
    f.appendChild(el('h2', { class: 'sec', text: 'The list — shuffled on purpose' }));
    f.appendChild(count);

    P.items.forEach(function (p, i) {
      var card = el('div', { class: 'card prob' });

      var head = el('div', { class: 'prob-head' }, [
        el('span', { class: 'num', text: '#' + (i + 1) }),
        el('h3', { text: p.t }),
      ]);
      card.appendChild(head);
      card.appendChild(el('p', { class: 'ask', text: p.ask }));

      // hidden meta
      var meta = el('div', { class: 'prob-meta' }, [
        el('div', { class: 'row' }, [el('b', { text: 'Difficulty' }), el('span', { class: 'diff', text: p.d })]),
        el('div', { class: 'row' }, [el('b', { text: 'Pattern' }), el('span', { text: p.p })]),
        el('div', { class: 'row' }, [el('b', { text: 'Key insight' }), el('span', { text: p.i })]),
      ]);

      function show(on) {
        meta.classList.toggle('open', on);
        card.classList.toggle('is-open', on);
      }

      var cb = el('input', { type: 'checkbox' });
      cb.checked = !!solved[i];
      var lab = el('label', { class: 'solve' }, [cb]);
      lab.appendChild(document.createTextNode('solved'));

      var rev = el('button', { class: 'ghost tiny', type: 'button', text: 'Stuck — reveal' });

      cb.addEventListener('change', function () {
        solved[i] = cb.checked;
        saveSolved();
        card.classList.toggle('is-solved', cb.checked);
        show(cb.checked || meta.classList.contains('open'));
        if (!cb.checked) show(false);
        tally();
      });
      rev.addEventListener('click', function () {
        show(!meta.classList.contains('open'));
        rev.textContent = meta.classList.contains('open') ? 'Hide' : 'Stuck — reveal';
      });

      card.appendChild(el('div', { class: 'prob-acts' }, [lab, rev]));
      card.appendChild(meta);

      if (solved[i]) { card.classList.add('is-solved'); show(true); }
      f.appendChild(card);
    });

    tally();
    return f;
  }

  // -------------------------------------------------------------- front end
  function renderFrontend() {
    var f = document.createDocumentFragment();
    var F = window.FRONTEND;
    f.appendChild(el('p', { class: 'lead', text: F.note }));
    F.groups.forEach(function (g, gi) {
      f.appendChild(el('h2', { class: 'sec', text: g.name }));
      var card = el('div', { class: 'card' });
      card.appendChild(el('p', { class: 'meta', text: g.why }));
      card.appendChild(el('ul', { class: 'tlist' }, g.items.map(function (it) {
        return el('li', {}, [el('b', { text: it[0] }), el('span', { text: it[1] })]);
      })));
      f.appendChild(card);
      void gi;
    });
    return f;
  }

  // ------------------------------------------------------------ placeholders
  function todo(title, body) {
    var f = document.createDocumentFragment();
    f.appendChild(el('div', { class: 'todo' }, [
      el('h3', { text: title }),
      el('p', { text: body }),
    ]));
    return f;
  }

  function render(tab) {
    main.innerHTML = '';
    if (tab === 'dsa') main.appendChild(renderDsa());
    else if (tab === 'reflexes') main.appendChild(renderReflexes());
    else if (tab === 'problems') main.appendChild(renderProblems());
    else if (tab === 'frontend') main.appendChild(renderFrontend());
    else if (tab === 'design') main.appendChild(todo('System design — not written yet',
      'Next tab to build. Planned: the round format, the client-side to distributed gap, a reusable answer skeleton, and back-of-envelope numbers worth memorising. Your real-time multiplayer client is the raw material.'));
    else main.appendChild(todo('Googleyness and Leadership — not written yet',
      'Planned: the attributes actually scored, a bank of ten to twelve STAR stories drawn from your real history, and the level/scope framing for a senior packet.'));
    applyFilter();
  }

  // ----------------------------------------------------------------- filter
  var q = document.getElementById('q');
  function applyFilter() {
    var term = (q.value || '').trim().toLowerCase();
    var blocks = main.querySelectorAll('.card, details.pat, details.top');
    blocks.forEach(function (b) {
      b.classList.toggle('hidden', !!term && b.textContent.toLowerCase().indexOf(term) === -1);
    });
    main.querySelectorAll('h2.sec').forEach(function (h) {
      var any = false, n = h.nextElementSibling;
      while (n && n.tagName !== 'H2') {
        if (!n.classList.contains('hidden') && !n.classList.contains('meta')) any = true;
        n = n.nextElementSibling;
      }
      h.classList.toggle('hidden', !!term && !any);
    });
  }
  q.addEventListener('input', applyFilter);

  // ------------------------------------------------------------ review mode
  var review = document.getElementById('review');
  function applyReview() {
    document.body.classList.toggle('reviewing', review.checked);
    if (review.checked) main.querySelectorAll('.qa[open]').forEach(function (d) { d.open = false; });
  }
  review.addEventListener('change', applyReview);

  document.getElementById('reset').addEventListener('click', function () {
    done = {};
    save();
    render(current);
  });

  // ------------------------------------------------------------------- tabs
  var current = location.hash.replace('#', '') || 'dsa';
  if (TABS.indexOf(current) === -1) current = 'dsa';

  var btns = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  function select(tab) {
    current = tab;
    location.hash = tab;
    btns.forEach(function (b) {
      b.setAttribute('aria-selected', b.dataset.tab === tab ? 'true' : 'false');
    });
    render(tab);
    window.scrollTo(0, 0);
  }
  btns.forEach(function (b) {
    b.addEventListener('click', function () { select(b.dataset.tab); });
  });

  select(current);
})();
