import React, { useEffect, useState } from "react";
import { useI18nStore } from "../../store/useI18nStore";

type ButtonState = {
  index: number;
  value: number;
  pressed: boolean;
};

type Parsed = {
  flags?: number;
  flagsBits?: boolean[];
  buttons?: ButtonState[];
};

const MAX_VAL = 2048; // 65535

const ControllerPanel: React.FC = () => {
  const t = useI18nStore((s) => s.t);
  const [parsed, setParsed] = useState<Parsed>({ buttons: [] });

  useEffect(() => {
    if (
      (window as any).electronAPI &&
      (window as any).electronAPI.onControllerData
    ) {
      const remove = (window as any).electronAPI.onControllerData(
        (data: any) => {
          try {
            const p = data?.parsed ?? data;
            setParsed(p || { buttons: [] });
          } catch (e) {
            console.warn("ControllerPanel: failed to parse controller data", e);
          }
        },
      );
      return () => remove();
    }
    return;
  }, []);

  const buttons = parsed.buttons ?? [];
  const filteredButtons = buttons.filter((b) => b.index >= 1 && b.index <= 5);

  return (
    <section className="panel controller-panel reveal-3">
      <h2>Controller</h2>
      <div className="controller-body">
        <div className="buttons-list">
          {filteredButtons.length === 0 && (
            <div className="no-data">No controller data</div>
          )}
          {filteredButtons.map((b) => {
            const pct = Math.round(((b.value ?? 0) / MAX_VAL) * 100);
            return (
              <div className="button-row" key={b.index}>
                <div className="button-label">B{b.index}</div>
                <div className="button-progress">
                  <progress max={MAX_VAL} value={b.value ?? 0} />
                </div>
                <div className="button-value">{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ControllerPanel;
