import { useState, useEffect } from 'react';

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy: number;
  error: string | null;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationState>({
    latitude: 0,
    longitude: 0,
    accuracy: 0,
    error: null,
  });

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setLocation(s => ({ ...s, error: 'Geolocation not supported by your browser' }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
        });
      },
      (error) => {
        setLocation(s => ({ ...s, error: error.message }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return location;
};
