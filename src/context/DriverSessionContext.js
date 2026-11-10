// AI-assisted: see docs/AI_LOG.md #9, #28, #41, #50
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { MOCK_DRIVER_LOCATION } from '../mocks/driver';
import { upsertDriverLocation } from '../services/driverLocationService';

const DriverSessionContext = createContext(null);

const STORAGE_KEYS = {
  isAvailable: '@uberclone/isAvailable',
};

/**
 * Provides driver session state backed by Firebase Auth + Firestore.
 * @param {{ children: React.ReactNode }} props
 */
export function DriverSessionProvider({ children }) {
  const [driver, setDriver] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [location, setLocation] = useState(MOCK_DRIVER_LOCATION.location);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [hasRealFix, setHasRealFix] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedRegistration, setHasCompletedRegistration] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setIsAuthenticated(false);
          setHasCompletedRegistration(false);
          setDriver(null);
          setVehicle(null);
          setIsAvailable(false);
          return;
        }

        setAuthReady(false);

        const driverSnap = await getDoc(doc(db, 'drivers', user.uid));
        if (!driverSnap.exists()) {
          setDriver(null);
          setVehicle(null);
          setHasCompletedRegistration(false);
          setIsAuthenticated(true);
          return;
        }

        const driverData = { ...driverSnap.data(), uid: user.uid };
        let nextVehicle = null;

        if (driverData.vehicleId) {
          const vehicleSnap = await getDoc(doc(db, 'vehicles', driverData.vehicleId));
          if (vehicleSnap.exists()) {
            nextVehicle = { vehicleId: vehicleSnap.id, ...vehicleSnap.data() };
          }
        }

        setDriver(driverData);
        setVehicle(nextVehicle);
        setHasCompletedRegistration(true);
        setIsAuthenticated(true);

        try {
          const saved = await AsyncStorage.getItem(STORAGE_KEYS.isAvailable);
          if (saved === 'true') {
            setIsAvailable(true);
          }
        } catch {
          // ignore
        }
      } catch {
        setHasCompletedRegistration(false);
        setIsAuthenticated(Boolean(auth.currentUser));
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!driver?.uid) {
      return undefined;
    }

    const unsubscribe = onSnapshot(doc(db, 'drivers', driver.uid), (snap) => {
      if (!snap.exists()) {
        return;
      }
      setDriver((prev) => ({ ...(prev ?? {}), ...snap.data(), uid: snap.id }));
    });

    return () => unsubscribe();
  }, [driver?.uid]);

  useEffect(() => {
    const vehicleId = driver?.vehicleId;
    if (!vehicleId) {
      return undefined;
    }

    const unsubscribe = onSnapshot(doc(db, 'vehicles', vehicleId), (snap) => {
      if (!snap.exists()) {
        return;
      }
      setVehicle({ vehicleId: snap.id, ...snap.data() });
    });

    return () => unsubscribe();
  }, [driver?.vehicleId]);

  useEffect(() => {
    if (!driver?.uid || !isAvailable) {
      return undefined;
    }

    let cancelled = false;
    (async () => {
      try {
        if (cancelled) return;
        await upsertDriverLocation({
          uid: driver.uid,
          isAvailable: true,
          location,
          category: vehicle?.category ?? 'economy',
        });
      } catch {
        // ignore transient location writes
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [driver?.uid, isAvailable, location, vehicle?.category]);

  const setAvailability = useCallback(async (next) => {
    if (driver?.accountStatus !== 'approved' && next) {
      return { ok: false, reason: 'account_not_approved' };
    }

    setIsAvailable(next);

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.isAvailable, String(next));
    } catch {
      // ignore
    }

    if (driver?.uid) {
      try {
        await upsertDriverLocation({
          uid: driver.uid,
          isAvailable: next,
          location,
          category: vehicle?.category ?? 'economy',
        });
      } catch {
        // ignore
      }
    }

    return { ok: true };
  }, [driver?.accountStatus, driver?.uid, location, vehicle?.category]);

  const updateLocation = useCallback((coords) => {
    setLocation(coords);
  }, []);

  const setLocationPermission = useCallback((granted) => {
    setHasLocationPermission(Boolean(granted));
  }, []);

  const setLocationRealFix = useCallback((value) => {
    setHasRealFix(Boolean(value));
  }, []);

  const applyRegistrationResult = useCallback((result) => {
    setDriver(result.driver);
    setVehicle(result.vehicle);
    setHasCompletedRegistration(true);
    setIsAuthenticated(true);
    setIsAvailable(false);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setHasCompletedRegistration(false);
    setDriver(null);
    setVehicle(null);
    setIsAvailable(false);
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.isAvailable]);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({
      driver: driver ?? {
        fullName: '',
        documentNumber: '',
        phone: '',
        email: '',
        accountStatus: 'pending',
        mercadoPagoEmail: '',
      },
      vehicle: vehicle ?? {
        plate: '',
        brand: '',
        model: '',
        year: 0,
        category: '',
        color: '',
        passengerCapacity: 0,
      },
      isAvailable,
      location,
      hasLocationPermission,
      hasRealFix,
      isAuthenticated,
      hasCompletedRegistration,
      authReady,
      setAvailability,
      updateLocation,
      setLocationPermission,
      setLocationRealFix,
      applyRegistrationResult,
      signOut,
      setHasCompletedRegistration,
    }),
    [
      driver,
      vehicle,
      isAvailable,
      location,
      hasLocationPermission,
      hasRealFix,
      isAuthenticated,
      hasCompletedRegistration,
      authReady,
      setAvailability,
      updateLocation,
      setLocationPermission,
      setLocationRealFix,
      applyRegistrationResult,
      signOut,
    ]
  );

  return (
    <DriverSessionContext.Provider value={value}>
      {children}
    </DriverSessionContext.Provider>
  );
}

/**
 * @returns {ReturnType<typeof useMemo>}
 */
export function useDriverSession() {
  const ctx = useContext(DriverSessionContext);
  if (!ctx) {
    throw new Error('useDriverSession must be used within DriverSessionProvider');
  }
  return ctx;
}
