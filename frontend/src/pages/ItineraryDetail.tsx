import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Map from "../components/Map"
import { getApiUrl } from "../config/api"

import { Itinerary } from "../types/Itinerary"

import "../styles/ItineraryDetail.css"

const API_BASE_URL = getApiUrl()

type Props = {}

const ItineraryDetail = (props: Props) => {
  const { id } = useParams<{ id: string }>()
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeDay, setActiveDay] = useState<number>(0)

  useEffect(() => {
    if (!id) return;
    fetchItinerary();
  }, [id])

  const fetchItinerary = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/itineraries/${id}`)
      setItinerary(response.data)
    } catch (error) {
      console.error("Error fetching itinerary:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este itinerario?")) {
      return
    }

    try {
      await axios.delete(`${API_BASE_URL}/itineraries/${id}`)
      alert("Itinerario eliminado con éxito")
      window.history.back()
    } catch (error) {
      console.error("Error al eliminar el itinerario:", error)
      alert("Error al eliminar el itinerario. Por favor, inténtalo de nuevo más tarde.")
    }
  }

  // Función para formatear la fecha en formato legible
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  }

  // Extrae las polilíneas de las rutas para un día específico
  const extractDayPolylines = (dayIndex: number): string[] => {
    if (!itinerary || !itinerary.completeRoute?.daysRoutes) return [];

    const polylines: string[] = [];
    const dayRoutes = itinerary.completeRoute.daysRoutes[dayIndex];

    if (dayRoutes?.segments) {
      dayRoutes.segments.forEach(segment => {
        if (segment.fullRoute?.overview_polyline?.points) {
          polylines.push(segment.fullRoute.overview_polyline.points);
        }
      });
    }

    return polylines;
  }

  // Obtiene los marcadores para un día específico
  const getDayMarkers = (dayIndex: number) => {
    if (!itinerary || !itinerary.days[dayIndex]) return [];

    return itinerary.days[dayIndex].activities.map(activity => ({
      id: activity.id,
      coordinates: [
        activity.poi.location.lng,
        activity.poi.location.lat
      ],
      popupContent: `
        <div class="marker-popup">
          <h3>${activity.poi.name}</h3>
          <p>${activity.poi.description || ''}</p>
          <p><strong>Horario:</strong> ${activity.startTime} - ${activity.endTime}</p>
          ${activity.routeToNext ?
          `<p><strong>Ruta siguiente:</strong> ${activity.routeToNext.distance}, ${activity.routeToNext.duration}</p>
           <p><strong>Modo:</strong> ${activity.routeToNext.mode}</p>` : ''}
        </div>
      `
    }));
  }

  // Obtiene las coordenadas iniciales del mapa para un día específico
  const getDayInitialCoordinates = (dayIndex: number): [number, number] => {
    if (!itinerary || !itinerary.days[dayIndex] || !itinerary.days[dayIndex].activities[0]) {
      return [0, 0]; // Coordenadas por defecto si no hay actividades
    }
    
    const firstActivity = itinerary.days[dayIndex].activities[0];
    return [firstActivity.poi.location.lng, firstActivity.poi.location.lat];
  }

  // Calcula la distancia total del día
  const getDayDistanceAndDuration = (dayIndex: number) => {
    if (!itinerary || !itinerary.completeRoute?.daysRoutes || !itinerary.completeRoute.daysRoutes[dayIndex]) {
      return { distance: 'No calculado', duration: 'No calculado' };
    }

    const dayRoute = itinerary.completeRoute.daysRoutes[dayIndex];
    return {
      distance: dayRoute.totalDistance,
      duration: dayRoute.totalDuration
    };
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="itinerary-detail-container loading">
          <div className="spinner"></div>
          <p>Cargando itinerario...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!itinerary) {
    return (
      <>
        <Header />
        <div className="itinerary-detail-container error">
          <h2>Error</h2>
          <p>No se encontró el itinerario solicitado</p>
          <button onClick={() => window.history.back()} className="button">Volver atrás</button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="itinerary-detail-container">
        <div className="itinerary-header">
          <h1>{itinerary.name}</h1>
          <p className="destination">📍 {itinerary.destination}</p>
          <p className="dates">🗓️ Del {formatDate(itinerary.startDate)} al {formatDate(itinerary.endDate)}</p>
          
          {itinerary.completeRoute && (
            <div className="total-stats">
              <div className="stat-item">
                <span className="stat-icon">📏</span>
                <span className="stat-label">Distancia total: </span>
                <span className="stat-value">{itinerary.completeRoute.totalDistance}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⏱️</span>
                <span className="stat-label">Duración total: </span>
                <span className="stat-value">{itinerary.completeRoute.totalDuration}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🚶</span>
                <span className="stat-label">Modos de transporte: </span>
                <span className="stat-value">{itinerary.transportModes.join(', ')}</span>
              </div>
            </div>
          )}

          <div className="itinerary-actions">
            <button onClick={() => window.location.href = `/itinerary/${itinerary._id}/edit`} className="edit-button">
              ✏️ Editar
            </button>
            <button onClick={() => handleDelete(itinerary._id)} className="delete-button">
              🗑️ Eliminar
            </button>
          </div>
        </div>

        <div className="itinerary-days-tabs">
          {itinerary.days.map((day, index) => (
            <button 
              key={day.id || index} 
              className={`day-tab ${activeDay === index ? 'active' : ''}`}
              onClick={() => setActiveDay(index)}
            >
              <span className="day-number">Día {index + 1}: </span>
              <span className="day-date">{formatDate(day.date)}</span>
            </button>
          ))}
        </div>

        <div className="day-content">
          <div className="day-detail">
            <div className="day-header">
              <h2>Día {activeDay + 1}: {formatDate(itinerary.days[activeDay].date)}</h2>
              
              {itinerary.completeRoute?.daysRoutes && itinerary.completeRoute.daysRoutes[activeDay] && (
                <div className="day-stats">
                  <div className="stat">
                    <span className="stat-icon">📏</span>
                    <span className="stat-value">{getDayDistanceAndDuration(activeDay).distance}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-value">{getDayDistanceAndDuration(activeDay).duration}</span>
                  </div>
                </div>
              )}
            </div>

            <ul className="activities-list">
              {itinerary.days[activeDay].activities.map((activity, actIndex) => (
                <li key={activity.id || actIndex} className="activity-item">
                  <div className="activity-time">
                    <span className="time">{activity.startTime}</span>
                    <span className="time-separator">-</span>
                    <span className="time">{activity.endTime}</span>
                  </div>
                  <div className="activity-content">
                    <div className="activity-header">
                      <h3 className="activity-name">{activity.poi.name}</h3>
                      <span className="activity-category">{activity.poi.category}</span>
                    </div>
                    {activity.poi.description && (
                      <p className="activity-description">{activity.poi.description}</p>
                    )}
                    {activity.notes && (
                      <p className="activity-notes">{activity.notes}</p>
                    )}
                    {activity.routeToNext && actIndex < itinerary.days[activeDay].activities.length - 1 && (
                      <div className="route-info">
                        <div className="route-icon">
                          {activity.routeToNext.mode === 'walking' && '🚶'}
                          {activity.routeToNext.mode === 'driving' && '🚗'}
                          {activity.routeToNext.mode === 'transit' && '🚌'}
                          {activity.routeToNext.mode === 'bicycling' && '🚲'}
                        </div>
                        <div className="route-details">
                          <span>Hasta {itinerary.days[activeDay].activities[actIndex + 1].poi.name}: </span>
                          <span className="route-distance">{activity.routeToNext.distance}</span>
                          <span className="route-separator">•</span>
                          <span className="route-duration">{activity.routeToNext.duration}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="day-map-container">
            <Map
              initialCoordinates={getDayInitialCoordinates(activeDay)}
              markers={getDayMarkers(activeDay)}
              routes={extractDayPolylines(activeDay)}
            />
          </div>
        </div>

        <div className="itinerary-navigation">
          <button 
            onClick={() => window.history.back()} 
            className="navigation-button"
          >
            ⬅️ Volver
          </button>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default ItineraryDetail