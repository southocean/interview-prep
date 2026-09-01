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

  // ------------------------------------------------------- indexes (derived)
  var P = window.PATTERNS.items;
  var S = window.STRUCTURES.items;
  var PR = window.PROBLEMS.items;

  var patById = {}, strById = {};
  P.forEach(function (p) { patById[p.id] = p; });
  S.forEach(function (s) { strById[s.id] = s; });

  var probsByPat = {}, probsByStr = {}, patsByStr = {};
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
  });

  var patsSorted = P.slice().sort(function (x, y) { return x.rank - y.rank; });
  var strsSorted = S.slice().sort(function (x, y) { return x.rank - y.rank; });

  // ------------------------------------------------------------- persistence
  function store(key) {
    var data = {};
    try { data = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) {}
    return {
      get: function (k) { return !!data[k]; },
      set: function (k, v) {
        data[k] = v;
        try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
      },
      count: function () { return Object.keys(data).filter(function (k) { return data[k]; }).length; },
    };
  }
  var reviewed = store('prep-progress');
  var solved = store('prep-problems');

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

      el('h2', { class: 'sec', text: 'Template' }),
      pre(p.template),

      el('h2', { class: 'sec', text: 'Deviations — what interviewers actually ask' }),
      el('p', { class: 'meta', text: 'The template gets you the textbook version. These are the variations, and each one changes the code in a specific way. Learn to spot the tell.' }),
      frag(p.deviations.map(function (d) {
        return el('div', { class: 'dev' }, [
          el('h4', { text: d[0] }),
          el('p', { class: 'tell', text: 'Tell: ' + d[1] }),
          el('p', { class: 'do', text: d[2] }),
        ]);
      })),

      el('h2', { class: 'sec', text: 'Common bugs' }),
      el('ul', {}, (p.bugs || []).map(function (b) { return el('li', { text: b }); })),

      el('h2', { class: 'sec', text: 'Structures it uses' }),
      chipsOf(structs),

      el('h2', { class: 'sec', text: 'Related patterns' }),
      chipsOf(also),

      el('h2', { class: 'sec', text: 'Problems on this pattern' }),
      probChips(probsByPat[p.id]),
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

      quizOf(s.quiz),
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
          el('td', { class: 'n', text: r[0] }), el('td', { class: 'k', text: r[1] }), el('td', { text: r[2] }),
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
              return el('div', { class: 'row' }, [el('b', { text: x[0] }), el('span', { text: x[1] })]);
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
        t.appendChild(el('tr', {}, [el('td', { class: 'cue', text: r[0] }), el('td', { text: r[1] })]));
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
  function sGroup(title, links) {
    return el('div', { class: 's-group' }, [el('div', { class: 's-title', text: title })].concat(links));
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

  function buildSidebar(r) {
    side.innerHTML = '';

    if (r.sec === 'dsa') {
      side.appendChild(sGroup('Foundations', FOUND.map(function (f) {
        return sLink('#/dsa/found/' + f.id, f.title, { active: r.kind === 'found' && r.id === f.id });
      })));
      side.appendChild(sGroup('Patterns', patsSorted.map(function (p) {
        return sLink('#/dsa/pattern/' + p.id, p.name, {
          n: String(p.rank), active: r.kind === 'pattern' && r.id === p.id, done: reviewed.get('pat-' + p.id),
        });
      })));
      side.appendChild(sGroup('Structures', strsSorted.map(function (s) {
        return sLink('#/dsa/structure/' + s.id, s.name, {
          active: r.kind === 'structure' && r.id === s.id, done: reviewed.get('str-' + s.id),
        });
      })));
      return;
    }

    if (r.sec === 'reflexes') {
      side.appendChild(sGroup('Reflexes', REF_PAGES.map(function (x) {
        return sLink('#/reflexes/' + x.id, x.get().title, { active: r.kind === x.id });
      })));
      return;
    }

    if (r.sec === 'problems') {
      side.appendChild(sGroup('All problems', [
        sLink('#/problems', 'The full list', { active: !r.kind, n: String(solved.count()) }),
      ]));
      side.appendChild(sGroup('By pattern', patsSorted.filter(function (p) {
        return (probsByPat[p.id] || []).length;
      }).map(function (p) {
        var mine = probsByPat[p.id];
        var got = mine.filter(function (pr) { return solved.get(pr.n); }).length;
        return sLink('#/problems/pattern/' + p.id, p.name, {
          n: got + '/' + mine.length, active: r.kind === 'pattern' && r.id === p.id,
        });
      })));
      return;
    }

    if (r.sec === 'frontend') {
      side.appendChild(sGroup('Front-end round', window.FRONTEND.groups.map(function (g, i) {
        return sLink('#/frontend/g/' + i, g.name, { active: r.kind === 'g' && r.id === String(i) });
      })));
      return;
    }

    side.appendChild(sGroup('Not written yet', [
      sLink('#/' + r.sec, r.sec === 'design' ? 'System design' : 'Googleyness', { active: true }),
    ]));
  }

  // ------------------------------------------------------------------ render
  function render() {
    var r = parse();

    document.querySelectorAll('.nav-a').forEach(function (n) {
      if (n.dataset.sec === r.sec) n.setAttribute('aria-current', 'page');
      else n.removeAttribute('aria-current');
    });

    buildSidebar(r);
    main.innerHTML = '';

    var page;
    if (r.sec === 'dsa') {
      page = r.kind === 'pattern' ? patternPage(r.id)
        : r.kind === 'structure' ? structurePage(r.id)
        : r.kind === 'found' ? foundationPage(r.id)
        : dsaHome();
    } else if (r.sec === 'reflexes') {
      page = r.kind ? reflexPage(r.kind) : reflexesHome();
    } else if (r.sec === 'problems') {
      page = problemsPage(r.kind === 'pattern' && patById[r.id] ? r.id : null);
    } else if (r.sec === 'frontend') {
      page = r.kind === 'g' ? frontendGroup(r.id) : frontendHome();
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
    var blocks = main.querySelectorAll('.tile, .prob, .dev, .card');
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
