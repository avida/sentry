export type MovementAxis = {
  x: number;
  y: number;
};

export interface MovementControllerOptions {
  acceleration?: number | MovementAxis;
  maxSpeed?: number;
  centerDeadZone?: number;
  updateInterval?: number;
  initialPosition?: MovementAxis;
}

export class MovementController {
  private readonly acceleration: MovementAxis;
  private readonly maxSpeed: number;
  private readonly centerDeadZone: number;
  private readonly updateInterval: number;
  private position: MovementAxis;
  private velocity: MovementAxis;
  private axis: MovementAxis;

  constructor({
    acceleration = { x: 0.18, y: 0.18 },
    maxSpeed = 8,
    centerDeadZone = 0.08,
    updateInterval = 16,
    initialPosition = { x: 0, y: 0 },
  }: MovementControllerOptions = {}) {
    this.acceleration = normalizeAxis(acceleration, 0.18);
    this.maxSpeed = Math.max(0, maxSpeed);
    this.centerDeadZone = clamp(centerDeadZone, 0, 1);
    this.updateInterval = Math.max(1, updateInterval);
    this.position = { ...initialPosition };
    this.velocity = { x: 0, y: 0 };
    this.axis = { x: 0, y: 0 };
  }

  public setAxis(axis: MovementAxis): void {
    this.axis = {
      x: clamp(axis.x, -1, 1),
      y: clamp(axis.y, -1, 1),
    };
  }

  public update(): MovementAxis {
    const dtFactor = this.updateInterval / 16.6667;
    const targetVelocity = {
      x: this.resolveVelocity(this.axis.x) * dtFactor,
      y: this.resolveVelocity(this.axis.y) * dtFactor,
    };

    this.velocity.x = this.easeToward("x", this.velocity.x, targetVelocity.x);
    this.velocity.y = this.easeToward("y", this.velocity.y, targetVelocity.y);

    this.position.x = clamp(this.position.x + this.velocity.x * dtFactor, -50, 50);
    this.position.y = clamp(this.position.y + this.velocity.y * dtFactor, -50, 50);

    return { ...this.position };
  }

  private resolveVelocity(axisValue: number): number {
    const absValue = Math.abs(axisValue);
    if (absValue <= this.centerDeadZone) {
      return 0;
    }

    const normalized = clamp(
      (absValue - this.centerDeadZone) / (1 - this.centerDeadZone),
      0,
      1,
    );
    const scaledValue = axisValue * normalized;
    return scaledValue * this.maxSpeed;
  }

  private easeToward(axis: keyof MovementAxis, current: number, target: number): number {
    const delta = target - current;
    if (Math.abs(delta) < 0.0001) {
      return target;
    }

    const ratio = this.acceleration[axis];
    const step = delta * ratio;
    return clamp(current + step, -this.maxSpeed, this.maxSpeed);
  }
}

const normalizeAxis = (
  axis: number | MovementAxis,
  defaultValue: number,
): MovementAxis => ({
  x: typeof axis === "number" ? axis : axis.x ?? defaultValue,
  y: typeof axis === "number" ? axis : axis.y ?? defaultValue,
});

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
