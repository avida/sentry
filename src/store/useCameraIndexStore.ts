import { create } from "zustand";

const CAMERA_CONTROL_ENDPOINT = "http://localhost:8080/camera";

type SignalState = {
  cameraIndex: number;
  setCameraIndex: (n: number) => void;
  signalingTemplate: string;
  setSignalingTemplate: (t: string) => void;
  cameraUrl: (index?: number) => string;
};

export const useCameraIndexStore = create<SignalState>((set, get) => {
  return {
    cameraIndex: 1,
    setCameraIndex: (n: number) => {
      const nextIndex = Number.isFinite(n) ? n : 1;
      set({ cameraIndex: nextIndex });

      void fetch(CAMERA_CONTROL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ camera_index: nextIndex }),
      }).catch((error) => {
        console.warn("Camera index update request failed:", error);
      });
    },
    signalingTemplate: "",
    setSignalingTemplate: (t: string) => set({ signalingTemplate: t }),
    cameraUrl: (index?: number) => {
      const idx = typeof index === "number" ? index : get().cameraIndex;
      return `http://192.168.44.145:1984/api/webrtc?src=zavod${idx}`;
    },
  };
});

export default useCameraIndexStore;