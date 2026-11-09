// AI-assisted: see docs/AI_LOG.md #42, #43
import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { useDriverSession } from '../context/DriverSessionContext';

const TICK_MS = 5000;
const DISTANCE_M = 5;

/**
 * @param {{ latitude: number, longitude: number }} coords
 * @returns {{ lat: number, lng: number }}
 */
function toLatLng(coords) {
  return {
    lat: Number(coords.latitude.toFixed(6)),
    lng: Number(coords.longitude.toFixed(6)),
  };
}

/**
 * @returns {Promise<boolean>}
 */
async function requestLocationPermission() {
  try {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }

    return await new Promise((resolve) => {
      Geolocation.requestAuthorization(
        () => resolve(true),
        () => resolve(false)
      );
    });
  } catch {
    return false;
  }
}

/**
 * Keeps the map on the device GPS via watchPosition.
 * Availability only controls whether the driver is "en seguimiento".
 */
export function useDriverLocation() {
  const { isAvailable, location, updateLocation } = useDriverSession();
  const [hasPermission, setHasPermission] = useState(false);
  const [hasRealFix, setHasRealFix] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let watchId = null;

    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse',
      locationProvider: 'auto',
    });

    (async () => {
      try {
        const granted = await requestLocationPermission();
        if (cancelled || !granted) {
          return;
        }

        setHasPermission(true);

        Geolocation.getCurrentPosition(
          (fix) => {
            if (cancelled || !fix?.coords) return;
            setHasRealFix(true);
            updateLocation(toLatLng(fix.coords));
          },
          () => {},
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          }
        );

        watchId = Geolocation.watchPosition(
          (fix) => {
            if (!fix?.coords) return;
            setHasRealFix(true);
            updateLocation(toLatLng(fix.coords));
          },
          () => {},
          {
            enableHighAccuracy: true,
            distanceFilter: DISTANCE_M,
            interval: TICK_MS,
            fastestInterval: TICK_MS,
            maximumAge: 10000,
            timeout: 15000,
          }
        );
      } catch {
        // permission or native module failure — keep last known location
      }
    })();

    return () => {
      cancelled = true;
      if (watchId != null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [updateLocation]);

  return {
    location,
    isTracking: isAvailable,
    hasPermission,
    hasRealFix,
  };
}
