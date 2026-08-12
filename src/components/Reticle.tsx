import React, { useEffect, useMemo, useRef, useState } from "react";
import { MovementController, type MovementAxis } from "../movement";
import { useControllerStore } from "../store/useControllerStore";
import "./Reticle.css";

export interface ReticleCenter {
  x?: number;
  y?: number;
}

interface ReticleProps {
  className?: string;
  center?: ReticleCenter;
  acceleration?: number | MovementAxis;
  deceleration?: number | MovementAxis;
  maxSpeed?: number;
  centerDeadZone?: number;
  updateInterval?: number;
}

const MAX_CONTROLLER_VALUE = 2047;

export const Reticle: React.FC<ReticleProps> = ({
  className,
  center,
  acceleration = { x: 0.03, y: 0.03 },
  deceleration = { x: 0.08, y: 0.08 },
  maxSpeed = 2,
  centerDeadZone = 0.08,
  updateInterval = 16,
}) => {
  const controllerParsed = useControllerStore((s) => s.parsed);
  const movementRef = useRef<MovementController | null>(null);
  const [currentCenter, setCurrentCenter] = useState<ReticleCenter>({
    x: 50,
    y: 50,
  });

  const axis = useMemo<MovementAxis>(() => {
    const buttons = controllerParsed.buttons ?? [];
    const horizontalValue =
      buttons.find((button) => button.index === 1)?.value ?? MAX_CONTROLLER_VALUE / 2;
    const verticalValue =
      buttons.find((button) => button.index === 2)?.value ?? MAX_CONTROLLER_VALUE / 2;

    const normalize = (value: number) => {
      const centered = value - MAX_CONTROLLER_VALUE / 2;
      return clamp(centered / (MAX_CONTROLLER_VALUE / 2), -1, 1);
    };

    return {
      x: normalize(horizontalValue),
      y: -normalize(verticalValue),
    };
  }, [controllerParsed]);

  useEffect(() => {
    if (!movementRef.current) {
      movementRef.current = new MovementController({
        acceleration,
        deceleration,
        maxSpeed,
        centerDeadZone,
        updateInterval,
        initialPosition: { x: 0, y: 0 },
      });
    }

    movementRef.current.setAxis(axis);
  }, [acceleration, axis, centerDeadZone, deceleration, maxSpeed, updateInterval]);

  useEffect(() => {
    if (center) {
      return;
    }

    const timerId = window.setInterval(() => {
      const offset = movementRef.current?.update() ?? { x: 0, y: 0 };
      setCurrentCenter({
        x: 50 + offset.x,
        y: 50 + offset.y,
      });
    }, updateInterval);

    return () => window.clearInterval(timerId);
  }, [center, updateInterval]);

  const resolvedCenter = center ?? currentCenter;
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
    </div>
  );
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
