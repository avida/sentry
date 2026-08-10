import { useEffect, useMemo, useState } from "react";
import { type LockState } from "./i18n";
import { useI18nStore } from "./store/useI18nStore";
import { Display } from "./components/display";
import Telemetry from "./components/telemetry";
import ControlPanel from "./components/controlPanel";
import MissionProfile from "./components/missionProfile";
import Logs from "./components/logs";
import TopBar from "./components/topbar";
import "./App.css";

type SentryMode = "SAFE" | "MANUAL" | "AUTO";

function App() {
  const locale = useI18nStore((s) => s.locale);
  const setLocale = useI18nStore((s) => s.setLocale);
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

      <TopBar locale={locale} setLocale={setLocale} clock={clock} />

      <section className="grid reveal-2">
        <MissionProfile
          mode={mode}
          setMode={setMode}
          armed={armed}
          setArmed={setArmed}
          autoTrack={autoTrack}
          setAutoTrack={setAutoTrack}
        />

        <section className="panel hud-panel">
          <Display
            lockState={lockState}
            targetConfidence={targetConfidence}
            rangeGate={rangeGate}
            signalingUrl="http://192.168.44.145:1984/api/webrtc?src=zavod2"
          />
        </section>

        {/* Telemetry panel moved to its own component */}
        <Telemetry pan={pan} tilt={tilt} burst={burst} armed={armed} />
      </section>

      <ControlPanel
        pan={pan}
        setPan={setPan}
        tilt={tilt}
        setTilt={setTilt}
        burst={burst}
        setBurst={setBurst}
        rangeGate={rangeGate}
        setRangeGate={setRangeGate}
      />

      <Logs />
    </main>
  );
}

export default App;
