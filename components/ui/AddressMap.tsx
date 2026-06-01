"use client";

import { useEffect, useRef } from "react";
import type { Map, Marker } from "leaflet";

type Props = { query: string };

export default function AddressMap({ query }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!query || !mapRef.current) return;

    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=jm`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "Rosterly/1.0",
          },
        }
      )
        .then((r) => r.json())
        .then((results: { lat: string; lon: string; display_name: string }[]) => {
          if (!results.length || !mapRef.current) return;
          const lat = parseFloat(results[0].lat);
          const lon = parseFloat(results[0].lon);
          const display_name = results[0].display_name;

          if (!mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapRef.current).setView([lat, lon], 15);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution:
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
              maxZoom: 19,
            }).addTo(mapInstanceRef.current);
          } else {
            mapInstanceRef.current.setView([lat, lon], 15);
          }

          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lon]);
            markerRef.current.setPopupContent(display_name);
          } else if (mapInstanceRef.current) {
            markerRef.current = L.marker([lat, lon])
              .addTo(mapInstanceRef.current)
              .bindPopup(display_name)
              .openPopup();
          }
        })
        .catch(console.error);
    });
  }, [query]);

  return (
    <div
      ref={mapRef}
      style={{
        height: 220,
        width: "100%",
        borderRadius: 10,
        overflow: "hidden",
        border: "0.5px solid var(--color-border)",
        zIndex: 0,
      }}
    />
  );
}
