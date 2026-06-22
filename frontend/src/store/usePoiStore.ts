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
      const lang = localStorage.getItem('language') || 'vi';

      const params = new URLSearchParams();
      params.set('lang', lang);

      // Disable Delta Sync to handle hard deletes correctly
      // if (lastUpdated) {
      //   params.set('updated_after', lastUpdated);
      // }

      const url = `${baseUrl}/api/v1/poi/load-all?${params.toString()}`;

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

// API trả về: { data: { dataset_version, items } }
// Frontend Map cần location dạng GeoJSON: { type: 'Point', coordinates: [lng, lat] }
const rawItems = responseData?.data?.items ?? responseData?.data ?? [];

const fetchedPois: Poi[] = rawItems.map((item: any) => {
  const lng =
    item.location?.lng ??
    item.location?.coordinates?.[0] ??
    item.Location?.lng ??
    item.Location?.coordinates?.[0];

  const lat =
    item.location?.lat ??
    item.location?.coordinates?.[1] ??
    item.Location?.lat ??
    item.Location?.coordinates?.[1];

  return {
    id: item.id ?? item.Id,
    name: item.name ?? item.Name,
    description: item.description ?? item.Description ?? "",
    category: item.category ?? item.Category ?? "unknown",
    location: {
      type: "Point",
      coordinates: [lng, lat],
    },
    address: item.address ?? item.Address ?? "",
    price_range: item.price_range ?? item.priceRange ?? item.PriceRange ?? "$",
    rating: item.rating ?? item.Rating ?? 0,
    priority: item.priority ?? item.Priority ?? 0,
    images: item.images ?? item.Images ?? [],
    owner_id: item.owner_id ?? item.OwnerId ?? null,
    audio_url: item.audio_url ?? item.AudioUrl ?? null,
    is_active: item.is_active ?? item.IsActive ?? true,
    created_at: item.created_at ?? item.CreatedAt ?? new Date().toISOString(),
    updated_at: item.updated_at ?? item.UpdatedAt ?? new Date().toISOString(),
  };
});

      // Extract ETag
      const newETag = response.headers.get('ETag');
      if (newETag) {
        localStorage.setItem('poi_etag', newETag);
      }

      // Always clear and overwrite to handle hard deletes
      await poiStorage.clear();
      await poiStorage.putBulk(fetchedPois);

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
