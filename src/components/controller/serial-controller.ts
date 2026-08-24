import { EventEmitter } from "events";
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const POSITION_POLL_INTERVAL_MS = 500;

export class SerialController extends EventEmitter {
  portPath: string;
  options: any;
  port: any | null;
  parser: any | null;

  constructor(portPath = "/dev/ttyUSB0", options: any = { baudRate: 115200 }) {
    super();
    this.portPath = portPath;
    this.options = options;
    this.port = null;
    this.parser = null;
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
        console.log(`[serial]: ${text}`);
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

  // sendShift: send three bytes to the serial device (as numbers 0-255)
  sendShift(a: number, b: number, c: number): void {
    if (!this.port) return;
    try {
      const buf = Buffer.from([a & 0xff, b & 0xff, c & 0xff]);
      this.port.write(buf);
    } catch (e) {
      this.emit("error", e);
    }
  }
}

export default SerialController;

// singleton that attempts to connect when the module is loaded (app start)
export const serialController = new SerialController();
serialController
  .connect()
  .catch((err) => console.error("Serial connect failed:", err));
