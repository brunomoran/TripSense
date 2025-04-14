import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import "../styles/Map.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

interface Props {
    initialCoordinates?: [number, number]; // [longitude, latitude]
    initialZoom?: number;
    markers?: Array<{
        id: string | number;
        coordinates: [number, number]; // [longitude, latitude]
        popupContent?: string;
    }>;
}

const Map = ({
    initialCoordinates = [2.1744, 41.4036],
    initialZoom = 12,
    markers = []
}: Props) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<Array<mapboxgl.Marker>>([]);
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        if (!mapboxgl.accessToken) {
            console.error("¡Error! No se ha configurado el token de Mapbox. Comprueba tu archivo .env");
            return;
        }
        
        if (mapContainer.current && !map.current) {
            console.log("Inicializando mapa con token");
            try {
                map.current = new mapboxgl.Map({
                    container: mapContainer.current,
                    style: 'mapbox://styles/mapbox/dark-v11',
                    center: initialCoordinates,
                    zoom: initialZoom,
                    attributionControl: false,
                })
    
                map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
                map.current.addControl(new mapboxgl.AttributionControl(), 'bottom-right');

                map.current.on('load', () => {
                    console.log("Mapa cargado");
                    setMapLoaded(true);
                });

                map.current.on('error', (error) => {
                    console.error("Error al cargar el mapa:", error);
                });
            } catch (error) {
                console.error("Error al inicializar el mapa:", error);
            }
        }

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (map.current && initialCoordinates) {
            map.current.flyTo({
                center: initialCoordinates,
                zoom: initialZoom,
                essential: true // this animation is considered essential with respect to prefers-reduced-motion
            });
        }
    }, [initialCoordinates])

    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        markers.forEach(({ coordinates, popupContent }) => {
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent || "");
            const marker = new mapboxgl.Marker()
                .setLngLat(coordinates)
                .setPopup(popup)
                .addTo(map.current!);
            
            markersRef.current.push(marker);
        });
    }, [markers, mapLoaded]);

    useEffect(() => {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        if (map.current && markers.length > 0) {
            console.log("Añadiendo marcadores al mapa:", markers);
            markers.forEach(({ id, coordinates, popupContent }) => {
                const marker = new mapboxgl.Marker()
                    .setLngLat(coordinates)
                    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent || ""))
                    .addTo(map.current!);

                markersRef.current.push(marker);
            });
        }
    }, [markers]);

    return (
        <div className="map-wrapper">
            <div ref={mapContainer} className="map-container"></div>
            {!mapLoaded && (
                <div className="map-loading-overlay">
                    <p>Cargando mapa...</p>
                </div>
            )}
        </div>
    )
}

export default Map