"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface LocationPickerProps {
  value?: { lat: number; lng: number };
  onChange: (location: { lat: number; lng: number; address: string }) => void;
  readonly?: boolean;
}

export function LocationPicker({
  value,
  onChange,
  readonly,
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [marker, setMarker] = useState<L.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Dynamically load Leaflet to avoid SSR issues
    const loadLeaflet = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!mapRef.current || mapInstanceRef.current) return;

      // Fix default icon
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

      const defaultCenter: [number, number] = value
        ? [value.lat, value.lng]
        : [20.5937, 78.9629]; // India center

      const mapInstance = L.map(mapRef.current).setView(
        defaultCenter,
        value ? 15 : 5,
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapInstance);

      if (value) {
        const m = L.marker([value.lat, value.lng]).addTo(mapInstance);
        setMarker(m);
      }

      if (!readonly) {
        mapInstance.on("click", async (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;

          if (marker) {
            marker.setLatLng([lat, lng]);
          } else {
            const m = L.marker([lat, lng]).addTo(mapInstance);
            setMarker(m);
          }

          // Reverse geocode with OpenStreetMap Nominatim
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            );
            const data = await res.json();
            onChange({
              lat,
              lng,
              address:
                data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            });
          } catch {
            onChange({
              lat,
              lng,
              address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            });
          }
        });
      }

      setMap(mapInstance);
      mapInstanceRef.current = mapInstance;
      setIsLoaded(true);
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;

        if (map) {
          map.setView([lat, lng], 15);

          const L = (await import("leaflet")).default;

          if (marker) {
            marker.setLatLng([lat, lng]);
          } else {
            const m = L.marker([lat, lng]).addTo(map);
            setMarker(m);
          }
        }

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          );
          const data = await res.json();
          onChange({
            lat,
            lng,
            address:
              data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          });
        } catch {
          onChange({
            lat,
            lng,
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          });
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
    );
  };

  return (
    <div className="space-y-2">
      <div
        ref={mapRef}
        className="h-[300px] w-full rounded-lg border overflow-hidden"
        style={{ zIndex: 0 }}
      />
      {!readonly && (
        <button
          type="button"
          onClick={getCurrentLocation}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <MapPin className="h-4 w-4" />
          Use Current Location
        </button>
      )}
      {!isLoaded && (
        <p className="text-xs text-muted-foreground">Loading map...</p>
      )}
    </div>
  );
}
