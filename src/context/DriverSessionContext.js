// AI-assisted: see docs/AI_LOG.md #9, #28
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_DRIVER, MOCK_VEHICLE, MOCK_DRIVER_LOCATION } from '../mocks/driver';

const DriverSessionContext = createContext(null);

const STORAGE_KEYS = {
  language: '@uberclone/language',
  isAvailable: '@uberclone/isAvailable',
};

/**
 * Provides mock driver session state (no Firebase yet).
 * @param {{ children: React.ReactNode }} props
 */
export function DriverSessionProvider({ children }) {
  const [driver, setDriver] = useState(MOCK_DRIVER);
  const [vehicle, setVehicle] = useState(MOCK_VEHICLE);
  const [isAvailable, setIsAvailable] = useState(MOCK_DRIVER_LOCATION.isAvailable);
  const [location, setLocation] = useState(MOCK_DRIVER_LOCATION.location);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [hasCompletedRegistration, setHasCompletedRegistration] = useState(true);

  const updateLanguage = useCallback(async (language) => {
    setDriver((prev) => ({ ...prev, language }));
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.language, language);
    } catch {
      // ignore persistence errors in mock mode
    }
  }, []);

  const setAvailability = useCallback(async (next) => {
    if (driver.accountStatus !== 'approved' && next) {
      return { ok: false, reason: 'account_not_approved' };
    }
    setIsAvailable(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.isAvailable, String(next));
    } catch {
      // ignore
    }
    return { ok: true };
  }, [driver.accountStatus]);

  const updateLocation = useCallback((coords) => {
    setLocation(coords);
  }, []);

  const completeRegistration = useCallback((payload) => {
    setDriver((prev) => ({ ...prev, ...payload.driver, accountStatus: 'pending' }));
    setVehicle((prev) => ({ ...prev, ...payload.vehicle }));
    setHasCompletedRegistration(true);
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(async () => {
    setIsAuthenticated(false);
    setIsAvailable(false);
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.isAvailable]);
    } catch {
      // ignore
    }
  }, []);

  const signInMock = useCallback(() => {
    setIsAuthenticated(true);
    setDriver(MOCK_DRIVER);
    setVehicle(MOCK_VEHICLE);
    setHasCompletedRegistration(true);
  }, []);

  const openRegistrationDemo = useCallback(() => {
    setIsAuthenticated(true);
    setHasCompletedRegistration(false);
    setIsAvailable(false);
  }, []);

  const value = useMemo(
    () => ({
      driver,
      vehicle,
      isAvailable,
      location,
      isAuthenticated,
      hasCompletedRegistration,
      updateLanguage,
      setAvailability,
      updateLocation,
      completeRegistration,
      signOut,
      signInMock,
      openRegistrationDemo,
      setHasCompletedRegistration,
    }),
    [
      driver,
      vehicle,
      isAvailable,
      location,
      isAuthenticated,
      hasCompletedRegistration,
      updateLanguage,
      setAvailability,
      updateLocation,
      completeRegistration,
      signOut,
      signInMock,
      openRegistrationDemo,
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
