import { useEffect, useMemo, useState } from "react";
import {
  getInitialLocale,
  locales,
  type Locale,
  type LockState,
  translations,
} from "./i18n";
import { Display } from "./components/display";
import "./App.css";

type SentryMode = "SAFE" | "MANUAL" | "AUTO";

function App() {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);
  const [mode, setMode] = useState<SentryMode>("AUTO");
  const [armed, setArmed] = useState(false);
  const [autoTrack, setAutoTrack] = useState(true);
  const [pan, setPan] = useState(4);
  const [tilt, setTilt] = useState(-12);
  const [burst, setBurst] = useState(3);
  const [rangeGate, setRangeGate] = useState(16);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("ui-locale", locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const t = translations[locale];

  const targetConfidence = useMemo(() => {
    const base = autoTrack ? 72 : 55;
    const modeBoost = mode === "AUTO" ? 16 : mode === "MANUAL" ? 8 : 0;
    const posturePenalty = Math.abs(tilt) > 22 ? 7 : 0;
    const rangePenalty = rangeGate > 24 ? 6 : 0;
    return Math.max(
      20,
      Math.min(99, base + modeBoost - posturePenalty - rangePenalty),
    );
  }, [autoTrack, mode, tilt, rangeGate]);

  const lockState: LockState =
    targetConfidence >= 80
      ? "HARD_LOCK"
      : targetConfidence >= 62
        ? "TRACKING"
        : "SCANNING";

  return (
    <main className="battlefield-shell">
      <section className="scanlines" aria-hidden="true" />

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

      <section className="grid reveal-2">
        <aside className="panel mode-panel">
          <h2>{t.missionProfile}</h2>
          <p className="label">{t.engagementMode}</p>
          <div className="mode-buttons">
            {(["SAFE", "MANUAL", "AUTO"] as SentryMode[]).map((item) => (
              <button
                key={item}
                type="button"
                className={item === mode ? "mode-btn active" : "mode-btn"}
                onClick={() => setMode(item)}
              >
                {t.modeSelection[item]}
              </button>
            ))}
          </div>

          <div className="status-stack">
            <div className="status-card">
              <span>{t.weaponBus}</span>
              <strong>{armed ? t.armed : t.standby}</strong>
            </div>
            <div className="status-card">
              <span>{t.iffFilter}</span>
              <strong>{autoTrack ? t.autoClassify : t.manualVerify}</strong>
            </div>
          </div>

          <div className="toggle-row">
            <button
              type="button"
              className="toggle"
              onClick={() => setArmed((value) => !value)}
            >
              {armed ? t.disarm : t.arm}
            </button>
            <button
              type="button"
              className="toggle"
              onClick={() => setAutoTrack((value) => !value)}
            >
              {autoTrack ? t.autoTrackOn : t.autoTrackOff}
            </button>
          </div>
        </aside>

        <section className="panel hud-panel">
          <Display
            lockState={lockState}
            targetConfidence={targetConfidence}
            rangeGate={rangeGate}
            signalingUrl="http://192.168.44.145:1984/api/webrtc?src=zavod2"
          />
        </section>

        <aside className="panel telemetry-panel">
          <h2>{t.telemetry}</h2>
          <ul>
            <li>
              <span>{t.turretPan}</span>
              <strong>
                {pan} {t.units.degrees}
              </strong>
            </li>
            <li>
              <span>{t.turretTilt}</span>
              <strong>
                {tilt} {t.units.degrees}
              </strong>
            </li>
            <li>
              <span>{t.burstLength}</span>
              <strong>
                {burst} {t.units.darts}
              </strong>
            </li>
            <li>
              <span>{t.flywheelTemp}</span>
              <strong>
                {48 + burst} {t.units.celsius}
              </strong>
            </li>
            <li>
              <span>{t.batteryReserve}</span>
              <strong>{armed ? "74%" : "96%"}</strong>
            </li>
          </ul>
        </aside>
      </section>

      <section className="panel controls reveal-3">
        <h2>{t.controlSurface}</h2>
        <div className="sliders">
          <label>
            {t.panAxis}
            <input
              type="range"
              min={-90}
              max={90}
              value={pan}
              onChange={(e) => setPan(Number(e.target.value))}
            />
          </label>
          <label>
            {t.tiltAxis}
            <input
              type="range"
              min={-45}
              max={45}
              value={tilt}
              onChange={(e) => setTilt(Number(e.target.value))}
            />
          </label>
          <label>
            {t.burstLength}
            <input
              type="range"
              min={1}
              max={8}
              value={burst}
              onChange={(e) => setBurst(Number(e.target.value))}
            />
          </label>
          <label>
            {t.rangeGate}
            <input
              type="range"
              min={8}
              max={40}
              value={rangeGate}
              onChange={(e) => setRangeGate(Number(e.target.value))}
            />
          </label>
        </div>
      </section>

      <section className="panel logs reveal-4">
        <h2>{t.eventLog}</h2>
        <ul>
          <li>15:21:41 - {t.logs[0]}</li>
          <li>15:21:56 - {t.logs[1]}</li>
          <li>15:22:03 - {t.logs[2]}</li>
          <li>15:22:12 - {t.logs[3]}</li>
        </ul>
      </section>
    </main>
  );
}

export default App;
