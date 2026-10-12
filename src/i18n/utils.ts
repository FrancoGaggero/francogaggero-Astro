import { ui, defaultLang, type Lang, type UIKey } from './ui';

export function getLang(url: URL): Lang {
  const [, first] = url.pathname.split('/');
  return first === 'en' ? 'en' : defaultLang;
}

export function useTranslations(lang: Lang) {
  return (key: UIKey) => ui[lang][key] ?? ui[defaultLang][key];
}

/** Prefixes a site path with the locale (default locale has no prefix). */
export function localize(lang: Lang, path: string) {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return lang === defaultLang ? clean : `/${lang}${clean === '/' ? '/' : clean}`;
}

/** Same page in the other language. */
export function alternatePath(url: URL, target: Lang) {
  const stripped = url.pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  return localize(target, stripped);
}
