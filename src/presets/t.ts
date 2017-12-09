/**
 * @REVISIT why does translations exist?
 */
const globalTranslations = Object.create(null);

export let currentLocale = 'en';
export let textDirection = 'ltr';

export function setLocale(_) {
  if (globalTranslations[_] !== undefined) {
    currentLocale = _;
  } else if (globalTranslations[_.split('-')[0]]) {
    currentLocale = _.split('-')[0];
  }
}

export function addTranslation(id, value) {
  globalTranslations[id] = value;
}
/**
 * Given a string identifier, try to find that string in the current
 * language, and return it.
 *
 * @param {string} s string identifier
 * @returns {string?} locale string
 */
export function t(s: string, o?: any, loc?: any, translation?: any) {
  loc = loc || currentLocale;

  const path = s
    .split('.')
    .map(function(ss) {
      return ss.replace('<TX_DOT>', '.');
    })
    .reverse();

  let rep = globalTranslations[loc] || translation;

  while (rep !== undefined && path.length) rep = rep[path.pop()];

  if (rep !== undefined) {
    if (o) for (const k in o) rep = rep.replace('{' + k + '}', o[k]);
    return rep;
  }

  if (loc !== 'en') {
    return t(s, o, 'en');
  }

  if (o && 'default' in o) {
    return o.default;
  }

  const missing = 'Missing ' + loc + ' translation: ' + s;
  if (typeof console !== 'undefined') console.error(missing); // eslint-disable-line

  return missing;
}

/**
 * Given string 'ltr' or 'rtl', save that setting
 *
 * @param {string} s ltr or rtl
 */

export function setTextDirection(dir) {
  textDirection = dir;
}
