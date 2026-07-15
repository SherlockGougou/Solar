/**
 * URL state sync for shareable simulation state.
 *
 * Reads/writes query parameters: body, date, timeScale, bodyScale,
 * distanceScale, camera
 */

import type { CameraMode } from '../simulation/state/simulation-store';

export interface URLState {
  body?: string;
  date?: string; // ISO 8601
  timeScale?: number;
  bodyScale?: number;
  distanceScale?: number;
  camera?: CameraMode;
}

/** Parse URL query parameters into state */
export function parseURLState(): URLState {
  const params = new URLSearchParams(window.location.search);
  const state: URLState = {};

  const body = params.get('body');
  if (body) state.body = body;

  const date = params.get('date');
  if (date) state.date = date;

  const ts = params.get('timeScale');
  if (ts) state.timeScale = Number(ts);

  const bs = params.get('bodyScale');
  if (bs) state.bodyScale = Number(bs);

  const ds = params.get('distanceScale');
  if (ds) state.distanceScale = Number(ds);

  const cam = params.get('camera');
  if (cam && ['free', 'follow', 'topdown', 'surface'].includes(cam)) {
    state.camera = cam as CameraMode;
  }

  return state;
}

/** Update URL query parameters without page reload */
export function updateURLState(state: Partial<URLState>): void {
  const params = new URLSearchParams(window.location.search);

  if (state.body !== undefined) {
    if (state.body) params.set('body', state.body);
    else params.delete('body');
  }
  if (state.date !== undefined) {
    if (state.date) params.set('date', state.date);
    else params.delete('date');
  }
  if (state.timeScale !== undefined) {
    params.set('timeScale', String(state.timeScale));
  }
  if (state.bodyScale !== undefined) {
    params.set('bodyScale', String(state.bodyScale));
  }
  if (state.distanceScale !== undefined) {
    params.set('distanceScale', String(state.distanceScale));
  }
  if (state.camera !== undefined) {
    params.set('camera', state.camera);
  }

  const newURL = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;

  window.history.replaceState(null, '', newURL);
}
