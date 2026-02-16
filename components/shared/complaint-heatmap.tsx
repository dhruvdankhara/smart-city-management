"use client";

import { useEffect, useRef } from "react";

interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

interface ComplaintHeatmapProps {
  points: HeatmapPoint[];
}

export function ComplaintHeatmap({ points }: ComplaintHeatmapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const loadMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      await import("leaflet.heat");

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current!).setView([20.5937, 78.9629], 5);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      if (points.length > 0) {
        const heatData: [number, number, number][] = points.map((p) => [
          p.lat,
          p.lng,
          p.intensity,
        ]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (L as any)
          .heatLayer(heatData, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            max: 1.0,
            gradient: {
              0.2: "#313695",
              0.4: "#4575b4",
              0.5: "#74add1",
              0.6: "#fee090",
              0.7: "#fdae61",
              0.8: "#f46d43",
              0.9: "#d73027",
              1.0: "#a50026",
            },
          })
          .addTo(map);

        // Fit bounds to data
        const lats = points.map((p) => p.lat);
        const lngs = points.map((p) => p.lng);
        const bounds = L.latLngBounds(
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        );
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    loadMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [points]);

  return (
    <div className="rounded-xl border overflow-hidden">
      <div ref={mapRef} className="h-[600px] w-full" style={{ zIndex: 0 }} />
    </div>
  );
}
