import React from "react";
import { useI18nStore } from "../store/useI18nStore";

type Props = {
  pan: number;
  setPan: (v: number) => void;
  tilt: number;
  setTilt: (v: number) => void;
  burst: number;
  setBurst: (v: number) => void;
  rangeGate: number;
  setRangeGate: (v: number) => void;
};

const ControlPanel: React.FC<Props> = ({
  pan,
  setPan,
  tilt,
  setTilt,
  burst,
  setBurst,
  rangeGate,
  setRangeGate,
}) => {
  const t = useI18nStore((s) => s.t);

  return (
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
  );
};

export default ControlPanel;
