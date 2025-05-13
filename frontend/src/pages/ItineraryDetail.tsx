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

  const extractRoutePolylines = (): string[] => {
    if (!itinerary) return []

    const polylines: string[] = []

    // Si el itinerario tiene una ruta completa con segmentos por día
    if (itinerary.completeRoute?.daysRoutes) {
      // Recorrer cada día en la ruta completa
      itinerary.completeRoute.daysRoutes.forEach(dayRoute => {
        // Recorrer cada segmento de ruta en el día
        dayRoute.segments.forEach(segment => {
          if (segment.fullRoute?.overview_polyline?.points) {
            polylines.push(segment.fullRoute.overview_polyline.points);
          }
        });
      });
    }
    console.log("Polylines from completeRoute:", polylines);
    return polylines;

  }

  if (isLoading) {
    return <p>Cargando itinerario...</p>
  }

  if (!itinerary) {
    return <p>No se encontró el itinerario</p>
  }

  return (
    <>
      <Header />
      <div className="itinerary-detail-container">
        <h1>{itinerary.name}</h1>
        <p className="destination">{itinerary.destination}</p>
        <p className="dates">
          Del {itinerary.startDate} al {itinerary.endDate}
        </p>

        {itinerary.days.map((day) => (
          <div key={day.id} className="day-section">
            <h2>🗓️ {day.date}</h2>
            <ul className="activities-list">
              {day.activities.map((activity) => (
                <li key={activity.id} className="activity-item">
                  <strong>{activity.poi.name}</strong> ({activity.poi.category})<br />
                  <span>{activity.startTime} - {activity.endTime}</span><br />
                  <em>{activity.poi.description}</em>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="itinerary-detail-actions">
        <button onClick={() => window.location.href = `/itinerary/${itinerary._id}/edit`} className="edit-button">✏️ Editar</button>
        <button onClick={() => handleDelete(itinerary._id)} className="delete-button">🗑️ Eliminar</button>
        <button onClick={() => window.history.back} className="goback-button">⬅️ Volver</button>
      </div>
      <div className="route-map">
        <h2>Mapa del itinerario</h2>
        <Map
          initialCoordinates={[
            itinerary.days[0]?.activities[0]?.poi.location.lng ?? 0,
            itinerary.days[0]?.activities[0]?.poi.location.lat ?? 0
          ]}
          markers={itinerary.days.flatMap(day =>
            day.activities.map(activity => ({
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
            }))
          )}
          routes={extractRoutePolylines()}
        />
      </div>
      <Footer />
    </>
  )
}

export default ItineraryDetail