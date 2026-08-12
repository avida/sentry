import React from "react";

export interface ReticleCenter {
  x?: number;
  y?: number;
}

interface ReticleProps {
  className?: string;
  center?: ReticleCenter;
}

export const Reticle: React.FC<ReticleProps> = ({
  className,
  center = { x: 50, y: 50 },
}) => {
  const { x = 50, y = 50 } = center;

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
