import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import Header from "../components/Header"
import Footer from "../components/Footer"

import { Itinerary } from "../types/Itinerary"

import "../styles/MyItineraries.css"
import { Link } from "react-router-dom"

type Props = {}
const API_BASE_URL = 'http://localhost:5000/api'

const MyItineraries = (props: Props) => {
  const { isLoggedIn, user } = useAuth()
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    if (isLoggedIn) {
      fetchItineraries()
    }
  }, [])

  const fetchItineraries = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/itineraries/user/${user.id}`)
      setItineraries(data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching itineraries:", error)
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
      setItineraries(itineraries.filter(itinerary => itinerary._id !== id))
    } catch (error) {
      console.error("Error al eliminar el itinerario:", error)
      alert("Error al eliminar el itinerario. Por favor, inténtalo de nuevo más tarde.")
    }
  }

  return (
    <>
      <Header />
      <div className="my-itineraries-container">
        <h2>Tus itinerarios</h2>
        {!isLoggedIn ? (
          <p>Debes iniciar sesión para ver tus itinerarios guardados</p>
        ) : isLoading ? (
          <p>Cargando itinerarios...</p>
        ) : itineraries.length === 0 ? (
          <p>No tienes itinerarios guardados aún.</p>
        ) : (
          <ul className="itinerary-list">
            {itineraries.map(itinerary => (
              <li key={itinerary._id} className="itinerary-card">
                <Link to={`/itinerary/${itinerary._id}`}>
                  <h3>{itinerary.name}</h3>
                </Link>
                <p>Destino: {itinerary.destination}</p>
                <p>Desde: {itinerary.startDate} hasta {itinerary.endDate}</p>
                <div className="buttons">
                  <button onClick={() => window.location.href = `/itinerary/${itinerary._id}/edit`}>
                    ✏️ Editar
                  </button>
                  <button onClick={() => handleDelete(itinerary._id)}>
                    🗑️ Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )
        }
      </div>
      <Footer />
    </>
  )
}

export default MyItineraries