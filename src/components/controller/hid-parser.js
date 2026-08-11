export class HIDParser {
  constructor({ endian = "LE", buttonCount = 9 } = {}) {
    this.endian = endian === "BE" ? "BE" : "LE";
    this.buttonCount = buttonCount;
    this.requiredLength = 1 + 2 * this.buttonCount;
  }

  parse(buffer) {
    if (!Buffer.isBuffer(buffer))
      throw new TypeError("buffer must be a Buffer");
    if (buffer.length < this.requiredLength)
      throw new RangeError(
        `buffer must be at least ${this.requiredLength} bytes`,
      );

    const flags = buffer[0];
    const flagsBits = [];
    for (let i = 0; i < 2; i++) flagsBits.push(Boolean(flags & (1 << i)));

    const buttons = [];
    for (let i = 0; i < this.buttonCount; i++) {
      const offset = 1 + i * 2;
      const value =
        this.endian === "LE"
          ? buffer.readUInt16LE(offset)
          : buffer.readUInt16BE(offset);
      buttons.push({ index: i, value, pressed: value !== 0 });
    }

    return { flags, flagsBits, buttons };
  }

  printState(buffer, { name } = {}) {
    const { flags, flagsBits, buttons } = this.parse(buffer);
    const prefix = name ? `${name}: ` : "";
    console.log(
      `${prefix}flags=0x${flags.toString(16).padStart(2, "0")} bits=${flagsBits.map((b) => (b ? "1" : "0")).join("")}`,
    );
    for (const b of buttons) {
      console.log(
        `${prefix}button[${b.index}]: value=${b.value} ${b.pressed ? "(pressed)" : "(released)"} `,
      );
    }
  }

  setEndian(endian) {
    this.endian = endian === "BE" ? "BE" : "LE";
  }
}

export default HIDParser;
