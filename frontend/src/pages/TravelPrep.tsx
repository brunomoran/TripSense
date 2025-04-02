import { useState } from 'react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import Map from '../components/Map';
import ListItems from '../components/ListItems';

import { POI } from '../types/ListItem';

import "../styles/TravelPrep.css";

type Props = {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const TravelPrep = (props: Props) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  
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
        setUserLocation([position.coords.longitude, position.coords.latitude]);
        console.log("Ubicación actual:", position.coords.longitude, position.coords.latitude);
      }, (error) => {
        console.error("Error al obtener la ubicación:", error);
      });
    }
  }

  return (
    <>
      <Header />
      <div className="travel-prep-container">
        <div className='search-section'>
          <SearchBar placeholder="Barcelona" onChange={() => console.log("Content changed")} />
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
          <Map initialCoordinates={userLocation || [2.1744, 41.4036]}/>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default TravelPrep

