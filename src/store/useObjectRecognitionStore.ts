import { create } from "zustand";

export type RecognizedObject = {
  bbox: [number, number, number, number];
  score: number;
  id: number;
};

export type ObjectRecognitionResponse = {
  timestamp: number;
  objects: Record<string, RecognizedObject[]>;
};

type ObjectRecognitionState = {
  objects: RecognizedObject[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  intervalId: ReturnType<typeof globalThis.setInterval> | null;
  setObjects: (objects: RecognizedObject[]) => void;
  fetchObjects: () => Promise<RecognizedObject[]>;
  clearObjects: () => void;
  startPolling: (intervalMs?: number) => () => void;
  stopPolling: () => void;
};

const OBJECTS_ENDPOINT = "http://localhost:8080/objects";
export const OBJECTS_POLL_INTERVAL_MS = 2000;

const parseObjects = (payload: unknown): RecognizedObject[] => {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const response = payload as Partial<ObjectRecognitionResponse>;

  if (Array.isArray(response.objects)) {
    return response.objects as RecognizedObject[];
  }

  if (response.objects && typeof response.objects === "object") {
    return Object.values(response.objects).flatMap((entry) => {
      if (Array.isArray(entry)) {
        return entry as RecognizedObject[];
      }
      return [];
    });
  }

  return [];
};

export const useObjectRecognitionStore = create<ObjectRecognitionState>((set, get) => ({
  objects: [],
  loading: false,
  error: null,
  lastUpdated: null,
  intervalId: null,
  setObjects: (objects) => set({ objects, lastUpdated: Date.now(), error: null }),
  fetchObjects: async () => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(OBJECTS_ENDPOINT, { method: "GET" });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = await response.json();
      const objects = parseObjects(payload);
      console.log("Fetched objs:", objects);

      set({ objects, loading: false, error: null, lastUpdated: Date.now() });
      return objects;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to fetch objects:", message);
      set({ loading: false, error: message });
      return [];
    }
  },
  clearObjects: () =>
    set({ objects: [], loading: false, error: null, lastUpdated: null }),
  startPolling: (intervalMs = OBJECTS_POLL_INTERVAL_MS) => {
    if (get().intervalId !== null) {
      return () => get().stopPolling();
    }

    void get().fetchObjects();

    const intervalId = globalThis.setInterval(() => {
      void get().fetchObjects();
    }, intervalMs);

    set({ intervalId });

    return () => get().stopPolling();
  },
  stopPolling: () => {
    const currentInterval = get().intervalId;
    if (currentInterval !== null) {
      globalThis.clearInterval(currentInterval);
    }

    set({ intervalId: null });
  },
}));

export default useObjectRecognitionStore;
