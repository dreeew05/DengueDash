"use client";

import { MapContainer, GeoJSON } from "react-leaflet";
import { GeoJsonObject } from "geojson";
import { Layer, LeafletEventHandlerFn } from "leaflet";
import geoJsonData from "@assets/geojsons/iloilo_barangays_random.json";
import { ByLocationInterface } from "@/interfaces/stat/stat.interfaces";

interface GeoJSONFeature {
  properties: {
    shape4: string;
    count: number;
  };
}

export type ChoroplethMapProps = {
  dengueData: ByLocationInterface[];
};

export default function ChoroplethMap({ dengueData }: ChoroplethMapProps) {
  const geoJson: GeoJsonObject = geoJsonData as GeoJsonObject;

  const getBarangayCaseCount = (barangayName: string): number => {
    const barangayData = dengueData.find(
      (data) => data.location === barangayName
    );
    return barangayData ? barangayData.case_count : 0;
  };

  const geoStyler = (feature: GeoJSONFeature | undefined) => {
    if (!feature) return {};
    return {
      color: "white",
      weight: 1,
      fillColor: getColor(getBarangayCaseCount(feature.properties.shape4)),
      fillOpacity: 0.5,
    };
  };

  const getColor = (cases: number): string => {
    return cases > 100
      ? "#800026"
      : cases > 75
        ? "#BD0026"
        : cases > 50
          ? "#E31A1C"
          : cases > 30
            ? "#FC4E2A"
            : cases > 20
              ? "#FD8D3C"
              : cases > 10
                ? "#FEB24C"
                : cases > 5
                  ? "#FED976"
                  : cases == 0
                    ? "#A9A9A9"
                    : "#FFEDA0";
  };

  const highlightFeature: LeafletEventHandlerFn = (e: any) => {
    const layer = e.target;

    layer.setStyle({
      color: "grey",
      weight: 2,
      fillOpacity: 0.7,
    });

    layer.bringToFront();
  };

  const resetHighlight: LeafletEventHandlerFn = (e: any) => {
    const layer = e.target;

    layer.setStyle({
      color: "white",
      weight: 1,
      fillOpacity: 0.5,
    });
  };

  const mapOnEachFeature = (feature: GeoJSONFeature, layer: Layer) => {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
    });

    layer.bindPopup(
      `<b>${feature.properties.shape4}</b><br>${getBarangayCaseCount(feature.properties.shape4)} cases`
    );
  };

  const ILOILO_CITY_COORDS: [number, number] = [10.73, 122.5521];
  const ZOOM_LEVEL: number = 13;

  return (
    <MapContainer
      style={{ height: "80vh" }}
      zoom={ZOOM_LEVEL}
      center={ILOILO_CITY_COORDS}
      dragging={true}
      touchZoom={true}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      boxZoom={true}
      keyboard={false}
      zoomControl={true}
    >
      <GeoJSON
        key={JSON.stringify(dengueData)}
        data={geoJson}
        style={geoStyler}
        onEachFeature={mapOnEachFeature}
      />
    </MapContainer>
  );
}
