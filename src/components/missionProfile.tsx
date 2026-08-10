import React from "react";
import { useI18nStore } from "../store/useI18nStore";

type SentryMode = "SAFE" | "MANUAL" | "AUTO";

type Props = {
  mode: SentryMode;
  setMode: (m: SentryMode) => void;
  armed: boolean;
  setArmed: (v: boolean) => void;
  autoTrack: boolean;
  setAutoTrack: (v: boolean) => void;
};

const MissionProfile: React.FC<Props> = ({
  mode,
  setMode,
  armed,
  setArmed,
  autoTrack,
  setAutoTrack,
}) => {
  const t = useI18nStore((s) => s.t);

  return (
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
          onClick={() =>
            setArmed((value) => {
              const next = !value;
              if (next) {
                try {
                  (window as Window & {
                    electronAPI?: { createHFile?: () => void };
                  }).electronAPI?.createHFile?.();
                } catch (e) {
                  console.error("createHFile IPC failed", e);
                }
              }
              return next;
            })
          }
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
  );
};

export default MissionProfile;
