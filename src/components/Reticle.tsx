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

const SVG_VIEWBOX_SIZE = 1000;
const BASELINE_X = SVG_VIEWBOX_SIZE / 2;
const BASELINE_Y = 720;
const BASELINE_HALF_LENGTH = 150;
const CENTER_GAP = 90;
const POINT_HALF_RANGE = 650;

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

  const cx = clamp(x, 0, 100);
  const cy = clamp(y, 0, 100);
  const centerX = (cx / 100) * SVG_VIEWBOX_SIZE;
  const centerY = (cy / 100) * SVG_VIEWBOX_SIZE;
  const topY = clamp(cy - CENTER_GAP / SVG_VIEWBOX_SIZE * 100, 0, 100);
  const bottomY = clamp(cy + CENTER_GAP / SVG_VIEWBOX_SIZE * 100, 0, 100);
  const leftX = clamp(cx - CENTER_GAP / SVG_VIEWBOX_SIZE * 100, 0, 100);
  const rightX = clamp(cx + CENTER_GAP / SVG_VIEWBOX_SIZE * 100, 0, 100);
  const baselineLeftX = BASELINE_X - BASELINE_HALF_LENGTH;
  const baselineRightX = BASELINE_X + BASELINE_HALF_LENGTH;

  return (
    <div
      className={className ? `reticle ${className}` : "reticle"}
      aria-label="Target reticle"
    >
      <svg
        className="reticle-guides"
        aria-hidden="true"
        viewBox={`0 0 ${SVG_VIEWBOX_SIZE} ${SVG_VIEWBOX_SIZE}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <line
          x1={0}
          y1={centerY}
          x2={leftX / 100 * SVG_VIEWBOX_SIZE}
          y2={centerY}
          stroke="rgba(66, 231, 105, 0.9)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <line
          x1={rightX / 100 * SVG_VIEWBOX_SIZE}
          y1={centerY}
          x2={SVG_VIEWBOX_SIZE}
          y2={centerY}
          stroke="rgba(66, 231, 105, 0.9)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <line
          x1={centerX}
          y1={0}
          x2={centerX}
          y2={topY / 100 * SVG_VIEWBOX_SIZE}
          stroke="rgba(66, 231, 105, 0.9)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <line
          x1={centerX}
          y1={bottomY / 100 * SVG_VIEWBOX_SIZE}
          x2={centerX}
          y2={SVG_VIEWBOX_SIZE}
          stroke="rgba(66, 231, 105, 0.9)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <line
          x1={baselineLeftX}
          y1={BASELINE_Y}
          x2={baselineRightX}
          y2={BASELINE_Y}
          stroke="rgba(12, 90, 44, 0.9)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <line
          x1={BASELINE_X - BASELINE_HALF_LENGTH}
          y1={BASELINE_X}
          x2={BASELINE_X + BASELINE_HALF_LENGTH}
          y2={BASELINE_X}
          stroke="rgba(128, 128, 128, 1)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="4 10"
        />
        <line
          x1={baselineLeftX}
          y1={BASELINE_Y}
          x2={centerX}
          y2={centerY}
          stroke="rgba(255, 140, 0, 0.9)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <line
          x1={baselineRightX}
          y1={BASELINE_Y}
          x2={centerX}
          y2={centerY}
          stroke="rgba(59, 130, 246, 0.9)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx={centerX} cy={centerY} r="12" fill="rgba(66, 231, 105, 0.9)" />
      </svg>

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
          <span className="motor-label motor-left">Left</span>
          <strong className="motor-value motor-left-value">{motorState.currentMotorPosition.left.toFixed(1)}</strong>
        </div>
        <div className="reticle-motor-row">
          <span className="motor-label motor-right">Right</span>
          <strong className="motor-value motor-right-value">{motorState.currentMotorPosition.right.toFixed(1)}</strong>
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
