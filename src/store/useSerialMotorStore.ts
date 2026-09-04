import { create } from "zustand";

export type MotorPosition = {
  left: number;
  right: number;
};

export type MotorStatus = "waiting" | "ok" | "unknown";

export type SerialMotorPayload = {
  currentMotorPosition?: MotorPosition | null;
  status?: MotorStatus | string | null;
};

type SerialMotorState = {
  currentMotorPosition: MotorPosition;
  status: MotorStatus;
  setMotorState: (payload: SerialMotorPayload | string | null | undefined) => void;
  clear: () => void;
};

const normalizeMotorPosition = (
  value: MotorPosition | null | undefined,
): MotorPosition => ({
  left: typeof value?.left === "number" && Number.isFinite(value.left) ? value.left : 0,
  right: typeof value?.right === "number" && Number.isFinite(value.right) ? value.right : 0,
});

const normalizeStatus = (
  value: MotorStatus | string | null | undefined,
): MotorStatus => {
  if (value === "ok" || value === "waiting") return value;
  return "unknown";
};

export const useSerialMotorStore = create<SerialMotorState>((set) => ({
  currentMotorPosition: { left: 0, right: 0 },
  status: "unknown",
  setMotorState: (payload) => {
    try {
      const parsed =
        typeof payload === "string" ? JSON.parse(payload) : payload ?? {};

      const target = parsed?.currentMotorPosition ?? parsed ?? {};
      set({
        currentMotorPosition: normalizeMotorPosition(target),
        status: normalizeStatus(parsed?.status ?? "ok"),
      });
    } catch {
      set({
        currentMotorPosition: { left: 0, right: 0 },
        status: "unknown",
      });
    }
  },
  clear: () =>
    set({
      currentMotorPosition: { left: 0, right: 0 },
      status: "unknown",
    }),
}));

export default useSerialMotorStore;
