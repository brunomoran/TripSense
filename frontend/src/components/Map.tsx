import { useEffect, useRef, useState } from "react";
import "../styles/Map.css";

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
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Cargar script de Google Maps si no está aún
    useEffect(() => {
        const loadGoogleMapsScript = () => {
            if (window.google?.maps) {
                setMapLoaded(true);
                return;
            }

            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => setMapLoaded(true);
            document.head.appendChild(script);
        };

        loadGoogleMapsScript();
    }, []);

    useEffect(() => {
        if (mapLoaded && mapRef.current && !mapInstance.current) {
            mapInstance.current = new google.maps.Map(mapRef.current, {
                center: { lng: initialCoordinates[0], lat: initialCoordinates[1] },
                zoom: initialZoom,
                mapTypeId: "roadmap"
            });
        }
    }, [mapLoaded]);

    useEffect(() => {
        if (!mapInstance.current) return;

        mapInstance.current.setCenter({
            lng: initialCoordinates[0],
            lat: initialCoordinates[1]
        });
        mapInstance.current.setZoom(initialZoom);
    }, [initialCoordinates, initialZoom]);

    useEffect(() => {
        if (!mapInstance.current) return;

        // Limpiar marcadores anteriores
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Añadir nuevos marcadores
        markers.forEach(({ coordinates, popupContent }) => {
            const marker = new google.maps.Marker({
                position: { lng: coordinates[0], lat: coordinates[1] },
                map: mapInstance.current
            });

            if (popupContent) {
                const infoWindow = new google.maps.InfoWindow({
                    content: popupContent
                });

                marker.addListener("click", () => {
                    infoWindow.open(mapInstance.current, marker);
                });
            }

            markersRef.current.push(marker);
        });
    }, [markers]);

    return (
        <div className="map-wrapper">
            <div ref={mapRef} className="map-container"></div>
            {!mapLoaded && (
                <div className="map-loading-overlay">
                    <p>Cargando mapa...</p>
                </div>
            )}
        </div>
    );
};

export default Map;
