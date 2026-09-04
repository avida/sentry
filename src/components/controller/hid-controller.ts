import { EventEmitter } from "events";
import HID from "node-hid";
import { HIDParser } from "./hid-parser";
import { serialController } from "./serial-controller";

const VERTICAL_SHIFT_BUTTON_INDEX = 2;
const SHIFT_CENTER = 1000;
const DEAD_ZONE = 40;
const HORIZONTAL_SHIFT_BUTTON_INDEX = 1;
const MAX_SIDE_LENGTH = 840;
const MIN_SIDE_LENGTH = 100;
const POINT_MAX = MAX_SIDE_LENGTH / 2;
const MAX_SHIFT_VALUE = 2047;
const BASE_HEIGHT = 100;
const TRIANGLE_BASE_LENGTH = 300;
const CONTROL_SENSITIVITY = 0.001;
export class HIDController extends EventEmitter {
  options: any;
  parser: any;
  device: any | null;
  deviceInfo: any | null;
  path: string | null;
  pointCoordinates: { x: number; y: number };

  constructor(options: any = {}) {
    super();
    this.options = options;

    this.parser =
      options.parser || new HIDParser({ endian: "LE", buttonCount: 9 });
    this.device = null;
    this.deviceInfo = null;
    this.pointCoordinates = { x: 0, y: 0 };
    this.path = null;
  }

  static listDevices(): any[] {
    return HID.devices();
  }

  static findControllerDevice(devices: any[] = []): any | null {
    const keywords =
      /(controller|gamepad|joystick|fpv|gimbal|radio|receiver|xbox|dualshock|playstation)/i;
    for (const d of devices) {
      if (d && d.product && keywords.test(d.product)) return d;
    }

    for (const d of devices) {
      if (d && typeof d.usagePage === "number" && typeof d.usage === "number") {
        if (d.usagePage === 0x01 && (d.usage === 0x04 || d.usage === 0x05))
          return d;
      }
    }

    return devices.length ? devices[0] : null;
  }

  async discoverAndConnect(): Promise<any> {
    const devices = HIDController.listDevices();
    const dev = HIDController.findControllerDevice(devices);
    if (!dev) throw new Error("No HID controller device found");
    this.deviceInfo = dev;
    const path = dev.path || dev.devicePath || (dev as any).pathName;
    await this.connect(path);
    return dev;
  }

  async connect(path: string): Promise<void> {
    if (!path) throw new Error("device path is required to connect");
    this.path = path;
    try {
      if ((HID as any).HIDAsync && (HID as any).HIDAsync.open) {
        this.device = await (HID as any).HIDAsync.open(path);
      } else {
        this.device = new (HID as any).HID(path);
      }
    } catch (err) {
      this.device = null;
      throw err;
    }

    if (this.device && typeof this.device.on === "function") {
      this.device.on("data", (data: Buffer) => this._onData(data));
      this.device.on("error", (err: any) => this.emit("error", err));
    }

    this.emit("connected", { path, info: this.deviceInfo });
  }

  disconnect(): void {
    if (!this.device) return;
    try {
      if (typeof this.device.close === "function") this.device.close();
    } catch (e) {}
    this.device = null;
    this.emit("disconnected", { path: this.path, info: this.deviceInfo });
  }
  normalizeShiftValue(
    rawValue: number,
    minValue: number,
    maxValue: number,
  ): number {
    const drift = rawValue - SHIFT_CENTER;

    if (Math.abs(drift) <= DEAD_ZONE) {
      return 0;
    }

    const positiveMax = Math.max(0, maxValue);
    const negativeMin = Math.min(0, minValue);
    const travel = Math.abs(drift) - DEAD_ZONE;
    const maxTravel =
      drift > 0
        ? Math.max(1, MAX_SHIFT_VALUE - (SHIFT_CENTER + DEAD_ZONE))
        : Math.max(1, SHIFT_CENTER - DEAD_ZONE);

    if (drift > 0) {
      const normalized = (travel / maxTravel) * positiveMax;
      return Math.min(positiveMax, Math.max(0, normalized));
    }

    const negativeScale = Math.abs(negativeMin) || 0;
    const normalized = (travel / maxTravel) * negativeScale;
    return Math.min(0, Math.max(-negativeScale, -normalized));
  }
  sideLengthsFromPoint(point: { x: number; y: number }): {
    left: number;
    right: number;
  } {
    const { x, y } = point;

    const leftLength = Math.hypot(
      y + BASE_HEIGHT,
      TRIANGLE_BASE_LENGTH / 2 + x,
    );
    const rightLength = Math.hypot(
      y + BASE_HEIGHT,
      TRIANGLE_BASE_LENGTH / 2 - x,
    );

    return { left: leftLength, right: rightLength };
  }
  isValidSideLengths(point: { x: number; y: number }): boolean {
    const { left, right } = this.sideLengthsFromPoint(point);
    return (
      left >= MIN_SIDE_LENGTH &&
      left <= MAX_SIDE_LENGTH &&
      right >= MIN_SIDE_LENGTH &&
      right <= MAX_SIDE_LENGTH
    );
  }

  _onData(buffer: Buffer): void {
    try {
      const { buttons } = this.parser.parse(buffer);
      const verticalShift = buttons[VERTICAL_SHIFT_BUTTON_INDEX];
      const horizontalShift = buttons[HORIZONTAL_SHIFT_BUTTON_INDEX];

      if (!verticalShift || !horizontalShift) {
        return;
      }

      const deltaY =
        this.normalizeShiftValue(verticalShift.value, -POINT_MAX, POINT_MAX) *
        CONTROL_SENSITIVITY;
      const deltaX =
        this.normalizeShiftValue(horizontalShift.value, -POINT_MAX, POINT_MAX) *
        CONTROL_SENSITIVITY;
      const nextPoint = {
        x: this.pointCoordinates.x + deltaX,
        y: Math.max(0 - BASE_HEIGHT, this.pointCoordinates.y + deltaY),
      };

      if (!this.isValidSideLengths(nextPoint)) {
        return;
      }

      this.pointCoordinates = nextPoint;

      const x = this.pointCoordinates.x;
      const y = this.pointCoordinates.y;
      const leftLength = this.sideLengthsFromPoint({ x, y }).left;
      const rightLength = this.sideLengthsFromPoint({ x, y }).right;
      serialController.setMotorPositionFromPoint(leftLength, rightLength);
      // broadcastState();
    } catch (err) {
      console.error(`Failed to parse HID data: ${err}`);
    }

    const payload = {
      pointCoordinates: this.pointCoordinates,
    };
    this.emit("data", payload);
  }
}

export default HIDController;
