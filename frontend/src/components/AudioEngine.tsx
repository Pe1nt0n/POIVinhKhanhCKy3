import React, { useEffect, useRef, useState } from 'react';
import { usePoiStore } from '../store/usePoiStore';
import { useGeolocation } from '../hooks/useGeolocation';
import * as turf from '@turf/turf';

// Use 70 meters as the default geofence radius for better reliability in urban canyons
const GEOFENCE_RADIUS_METERS = 70;

// A simple public domain chime for testing (since backend hasn't generated real TTS mp3s yet)
const MOCK_AUDIO_URL = 'https://actions.google.com/sounds/v1/alarms/spaceship_alarm.ogg';

interface AudioEngineProps {
  onPermissionGranted: () => void;
}

export const AudioEngine: React.FC<AudioEngineProps> = ({ onPermissionGranted }) => {
  const [started, setStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const location = useGeolocation();
  const { pois, playedAudioSet, playPoiAudio, setUserLocation } = usePoiStore();

  // Sync GPS to global store so the map can render the blue dot
  useEffect(() => {
    if (location.latitude && location.longitude) {
      setUserLocation([location.longitude, location.latitude]);
    }
  }, [location.latitude, location.longitude, setUserLocation]);

  // Geofencing calculation
  useEffect(() => {
    if (!started || !location.latitude || !location.longitude) return;

    const userPt = turf.point([location.longitude, location.latitude]);

    for (const poi of pois) {
      if (playedAudioSet.has(poi.id)) continue;

      const poiPt = turf.point(poi.location.coordinates);
      // turf.distance defaults to kilometers
      const distanceKm = turf.distance(userPt, poiPt, { units: 'kilometers' });
      const distanceMeters = distanceKm * 1000;

      if (distanceMeters <= GEOFENCE_RADIUS_METERS) {
        console.log(`Entered Geofence for POI: ${poi.name}. Playing audio...`);
        playPoiAudio(poi.id);
        
        if (audioRef.current) {
          // In production, we would use: poi.localizations[language].audio_url
          audioRef.current.src = MOCK_AUDIO_URL;
          audioRef.current.play().catch(e => console.error("Autoplay blocked:", e));
        }
        
        // Break after the first match to avoid playing overlapping audios
        break;
      }
    }
  }, [location.latitude, location.longitude, pois, playedAudioSet, playPoiAudio, started]);

  const handleStart = () => {
    setStarted(true);
    onPermissionGranted();
    
    // Play a silent sound to unlock the AudioContext on iOS Safari / Chrome Autoplay Policy
    if (audioRef.current) {
      audioRef.current.src = 'data:audio/mp3;base64,//OExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
      audioRef.current.play().catch(() => {});
    }
  };

  return (
    <>
      <audio ref={audioRef} style={{ display: 'none' }} />
      {!started && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border-t-4 border-[#e65100]">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <span className="text-4xl">🎧</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Khám phá<br/>Bằng Âm Thanh</h2>
            <p className="text-gray-600 mb-8 text-sm leading-relaxed font-medium">
              Đeo tai nghe và bắt đầu hành trình. Hệ thống sẽ tự động phát thuyết minh ẩm thực khi bạn đi dạo qua các nhà hàng tại Quận 4.
            </p>
            <button 
              onClick={handleStart}
              className="w-full bg-[#e65100] hover:bg-[#ac1900] text-white font-bold py-4 px-6 rounded-2xl shadow-[0_8px_30px_rgb(230,81,0,0.3)] transition-all active:scale-95 text-lg"
            >
              Bắt đầu Khám phá
            </button>
          </div>
        </div>
      )}
    </>
  );
};
