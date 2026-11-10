// AI-assisted: see docs/AI_LOG.md #50
import { useEffect, useMemo, useState } from 'react';
import {
  bearingDegrees,
  densifyRoute,
} from '../utils/routeCoordinates';

const TICK_MS = 50;

/**
 * Animates a vehicle along a Directions polyline (demo motion, not live GPS).
 * @param {{ latitude: number, longitude: number }[]|null|undefined} routeCoordinates
 * @param {{
 *   playing?: boolean,
 *   durationMs?: number,
 *   resetKey?: string|number|null,
 * }} [options]
 * @returns {{
 *   position: { latitude: number, longitude: number } | null,
 *   heading: number,
 *   progress: number,
 *   finished: boolean,
 * }}
 */
export function useRouteSimulation(routeCoordinates, options = {}) {
  const {
    playing = true,
    durationMs = 45000,
    resetKey = null,
  } = options;

  const path = useMemo(
    () => densifyRoute(routeCoordinates ?? []),
    [routeCoordinates]
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [resetKey, path]);

  useEffect(() => {
    if (!playing || path.length < 2) {
      return undefined;
    }

    const totalSteps = path.length - 1;
    const intervalMs = Math.max(
      TICK_MS,
      Math.floor(durationMs / Math.max(totalSteps, 1))
    );

    const timer = setInterval(() => {
      setIndex((prev) => {
        if (prev >= totalSteps) {
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [playing, path, durationMs, resetKey]);

  if (path.length === 0) {
    return {
      position: null,
      heading: 0,
      progress: 0,
      finished: false,
    };
  }

  const safeIndex = Math.min(index, path.length - 1);
  const position = path[safeIndex];
  const next = path[Math.min(safeIndex + 1, path.length - 1)];
  const finished = safeIndex >= path.length - 1;
  const progress = path.length <= 1 ? 1 : safeIndex / (path.length - 1);

  return {
    position,
    heading: bearingDegrees(position, next),
    progress,
    finished,
  };
}
