import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  LocationCoordinates,
  SolarTimes,
  SolarPosition,
  calculateSolarTimes,
  calculateSolarPosition,
  getDefaultLocation,
  PRESET_CITIES,
} from '../utils/solarCalculator';

interface SolarContextType {
  location: LocationCoordinates;
  setLocation: (loc: LocationCoordinates) => void;
  isLocating: boolean;
  locationError: string | null;
  detectGpsLocation: () => void;
  solarTimes: SolarTimes;
  currentSolarPosition: SolarPosition;
  getSolarPositionForDate: (date: Date) => SolarPosition;
  getSolarTimesForDate: (date: Date) => SolarTimes;
  presetCities: LocationCoordinates[];
  currentTime: Date;
}

const SolarContext = createContext<SolarContextType | null>(null);

const STORAGE_KEY_LOCATION = 'temporal_user_location';

export const SolarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocationState] = useState<LocationCoordinates>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOCATION);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return getDefaultLocation();
  });

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Save location updates
  const setLocation = (loc: LocationCoordinates) => {
    setLocationState(loc);
    try {
      localStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(loc));
    } catch {
      // ignore
    }
  };

  // Timer ticker for real-time sun phase and position updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000); // update every 15 seconds

    return () => clearInterval(timer);
  }, []);

  // GPS auto-detect function
  const detectGpsLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser/device.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Math.round(position.coords.latitude * 10000) / 10000;
        const lng = Math.round(position.coords.longitude * 10000) / 10000;
        
        const newLoc: LocationCoordinates = {
          latitude: lat,
          longitude: lng,
          city: 'Current Location',
          country: 'GPS Detected',
          source: 'gps',
        };

        setLocation(newLoc);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location permission was denied. You can select a city preset or enter coordinates manually.');
        } else {
          setLocationError('Unable to retrieve GPS coordinates. Using preset location.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Auto-attempt geolocation on first load if default location
  useEffect(() => {
    if (location.source === 'default' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Math.round(pos.coords.latitude * 10000) / 10000;
          const lng = Math.round(pos.coords.longitude * 10000) / 10000;
          setLocation({
            latitude: lat,
            longitude: lng,
            city: 'My Location',
            country: 'GPS',
            source: 'gps',
          });
        },
        () => {
          // silently keep default
        },
        { timeout: 5000, maximumAge: 300000 }
      );
    }
  }, []);

  // Solar times for today
  const solarTimes = useMemo(() => {
    return calculateSolarTimes(currentTime, location.latitude, location.longitude);
  }, [currentTime, location.latitude, location.longitude]);

  // Current real-time solar position and phase
  const currentSolarPosition = useMemo(() => {
    return calculateSolarPosition(currentTime, location.latitude, location.longitude, solarTimes);
  }, [currentTime, location.latitude, location.longitude, solarTimes]);

  const getSolarTimesForDate = (date: Date) => {
    return calculateSolarTimes(date, location.latitude, location.longitude);
  };

  const getSolarPositionForDate = (date: Date) => {
    return calculateSolarPosition(date, location.latitude, location.longitude);
  };

  return (
    <SolarContext.Provider
      value={{
        location,
        setLocation,
        isLocating,
        locationError,
        detectGpsLocation,
        solarTimes,
        currentSolarPosition,
        getSolarPositionForDate,
        getSolarTimesForDate,
        presetCities: PRESET_CITIES,
        currentTime,
      }}
    >
      {children}
    </SolarContext.Provider>
  );
};

export const useSolar = (): SolarContextType => {
  const context = useContext(SolarContext);
  if (!context) {
    throw new Error('useSolar must be used within a SolarProvider');
  }
  return context;
};
