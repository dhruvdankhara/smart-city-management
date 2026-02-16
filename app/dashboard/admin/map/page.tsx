"use client";

import { useEffect, useState, useRef } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AlertBanner } from "@/components/shared/alert-banner";
import apiClient from "@/lib/api-client";

export default function AdminMapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient
      .get("/complaints/map")
      .then(({ data }) => {
        setComplaints(data.data);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to load map data");
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isLoading || !mapRef.current || complaints.length === 0) return;

    const loadMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      // Properly remove existing map instance
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

      const priorityColors: Record<string, string> = {
        low: "#64748b",
        medium: "#3b82f6",
        high: "#f97316",
        critical: "#ef4444",
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      complaints.forEach((c: any) => {
        if (!c.location?.coordinates) return;
        const [lng, lat] = c.location.coordinates;

        const icon = L.divIcon({
          html: `<div style="background:${priorityColors[c.priority] || "#3b82f6"};width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`,
          className: "",
          iconSize: [12, 12],
        });

        L.marker([lat, lng], { icon }).addTo(map).bindPopup(`
            <strong>${c.title}</strong><br/>
            <span>Status: ${c.status}</span><br/>
            <span>Priority: ${c.priority}</span><br/>
            <span>${c.address}</span>
          `);
      });

      // Fit bounds
      if (complaints.length > 0) {
        const bounds = L.latLngBounds(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          complaints
            .filter((c: any) => c.location?.coordinates)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((c: any) => [
              c.location.coordinates[1],
              c.location.coordinates[0],
            ]),
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
  }, [isLoading, complaints]);

  return (
    <div>
      <PageHeader
        title="Map View"
        description="Complaint locations in your department"
      />

      {error && <AlertBanner variant="error" message={error} />}

      <div className="rounded-xl border overflow-hidden">
        <div ref={mapRef} className="h-[600px] w-full" style={{ zIndex: 0 }} />
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-sm">
        {[
          { label: "Low", color: "#64748b" },
          { label: "Medium", color: "#3b82f6" },
          { label: "High", color: "#f97316" },
          { label: "Critical", color: "#ef4444" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-full"
              style={{ background: item.color }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
