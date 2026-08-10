import React from "react";
import { locales, type Locale } from "../i18n";
import { useI18nStore } from "../store/useI18nStore";

type Props = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  clock: Date;
};

const TopBar: React.FC<Props> = ({ locale, setLocale, clock }) => {
  const t = useI18nStore((s) => s.t);

  return (
    <header className="topbar reveal-1">
      <div>
        <p className="label">{t.appLabel}</p>
        <h1>{t.title}</h1>
      </div>
      <div className="topbar-meta">
        <p>{t.callsign}</p>
        <p>{clock.toLocaleTimeString(locale)}</p>
        <label className="locale-control">
          <span>{t.language}</span>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            aria-label={t.language}
          >
            {locales.map((item) => (
              <option key={item} value={item}>
                {item.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
};

export default TopBar;
