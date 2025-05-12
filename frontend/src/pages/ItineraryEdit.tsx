import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Itinerary } from '../types/Itinerary'
import { POI } from '../types/ListItem'
import { getApiUrl } from '../config/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Modal from '../components/Modal'

import '../styles/ItineraryEdit.css'

import axios from 'axios'

type Props = {}

const API_BASE_URL = getApiUrl()

const transportOptions = [
  { id: "walking", label: "A pie" },
  { id: "driving", label: "Coche" },
  { id: "transit", label: "Transporte público" },
];

const ItineraryEdit = (props: Props) => {
  const { id } = useParams<{ id: string }>()
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [pois, setPois] = useState<POI[]>([])
  const [selectedTransport, setSelectedTransport] = useState<string[]>([])

  useEffect(() => {
    if (id) {
      fetchItinerary(id);
    }
  }, [id])

  const fetchItinerary = async (id: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/itineraries/${id}`);
      setItinerary(response.data);
      setSelectedTransport(response.data.transportModes || []);
    } catch (error) {
      console.error("Error fetching itinerary:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchPoisForCity = async (city: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/map/places`, { city })
      console.log("POIs:", response.data)
      setPois(response.data.pois)
    } catch (error) {
      console.error("Error fetching POIs:", error)
      setPois([])
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
      await axios.put(`${API_BASE_URL}/itineraries/${itinerary._id}`, {
        ...itinerary,
        transportModes: selectedTransport
      })
      await axios.post(`${API_BASE_URL}/itineraries/${itinerary._id}/calculate`)
      alert("Cambios guardados con éxito")
    } catch (error) {
      console.error("Error al guardar cambios:", error)
      alert("Error al guardar cambios. Por favor, inténtalo de nuevo más tarde.")
    }
  }

  const handleOpenModal = () => {
    if (itinerary?.destination) {
      fetchPoisForCity(itinerary.destination)
      setShowModal(true)
    }
  }

  const handleAddPoiToItinerary = (poi: POI) => {
    if (!itinerary || !itinerary.days || itinerary.days.length === 0) return;

    // Generar un ID único para la actividad
    const activityId = 'act_' + Math.random().toString(36).substring(2, 9);

    // Tomamos el primer día del itinerario para simplificar (podrías permitir seleccionar un día)
    const firstDay = itinerary.days[0];

    const updatedDays = itinerary.days.map(day => {
      if (day._id === firstDay._id) {
        return {
          ...day,
          activities: [
            ...day.activities,
            {
              id: activityId,
              poi: poi,
              startTime: "10:00", // Hora predeterminada
              endTime: "11:00", // Hora predeterminada
              notes: ""
            }
          ]
        };
      }
      return day;
    });

    setItinerary({
      ...itinerary,
      days: updatedDays
    });

    setShowModal(false);
  };

  const handleTransportChange = (mode: string) => {
    setSelectedTransport(prev =>
      prev.includes(mode)
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    );
  };


  if (isLoading) return (
    <>
      <Header />
      <div className="loading-container">
        <p>Cargando itinerario...</p>
      </div>
      <Footer />
    </>
  )

  if (!itinerary) return (
    <>
      <Header />
      <div className="error-container">
        <p>No se encontró el itinerario</p>
        <button onClick={() => navigate('/my_itineraries')} className="back-button">
          Volver a mis itinerarios
        </button>
      </div>
      <Footer />
    </>
  )

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

        <button className="add-activity-button" onClick={handleOpenModal}>
          ➕ Añadir actividad
        </button>

        <Modal show={showModal} onClose={() => setShowModal(false)}>
          <h2>Puntos de interés en {itinerary.destination}</h2>
          {pois.length === 0 ? (
            <p>Cargando puntos de interés...</p>
          ) : (
            <ul className="poi-list">
              {pois.map((poi) => (
                <li key={poi.id || poi._id || Math.random()} className="poi-item">
                  <strong>{poi.name}</strong>
                  <p>{poi.description}</p>
                  <span className="poi-category">{poi.category}</span>
                  <button
                    className="add-poi-button"
                    onClick={() => handleAddPoiToItinerary(poi)}
                  >
                    ➕ Añadir al itinerario
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Modal>

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

        <div className="transport-selection">
          <h3>Selecciona los medios de transporte permitidos:</h3>
          <div className="transport-options">
            {transportOptions.map(option => (
              <label key={option.id} className="transport-option">
                <input
                  type="checkbox"
                  value={option.id}
                  checked={selectedTransport.includes(option.id)}
                  onChange={() => handleTransportChange(option.id)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <button onClick={() => handleSaveChanges()} className="save-itinerary-button">💾 Guardar cambios</button>
      </div>
      <Footer />
    </>
  )
}

export default ItineraryEdit