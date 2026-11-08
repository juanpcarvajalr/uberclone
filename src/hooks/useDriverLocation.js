import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { useDriverSession } from '../context/DriverSessionContext';

const TICK_MS = 5000;
const JITTER = 0.00015;

/**
 * @param {import('expo-location').LocationObjectCoords} coords
 * @returns {{ lat: number, lng: number }}
 */
function toLatLng(coords) {
  return {
    lat: Number(coords.latitude.toFixed(6)),
    lng: Number(coords.longitude.toFixed(6)),
  };
}

/**
 * Keeps the map on the device GPS. Continuous watch is for UI;
 * availability only controls whether the driver is "en seguimiento".
 */
export function useDriverLocation() {
  const { isAvailable, location, updateLocation } = useDriverSession();
  const locationRef = useRef(location);
  locationRef.current = location;
  const [hasPermission, setHasPermission] = useState(false);
  const [hasRealFix, setHasRealFix] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let subscription = null;
    let mockInterval = null;

    (async () => {
      try {
        const current = await Location.getForegroundPermissionsAsync();
        const permission =
          current.status === 'granted'
            ? current
            : await Location.requestForegroundPermissionsAsync();

        if (cancelled || permission.status !== 'granted') {
          return;
        }

        setHasPermission(true);

        try {
          const last = await Location.getLastKnownPositionAsync();
          if (!cancelled && last?.coords) {
            setHasRealFix(true);
            updateLocation(toLatLng(last.coords));
          }
        } catch {
          // ignore
        }

        try {
          const fix = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          if (!cancelled && fix?.coords) {
            setHasRealFix(true);
            updateLocation(toLatLng(fix.coords));
          }
        } catch {
          // emulator may need Set Location before this succeeds
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: TICK_MS,
            distanceInterval: 5,
          },
          (fix) => {
            setHasRealFix(true);
            updateLocation(toLatLng(fix.coords));
          }
        );
      } catch {
        if (cancelled) return;
        mockInterval = setInterval(() => {
          const currentLocation = locationRef.current;
          updateLocation({
            lat: Number(
              (currentLocation.lat + (Math.random() - 0.5) * JITTER).toFixed(6)
            ),
            lng: Number(
              (currentLocation.lng + (Math.random() - 0.5) * JITTER).toFixed(6)
            ),
          });
        }, TICK_MS);
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
      if (mockInterval) clearInterval(mockInterval);
    };
  }, [updateLocation]);

  return {
    location,
    isTracking: isAvailable,
    hasPermission,
    hasRealFix,
  };
}
