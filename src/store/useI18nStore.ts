import { create } from "zustand";
import {
  translations,
  locales,
  getInitialLocale,
  type Locale,
} from "../i18n";

type Translation = (typeof translations)[Locale];

type I18nState = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Translation;
};

export const useI18nStore = create<I18nState>((set, get) => {
  const initial = getInitialLocale();
  // ensure document language matches initial locale
  try {
    document.documentElement.lang = initial;
  } catch (e) {
    // noop in non-browser environments
  }

  return {
    locale: initial,
    t: translations[initial],
    setLocale: (l: Locale) => {
      if (get().locale === l) {
        return;
      }
      try {
        window.localStorage.setItem("ui-locale", l);
      } catch (e) {
        // ignore
      }
      try {
        document.documentElement.lang = l;
      } catch (e) {
        // ignore
      }
      set({ locale: l, t: translations[l] });
    },
  };
});

export default useI18nStore;

export { locales };
