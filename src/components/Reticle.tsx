import React, { useMemo } from "react";
import { useControllerStore } from "../store/useControllerStore";

export interface ReticleCenter {
  x?: number;
  y?: number;
}

interface ReticleProps {
  className?: string;
  center?: ReticleCenter;
}

const MAX_CONTROLLER_VALUE = 2047;

export const Reticle: React.FC<ReticleProps> = ({
  className,
  center,
}) => {
  const controllerParsed = useControllerStore((s) => s.parsed);

  const derivedCenter = useMemo(() => {
    const buttons = controllerParsed.buttons ?? [];
    const horizontalValue =
      buttons.find((button) => button.index === 1)?.value ?? 1023.5;
    const verticalValue =
      buttons.find((button) => button.index === 2)?.value ?? 1023.5;

    const toPercent = (value: number) => {
      const clamped = Math.min(Math.max(value, 0), MAX_CONTROLLER_VALUE);
      return (clamped / MAX_CONTROLLER_VALUE) * 100;
    };

    return {
      x: toPercent(horizontalValue),
      y: 100 - toPercent(verticalValue),
    };
  }, [controllerParsed]);

  const resolvedCenter = center ?? derivedCenter;
  const { x = 50, y = 50 } = resolvedCenter;

  const reticleStyle = {
    ["--reticle-center-x" as string]: `${x}%`,
    ["--reticle-center-y" as string]: `${y}%`,
  } as React.CSSProperties;

  return (
    <div
      className={className ? `reticle ${className}` : "reticle"}
      style={reticleStyle}
      aria-label="Target reticle"
    >
      <div className="crosshair horizontal" aria-hidden="true" />
      <div className="crosshair vertical" aria-hidden="true" />
    </div>
  );
};
