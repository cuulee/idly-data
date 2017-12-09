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
export function t(s: string, options?: any, loc?: any) {
  loc = loc || currentLocale;

  const path = s
    .split('.')
    .map(function(ss) {
      return ss.replace('<TX_DOT>', '.');
    })
    .reverse();
  let rep = globalTranslations[loc];

  if (options.dynamicTranslation) {
    rep = options.dynamicTranslation;
  }

  while (rep !== undefined && path.length) rep = rep[path.pop()];

  if (rep !== undefined) {
    if (options)
      for (const k in options) rep = rep.replace('{' + k + '}', options[k]);
    return rep;
  }

  if (loc !== 'en') {
    return t(s, options, 'en');
  }

  if (options && 'default' in options) {
    return options.default;
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
