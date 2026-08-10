import React from "react";
import { useI18nStore } from "../store/useI18nStore";

const Logs: React.FC = () => {
  const t = useI18nStore((s) => s.t);
  return (
    <section className="panel logs reveal-4">
      <h2>{t.eventLog}</h2>
      <ul>
        <li>15:21:41 - {t.logs[0]}</li>
        <li>15:21:56 - {t.logs[1]}</li>
        <li>15:22:03 - {t.logs[2]}</li>
        <li>15:22:12 - {t.logs[3]}</li>
      </ul>
    </section>
  );
};

export default Logs;
