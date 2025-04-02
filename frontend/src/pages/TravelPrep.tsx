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
  
  // datos de ejemplo para los puntos de interés
  const POIList = [
    {
      id: 1,
      name: "Park Güell",
      description: "Un parque público con jardines y arquitectura de Antoni Gaudí.",
      imageUrl: "https://example.com/parc-guell.jpg",
      location: { lat: 41.4145, lng: 2.1527 },
      category: "Parque"
    },
    {
      id: 2,
      name: "Sagrada Familia",
      description: "Una basílica católica diseñada por Antoni Gaudí.",
      imageUrl: "https://example.com/sagrada-familia.jpg",
      location: { lat: 41.4036, lng: 2.1744 },
      category: "Monumento"
    }
  ]

  const handlePoiClick = (poi: POI) => {
    console.log(`Clicked on Point Of Interest: ${poi.name}`);
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setMapCoordinates([position.coords.longitude, position.coords.latitude]);
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
      } else {
        console.log("No se encontraron resultados para la búsqueda.");
      }
    } catch (error) {
      console.error("Error al buscar la ubicación:", error);
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
              title={`Puntos de interés en ${'cityname'}`}
              emptyMessage='No hay puntos de interés disponibles para esta ubicación.' />
          </div>
          <Map initialCoordinates={mapCoordinates || [2.1744, 41.4036]}/>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default TravelPrep

