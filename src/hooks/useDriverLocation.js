// AI-assisted: see docs/AI_LOG.md #42, #43, #50
import { useEffect } from 'react';
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
 * Keeps session location on device GPS via watchPosition (Spec 6 / 12).
 * Availability controls writes to driverLocations, not the GPS watch itself.
 */
export function useDriverLocation() {
  const {
    isAvailable,
    location,
    hasLocationPermission,
    hasRealFix,
    updateLocation,
    setLocationPermission,
    setLocationRealFix,
  } = useDriverSession();

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

        setLocationPermission(true);

        Geolocation.getCurrentPosition(
          (fix) => {
            if (cancelled || !fix?.coords) return;
            setLocationRealFix(true);
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
            setLocationRealFix(true);
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
  }, [updateLocation, setLocationPermission, setLocationRealFix]);

  return {
    location,
    isTracking: isAvailable,
    hasPermission: hasLocationPermission,
    hasRealFix,
  };
}
