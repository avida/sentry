import React, { useEffect } from "react";
import { useI18nStore } from "../store/useI18nStore";

const Logs: React.FC = () => {
  const t = useI18nStore((s) => s.t);

  const logs = t.logs || [];

  return (
    <section className="panel logs reveal-4">
      <h2>{t.eventLog}</h2>
      <ul>
        {logs.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </section>
  );
};

export default Logs;
