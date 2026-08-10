import React from "react";
import { useI18nStore } from "../store/useI18nStore";

type Props = {
  pan: number;
  tilt: number;
  burst: number;
  armed: boolean;
};

const Telemetry: React.FC<Props> = ({ pan, tilt, burst, armed }) => {
  const t = useI18nStore((s) => s.t);
  return (
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
  );
};

export default Telemetry;
