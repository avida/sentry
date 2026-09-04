import { EventEmitter } from "events";
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const POSITION_POLL_INTERVAL_MS = 500;

export class SerialController extends EventEmitter {
  portPath: string;
  options: any;
  port: any | null;
  parser: any | null;
  currentMotorPosition: { left: number; right: number };
  pointCoordinates: { x: number; y: number };

  constructor(portPath = "/dev/ttyUSB0", options: any = { baudRate: 115200 }) {
    super();
    this.portPath = portPath;
    this.options = options;
    this.port = null;
    this.parser = null;
    this.currentMotorPosition = { left: 0, right: 0 };
    this.pointCoordinates = { x: 0, y: 0 };
  }

  updateCurrentPositionFromText(text: string): boolean {
    const pairMatch = String(text).match(
      /-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?/,
    );
    if (pairMatch) {
      const [x, y] = pairMatch[0].split(",").map((part) => Number(part.trim()));

      this.currentMotorPosition = {
        left: x,
        right: y,
      };
      return true;
    }
    return false;
  }
  broadcastState() {
    const payload = JSON.stringify({
      currentMotorPosition: this.currentMotorPosition,
      status: this.currentMotorPosition === null ? "waiting" : "ok",
    });
    this.emit("data", payload);
  }

  async connect(): Promise<void> {
    if (this.port) return;

    // ensure we always pass a defined path to SerialPort
    const resolvedPath = this.portPath || "/dev/ttyUSB0";
    this.portPath = resolvedPath;

    this.port = new SerialPort(
      { path: resolvedPath, baudRate: this.options.baudRate },
      (err: { message: any }) => {
        if (err)
          console.error(
            `Failed to open serial port ${resolvedPath}: ${err.message}`,
          );
      },
    );
    this.parser = this.port.pipe(new ReadlineParser({ delimiter: "\n" }));
    this.parser.on("data", (line: any) => {
      const text = String(line).trim();
      if (text) {
        if (this.updateCurrentPositionFromText(text)) {
          this.broadcastState();
        } else {
          console.log(`[serial]: ${text}`);
        }
      }
    });

    setInterval(() => {
      if (!this.port.isOpen) {
        return;
      }

      const message = Buffer.alloc(1);
      message[0] = 2;

      this.port.write(message, (err: { message: any }) => {
        if (err) {
          console.error(`Serial write failed: ${err.message}`);
        }
      });
    }, POSITION_POLL_INTERVAL_MS);
  }

  disconnect(): void {
    if (!this.port) return;
    try {
      this.port.close();
    } catch (e) {
      this.emit("error", e);
    }
  }

  sendOneByte(): void {
    if (!this.port) return;
    try {
      this.port.write(Buffer.from([1]));
    } catch (e) {
      this.emit("error", e);
    }
  }

  // sendShift: send a single signed integer in range -255..255 using format:
  // [0] = 1 (command byte), [1] = low byte, [2] = high byte (little-endian)
  sendShift(value: number): void {
    if (!this.port) return;
    try {
      let n = Number(value) || 0;
      n = Math.trunc(n);
      if (n > 255) n = 255;
      if (n < -255) n = -255;

      // represent as signed 16-bit (two's complement) and send low byte first
      const int16 = n & 0xffff;
      const low = int16 & 0xff;
      const high = (int16 >> 8) & 0xff;

      const buf = Buffer.from([1, low, high]);
      this.port.write(buf);
    } catch (e) {
      this.emit("error", e);
    }
  }
  setMotorPositionFromPoint(leftLength: number, rightLength: number) {
    const message = Buffer.alloc(5);
    message[0] = 1;
    message.writeInt16LE(Math.round(leftLength), 1);
    message.writeInt16LE(Math.round(rightLength), 3);

    this.port.write(message, (err: { message: any }) => {
      if (err) console.error(`Serial write failed: ${err.message}`);
    });
  }
}

export default SerialController;

// singleton that attempts to connect when the module is loaded (app start)
export const serialController = new SerialController();
serialController
  .connect()
  .catch((err) => console.error("Serial connect failed:", err));
