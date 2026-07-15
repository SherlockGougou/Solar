/**
 * Main simulation store: time, body selection, camera, and scale state.
 */

import { create } from 'zustand';
import { MS_PER_S } from '../astronomy/time';

export type ScaleMode = 'realistic' | 'enhanced' | 'educational';
export type CameraMode = 'free' | 'follow' | 'topdown' | 'surface' | 'overview' | 'side';

export interface SimulationState {
  // Time
  simulationTimeUtcMs: number;
  timeScale: number; // simulation seconds per real second
  paused: boolean;
  timeDirection: 1 | -1;

  // Selection
  selectedBodyId: string | null;

  // Camera
  cameraMode: CameraMode;

  // Scale
  bodySizeMultiplier: number;
  orbitDistanceMultiplier: number;
  scaleMode: ScaleMode;

  // UI toggles
  showOrbitLines: boolean;
  showLabels: boolean;
  showGrid: boolean;
  lightingMode: 'scientific' | 'assisted';

  // Actions
  setSimulationTime: (ms: number) => void;
  advanceTime: (deltaRealSeconds: number) => void;
  setTimeScale: (scale: number) => void;
  togglePause: () => void;
  setTimeDirection: (dir: 1 | -1) => void;
  goToNow: () => void;
  stepTime: (simSeconds: number) => void;

  selectBody: (id: string | null) => void;
  setCameraMode: (mode: CameraMode) => void;
  resetCamera: () => void;

  setBodySizeMultiplier: (v: number) => void;
  setOrbitDistanceMultiplier: (v: number) => void;
  setScaleMode: (mode: ScaleMode) => void;

  setShowOrbitLines: (v: boolean) => void;
  setShowLabels: (v: boolean) => void;
  setShowGrid: (v: boolean) => void;
  setLightingMode: (mode: 'scientific' | 'assisted') => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  // Initial time = now
  simulationTimeUtcMs: Date.now(),
  timeScale: 86_400, // 1 day/second default
  paused: false,
  timeDirection: 1,

  selectedBodyId: 'earth',
  cameraMode: 'free',

  bodySizeMultiplier: 1,
  orbitDistanceMultiplier: 1,
  scaleMode: 'realistic',

  showOrbitLines: true,
  showLabels: true,
  showGrid: false,
  lightingMode: 'scientific',

  setSimulationTime: (ms) => set({ simulationTimeUtcMs: ms }),

  advanceTime: (deltaRealSeconds) => {
    const { paused, timeScale, timeDirection, simulationTimeUtcMs } = get();
    if (paused) return;
    const advance = deltaRealSeconds * timeScale * timeDirection * MS_PER_S;
    set({ simulationTimeUtcMs: simulationTimeUtcMs + advance });
  },

  setTimeScale: (scale) => set({ timeScale: scale }),
  togglePause: () => set((s) => ({ paused: !s.paused })),
  setTimeDirection: (dir) => set({ timeDirection: dir }),

  goToNow: () => set({ simulationTimeUtcMs: Date.now() }),

  stepTime: (simSeconds) => {
    const { simulationTimeUtcMs } = get();
    set({ simulationTimeUtcMs: simulationTimeUtcMs + simSeconds * MS_PER_S });
  },

  selectBody: (id) => set({ selectedBodyId: id }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  resetCamera: () => set({ cameraMode: 'free', selectedBodyId: 'sun' }),

  setBodySizeMultiplier: (v) => set({ bodySizeMultiplier: v }),
  setOrbitDistanceMultiplier: (v) => set({ orbitDistanceMultiplier: v }),

  setScaleMode: (mode) => {
    switch (mode) {
      case 'realistic':
        set({ scaleMode: mode, bodySizeMultiplier: 1, orbitDistanceMultiplier: 1 });
        break;
      case 'enhanced':
        set({ scaleMode: mode, bodySizeMultiplier: 100, orbitDistanceMultiplier: 1 });
        break;
      case 'educational':
        set({ scaleMode: mode, bodySizeMultiplier: 500, orbitDistanceMultiplier: 0.1 });
        break;
    }
  },

  setShowOrbitLines: (v) => set({ showOrbitLines: v }),
  setShowLabels: (v) => set({ showLabels: v }),
  setShowGrid: (v) => set({ showGrid: v }),
  setLightingMode: (mode) => set({ lightingMode: mode }),
}));
