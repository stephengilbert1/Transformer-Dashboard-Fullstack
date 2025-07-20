"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { TransformerSummary } from "@/src/types";
import { ZoomControl } from "react-leaflet";

type Props = {
  transformers: TransformerSummary[];
  selectedId?: string;
  onSelect: (id: string) => void;
  height?: string;
  zoom?: number;
  showPopups?: boolean;
};

function Recenter({ latlng }: { latlng: LatLngExpression }) {
  const map = useMap();

  useEffect(() => {
    const offsetLatLng = (map: L.Map, latlng: LatLngExpression, yOffsetPx: number) => {
      const targetPoint = map.project(latlng as L.LatLng).subtract([0, yOffsetPx]);
      return map.unproject(targetPoint);
    };

    const newCenter = offsetLatLng(map, latlng, map.getSize().y * 0.25); // 25% height offset
    map.setView(newCenter, map.getZoom(), { animate: true });
  }, [latlng, map]);

  return null;
}

export function TransformerMapClient({
  transformers,
  selectedId,
  onSelect,
  height = "100%",
  zoom = 13,
  showPopups = true,
}: Props) {
  const [L, setLeaflet] = useState<typeof import("leaflet") | null>(null);

  useEffect(() => {
    (async () => {
      const leaflet = await import("leaflet");
      setLeaflet(leaflet);
    })();
  }, []);

  const selected = transformers.find((t) => t.id === selectedId);
  const center: LatLngExpression = selected?.location ??
    transformers.find((t) => t.location)?.location ?? [49.2827, -123.1207]; // Vancouver fallback

  if (!L) return null;

  const createIcon = (color: string, size = 24) =>
    new L.DivIcon({
      html: `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" stroke="#fff" stroke-width="2" />
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="rgba(0,0,0,0.3)" />
        </filter>
      </svg>
    `,
      className: "",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });

  return (
    <MapContainer center={center} zoom={zoom} style={{ height, width: "100%" }} zoomControl={false}>
      <TileLayer
        attribution="Map data © OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomleft" />
      {transformers
        .filter(
          (t) =>
            t.location && typeof t.location.lat === "number" && typeof t.location.lng === "number"
        )
        .map((t) => {
          const isSelected = t.id === selectedId;
          const icon = createIcon(
            isSelected ? "#f26d21" : "#444", // Brighter for selected, soft dark for others
            isSelected ? 30 : 24
          );

          return (
            <Marker
              key={t.id}
              position={t.location}
              icon={icon}
              eventHandlers={{
                click: () => onSelect(t.id),
              }}
            >
              {showPopups && (
                <Popup>
                  <strong>{t.id}</strong>
                  <br />
                  {t.kVA} kVA
                </Popup>
              )}
            </Marker>
          );
        })}

      {selected?.location && <Recenter latlng={selected.location} />}
    </MapContainer>
  );
}
