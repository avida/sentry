import { create } from "zustand";

type ButtonState = {
  index: number;
  value: number;
  pressed: boolean;
};

export type PointCoordinates = {
  x: number;
  y: number;
};

type ParsedControllerData = {
  flags?: number;
  flagsBits?: boolean[];
  buttons?: ButtonState[];
};

type ControllerData = ParsedControllerData & {
  parsed?: ParsedControllerData;
  pointCoordinates?: PointCoordinates;
};

type ControllerState = {
  parsed: ParsedControllerData;
  pointCoordinates: PointCoordinates;
  setControllerData: (data: ControllerData | null | undefined) => void;
  setPointCoordinates: (pointCoordinates: PointCoordinates) => void;
  clear: () => void;
};

const normalizeParsedControllerData = (
  value: ParsedControllerData | null | undefined,
): ParsedControllerData => {
  const parsed = value ?? {};

  return {
    flags: parsed.flags,
    flagsBits: Array.isArray(parsed.flagsBits) ? parsed.flagsBits : [],
    buttons: Array.isArray(parsed.buttons)
      ? parsed.buttons.map((button) => ({
          index: Number(button?.index ?? 0),
          value: Number(button?.value ?? 0),
          pressed: Boolean(button?.pressed),
        }))
      : [],
  };
};

const normalizePointCoordinates = (
  value: PointCoordinates | null | undefined,
): PointCoordinates => {
  const x = value?.x;
  const y = value?.y;

  return {
    x: typeof x === "number" && Number.isFinite(x) ? x : 0,
    y: typeof y === "number" && Number.isFinite(y) ? y : 0,
  };
};

export const useHIDControllerStore = create<ControllerState>((set) => ({
  parsed: { buttons: [] },
  pointCoordinates: { x: 0, y: 0 },
  setControllerData: (data) =>
    set((state) => ({
      parsed: data?.parsed
        ? normalizeParsedControllerData(data.parsed)
        : data?.buttons
          ? normalizeParsedControllerData(data)
          : state.parsed,
      pointCoordinates: data?.pointCoordinates
        ? normalizePointCoordinates(data.pointCoordinates)
        : state.pointCoordinates,
    })),
  setPointCoordinates: (pointCoordinates) =>
    set({ pointCoordinates: normalizePointCoordinates(pointCoordinates) }),
  clear: () => set({ parsed: { buttons: [] }, pointCoordinates: { x: 0, y: 0 } }),
}));

export default useHIDControllerStore;
