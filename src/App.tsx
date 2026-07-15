/**
 * Main application component.
 *
 * Renders the 3D solar scene with all UI overlays:
 * - Navigation panel (left)
 * - Info panel (right)
 * - Scale controls (top)
 * - Time controls (bottom)
 */

import { useEffect } from 'react';
import SolarScene from './components/simulation/SolarScene';
import NavigationPanel from './components/panels/NavigationPanel';
import InfoPanel from './components/panels/InfoPanel';
import TimeControls from './components/controls/TimeControls';
import ScaleControls from './components/controls/ScaleControls';
import { useSimulationStore } from './simulation/state/simulation-store';
import { parseURLState, updateURLState } from './utils/url-state';
import { CELESTIAL_BODIES } from './data/celestial-bodies';

export default function App() {
  // Initialize from URL state on mount
  useEffect(() => {
    const urlState = parseURLState();
    const store = useSimulationStore.getState();

    if (urlState.body && CELESTIAL_BODIES.find((b) => b.id === urlState.body)) {
      store.selectBody(urlState.body);
    }
    if (urlState.date) {
      const ms = new Date(urlState.date).getTime();
      if (!isNaN(ms)) store.setSimulationTime(ms);
    }
    if (urlState.timeScale) store.setTimeScale(urlState.timeScale);
    if (urlState.bodyScale) store.setBodySizeMultiplier(urlState.bodyScale);
    if (urlState.distanceScale) store.setOrbitDistanceMultiplier(urlState.distanceScale);
    if (urlState.camera) store.setCameraMode(urlState.camera);
  }, []);

  // Sync to URL on state changes (debounced)
  useEffect(() => {
    const unsub = useSimulationStore.subscribe((state) => {
      updateURLState({
        body: state.selectedBodyId || undefined,
        date: new Date(state.simulationTimeUtcMs).toISOString(),
        timeScale: state.timeScale,
        bodyScale: state.bodySizeMultiplier,
        distanceScale: state.orbitDistanceMultiplier,
        camera: state.cameraMode,
      });
    });
    return unsub;
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          useSimulationStore.getState().togglePause();
          break;
        case 'r':
        case 'R':
          useSimulationStore.getState().goToNow();
          break;
        case 'ArrowRight':
          useSimulationStore.getState().stepTime(86400);
          break;
        case 'ArrowLeft':
          useSimulationStore.getState().stepTime(-86400);
          break;
        case 'Escape':
          useSimulationStore.getState().selectBody(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden bg-black">
      {/* 3D Scene (full screen background) */}
      <SolarScene />

      {/* UI Overlays */}
      <NavigationPanel />
      <InfoPanel />
      <ScaleControls />
      <TimeControls />
    </div>
  );
}
