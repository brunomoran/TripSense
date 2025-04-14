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

const SEARCH_RADIUS = 50000; // Radio de búsqueda en metros

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
        
        // Obtener el nombre de la ubicación actual mediante geocodificación inversa
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${mapboxgl.accessToken}`
          );
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            // Buscar la característica que sea una ciudad o población
            const cityFeature = data.features.find((f: any) => 
              f.place_type.includes('place') || 
              f.place_type.includes('locality') ||
              f.place_type.includes('region')
            );
            
            setCityName(cityFeature ? cityFeature.text : 'Ubicación actual');
          } else {
            setCityName('Ubicación actual');
          }
        } catch (error) {
          console.error("Error al obtener el nombre de la ubicación:", error);
          setCityName('Ubicación actual');
        }
        
        await fetchAllPOIsNearby(coordinates);
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
      // Obtener las coordenadas del lugar buscado
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchText)}.json?access_token=${mapboxgl.accessToken}&types=place,locality,region`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center;
        const coordinates: [number, number] = [longitude, latitude];
        setMapCoordinates(coordinates);
        
        // Actualizar el nombre de la ciudad
        setCityName(data.features[0].text);
        
        // Buscar puntos de interés cercanos
        await fetchAllPOIsNearby(coordinates);
      } else {
        console.log("No se encontraron resultados para la búsqueda.");
        setPOIList([]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error al buscar la ubicación:", error);
      setIsLoading(false);
    }
  }

  // Función para buscar POIs para todas las categorías
  const fetchAllPOIsNearby = async (coordinates: [number, number]) => {
    setIsLoading(true);
    
    try {
      let allPOIs: POI[] = [];
      let idCounter = 0;
      
      // Buscar POIs para cada categoría
      for (const category of POI_CATEGORIES) {
        const categoryPOIs = await fetchPOIsForCategory(coordinates, category.id, idCounter);
        idCounter += categoryPOIs.length;
        allPOIs = [...allPOIs, ...categoryPOIs];
      }
      
      // Actualizar la lista de POIs
      console.log(`Se encontraron ${allPOIs.length} puntos de interés en total`);
      setPOIList(allPOIs);
    } catch (error) {
      console.error("Error al buscar puntos de interés:", error);
      setPOIList([]);
    } finally {
      setIsLoading(false);
    }
  }
  
  // Función para buscar POIs de una categoría específica
  const fetchPOIsForCategory = async (coordinates: [number, number], categoryId: string, startId: number = 0): Promise<POI[]> => {
    try {
      // Usamos la API de Mapbox para buscar POIs cercanos por categoría
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${categoryId}.json?proximity=${coordinates[0]},${coordinates[1]}&access_token=${mapboxgl.accessToken}&limit=10`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.features || data.features.length === 0) {
        return [];
      }
      
      // Filtrar POIs que estén realmente cerca (dentro del radio de búsqueda)
      const category = POI_CATEGORIES.find(c => c.id === categoryId);
      const poiLabel = category ? category.label : 'Punto de interés';
      const poiEmoji = category ? category.emoji : '📍';
      
      const pois = data.features
        .filter((feature: any) => {
          // Calcular distancia aproximada (en grados - una aproximación simple)
          const dx = feature.center[0] - coordinates[0];
          const dy = feature.center[1] - coordinates[1];
          const distanceInDegrees = Math.sqrt(dx * dx + dy * dy);
          
          // Convertir aproximadamente a km (1 grado ≈ 111 km en el ecuador)
          const distanceInKm = distanceInDegrees * 111;
          return distanceInKm <= (SEARCH_RADIUS / 1000);
        })
        .map((feature: any, index: number) => {
          // Extraer dirección del place_name
          const fullAddress = feature.place_name;
          // Quitar el nombre del POI del inicio de la dirección
          const address = fullAddress.replace(feature.text, '').replace(/^,\s*/, '');
          
          return {
            id: startId + index,
            name: `${poiEmoji} ${feature.text}`,
            description: address,
            imageUrl: "", // Podría integrarse con otra API para obtener imágenes
            location: { 
              lat: feature.center[1], 
              lng: feature.center[0] 
            },
            category: poiLabel
          };
        });
      
      console.log(`Se encontraron ${pois.length} ${poiLabel.toLowerCase()}`);
      return pois;
      
    } catch (error) {
      console.error(`Error al buscar ${categoryId}:`, error);
      return [];
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

