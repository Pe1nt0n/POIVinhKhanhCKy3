import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePoiStore } from '../store/usePoiStore';
import { useGeolocation } from '../hooks/useGeolocation';
import * as turf from '@turf/turf';
import { trackEvent } from '../services/analytics';

// Use 70 meters as the default geofence radius for better reliability in urban canyons
const GEOFENCE_RADIUS_METERS = 70;

// A simple public domain chime for testing (since backend hasn't generated real TTS mp3s yet)
interface AudioEngineProps {
  onPermissionGranted: () => void;
}

export const AudioEngine: React.FC<AudioEngineProps> = ({ onPermissionGranted }) => {
  const [started, setStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAudioStartingRef = useRef(false);
  const lastTriggeredPoiRef = useRef<string | null>(null);
  const lastTriggeredAtRef = useRef(0);
  
  const location = useGeolocation();
  const {
  pois,
  playedAudioSet,
  playPoiAudio,
  setUserLocation,
  userLocation
} = usePoiStore();
  const speakPoi = useCallback(async (poi: any) => {
  if (isAudioStartingRef.current) {
    console.log('[AUDIO] Đang chuẩn bị phát, bỏ qua lần gọi trùng.');
    return;
  }

  isAudioStartingRef.current = true;

  const audioUrl = poi.audio_url || '/audio/vk_intro.mp3';

  console.log(`[AUDIO] Phát thuyết minh cho POI: ${poi.name}`);
  console.log(`[AUDIO] URL: ${audioUrl}`);

  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (!audioRef.current) {
      console.error('[AUDIO] audioRef chưa sẵn sàng.');
      return;
    }

    const audio = audioRef.current;

    audio.pause();
    audio.currentTime = 0;
    audio.src = audioUrl;
    audio.load();

    await audio.play();

    console.log('[AUDIO] Đã phát file thuyết minh thành công.');

    trackEvent('audio_play', poi.id, {
      poi_name: poi.name,
      audio_url: audioUrl,
      source: 'geofence',
    });
  } catch (error: any) {
    const errorText = String(error);

    if (
      error?.name === 'AbortError' ||
      errorText.includes('AbortError') ||
      errorText.includes('interrupted')
    ) {
      console.warn('[AUDIO] Bỏ qua AbortError do audio bị gọi quá nhanh.');
      return;
    }
    console.error('[AUDIO] Không phát được file thuyết minh:', error);

    trackEvent('audio_play_failed', poi.id, {
      poi_name: poi.name,
      audio_url: audioUrl,
      error: String(error),
      source: 'geofence',
    });
  } finally {
    setTimeout(() => {
      isAudioStartingRef.current = false;
    }, 1000);
  }
}, []);
  // Sync GPS to global store so the map can render the blue dot
  useEffect(() => {
  // Nếu đã có userLocation, tức là đang dùng Teleport/mock,
  // không cho GPS thật ghi đè để demo ổn định.
    if (userLocation) return;

    if (location.latitude && location.longitude) {
      setUserLocation([location.longitude, location.latitude]);
    }
  }, [location.latitude, location.longitude, setUserLocation, userLocation]);

  // Geofencing calculation
useEffect(() => {
  if (!started) return;

  // Ưu tiên vị trí trong store.
  // Vị trí này có thể đến từ GPS thật hoặc từ nút Mock GPS trong App.tsx.
  const effectiveLng =
    userLocation?.[0] ??
    (location.longitude ? location.longitude : null);

  const effectiveLat =
    userLocation?.[1] ??
    (location.latitude ? location.latitude : null);

  if (effectiveLng === null || effectiveLat === null) return;

  const userPt = turf.point([effectiveLng, effectiveLat]);

  // Sắp xếp POI theo priority cao trước
  const sortedPois = [...pois].sort((a, b) => (b.priority || 0) - (a.priority || 0));

  for (const poi of sortedPois) {
    if (playedAudioSet.has(poi.id)) continue;
    if (!poi.location?.coordinates) continue;

    const poiPt = turf.point(poi.location.coordinates);

    const distanceKm = turf.distance(userPt, poiPt, { units: 'kilometers' });
    const distanceMeters = distanceKm * 1000;

    console.log(
      `[Geofence] ${poi.name}: ${distanceMeters.toFixed(1)}m`
    );

    if (distanceMeters <= GEOFENCE_RADIUS_METERS) {
  const now = Date.now();

  if (
    lastTriggeredPoiRef.current === poi.id &&
    now - lastTriggeredAtRef.current < 10000
  ) {
    console.log(`[Geofence] ${poi.name} vừa phát gần đây, bỏ qua.`);
    break;
  }

  console.log(`Entered Geofence for POI: ${poi.name}. Playing audio...`);

  lastTriggeredPoiRef.current = poi.id;
  lastTriggeredAtRef.current = now;

  trackEvent('poi_enter_geofence', poi.id, {
    poi_name: poi.name,
    distance_meters: Math.round(distanceMeters),
    source: 'mock_or_gps',
  });

  playPoiAudio(poi.id);

  speakPoi(poi);

  break;
  }
  }
}, [
  started,
  userLocation,
  location.latitude,
  location.longitude,
  pois,
  playedAudioSet,
  playPoiAudio,
  speakPoi
]);

  const handleStart = () => {
    setStarted(true);
    onPermissionGranted();
    console.log('[AUDIO] Đã bật chế độ khám phá âm thanh.');
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
              Đeo tai nghe và bắt đầu hành trình. Hệ thống sẽ tự động phát thuyết minh ẩm thực khi bạn đi dạo qua các nhà hàng tại Khu Ẩm Thực Vĩnh Khánh.
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
