"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface CemeteryMapProps {
  lat: number;
  lng: number;
  editable?: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
  className?: string;
}

const DEFAULT_LAT = 55.7558;
const DEFAULT_LNG = 37.6173;

const MAP_TILES = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  maxZoom: 19,
} as const;

function createMarkerIcon() {
  return L.divIcon({
    className: "",
    html: '<div style="width:14px;height:14px;border-radius:50%;background:#1c98a0;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function coordsFromMarker(marker: L.Marker): { lat: number; lng: number } {
  const { lat, lng } = marker.getLatLng();
  return { lat, lng };
}

export function CemeteryMap({
  lat,
  lng,
  editable = false,
  onLocationChange,
  className = "",
}: CemeteryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onLocationChangeRef = useRef(onLocationChange);

  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialHasCoords = Number.isFinite(lat) && Number.isFinite(lng);
    const initialLat = initialHasCoords ? lat : DEFAULT_LAT;
    const initialLng = initialHasCoords ? lng : DEFAULT_LNG;

    const map = L.map(containerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialHasCoords ? 14 : 5,
      scrollWheelZoom: true,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(MAP_TILES.url, {
      attribution: "",
      maxZoom: MAP_TILES.maxZoom,
    }).addTo(map);

    if (initialHasCoords) {
      const marker = L.marker([initialLat, initialLng], {
        icon: createMarkerIcon(),
        draggable: editable,
      }).addTo(map);
      markerRef.current = marker;
    }

    mapRef.current = map;

    const resizeTimer = window.setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      window.clearTimeout(resizeTimer);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Карта создаётся один раз; координаты и режим редактирования синхронизируются отдельно.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mapInstance = mapRef.current;
    if (!mapInstance) return;

    function emitCoords(marker: L.Marker) {
      const { lat: nextLat, lng: nextLng } = coordsFromMarker(marker);
      onLocationChangeRef.current?.(nextLat, nextLng);
    }

    function ensureMarker(leafletMap: L.Map, atLat: number, atLng: number) {
      if (markerRef.current) {
        markerRef.current.setLatLng([atLat, atLng]);
        return markerRef.current;
      }

      const marker = L.marker([atLat, atLng], {
        icon: createMarkerIcon(),
        draggable: editable,
      }).addTo(leafletMap);
      markerRef.current = marker;
      return marker;
    }

    if (hasCoords) {
      const marker = ensureMarker(mapInstance, lat, lng);
      marker.setLatLng([lat, lng]);
      marker.dragging?.[editable ? "enable" : "disable"]();
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    mapInstance.off("click");
    markerRef.current?.off("dragend");

    if (editable) {
      mapInstance.on("click", (event) => {
        const marker = ensureMarker(mapInstance, event.latlng.lat, event.latlng.lng);
        marker.dragging?.enable();
        emitCoords(marker);
      });

      markerRef.current?.on("dragend", () => {
        if (markerRef.current) emitCoords(markerRef.current);
      });
    }
  }, [lat, lng, hasCoords, editable]);

  return (
    <div
      ref={containerRef}
      className={`memorial-map-container relative z-0 h-64 w-full overflow-hidden rounded-md border border-memorial-border ${className}`}
    />
  );
}
