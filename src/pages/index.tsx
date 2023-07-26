import { NextPage } from "next";
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
const HelicopterData = require("./la-helicopters-apr2023.json") as { flights: { positions: Position[] }[] };

interface Position {
  latitude: number;
  longitude: number;
}

const Home: NextPage = () => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const indexRef = useRef<number>(0); // Remove unnecessary null union

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1Ijoia2VubmV0aG1lamlhIiwiYSI6ImNsZG1oYnpxNDA2aTQzb2tkYXU2ZWc1b3UifQ.PxO_XgMo13klJ3mQw1QxlQ";

    const airportIcon = document.createElement("div");
    airportIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.4 8.4V7.2L6.6 4.2V0.9C6.6 0.402 6.198 0 5.7 0C5.202 0 4.8 0.402 4.8 0.9V4.2L0 7.2V8.4L4.8 6.9V10.2L3.6 11.1V12L5.7 11.4L7.8 12V11.1L6.6 10.2V6.9L11.4 8.4Z" fill="black"/>
    </svg>`;
    airportIcon.style.width = "24px";
    airportIcon.style.height = "24px";

    const formulaForZoom = () => {
      if (typeof window !== "undefined") {
        return window.innerWidth > 700 ? 10 : 9.1;
      }
      return 9.1;
    };

    const mapparams: mapboxgl.MapboxOptions = {
      container: divRef.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-118.41, 34],
      zoom: formulaForZoom(),
    };

    const map = new mapboxgl.Map(mapparams);
    mapRef.current = map;

    map.on("load", () => {
      const positions: Position[] = HelicopterData.flights[0].positions;
      const routeData = positions?.map((position) => ({
        latitude: position.latitude,
        longitude: position.longitude,
      }));

      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: routeData?.map((point) => [point.longitude, point.latitude]),
          },
          properties: {}, // Add an empty properties object
        },
      });

      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        paint: {
          "line-color": "#ff0000",
          "line-width": 4,
        },
      });

      const animatedPoint = new mapboxgl.Marker({
        element: airportIcon,
      })
        .setLngLat([positions[0].longitude, positions[0].latitude])
        .addTo(map);

      indexRef.current = 0;

      function animatePoints() {
        const nextIndex = indexRef.current! + 1;
        if (nextIndex < routeData!.length) {
          animatedPoint.setLngLat([
            routeData![nextIndex].longitude,
            routeData![nextIndex].latitude,
          ]);
          animatedPoint.setPopup(
            new mapboxgl.Popup({
              closeOnClick: false,
              anchor: "bottom",
            }).setLngLat([routeData![nextIndex].longitude, routeData![nextIndex].latitude])
          );
          indexRef.current = nextIndex;
          requestAnimationFrame(animatePoints);
        }
      }

      animatePoints();
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-screen absolute">
      <div ref={divRef} style={{}} className="map-container w-full h-full " />
    </div>
  );
};

export default Home;
