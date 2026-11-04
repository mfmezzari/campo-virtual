import { useEffect, useState } from "react";
import type { GeoPoint } from "../types";

export type GpsStatus = "buscando" | "ativo" | "negado" | "indisponivel";

export interface FieldGps {
  point: GeoPoint | null;
  accuracy: number;
  status: GpsStatus;
}

export function useFieldGps(): FieldGps {
  const [fix, setFix] = useState<FieldGps>({ point: null, accuracy: 0, status: "buscando" });

  useEffect(() => {
    if (!navigator.geolocation) {
      setFix({ point: null, accuracy: 0, status: "indisponivel" });
      return;
    }
    const watch = navigator.geolocation.watchPosition(
      (position) => {
        setFix({
          point: { lat: position.coords.latitude, lng: position.coords.longitude },
          accuracy: position.coords.accuracy,
          status: "ativo",
        });
      },
      () => setFix((current) => ({ ...current, status: "negado" })),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 12000 },
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, []);

  return fix;
}

export function gpsStatusLabel(status: GpsStatus) {
  if (status === "ativo") return "Ponto azul: sua posição no campo.";
  if (status === "negado") return "Libere a localização do aparelho para ver o ponto azul.";
  if (status === "indisponivel") return "Este aparelho não informou a localização.";
  return "Buscando o GPS do aparelho.";
}
