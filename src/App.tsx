import { useEffect, useMemo, useState } from "react";
import { type LockState } from "./i18n";
import { useI18nStore } from "./store/useI18nStore";
import { Display } from "./components/display";
import Telemetry from "./components/telemetry";
import ControlPanel from "./components/controlPanel";
import MissionProfile from "./components/missionProfile";
import Logs from "./components/logs";
import TopBar from "./components/topbar";
import GridLayout, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
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

  const layout: Layout = [
    {
      i: "mission",
      x: 0,
      y: 0,
      w: 3,
      h: 3,
      moved: false,
      static: false,
    },
    {
      i: "display",
      x: 3,
      y: 0,
      w: 6,
      h: 4,
      moved: false,
      static: false,
    },
    {
      i: "telemetry",
      x: 9,
      y: 0,
      w: 3,
      h: 3,
      moved: false,
      static: false,
    },
    {
      i: "control",
      x: 0,
      y: 3,
      w: 3,
      h: 2,
      moved: false,
      static: false,
    },
    {
      i: "logs",
      x: 9,
      y: 3,
      w: 3,
      h: 2,
      moved: false,
      static: false,
    },
  ];

  const gridWidth =
    typeof window !== "undefined"
      ? Math.max(900, window.innerWidth - 96)
      : 1200;

  const [_, setCurrentLayout] = useState<Layout>(layout);

  return (
    <main className="battlefield-shell">
      <section className="scanlines" aria-hidden="true" />

      <TopBar locale={locale} setLocale={setLocale} clock={clock} />

      <GridLayout
        className="layout reveal-2"
        layout={layout}
        width={gridWidth}
        onLayoutChange={(l) => setCurrentLayout(l)}
        onDragStop={(layout) => setCurrentLayout(layout)}
        onResizeStop={(layout) => setCurrentLayout(layout)}
      >
        <div key="mission" className="panel mode-panel">
          <MissionProfile
            mode={mode}
            setMode={setMode}
            armed={armed}
            setArmed={setArmed}
            autoTrack={autoTrack}
            setAutoTrack={setAutoTrack}
          />
        </div>

        <div key="display" className="panel hud-panel">
          <Display
            lockState={lockState}
            targetConfidence={targetConfidence}
            rangeGate={rangeGate}
            signalingUrl="http://192.168.44.145:1984/api/webrtc?src=zavod2"
          />
        </div>

        <div key="telemetry" className="panel telemetry-panel">
          <Telemetry pan={pan} tilt={tilt} burst={burst} armed={armed} />
        </div>

        <div key="control" className="panel controls">
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
        </div>

        <div key="logs" className="panel logs">
          <Logs />
        </div>
      </GridLayout>
      {/* <div className="layout-debug" aria-hidden="false">
        <pre style={{ whiteSpace: "pre-wrap", margin: 8 }}>
          {JSON.stringify(currentLayout, null, 2)}
        </pre>
      </div> */}
    </main>
  );
}

export default App;
