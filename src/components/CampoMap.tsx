import { useEffect, useRef, useState, type MouseEvent } from "react";
import { GoogleMap, OverlayViewF, useGoogleMap, useLoadScript } from "@react-google-maps/api";
import type { CultureFilter, GeoPoint, ParcelaCroqui } from "../types";
import { CROQUI_CENTER, rotuloDaParcela } from "../data/croquiParcelas";
import { CAMPO_ZOOM, projectPoint, unprojectRatio } from "../lib/croquiGeo";
import { gpsStatusLabel, useFieldGps } from "../lib/fieldGps";

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";

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
  if (!MAPS_KEY) return <ProjectedMap {...props} />;
  return <SatelliteMap {...props} />;
}

function polygonStyle(item: ParcelaCroqui, selected: boolean, dimmed: boolean) {
  const soja = item.cultura === "soja";
  return {
    fillColor: soja ? "#22c55e" : "#f59e0b",
    fillOpacity: selected ? 0.62 : dimmed ? 0.12 : 0.4,
    strokeColor: selected ? "#ffffff" : soja ? "#166534" : "#b45309",
    strokeOpacity: dimmed ? 0.35 : 1,
    strokeWeight: selected ? 3 : 1.5,
    clickable: true,
    zIndex: selected ? 3 : 1,
  };
}

function SatelliteMap(props: CampoMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: MAPS_KEY,
    language: "pt-BR",
    region: "BR",
  });
  const [mapsReady, setMapsReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    let live = true;
    google.maps.importLibrary("maps").then(() => {
      if (live) setMapsReady(true);
    });
    return () => {
      live = false;
    };
  }, [isLoaded]);

  if (loadError) return <ProjectedMap {...props} notice="O satélite do Google não carregou. O desenho das parcelas continua disponível." />;
  if (!isLoaded || !mapsReady) {
    return (
      <div className="flex h-[26rem] items-center justify-center rounded-[1.75rem] bg-leaf-800 text-sm font-bold text-white">
        Carregando visão de satélite…
      </div>
    );
  }
  return (
    <div className="relative h-[26rem] overflow-hidden rounded-[1.75rem] shadow-card">
      <GoogleMap
        center={props.center ?? CROQUI_CENTER}
        zoom={props.zoom ?? CAMPO_ZOOM}
        mapContainerClassName="h-full w-full"
        options={{
          mapTypeId: "satellite",
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          rotateControl: false,
          scaleControl: false,
          clickableIcons: false,
          gestureHandling: "greedy",
          minZoom: 16,
          maxZoom: 21,
        }}
        onLoad={(map) => {
          map.setCenter(props.center ?? CROQUI_CENTER);
          map.setZoom(props.zoom ?? CAMPO_ZOOM);
          map.setMapTypeId("satellite");
        }}
        onClick={(event) => {
          if (!props.onMapClick || !event.latLng) return;
          props.onMapClick({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        }}
      >
        <ParcelLayer
          parcelas={props.parcelas}
          culture={props.culture}
          selectedId={props.selectedId}
          draft={props.draft}
          drawing={Boolean(props.onMapClick)}
          onSelect={props.onSelect}
        />
        <GpsMarker />
      </GoogleMap>
      <MapLegend />
      <GpsCaption />
    </div>
  );
}

function writeLabel(
  svg: SVGSVGElement,
  projection: google.maps.MapCanvasProjection,
  item: ParcelaCroqui,
  dimmed: boolean,
) {
  if (item.coordenadas.length < 4) return;
  const pixels = item.coordenadas.slice(0, 4).map((point) => projection.fromLatLngToDivPixel(point));
  if (pixels.some((point) => !point)) return;
  const [sw, se, , nw] = pixels as google.maps.Point[];
  const alongX = se.x - sw.x;
  const alongY = se.y - sw.y;
  const width = Math.hypot(alongX, alongY);
  const height = Math.hypot(nw.x - sw.x, nw.y - sw.y);
  const { esquerda, direita } = rotuloDaParcela(item);
  const longest = Math.max(esquerda.length, direita.length, 1);
  const font = Math.min(height * 0.8, (width * 0.42) / (longest * 0.48), 15);
  if (font < 4.5 || width < 28) return;
  let angle = (Math.atan2(alongY, alongX) * 180) / Math.PI;
  if (angle > 90) angle -= 180;
  if (angle < -90) angle += 180;
  const place = (text: string, along: number) => {
    const x = sw.x + (se.x - sw.x) * along + (nw.x - sw.x) * 0.5;
    const y = sw.y + (se.y - sw.y) * along + (nw.y - sw.y) * 0.5;
    const node = document.createElementNS("http://www.w3.org/2000/svg", "text");
    node.textContent = text;
    node.setAttribute("x", String(x));
    node.setAttribute("y", String(y));
    node.setAttribute("fill", item.cultura === "soja" ? "#14532d" : "#7c2d12");
    node.setAttribute("font-size", String(font));
    node.setAttribute("font-weight", "700");
    node.setAttribute("font-family", "system-ui, sans-serif");
    node.setAttribute("text-anchor", "middle");
    node.setAttribute("dominant-baseline", "middle");
    node.setAttribute("transform", `rotate(${angle} ${x} ${y})`);
    node.setAttribute("pointer-events", "none");
    node.setAttribute("opacity", dimmed ? "0.35" : "1");
    node.setAttribute("stroke", "#ffffff");
    node.setAttribute("stroke-width", String(Math.max(font * 0.08, 0.4)));
    node.setAttribute("paint-order", "stroke");
    svg.appendChild(node);
  };
  place(esquerda, 0.28);
  place(direita, 0.72);
}

function ParcelLayer({
  parcelas,
  culture,
  selectedId,
  draft,
  drawing,
  onSelect,
}: {
  parcelas: CampoMapProps["parcelas"];
  culture: CampoMapProps["culture"];
  selectedId: string | null;
  draft?: GeoPoint[];
  drawing: boolean;
  onSelect?: (id: string) => void;
}) {
  const map = useGoogleMap();
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!map) return;
    const host = document.createElement("div");
    host.style.position = "absolute";
    host.style.left = "0";
    host.style.top = "0";
    const overlay = new google.maps.OverlayView();
    overlay.onAdd = () => {
      overlay.getPanes()?.overlayMouseTarget.appendChild(host);
    };
    overlay.draw = () => {
      const projection = overlay.getProjection();
      if (!projection) return;
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("style", "position:absolute;left:0;top:0;overflow:visible;width:1px;height:1px");
      const paint = (points: GeoPoint[], fill: string, fillOpacity: string, stroke: string, strokeWidth: string, onClick?: () => void) => {
        const coords = points.map((point) => {
          const pixel = projection.fromLatLngToDivPixel(point);
          return pixel ? `${pixel.x},${pixel.y}` : "";
        });
        if (coords.some((point) => point === "")) return;
        const shape = document.createElementNS("http://www.w3.org/2000/svg", points.length >= 3 ? "polygon" : "polyline");
        shape.setAttribute("points", coords.join(" "));
        shape.setAttribute("fill", points.length >= 3 ? fill : "none");
        shape.setAttribute("fill-opacity", fillOpacity);
        shape.setAttribute("stroke", stroke);
        shape.setAttribute("stroke-width", strokeWidth);
        if (onClick) {
          shape.setAttribute("cursor", "pointer");
          shape.addEventListener("click", (event) => {
            event.stopPropagation();
            onClick();
          });
        }
        svg.appendChild(shape);
      };
      parcelas.forEach((item) => {
        const selected = item.id === selectedId;
        const dimmed = culture !== "todas" && item.cultura !== culture;
        const soja = item.cultura === "soja";
        paint(
          item.coordenadas,
          soja ? "#22c55e" : "#f59e0b",
          selected ? "0.72" : dimmed ? "0.12" : "0.55",
          selected ? "#ffffff" : soja ? "#166534" : "#b45309",
          selected ? "3" : "1.5",
          drawing ? undefined : () => onSelectRef.current?.(item.id),
        );
        if (!drawing) writeLabel(svg, projection, item, dimmed);
      });
      if (draft && draft.length >= 2) paint(draft, "#ffffff", "0.25", "#ffffff", "2");
      host.replaceChildren(svg);
    };
    overlay.setMap(map);
    return () => {
      overlay.setMap(null);
      host.remove();
    };
  }, [map, parcelas, culture, selectedId, draft, drawing]);

  return null;
}

function GpsMarker() {
  const map = useGoogleMap();
  const gps = useFieldGps();
  const haloRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;
    const halo = new google.maps.Circle({
      map,
      clickable: false,
      fillColor: "#1a73e8",
      fillOpacity: 0.16,
      strokeColor: "#1a73e8",
      strokeOpacity: 0.4,
      strokeWeight: 1,
      zIndex: 999,
    });
    haloRef.current = halo;
    return () => halo.setMap(null);
  }, [map]);

  useEffect(() => {
    if (!gps.point) return;
    haloRef.current?.setCenter(gps.point);
    haloRef.current?.setRadius(Math.max(gps.accuracy, 8));
  }, [gps.accuracy, gps.point]);

  if (!gps.point) return null;
  return (
    <OverlayViewF
      position={gps.point}
      mapPaneName="overlayMouseTarget"
      getPixelPositionOffset={(width, height) => ({ x: -(width / 2), y: -(height / 2) })}
    >
      <div className="relative h-8 w-8" aria-hidden="true">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#1a73e8] opacity-70" />
        <span className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#1a73e8]" />
      </div>
    </OverlayViewF>
  );
}

function ProjectedMap({ notice, ...props }: CampoMapProps & { notice?: string }) {
  const gps = useFieldGps();
  const dot = gps.point ? projectPoint(gps.point) : null;
  const dotVisible = dot !== null && dot.x >= 0 && dot.x <= 100 && dot.y >= 0 && dot.y <= 100;

  function onBackground(event: MouseEvent<SVGSVGElement>) {
    if (!props.onMapClick) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    props.onMapClick(unprojectRatio(x, y));
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] shadow-card">
      <div className="relative h-[26rem] bg-[#245233]">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="Mapa das parcelas em São Domingos" onClick={onBackground}>
          <rect width="100" height="100" fill="#2f6a3e" />
          <text x="50" y="6" textAnchor="middle" fill="#e7f6ea" fontSize="3.2" fontWeight="700">
            N · São Domingos (SC)
          </text>
          {props.parcelas.map((item) => {
            const dimmed = props.culture !== "todas" && item.cultura !== props.culture;
            const selected = props.selectedId === item.id;
            const points = item.coordenadas
              .map((point) => {
                const spot = projectPoint(point);
                return `${spot.x},${spot.y}`;
              })
              .join(" ");
            const style = polygonStyle(item, selected, dimmed);
            const spots = item.coordenadas.slice(0, 4).map(projectPoint);
            const rotulo = spots.length === 4 ? rotuloDaParcela(item) : null;
            const sw = spots[0];
            const se = spots[1];
            const nw = spots[3];
            const width = sw && se ? Math.hypot(se.x - sw.x, se.y - sw.y) : 0;
            const height = sw && nw ? Math.hypot(nw.x - sw.x, nw.y - sw.y) : 0;
            const longest = rotulo ? Math.max(rotulo.esquerda.length, rotulo.direita.length, 1) : 1;
            const font = Math.min(height * 0.62, (width * 0.4) / (longest * 0.52), 2.4);
            let angle = sw && se ? (Math.atan2(se.y - sw.y, se.x - sw.x) * 180) / Math.PI : 0;
            if (angle > 90) angle -= 180;
            if (angle < -90) angle += 180;
            const spotAt = (along: number) =>
              sw && se && nw
                ? {
                    x: sw.x + (se.x - sw.x) * along + (nw.x - sw.x) * 0.5,
                    y: sw.y + (se.y - sw.y) * along + (nw.y - sw.y) * 0.5,
                  }
                : null;
            const esquerda = spotAt(0.28);
            const direita = spotAt(0.72);
            return (
              <g key={item.id}>
                <polygon
                  points={points}
                  fill={style.fillColor}
                  fillOpacity={dimmed ? 0.28 : selected ? 1 : 0.92}
                  stroke={selected ? "#ffffff" : style.strokeColor}
                  strokeWidth={selected ? 0.8 : 0.35}
                  onClick={(event) => {
                    if (props.onMapClick) return;
                    event.stopPropagation();
                    props.onSelect?.(item.id);
                  }}
                />
                {rotulo && font >= 0.7 && esquerda && direita ? (
                  <>
                    <text
                      x={esquerda.x}
                      y={esquerda.y}
                      fill={item.cultura === "soja" ? "#14532d" : "#7c2d12"}
                      fontSize={font}
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${angle} ${esquerda.x} ${esquerda.y})`}
                      pointerEvents="none"
                    >
                      {rotulo.esquerda}
                    </text>
                    <text
                      x={direita.x}
                      y={direita.y}
                      fill={item.cultura === "soja" ? "#14532d" : "#7c2d12"}
                      fontSize={font}
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${angle} ${direita.x} ${direita.y})`}
                      pointerEvents="none"
                    >
                      {rotulo.direita}
                    </text>
                  </>
                ) : null}
              </g>
            );
          })}
          {props.draft && props.draft.length >= 2 ? (
            <polyline
              points={props.draft
                .map((point) => {
                  const spot = projectPoint(point);
                  return `${spot.x},${spot.y}`;
                })
                .join(" ")}
              fill={props.draft.length >= 3 ? "#ffffff" : "none"}
              fillOpacity={0.25}
              stroke="#ffffff"
              strokeWidth={0.5}
              pointerEvents="none"
            />
          ) : null}
        </svg>
        {dotVisible && dot ? (
          <span
            className="pointer-events-none absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
            aria-hidden="true"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-[#1a73e8] opacity-70" />
            <span className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#1a73e8]" />
          </span>
        ) : null}
        <MapLegend />
      </div>
      <p className="bg-white px-3 py-2 text-xs font-semibold text-ink-700">
        {notice ??
          "A visão de satélite do Google entra com a chave VITE_GOOGLE_MAPS_API_KEY. As parcelas já estão desenhadas na posição do campo."}{" "}
        {gpsStatusLabel(gps.status)}
      </p>
    </div>
  );
}

function MapLegend() {
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 flex gap-2 rounded-2xl bg-white/90 px-3 py-2 text-[11px] font-extrabold text-ink-800">
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
    <p className="pointer-events-none absolute right-3 top-3 max-w-[11rem] rounded-2xl bg-white/90 px-2 py-1 text-[11px] font-bold text-ink-800">
      {gpsStatusLabel(gps.status)}
    </p>
  );
}
