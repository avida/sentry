import { create } from "zustand";

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
    setCameraIndex: (n: number) => set({ cameraIndex: n }),
    cameraUrl: (index?: number) => {
      return `http://192.168.44.145:1984/api/webrtc?src=zavod${get().cameraIndex}`;
    },
  };
});

export default useCameraIndexStore;
