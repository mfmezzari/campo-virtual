import { useEffect, useState } from "react";
import { Circle, MapContainer, Marker, Polygon, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { CultureFilter, GeoPoint, ParcelaCroqui } from "../types";
import { CROQUI_CENTER, rotuloDaParcela } from "../data/croquiParcelas";
import { CAMPO_ZOOM } from "../lib/croquiGeo";
import { gpsStatusLabel, useFieldGps } from "../lib/fieldGps";
import "leaflet/dist/leaflet.css";

/** Foto aérea pública (Esri / Maxar), no mesmo ponto do talhão. Sem chave do Google. */
const AERIAL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

const gpsIcon = L.divIcon({
  className: "campo-gps",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  html: `<span class="campo-gps-ping"></span><span class="campo-gps-dot"></span>`,
});

interface CampoMapProps {
  parcelas: ParcelaCroqui[];
  culture: CultureFilter;
  selectedId: string | null;
  center?: GeoPoint;
  zoom?: number;
  draft?: GeoPoint[];
  onSelect?: (id: string) => void;
  onMapClick?: (point: GeoPoint) => void;
}

export function CampoMap(props: CampoMapProps) {
  const center = props.center ?? CROQUI_CENTER;
  const zoom = props.zoom ?? CAMPO_ZOOM;
  const drawing = Boolean(props.onMapClick);

  return (
    <div className="relative h-[26rem] overflow-hidden rounded-xl border border-slate-200/80 shadow-sm">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        zoomSnap={0.5}
        minZoom={16}
        maxZoom={20}
        scrollWheelZoom
        className="h-full w-full"
        attributionControl
      >
        <TileLayer
          url={AERIAL}
          attribution="Foto aérea © Esri, Maxar, Earthstar Geographics"
          maxZoom={20}
          maxNativeZoom={18}
        />
        <WakeMap />
        <MapClicks onMapClick={props.onMapClick} />
        {props.parcelas.map((item) => (
          <ParcelShape
            key={item.id}
            item={item}
            culture={props.culture}
            selected={item.id === props.selectedId}
            drawing={drawing}
            onSelect={props.onSelect}
            onMapClick={props.onMapClick}
          />
        ))}
        <ParcelLabels parcelas={props.parcelas} culture={props.culture} drawing={drawing} />
        {props.draft && props.draft.length >= 2 ? (
          props.draft.length >= 3 ? (
            <Polygon
              positions={toLatLngs(props.draft)}
              pathOptions={{ color: "#ffffff", weight: 2, fillColor: "#ffffff", fillOpacity: 0.25 }}
              interactive={false}
            />
          ) : (
            <Polyline positions={toLatLngs(props.draft)} pathOptions={{ color: "#ffffff", weight: 2 }} interactive={false} />
          )
        ) : null}
        <GpsLayer />
      </MapContainer>
      <MapLegend />
      <GpsCaption />
    </div>
  );
}

function toLatLngs(points: GeoPoint[]): [number, number][] {
  return points.map((point) => [point.lat, point.lng]);
}

function WakeMap() {
  const map = useMap();
  useEffect(() => {
    const frame = requestAnimationFrame(() => map.invalidateSize());
    return () => cancelAnimationFrame(frame);
  }, [map]);
  return null;
}

function MapClicks({ onMapClick }: { onMapClick?: (point: GeoPoint) => void }) {
  useMapEvents({
    click(event) {
      if (!onMapClick) return;
      onMapClick({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

function ParcelShape({
  item,
  culture,
  selected,
  drawing,
  onSelect,
  onMapClick,
}: {
  item: ParcelaCroqui;
  culture: CultureFilter;
  selected: boolean;
  drawing: boolean;
  onSelect?: (id: string) => void;
  onMapClick?: (point: GeoPoint) => void;
}) {
  const dimmed = culture !== "todas" && item.cultura !== culture;
  const soja = item.cultura === "soja";
  return (
    <Polygon
      positions={toLatLngs(item.coordenadas)}
      pathOptions={{
        color: selected ? "#ffffff" : soja ? "#166534" : "#b45309",
        weight: selected ? 3 : 1.5,
        opacity: dimmed ? 0.35 : 1,
        fillColor: soja ? "#22c55e" : "#f59e0b",
        fillOpacity: selected ? 0.62 : dimmed ? 0.12 : 0.4,
      }}
      eventHandlers={{
        click: (event) => {
          L.DomEvent.stop(event.originalEvent);
          if (drawing) {
            onMapClick?.({ lat: event.latlng.lat, lng: event.latlng.lng });
            return;
          }
          onSelect?.(item.id);
        },
      }}
    />
  );
}

function ParcelLabels({
  parcelas,
  culture,
  drawing,
}: {
  parcelas: ParcelaCroqui[];
  culture: CultureFilter;
  drawing: boolean;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });
  if (drawing) return null;

  return (
    <>
      {parcelas.flatMap((item) => {
        if (item.coordenadas.length < 4) return [];
        const [sw, se, , nw] = item.coordenadas;
        const widthPx = metersBetween(sw, se) / metersPerPixel(zoom, sw.lat);
        const heightPx = metersBetween(sw, nw) / metersPerPixel(zoom, sw.lat);
        const { esquerda, direita } = rotuloDaParcela(item);
        const longest = Math.max(esquerda.length, direita.length, 1);
        const font = Math.min(heightPx * 0.8, (widthPx * 0.42) / (longest * 0.48), 15);
        if (font < 4.5 || widthPx < 28) return [];
        const angle = screenAngle(sw, se);
        const dimmed = culture !== "todas" && item.cultura !== culture;
        const color = item.cultura === "soja" ? "#14532d" : "#7c2d12";
        const spots = [
          { key: "e", text: esquerda, at: labelPoint(sw, se, nw, 0.28) },
          { key: "d", text: direita, at: labelPoint(sw, se, nw, 0.72) },
        ];
        return spots.map((spot) => (
          <Marker
            key={`${item.id}-${spot.key}-${zoom}`}
            position={[spot.at.lat, spot.at.lng]}
            icon={labelIcon(spot.text, color, angle, font, dimmed)}
            interactive={false}
          />
        ));
      })}
    </>
  );
}

function labelPoint(sw: GeoPoint, se: GeoPoint, nw: GeoPoint, along: number): GeoPoint {
  return {
    lat: sw.lat + (se.lat - sw.lat) * along + (nw.lat - sw.lat) * 0.5,
    lng: sw.lng + (se.lng - sw.lng) * along + (nw.lng - sw.lng) * 0.5,
  };
}

function metersBetween(a: GeoPoint, b: GeoPoint) {
  const cos = Math.cos((a.lat * Math.PI) / 180);
  const east = (b.lng - a.lng) * 111320 * cos;
  const north = (b.lat - a.lat) * 110940;
  return Math.hypot(east, north);
}

function metersPerPixel(zoom: number, lat: number) {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;
}

function screenAngle(a: GeoPoint, b: GeoPoint) {
  const cos = Math.cos((a.lat * Math.PI) / 180);
  const dx = (b.lng - a.lng) * cos;
  const dy = a.lat - b.lat;
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (angle > 90) angle -= 180;
  if (angle < -90) angle += 180;
  return angle;
}

function labelIcon(text: string, color: string, angle: number, font: number, dimmed: boolean) {
  return L.divIcon({
    className: "campo-label",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    html: `<span style="position:absolute;left:0;top:0;transform:translate(-50%,-50%) rotate(${angle}deg);white-space:nowrap;font-family:system-ui,sans-serif;font-weight:700;font-size:${font}px;line-height:1;color:${color};opacity:${dimmed ? 0.35 : 1};-webkit-text-stroke:2px #fff;paint-order:stroke fill;">${escapeHtml(text)}</span>`,
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    if (char === "&") return "&amp;";
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    if (char === '"') return "&quot;";
    return "&#39;";
  });
}

function GpsLayer() {
  const gps = useFieldGps();
  if (!gps.point) return null;
  return (
    <>
      <Circle
        center={[gps.point.lat, gps.point.lng]}
        radius={Math.max(gps.accuracy, 8)}
        pathOptions={{ color: "#1a73e8", weight: 1, opacity: 0.4, fillColor: "#1a73e8", fillOpacity: 0.16 }}
        interactive={false}
      />
      <Marker position={[gps.point.lat, gps.point.lng]} icon={gpsIcon} interactive={false} />
    </>
  );
}

function MapLegend() {
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex gap-2 rounded-2xl bg-white/90 px-3 py-2 text-[11px] font-semibold text-ink-800">
      <span className="inline-flex items-center gap-1">
        <span className="h-2.5 w-2.5 rounded-sm bg-[#22c55e]" /> Soja
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="h-2.5 w-2.5 rounded-sm bg-[#f59e0b]" /> Milho
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="h-2.5 w-2.5 rounded-full bg-[#1a73e8]" /> GPS
      </span>
    </div>
  );
}

function GpsCaption() {
  const gps = useFieldGps();
  return (
    <p className="pointer-events-none absolute right-3 top-3 z-[500] max-w-[11rem] rounded-2xl bg-white/90 px-2 py-1 text-[11px] font-bold text-ink-800">
      {gpsStatusLabel(gps.status)}
    </p>
  );
}
