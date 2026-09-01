/* Tabs, rendering, filter, review mode, progress. No modules, so this opens
   straight off the filesystem with no server. */
(function () {
  'use strict';

  var main = document.getElementById('main');
  var TABS = ['dsa', 'frontend', 'design', 'behaviour'];

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
