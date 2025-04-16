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

const POI_CATEGORIES = [
  { id: 'restaurant', label: 'Restaurantes', emoji: '🍽️' },
  { id: 'hotel', label: 'Hoteles', emoji: '🏨' },
  { id: 'museum', label: 'Museos', emoji: '🏛️' },
  { id: 'attraction', label: 'Atracciones', emoji: '🎭' },
  { id: 'park', label: 'Parques', emoji: '🌳' },
  { id: 'cafe', label: 'Cafés', emoji: '☕' }
];

const API_BASE_URL = 'http://localhost:5000/api/map';

const TravelPrep = (props: Props) => {
  const [mapCoordinates, setMapCoordinates] = useState<[number, number] | null>(null);
  const [POIList, setPOIList] = useState<POI[]>([]);
  const [cityName, setCityName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handlePoiClick = (poi: POI) => {
    setMapCoordinates([poi.location.lng, poi.location.lat]);
    setCityName(poi.name);
  }

  const handleUseCurrentLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const coordinates: [number, number] = [position.coords.longitude, position.coords.latitude];
        setMapCoordinates(coordinates);
        
        // Usar el endpoint del backend para la geocodificación inversa
        try {
          const response = await fetch(`${API_BASE_URL}/reverse-geocode`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              longitude: coordinates[0],
              latitude: coordinates[1]
            })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            setCityName(data.name);
          } else {
            console.error("Error al obtener el nombre de la ubicación:", data.message);
            setCityName('Ubicación actual');
          }
        } catch (error) {
          console.error("Error al obtener el nombre de la ubicación:", error);
          setCityName('Ubicación actual');
        }
        
        await fetchPOIsFromBackend(coordinates);
      }, (error) => {
        console.error("Error al obtener la ubicación:", error);
        setIsLoading(false);
      });
    }
  }

  const handleSearch = async (searchText: string) => {
    if (!searchText.trim()) return;
    setIsLoading(true);

    try {
      // Usar el endpoint del backend para la geocodificación
      const response = await fetch(`${API_BASE_URL}/geocode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ searchText })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        const coordinates: [number, number] = data.coordinates;
        setMapCoordinates(coordinates);
        setCityName(data.name);
        
        // Buscar puntos de interés cercanos
        await fetchPOIsFromBackend(coordinates);
      } else {
        console.error("Error al buscar la ubicación:", data.message);
        setPOIList([]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error al buscar la ubicación:", error);
      setIsLoading(false);
    }
  }

  // Función para buscar POIs usando el backend
  const fetchPOIsFromBackend = async (coordinates: [number, number]) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/pois-nearby`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          longitude: coordinates[0],
          latitude: coordinates[1]
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log(`Se encontraron ${data.count} puntos de interés en total`);
        setPOIList(data.pois);
      } else {
        console.error("Error al buscar puntos de interés:", data.message);
        setPOIList([]);
      }
    } catch (error) {
      console.error("Error al buscar puntos de interés:", error);
      setPOIList([]);
    } finally {
      setIsLoading(false);
    }
  }
  
  // Filtrar POIs por categoría
  const getFilteredPOIs = () => {
    if (!activeCategory) return POIList;
    return POIList.filter(poi => poi.category === activeCategory);
  }
  
  // Función para cambiar la categoría activa
  const handleCategoryChange = (category: string | null) => {
    setActiveCategory(category);
  }

  return (
    <>
      <Header />
      <div className="travel-prep-container">
        <div className='search-section'>
          <SearchBar 
            placeholder="Buscar ciudad o lugar (ej. Barcelona, París...)" 
            onSearch={handleSearch} 
            isLoading={isLoading} 
          />
          <p className='location-text'>O prueba a</p>
          <button 
            className='location-button' 
            onClick={handleUseCurrentLocation}
            disabled={isLoading}
          >
            Usar tu ubicación actual
          </button>
        </div>

        {cityName && (
          <div className="selected-location">
            <h2>Explorando: {cityName}</h2>
          </div>
        )}

        <div className="category-filters">
          <button 
            className={activeCategory === null ? 'active-filter' : ''} 
            onClick={() => handleCategoryChange(null)}
          >
            Todos
          </button>
          {POI_CATEGORIES.map(category => (
            <button 
              key={category.id}
              className={activeCategory === category.label ? 'active-filter' : ''}
              onClick={() => handleCategoryChange(category.label)}
            >
              {category.emoji} {category.label}
            </button>
          ))}
        </div>

        <div className="content-section">
          <div className="left-column">
            <FilterDropdown />
            <ListItems<POI>
              items={getFilteredPOIs()}
              onItemClick={handlePoiClick}
              title={isLoading ? 'Buscando lugares...' : `Lugares de interés ${activeCategory ? `(${activeCategory})` : ''}`}
              emptyMessage={isLoading 
                ? 'Buscando puntos de interés...' 
                : cityName 
                  ? 'No se encontraron lugares en esta categoría. Prueba con otra categoría o busca otra ubicación.' 
                  : 'Busca una ciudad o usa tu ubicación actual para ver lugares de interés.'}
              className="poi-list" 
            />
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

