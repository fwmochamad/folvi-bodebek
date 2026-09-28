"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { MapPoint } from "@/lib/dashboard/data";
import { fmt } from "@/lib/dashboard/format";
import { STATUS_STYLE } from "./status";

const CAMERA_LABEL = { sehat: "kamera sehat", menurun: "kualitas menurun", mati: "tidak mengirim data" } as const;

function dotIcon(p: MapPoint, selected: boolean) {
  const { color } = STATUS_STYLE[p.status];
  const size = selected ? 26 : 18;
  return L.divIcon({
    className: "",
    html: `<span class="titik-dot titik-${p.status}${selected ? " is-selected" : ""}" style="--c:${color}"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FitToPoints({ points, fitKey }: { points: MapPoint[]; fitKey: string }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lon] as [number, number]));
    map.flyToBounds(bounds, { padding: [48, 48], duration: 0.8, maxZoom: 14 });
    // Hanya saat daerah berganti; titik yang sama tidak perlu memicu ulang.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, map]);
  return null;
}

function FlyToSelected({ point }: { point: MapPoint | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (point) map.flyTo([point.lat, point.lon], Math.max(map.getZoom(), 14), { duration: 0.6 });
  }, [point, map]);
  return null;
}

export default function TitikMap({
  points,
  fitKey,
  selectedId,
  onSelect,
}: {
  points: MapPoint[];
  fitKey: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const selected = useMemo(() => points.find((p) => p.id === selectedId), [points, selectedId]);

  return (
    <MapContainer
      center={[-6.42, 106.9]}
      zoom={11}
      minZoom={10}
      scrollWheelZoom
      className="map-soft h-full w-full"
      attributionControl
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <FitToPoints points={points} fitKey={fitKey} />
      <FlyToSelected point={selected} />
      {points.map((p) => (
        <Marker
          key={`${p.id}-${p.status}-${p.id === selectedId}`}
          position={[p.lat, p.lon]}
          icon={dotIcon(p, p.id === selectedId)}
          zIndexOffset={p.id === selectedId ? 1000 : p.status === "macet" ? 500 : 0}
          eventHandlers={{ click: () => onSelect(p.id) }}
          keyboard
          title={p.name}
        >
          <Tooltip direction="top" offset={[0, -12]} className="titik-tooltip" permanent={p.id === selectedId}>
            <p className="font-semibold text-ink">{p.name}</p>
            <p className="mt-0.5 text-[11px] text-subtle">{p.road}</p>
            {p.status === "mati" ? (
              <p className="mt-1 font-mono text-[11px] text-bad">tidak ada data · kamera mati {p.offlineFor}</p>
            ) : (
              <p className="mt-1 font-mono text-[11px]" style={{ color: STATUS_STYLE[p.status].color }}>
                {fmt(p.speed)} km/j · beban {p.load}% · {STATUS_STYLE[p.status].label.toUpperCase()}
              </p>
            )}
            <p className="mt-0.5 font-mono text-[10px] text-faint">
              {p.camera} · {CAMERA_LABEL[p.camStatus]} · {p.status === "mati" ? "—" : "5 mnt lalu"}
            </p>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
