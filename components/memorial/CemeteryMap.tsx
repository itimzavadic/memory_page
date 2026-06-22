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

  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const mapLat = hasCoords ? lat : DEFAULT_LAT;
  const mapLng = hasCoords ? lng : DEFAULT_LNG;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [mapLat, mapLng],
      zoom: hasCoords ? 14 : 5,
      scrollWheelZoom: !editable,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);

    const icon = L.divIcon({
      className: "",
      html: '<div style="width:14px;height:14px;border-radius:50%;background:#1c98a0;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    if (hasCoords) {
      markerRef.current = L.marker([mapLat, mapLng], { icon }).addTo(map);
    }

    if (editable) {
      map.on("click", (event) => {
        const { lat: clickLat, lng: clickLng } = event.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([clickLat, clickLng]);
        } else {
          markerRef.current = L.marker([clickLat, clickLng], { icon }).addTo(map);
        }
        onLocationChange?.(clickLat, clickLng);
      });
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
  }, [editable, hasCoords, mapLat, mapLng, onLocationChange]);

  return (
    <div
      ref={containerRef}
      className={`memorial-map-container relative z-0 h-64 w-full overflow-hidden rounded-md border border-memorial-border ${className}`}
    />
  );
}
