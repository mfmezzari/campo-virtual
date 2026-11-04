import type { GeoPoint } from "../types";

/** Ponto informado da unidade da Coamo em São Domingos (SC). */
export const CAMPO_CENTER: GeoPoint = { lat: -26.568889, lng: -52.524639 };
export const CAMPO_ZOOM = 18.5;

const METERS_PER_DEG_LAT = 110940;
const METERS_PER_DEG_LNG = 111320 * Math.cos((CAMPO_CENTER.lat * Math.PI) / 180);

/**
 * As faixas do talhão descem cerca de 15° em direção ao leste,
 * no mesmo sentido das linhas de plantio ao sul do galpão.
 */
export const FIELD_ROTATION_DEG = -15;
const FIELD_ROTATION = (FIELD_ROTATION_DEG * Math.PI) / 180;

/** Canto noroeste da faixa de soja, em metros a partir de CAMPO_CENTER. Fica logo ao sul do galpão. */
export const FIELD_ORIGIN = { east: -127, north: 35 };

/** Janela fixa, em metros, usada para desenhar o mapa quando o satélite ainda não carregou. */
export const CAMPO_VIEW = { west: -180, east: 70, south: -140, north: 70 };

export function offsetMeters(east: number, north: number): GeoPoint {
  return {
    lat: CAMPO_CENTER.lat + north / METERS_PER_DEG_LAT,
    lng: CAMPO_CENTER.lng + east / METERS_PER_DEG_LNG,
  };
}

/** Converte um ponto do croqui (x ao longo da faixa, y para o norte do talhão) em coordenada. */
export function fieldPoint(localEast: number, localNorth: number): GeoPoint {
  const east = FIELD_ORIGIN.east + localEast * Math.cos(FIELD_ROTATION) - localNorth * Math.sin(FIELD_ROTATION);
  const north = FIELD_ORIGIN.north + localEast * Math.sin(FIELD_ROTATION) + localNorth * Math.cos(FIELD_ROTATION);
  return offsetMeters(east, north);
}

export function fieldRect(localWest: number, localSouth: number, width: number, height: number): GeoPoint[] {
  return [
    fieldPoint(localWest, localSouth),
    fieldPoint(localWest + width, localSouth),
    fieldPoint(localWest + width, localSouth + height),
    fieldPoint(localWest, localSouth + height),
  ];
}

export function rectMeters(west: number, south: number, width: number, height: number): GeoPoint[] {
  return [
    offsetMeters(west, south),
    offsetMeters(west + width, south),
    offsetMeters(west + width, south + height),
    offsetMeters(west, south + height),
  ];
}

export function projectPoint(point: GeoPoint) {
  const east = (point.lng - CAMPO_CENTER.lng) * METERS_PER_DEG_LNG;
  const north = (point.lat - CAMPO_CENTER.lat) * METERS_PER_DEG_LAT;
  return {
    x: ((east - CAMPO_VIEW.west) / (CAMPO_VIEW.east - CAMPO_VIEW.west)) * 100,
    y: ((CAMPO_VIEW.north - north) / (CAMPO_VIEW.north - CAMPO_VIEW.south)) * 100,
  };
}

export function unprojectRatio(xRatio: number, yRatio: number): GeoPoint {
  const east = CAMPO_VIEW.west + xRatio * (CAMPO_VIEW.east - CAMPO_VIEW.west);
  const north = CAMPO_VIEW.north - yRatio * (CAMPO_VIEW.north - CAMPO_VIEW.south);
  return offsetMeters(east, north);
}

export function isGeoPoint(value: unknown): value is GeoPoint {
  if (!value || typeof value !== "object") return false;
  const point = value as GeoPoint;
  return Number.isFinite(point.lat) && Number.isFinite(point.lng) && Math.abs(point.lat) <= 90 && Math.abs(point.lng) <= 180;
}

export function validRing(points: GeoPoint[]) {
  return points.length >= 3 && points.length <= 40 && points.every(isGeoPoint);
}
