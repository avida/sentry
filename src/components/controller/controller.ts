import { EventEmitter } from "events";
import HID from "node-hid";
import { HIDParser } from "./hid-parser";

export class Controller extends EventEmitter {
  options: any;
  parser: any;
  device: any | null;
  deviceInfo: any | null;
  path: string | null;

  constructor(options: any = {}) {
    super();
    this.options = options;

    this.parser =
      options.parser || new HIDParser({ endian: "LE", buttonCount: 9 });
    this.device = null;
    this.deviceInfo = null;
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
        if (d.usagePage === 0x01 && (d.usage === 0x04 || d.usage === 0x05)) return d;
      }
    }

    return devices.length ? devices[0] : null;
  }

  async discoverAndConnect(): Promise<any> {
    const devices = Controller.listDevices();
    const dev = Controller.findControllerDevice(devices);
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

  _onData(buffer: Buffer): void {
    try {
      if (this.parser && typeof this.parser.parse === "function") {
        const parsed = this.parser.parse(buffer);
        this.emit("data", { raw: buffer, parsed, device: this.deviceInfo });
        return;
      }
      this.emit("data", { raw: buffer, device: this.deviceInfo });
    } catch (err) {
      this.emit("error", err);
      this.emit("data", { raw: buffer, device: this.deviceInfo });
    }
  }
}

export default Controller;
