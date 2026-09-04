import React from "react";
import { useHIDControllerStore } from "../store/useHIDControllerStore";
import { useSerialMotorStore } from "../store/useSerialMotorStore";
import "./Reticle.css";

export interface ReticleCenter {
  x?: number;
  y?: number;
}

interface ReticleProps {
  className?: string;
  center?: ReticleCenter;
}
const BASE_LENGTH = 300;
const BASE_HEIGHT = 100;

const POINT_HALF_RANGE = 150;

export const Reticle: React.FC<ReticleProps> = ({
  className,
  center,
}) => {
  const pointCoordinates = useHIDControllerStore((s) => s.pointCoordinates);
  const motorState = useSerialMotorStore((s) => s);
  const resolvedCenter = center ?? {
    x:
      50 +
      (clamp(pointCoordinates.x, -POINT_HALF_RANGE, POINT_HALF_RANGE) /
        POINT_HALF_RANGE) *
        50,
    y:
      50 -
      (clamp(pointCoordinates.y, -POINT_HALF_RANGE, POINT_HALF_RANGE) /
        POINT_HALF_RANGE) *
        50,
  };
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
      <div className="reticle-circle" aria-hidden="true" />
      <div className="reticle-post post-left" aria-hidden="true" />
      <div className="reticle-post post-right" aria-hidden="true" />
      <div className="reticle-post post-top" aria-hidden="true" />
      <div className="reticle-post post-bottom" aria-hidden="true" />
      <div className="reticle-center-dot" aria-hidden="true" />

      <div className="reticle-motor-overlay" aria-live="polite">
        <div className="reticle-motor-row">
          <span>X</span>
          <strong>{pointCoordinates.x.toFixed(1)}</strong>
        </div>
        <div className="reticle-motor-row">
          <span>Y</span>
          <strong>{pointCoordinates.y.toFixed(1)}</strong>
        </div>
        <div className="reticle-motor-row">
          <span>Left</span>
          <strong>{motorState.currentMotorPosition.left.toFixed(1)}</strong>
        </div>
        <div className="reticle-motor-row">
          <span>Right</span>
          <strong>{motorState.currentMotorPosition.right.toFixed(1)}</strong>
        </div>
        <div className="reticle-motor-row status-row">
          <span>Status</span>
          <strong>{motorState.status}</strong>
        </div>
      </div>
    </div>
  );
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
