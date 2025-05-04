import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import Header from "../components/Header"
import Footer from "../components/Footer"

import { Itinerary } from "../types/Itinerary"

import "../styles/ItineraryDetail.css"

const API_BASE_URL = 'http://localhost:5000/api'

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
      <Footer />
    </>
  )
}

export default ItineraryDetail