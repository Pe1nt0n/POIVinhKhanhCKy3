import React, { useEffect, useRef } from 'react';
import maplibregl, { Map as MapLibreMap, Marker } from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';
import { usePoiStore } from '../store/usePoiStore';

// We use a publicly hosted PMTiles vector map of the world/region for MVP testing
// Replace this with `/quan4.pmtiles` in production when the file is available in `public/`
const PMTILES_URL = 'https://r2-public.protomaps.com/protomaps-sample-datasets/cb_2018_us_zcta510_500k.pmtiles'; 

export const Map: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});
  const userMarkerRef = useRef<Marker | null>(null);
  
  const pois = usePoiStore(state => state.pois);
  const userLocation = usePoiStore(state => state.userLocation);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Register PMTiles protocol
    const protocol = new Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);

    // Initialize map
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors'
          }
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [106.700981, 10.762622], // Center around District 4, HCMC
      zoom: 13,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    mapRef.current = map;

    return () => {
      map.remove();
      maplibregl.removeProtocol('pmtiles');
      mapRef.current = null;
    };
  }, []);

  // Sync markers when POIs change
  useEffect(() => {
    if (!mapRef.current) return;

    const currentMarkers = markersRef.current;
    const newMarkerIds = new Set(pois.map(p => p.id));

    // Remove old markers
    Object.keys(currentMarkers).forEach(id => {
      if (!newMarkerIds.has(id)) {
        currentMarkers[id].remove();
        delete currentMarkers[id];
      }
    });

    // Add/Update markers
    pois.forEach(poi => {
      if (!currentMarkers[poi.id]) {
        // Create custom marker element using Tailwind
        const el = document.createElement('div');
        el.className = 'cursor-pointer';
        
        const inner = document.createElement('div');
        inner.className = 'w-6 h-6 bg-[#e65100] border-2 border-white rounded-full shadow-lg transform hover:scale-110 transition-transform';
        el.appendChild(inner);
        
        // Popup
        const listenUrl = poi.audio_url ? `${window.location.origin}/listen/${poi.id}` : '';
        const qrImgHtml = listenUrl 
            ? `<div class="mt-3 text-center">
                 <div class="hidden sm:block">
                   <a href="${listenUrl}" target="_blank">
                     <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(listenUrl)}&color=e65100" alt="QR Code" class="mx-auto rounded border border-gray-100" />
                   </a>
                   <span class="text-[10px] text-gray-500 mt-1 block font-semibold mb-3">Quét bằng điện thoại để nghe</span>
                 </div>
                 <a href="${listenUrl}" target="_blank" class="block w-full py-2 bg-[#e65100] text-white text-xs font-bold rounded shadow hover:bg-[#ac1900] transition-colors flex items-center justify-center gap-1">
                   <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                   Nghe Thuyết Minh
                 </a>
               </div>`
            : '';

        const popup = new maplibregl.Popup({ offset: 15, closeButton: false })
          .setHTML(`<div class="p-3 font-sans w-56"><strong class="text-[#e65100] block text-base leading-tight mb-1">${poi.name || 'POI'}</strong><span class="text-[11px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded uppercase tracking-wider inline-block mb-2">${poi.category || 'Unknown'}</span><p class="text-xs text-gray-700 line-clamp-4 leading-relaxed mb-2">${poi.description || ''}</p>${qrImgHtml}</div>`);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(poi.location.coordinates)
          .setPopup(popup)
          .addTo(mapRef.current!);

        currentMarkers[poi.id] = marker;
      } else {
        // Just update position if it somehow changed
        currentMarkers[poi.id].setLngLat(poi.location.coordinates);
      }
    });

  }, [pois]);

  // Sync user location blue dot
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    if (!userMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'w-5 h-5 bg-blue-500 border-2 border-white rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] relative';
      // Add ping animation
      const ping = document.createElement('div');
      ping.className = 'absolute inset-0 w-full h-full bg-blue-400 rounded-full animate-ping opacity-75';
      el.appendChild(ping);

      userMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat(userLocation)
        .addTo(mapRef.current);
    } else {
      userMarkerRef.current.setLngLat(userLocation);
    }
  }, [userLocation]);

  return <div ref={mapContainerRef} className="w-full h-full bg-[#e8e4db]" />;
};
