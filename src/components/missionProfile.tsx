import React from "react";
import { useI18nStore } from "../store/useI18nStore";
import { useCameraIndexStore } from "../store/useCameraIndexStore";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import styles from "./missionProfile.module.css";

type SentryMode = "SAFE" | "MANUAL" | "AUTO";

type Props = {
  mode: SentryMode;
  setMode: (m: SentryMode) => void;
  armed: boolean;
  setArmed: React.Dispatch<React.SetStateAction<boolean>>;
  autoTrack: boolean;
  setAutoTrack: React.Dispatch<React.SetStateAction<boolean>>;
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
  const cameraIndex = useCameraIndexStore((s) => s.cameraIndex);
  const setCameraIndex = useCameraIndexStore((s) => s.setCameraIndex);

  return (
    <aside className="panel mode-panel">
      <h2>{t.missionProfile}</h2>
      <p className="label">{t.engagementMode}</p>
      <div className="mode-buttons">
        {(["MANUAL", "AUTO"] as SentryMode[]).map((item) => (
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
            setArmed((value: boolean) => {
              const next = !value;
              return next;
            })
          }
        >
          {armed ? t.disarm : t.arm}
        </button>
        <button
          type="button"
          className="toggle"
          onClick={() => setAutoTrack((value: boolean) => !value)}
        >
          {autoTrack ? t.autoTrackOn : t.autoTrackOff}
        </button>
      </div>
      <FormControl variant="filled" size="small" className={styles.cameraControl}>
        <InputLabel id="camera-select-label" className={styles.cameraLabel}>
          {t.camera}
        </InputLabel>
        <Select
          labelId="camera-select-label"
          value={cameraIndex}
          label={t.camera}
          onChange={(e) => setCameraIndex(Number(e.target.value))}
          className={styles.cameraSelect}
        >
          {t.cameraOptions .map((label, i) => (
            <MenuItem key={i} value={i + 1}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </aside>
  );
};

export default MissionProfile;
