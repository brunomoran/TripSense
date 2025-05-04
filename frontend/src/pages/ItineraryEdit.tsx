import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import { useParams } from 'react-router-dom'
import { Itinerary } from '../types/Itinerary'
import { getApiUrl } from '../config/api'
import Footer from '../components/Footer'

import axios from 'axios'

type Props = {}

const API_BASE_URL = getApiUrl()

const ItineraryEdit = (props: Props) => {
  const { id } = useParams<{ id: string }>()
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    if (id) {
      fetchItinerary(id);
    }
  }, [id])

  const fetchItinerary = async (id: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/itineraries/${id}`);
      setItinerary(response.data);
    } catch (error) {
      console.error("Error fetching itinerary:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeleteActivity = async (dayId: string, activityId: string) => {
    console.log(`Eliminar actividad ${activityId} del día ${dayId}`);

    if (!itinerary) return

    const updatedDays = itinerary.days.map((day) => {
      if (day.id === dayId) {
        return {
          ...day,
          activities: day.activities.filter((a) => a.id !== activityId)
        }
      }
      return day
    })

    setItinerary({ ...itinerary, days: updatedDays })
  }

  const handleTogglePublic = () => {
    if (!itinerary) return
    setItinerary({ ...itinerary, isPublic: !itinerary.isPublic })
  }

  const handleSaveChanges = async () => {
    if (!itinerary) return

    try {
      await axios.put(`${API_BASE_URL}/itineraries/${itinerary._id}`, itinerary)
      alert("Cambios guardados con éxito")
    } catch (error) {
      console.error("Error al guardar cambios:", error)
      alert("Error al guardar cambios. Por favor, inténtalo de nuevo más tarde.")
    }
  }

  if (isLoading) return <p>Cargando itinerario</p>
  if (!itinerary) return <p>Itinerario no encontrado</p>

  return (
    <>
      <Header />
      <div className="itinerary-edit-container">
        <h1>Editando {itinerary?.name}</h1>

        <label htmlFor="">
          <input type="checkbox"
            checked={itinerary?.isPublic || false}
            onChange={handleTogglePublic}
          />
          {itinerary?.isPublic
            ? 'Hacer este itinerario privado' : 'Hacer este itinerario público'}
        </label>

        {itinerary?.days.map((day) => (
          <div key={day._id} className="day-edit-section">
            <h2>🗓️ {day.date}</h2>
            <ul className="activity-edit-list">
              {day.activities.map((activity) => (
                <li key={activity._id} className="activity-edit-item">
                  <div>
                    <strong>{activity.poi.name}</strong> ({activity.poi.category})<br />
                    <span>{activity.startTime} - {activity.endTime}</span>
                  </div>
                  <button onClick={() => handleDeleteActivity(day._id ?? '', activity._id ?? '')}>
                    ❌ Eliminar
                  </button>
                </li>
              ))}
            </ul>
            <button onClick={() => handleSaveChanges} className="add-activity-button">➕ Añadir actividad</button>
          </div>
        ))}
        <button className="save-itinerary-button">💾 Guardar cambios</button>
      </div>
      <Footer />
    </>
  )
}

export default ItineraryEdit