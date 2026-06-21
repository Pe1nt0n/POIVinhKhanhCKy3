export interface PoiLocation {
  type: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface PoiLocalization {
  lang: string;
  name: string;
  description: string;
  audio_url: string | null;
}

export interface Poi {
  id: string;
  category: string;
  location: PoiLocation;
  address: string;
  price_range: string;
  rating: number;
  priority: number;
  images: string[];
  owner_id: string | null;
  is_active: boolean;
  
  // Base fields that might be mapped natively depending on the API design
  name?: string;
  description?: string;
  
  // The localizations map returned by /api/v1/poi/load-all
  localizations?: Record<string, PoiLocalization>;
  
  created_at: string;
  updated_at: string;
}
