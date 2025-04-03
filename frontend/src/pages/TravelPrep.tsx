import { useState } from 'react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import Map from '../components/Map';
import ListItems from '../components/ListItems';
import mapboxgl from 'mapbox-gl';

import { POI } from '../types/ListItem';

import "../styles/TravelPrep.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

type Props = {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const TravelPrep = (props: Props) => {
  const [mapCoordinates, setMapCoordinates] = useState<[number, number] | null>(null);
  const [POIList, setPOIList] = useState<POI[]>([]);
  const [cityName, setCityName] = useState<string>('');
  

  const handlePoiClick = (poi: POI) => {
    setMapCoordinates([poi.location.lng, poi.location.lat]);
    setCityName(poi.name);
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setMapCoordinates([position.coords.longitude, position.coords.latitude]);
        fetchPOIs([position.coords.longitude, position.coords.latitude]);
        setCityName("Ubicación actual");
        console.log("Ubicación actual:", position.coords.longitude, position.coords.latitude);
      }, (error) => {
        console.error("Error al obtener la ubicación:", error);
      });
    }
  }

  const handleSearch = async (searchText: string) => {
    if (!searchText.trim()) return;

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchText)}.json?access_token=${mapboxgl.accessToken}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center;
        setMapCoordinates([longitude, latitude]);
        setCityName(searchText);
        fetchPOIs([longitude, latitude]);
      } else {
        console.log("No se encontraron resultados para la búsqueda.");
      }
    } catch (error) {
      console.error("Error al buscar la ubicación:", error);
    }
  }

  const fetchPOIs = async (coordinates: [number, number]) => {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/poi.json?proximity=${coordinates[0]},${coordinates[1]}&access_token=${mapboxgl.accessToken}&limit=10`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.features.length > 0) {
        console.log("Puntos de interés encontrados:", data.features);
        const pois: POI[] = data.features.map((poi: any, index: number) => ({
          id: index,
          name: poi.text,
          description: poi.place_name,
          imageUrl: "", // Podrías obtener imágenes de otro API
          location: { lat: poi.center[1], lng: poi.center[0] },
          category: "Punto de Interés"
        }));
        setPOIList(pois);
        setCityName(data.features[0].place_name.split(",")[2].trim());
      } else {
        console.log("No se encontraron puntos de interés.");
        setPOIList([]);
      }
    } catch (error) {
      console.error("Error al buscar puntos de interés:", error);
    }
  }

  return (
    <>
      <Header />
      <div className="travel-prep-container">
        <div className='search-section'>
          <SearchBar placeholder="Barcelona" onSearch={handleSearch} />
          <p className='location-text'>O prueba a</p>
          <button className='location-button' onClick={handleUseCurrentLocation}>Usar tu ubicación actual</button>
        </div>

        <div className="content-section">
          <div className="left-column">
            <FilterDropdown />
            <ListItems<POI>
              items={POIList}
              onItemClick={handlePoiClick}
              title={`Puntos de interés en ${cityName || "la ubicación actual"}`}
              emptyMessage='No hay puntos de interés disponibles para esta ubicación.' />
          </div>
          <Map initialCoordinates={mapCoordinates || [2.1744, 41.4036]}
            markers={POIList.map(poi => ({
              id: poi.id,
              coordinates: [poi.location.lng, poi.location.lat],
              popupContent: poi.name
            }))}
          />
        </div>
      </div>
      <Footer />
    </>
  )
}

export default TravelPrep

