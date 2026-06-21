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
  
  const pois = usePoiStore(state => state.pois);

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
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {
          'offline-tiles': {
            type: 'vector',
            url: `pmtiles://${PMTILES_URL}`
          }
        },
        layers: [
          // A very basic style to render lines from the vector tiles so we see something
          {
            id: 'vector-layer',
            type: 'line',
            source: 'offline-tiles',
            'source-layer': 'zcta', // Example layer name from the protomaps sample
            paint: {
              'line-color': '#e65100',
              'line-width': 1
            }
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
        el.className = 'w-6 h-6 bg-[#e65100] border-2 border-white rounded-full shadow-lg cursor-pointer transform hover:scale-110 transition-transform';
        
        // Popup
        const popup = new maplibregl.Popup({ offset: 15, closeButton: false })
          .setHTML(`<div class="p-2 font-sans"><strong class="text-[#e65100] block">${poi.name || 'POI'}</strong><span class="text-xs text-gray-500">${poi.category || 'Unknown'}</span></div>`);

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

  return <div ref={mapContainerRef} className="w-full h-full bg-gray-100" />;
};
