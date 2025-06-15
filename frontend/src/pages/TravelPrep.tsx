import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';

import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import Map from '../components/Map';
import ListItems from '../components/ListItems';

import { POI } from '../types/ListItem';

import "../styles/TravelPrep.css";
import { ItineraryDay } from '../types/Itinerary';

const POI_CATEGORIES = [
  { id: 'restaurant', label: 'Restaurantes', emoji: '🍽️' },
  { id: 'hotel', label: 'Hoteles', emoji: '🏨' },
  { id: 'museum', label: 'Museos', emoji: '🏛️' },
  { id: 'attraction', label: 'Atracciones', emoji: '🎭' },
  { id: 'park', label: 'Parques', emoji: '🌳' },
  { id: 'cafe', label: 'Cafés', emoji: '☕' }
];

const TRANSPORT_OPTIONS = [
  { id: "walking", label: "A pie", icon: "🚶" },
  { id: "driving", label: "Coche", icon: "🚗" },
  { id: "transit", label: "Transporte público", icon: "🚌" },
];

const API_BASE_URL = getApiUrl();

const TravelPrep = () => {
  const { isLoggedIn, user } = useAuth();

  const [mapCoordinates, setMapCoordinates] = useState<[number, number] | null>(null);
  const [POIList, setPOIList] = useState<POI[]>([]);
  const [cityName, setCityName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedPOIs, setSelectedPOIs] = useState<POI[]>([]);
  const [transportModes, setTransportModes] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [days, setDays] = useState<ItineraryDay[]>([
    {
      date: new Date().toISOString().split('T')[0],
      activities: []
    }
  ]);
  const [activeDay, setActiveDay] = useState<number>(0);

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
          const { data } = await axios.post(`${API_BASE_URL}/map/reverse-geocode`, {
            longitude: coordinates[0],
            latitude: coordinates[1]
          });

          setCityName(data.name);
          setSelectedPOIs([]); // Limpiar POIs seleccionados al usar ubicación actual
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
      const { data } = await axios.post(`${API_BASE_URL}/map/geocode`, { searchText });
      const coordinates: [number, number] = data.coordinates;
      setMapCoordinates(coordinates);
      setCityName(data.name);
      setSelectedPOIs([]); // Limpiar POIs seleccionados al buscar una nueva ubicación

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
      const { data } = await axios.post(`${API_BASE_URL}/map/pois-nearby`, {
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
    if (!days[activeDay].activities.some(activity => activity.poi.id === poi.id)) {
      const updatedDays = [...days];
      updatedDays[activeDay].activities.push({
        poi,
        startTime: "10:00",
        endTime: "11:00",
        notes: ""
      });
      setDays(updatedDays);
    }
  }

  const handleRemoveFromItinerary = (poiId: number, dayIndex: number) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].activities = updatedDays[dayIndex].activities.filter(
      activity => activity.poi.id !== poiId
    );
    setDays(updatedDays);
  };

  const handleDateChange = (type: 'start' | 'end', newDate: string) => {
    if (type === 'start') {
      setStartDate(newDate);
      
      // Si la fecha de inicio es posterior a la de fin, actualizar la de fin
      if (new Date(newDate) > new Date(endDate)) {
        const nextDay = new Date(newDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setEndDate(nextDay.toISOString().split('T')[0]);
      }
    } else {
      setEndDate(newDate);
    }

    // Regenerar los días basados en las nuevas fechas
    generateDays(type === 'start' ? newDate : startDate, type === 'end' ? newDate : endDate);
  }

  const generateDays = (start: string, end: string) => {
    const startDateTime = new Date(start);
    const endDateTime = new Date(end);
    const newDays: ItineraryDay[] = [];
    
    // Crear un día por cada fecha entre inicio y fin (inclusive)
    for (let dt = new Date(startDateTime); dt <= endDateTime; dt.setDate(dt.getDate() + 1)) {
      const dateString = dt.toISOString().split('T')[0];
      
      // Buscar si ya existe este día para mantener sus actividades
      const existingDay = days.find(day => day.date === dateString);
      
      if (existingDay) {
        newDays.push(existingDay);
      } else {
        newDays.push({ date: dateString, activities: [] });
      }
    }
    
    setDays(newDays);
    
    // Asegurarse que el día activo es válido
    if (activeDay >= newDays.length) {
      setActiveDay(0);
    }
  }

  const resetDays = () => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    
    setStartDate(today);
    setEndDate(tomorrowString);
    setDays([{ date: today, activities: [] }]);
    setActiveDay(0);
    setTransportModes([]);
  }

  const handleSaveItinerary = async () => {
    if (!isLoggedIn) {
      return alert("Inicia sesión para guardar el itinerario.");
    }

    // Verificar que hay al menos una actividad en algún día
    const hasActivities = days.some(day => day.activities.length > 0);
    if (!hasActivities) {
      return alert("Añade al menos una actividad a tu itinerario.");
    }

    if (transportModes.length === 0) {
      return alert("Selecciona al menos un medio de transporte.");
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/itineraries`, {
        name: `Itinerario en ${cityName}`,
        description: `Lugares interesantes para visitar en ${cityName}`,
        destination: cityName,
        startDate: startDate,
        endDate: endDate,
        userId: user.id,
        days: days,
        transportModes: transportModes,
        isPublic: false
      });

      if (response.status === 201) {
        const itineraryId = response.data._id;

        try {
          await axios.post(`${API_BASE_URL}/itineraries/${itineraryId}/calculate`);
          alert("Itinerario guardado con éxito y rutas calculadas.");
          resetDays(); // Limpiar itinerario después de guardar
          
          window.location.href = `/itinerary/${itineraryId}`; // Redirigir al itinerario guardado	
        } catch (routeError) {
          console.error("Error al calcular las rutas del itinerario:", routeError);
          alert("Itinerario guardado, pero hubo un error al calcular las rutas. Inténtalo de nuevo más tarde.");
        }
      }
    } catch (error) {
      console.error("Error al guardar el itinerario:", error);
      alert("Error al guardar el itinerario. Inténtalo de nuevo más tarde.");
    }
  }

  const handleTransportChange = (transportId: string) => {
    setTransportModes(prev =>
      prev.includes(transportId)
        ? prev.filter(id => id !== transportId)
        : [...prev, transportId]
    );
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
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
        
        {cityName && (
          <div className="itinerary-builder">
            <h3>🗓️ Planifica tu itinerario</h3>
            
            <div className="date-selection">
              <div className="date-field">
                <label htmlFor="startDate">Fecha de inicio:</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="date-field">
                <label htmlFor="endDate">Fecha de fin:</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  min={startDate}
                />
              </div>
              
              <div className="trip-duration">
                <span>Duración: {days.length} día{days.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {days.length > 0 && (
              <div className="itinerary-days">
                <div className="days-tabs">
                  {days.map((day, index) => (
                    <button
                      key={day.date}
                      className={`day-tab ${activeDay === index ? 'active' : ''}`}
                      onClick={() => setActiveDay(index)}
                    >
                      <span className="day-number">Día {index + 1}</span>
                      <span className="day-date"> {formatDate(day.date)}</span>
                    </button>
                  ))}
                </div>
                
                <div className="day-content">
                  <h4>Actividades del día {activeDay + 1}</h4>
                  
                  {days[activeDay].activities.length === 0 ? (
                    <p className="no-activities">No hay actividades planificadas para este día. Añade puntos de interés desde el mapa.</p>
                  ) : (
                    <ul className="activities-list">
                      {days[activeDay].activities.map((activity, idx) => (
                        <li key={`${activity.poi.id}-${idx}`} className="activity-item">
                          <div className="activity-info">
                            <h5>{activity.poi.name}</h5>
                            <p className="activity-category">{activity.poi.category}</p>
                            <p className="activity-description">{activity.poi.description}</p>
                          </div>
                          <div className="activity-actions">
                            <div className="activity-time">
                              <div className="time-input">
                                <label>Desde:</label>
                                <input 
                                  type="time" 
                                  value={activity.startTime} 
                                  onChange={(e) => {
                                    const updatedDays = [...days];
                                    updatedDays[activeDay].activities[idx].startTime = e.target.value;
                                    setDays(updatedDays);
                                  }}
                                />
                              </div>
                              <div className="time-input">
                                <label>Hasta:</label>
                                <input 
                                  type="time" 
                                  value={activity.endTime} 
                                  onChange={(e) => {
                                    const updatedDays = [...days];
                                    updatedDays[activeDay].activities[idx].endTime = e.target.value;
                                    setDays(updatedDays);
                                  }}
                                />
                              </div>
                            </div>
                            <button 
                              className="remove-activity" 
                              onClick={() => handleRemoveFromItinerary(Number(activity.poi.id), activeDay)}
                            >
                              ❌ Eliminar
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {days.some(day => day.activities.length > 0) && (
              <div className="itinerary-finalization">
                <div className="transport-selection">
                  <h4>Selecciona medios de transporte:</h4>
                  <div className="transport-options">
                    {TRANSPORT_OPTIONS.map(option => {
                      const isSelected = transportModes.includes(option.id);
                      
                      return (
                        <label
                          key={option.id}
                          className={`transport-option ${isSelected ? 'selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTransportChange(option.id)}
                          />
                          <span>{option.icon} {option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                
                <button 
                  className="save-itinerary-button" 
                  onClick={handleSaveItinerary}
                  disabled={transportModes.length === 0}
                >
                  💾 Guardar itinerario
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}

export default TravelPrep

