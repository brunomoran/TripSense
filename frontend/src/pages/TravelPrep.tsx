import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import Map from '../components/Map';
import ListItems from '../components/ListItems';

import { POI } from '../types/ListItem';

import "../styles/TravelPrep.css";

const POI_CATEGORIES = [
  { id: 'restaurant', label: 'Restaurantes', emoji: '🍽️' },
  { id: 'hotel', label: 'Hoteles', emoji: '🏨' },
  { id: 'museum', label: 'Museos', emoji: '🏛️' },
  { id: 'attraction', label: 'Atracciones', emoji: '🎭' },
  { id: 'park', label: 'Parques', emoji: '🌳' },
  { id: 'cafe', label: 'Cafés', emoji: '☕' }
];

const API_BASE_URL = 'http://localhost:5000/api/map';

const TravelPrep = () => {
  const { isLoggedIn, user } = useAuth();
  
  const [mapCoordinates, setMapCoordinates] = useState<[number, number] | null>(null);
  const [POIList, setPOIList] = useState<POI[]>([]);
  const [cityName, setCityName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedPOIs, setSelectedPOIs] = useState<POI[]>([]);

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
          const { data } = await axios.post(`${API_BASE_URL}/reverse-geocode`, {
            longitude: coordinates[0],
            latitude: coordinates[1]
          });

          setCityName(data.name);
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
      const { data } = await axios.post(`${API_BASE_URL}/geocode`, { searchText });
      const coordinates: [number, number] = data.coordinates;
      setMapCoordinates(coordinates);
      setCityName(data.name);

      // Buscar puntos de interés cercanos
      await fetchPOIsFromBackend(coordinates);
    } catch (error: any) {
      console.error("Error al buscar la ubicación:", error.response?.data?.message || error.message);
      setPOIList([]);
      setIsLoading(false);
    }
  }

  // Función para buscar POIs usando el backend
  const fetchPOIsFromBackend = async (coordinates: [number, number]) => {
    setIsLoading(true);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/pois-nearby`, {
        longitude: coordinates[0],
        latitude: coordinates[1]
      });
      console.log(`Se encontraron ${data.count} puntos de interés.`);
      setPOIList(data.pois);
    } catch (error: any) {
      console.error("Error al buscar puntos de interés:", error.response?.data?.message || error.message);
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

  const handleAddToItinerary = (poi: POI) => {
    if (!selectedPOIs.find(p => p.id === poi.id)) {
      setSelectedPOIs(prev => [...prev, poi]);
    }
  }

  const handleSaveItinerary = async () => {
    if (!isLoggedIn) {
      return alert("Inicia sesión para guardar el itinerario.");
    }

    if (selectedPOIs.length === 0) {
      return alert("Añade al menos una actividad al itinerario.");
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/`, {
        name: `Itinerario en ${cityName}`,
        userId: user.id,
        activities: selectedPOIs.map(poi => ({
          name: poi.name,
          description: poi.description,
          location: poi.location,
          category: poi.category
        }))
      })
      if (response.status === 200) {
        alert("Itinerario guardado con éxito.");
      }
    } catch (error) {
      console.error("Error al guardar el itinerario:", error);
      alert("Error al guardar el itinerario. Inténtalo de nuevo más tarde.");
    }
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
              onAddItinerary={handleAddToItinerary}
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
        {selectedPOIs.length > 0 && (
          <div className="itinerary-preview">
            <h3>📝 Itinerario en preparación:</h3>
            <ul>
              {selectedPOIs.map((poi) => (
                <li key={poi.id}>{poi.name} - {poi.category}</li>
              ))}
            </ul>
            <button className="save-itinerary-button" onClick={handleSaveItinerary}>
              💾 Guardar itinerario
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}

export default TravelPrep

