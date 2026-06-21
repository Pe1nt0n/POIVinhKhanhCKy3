import { create } from 'zustand';
import { Poi } from '../types/poi';
import { poiStorage } from '../services/db';

interface PoiState {
  pois: Poi[];
  language: string;
  isSyncing: boolean;
  lastSyncTime: string | null;
  error: string | null;
  
  // Geofencing & Audio State
  userLocation: [number, number] | null;
  activeAudioPoi: string | null;
  playedAudioSet: Set<string>;
  
  // Actions
  setLanguage: (lang: string) => void;
  initOfflineData: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  setUserLocation: (lngLat: [number, number]) => void;
  playPoiAudio: (poiId: string) => void;
  clearActiveAudio: () => void;
}

export const usePoiStore = create<PoiState>((set) => ({
  pois: [],
  language: localStorage.getItem('language') || 'vi',
  isSyncing: false,
  lastSyncTime: localStorage.getItem('lastSyncTime'),
  error: null,

  userLocation: null,
  activeAudioPoi: null,
  playedAudioSet: new Set<string>(),

  setLanguage: (lang: string) => {
    localStorage.setItem('language', lang);
    set({ language: lang });
  },

  initOfflineData: async () => {
    try {
      const pois = await poiStorage.getAll();
      set({ pois });
    } catch (err) {
      console.error('Failed to load offline POIs:', err);
      set({ error: 'Failed to load offline data' });
    }
  },

  syncWithServer: async () => {
    set({ isSyncing: true, error: null });
    try {
      const eTag = localStorage.getItem('poi_etag');
      const lastUpdated = localStorage.getItem('poi_last_updated');
      
      const headers: HeadersInit = {};
      if (eTag) {
        headers['If-None-Match'] = eTag;
      }

      // Construct URL with updated_after for Delta Sync
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      let url = `${baseUrl}/api/v1/poi/load-all`;
      if (lastUpdated) {
        url += `?updated_after=${encodeURIComponent(lastUpdated)}`;
      }

      const response = await fetch(url, { headers });

      if (response.status === 304) {
        // Not modified, our IndexedDB is already up to date
        const syncTime = new Date().toISOString();
        localStorage.setItem('lastSyncTime', syncTime);
        set({ isSyncing: false, lastSyncTime: syncTime });
        return;
      }

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const responseData = await response.json();
      // The API returns ApiResponse<IEnumerable<Poi>>
      const fetchedPois: Poi[] = responseData.data;

      // Extract ETag
      const newETag = response.headers.get('ETag');
      if (newETag) {
        localStorage.setItem('poi_etag', newETag);
      }

      if (!lastUpdated) {
        // First time sync: Overwrite everything
        await poiStorage.clear();
        await poiStorage.putBulk(fetchedPois);
      } else {
        // Delta Sync: Upsert only changed POIs into IndexedDB
        // Since we don't handle hard deletes in this MVP, we just putBulk
        await poiStorage.putBulk(fetchedPois);
      }

      // Update last sync timestamps
      const syncTime = new Date().toISOString();
      localStorage.setItem('lastSyncTime', syncTime);
      localStorage.setItem('poi_last_updated', syncTime); // Use this for the next delta sync

      // Reload state from DB to get the merged data
      const mergedPois = await poiStorage.getAll();

      set({ pois: mergedPois, isSyncing: false, lastSyncTime: syncTime });
    } catch (err) {
      console.error('Sync failed:', err);
      set({ isSyncing: false, error: 'Failed to sync with server. Continuing in Offline Mode.' });
    }
  },

  setUserLocation: (lngLat: [number, number]) => {
    set({ userLocation: lngLat });
  },

  playPoiAudio: (poiId: string) => {
    set((state) => {
      const newSet = new Set(state.playedAudioSet);
      newSet.add(poiId);
      return {
        activeAudioPoi: poiId,
        playedAudioSet: newSet
      };
    });
  },

  clearActiveAudio: () => {
    set({ activeAudioPoi: null });
  }
}));
