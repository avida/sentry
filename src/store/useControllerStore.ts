import { create } from "zustand";

type ButtonState = {
  index: number;
  value: number;
  pressed: boolean;
};

type ParsedControllerData = {
  flags?: number;
  flagsBits?: boolean[];
  buttons?: ButtonState[];
};

type ControllerState = {
  parsed: ParsedControllerData;
  setParsed: (parsed: ParsedControllerData | null | undefined) => void;
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

export const useControllerStore = create<ControllerState>((set) => ({
  parsed: { buttons: [] },
  setParsed: (parsed) => set({ parsed: normalizeParsedControllerData(parsed) }),
  clear: () => set({ parsed: { buttons: [] } }),
}));

export default useControllerStore;
