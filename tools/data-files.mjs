/* The one list of data files.
 *
 * It used to be duplicated across index.html and three tools, which meant
 * adding an animation batch could silently break a checker: a file the gate did
 * not load looked like a file with no animations in it. One export now, and
 * check-html.mjs verifies the page agrees with it.
 */
export const DATA_FILES = [
  'base', 'lexicon', 'tiers', 'patterns', 'structures', 'techniques',
  'refs', 'anims', 'anims-b', 'anims-c', 'anims-d', 'anims-e', 'anims-f', 'anims-g', 'anims-h',
  'worked', 'deviations', 'problems', 'reflexes', 'frontend',
];

/* ANIMS is merged into by the anims-* files with Object.assign, so it must
   exist before they load. */
export function loadData(readFileSync) {
  const win = {};
  win.ANIMS = {};
  for (const f of DATA_FILES) {
    win[`__file_${f}`] = true;
    new Function('window', readFileSync(`data/${f}.js`, 'utf8'))(win);
  }
  return win;
}
