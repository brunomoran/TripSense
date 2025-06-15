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
  { id: "walking", label: "A pie", icon: "🚶" },
  { id: "driving", label: "Coche", icon: "🚗" },
  { id: "transit", label: "Transporte público", icon: "🚌" },
];

const ItineraryEdit = (props: Props) => {
  const { id } = useParams<{ id: string }>()
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [showShareModal, setShowShareModal] = useState<boolean>(false)
  const [pois, setPois] = useState<POI[]>([])
  const [selectedTransport, setSelectedTransport] = useState<string[]>([])
  const [postDescription, setPostDescription] = useState<string>("")
  const [isPublishing, setIsPublishing] = useState<boolean>(false)

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
      if (day.id === dayId || day._id === dayId) {
        return {
          ...day,
          activities: day.activities.filter((a) => a.id !== activityId && a._id !== activityId)
        }
      }
      return day
    })

    setItinerary({ ...itinerary, days: updatedDays })
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

    // Tomamos el primer día del itinerario para simplificar
    const firstDay = itinerary.days[0];

    const updatedDays = itinerary.days.map(day => {
      if (day._id === firstDay._id || day.id === firstDay.id) {
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

  const handleShareItinerary = async () => {
    if (!itinerary) return;
    setShowShareModal(true);
  };

  const handlePublishPost = async () => {
    if (!itinerary) return;
    
    setIsPublishing(true);
    try {
      // Primero aseguramos que el itinerario sea público
      if (!itinerary.isPublic) {
        await axios.put(`${API_BASE_URL}/itineraries/${itinerary._id}`, {
          ...itinerary,
          isPublic: true
        });
      }
      
      // Luego creamos el post
      const response = await axios.post(`${API_BASE_URL}/posts`, {
        itineraryId: itinerary._id,
        description: postDescription.trim() || `¡Mira mi itinerario a ${itinerary.destination}!`
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.status === 201) {
        alert('¡Tu itinerario ha sido publicado en la comunidad!');
        setShowShareModal(false);
        setPostDescription("");
        // Opcionalmente, redirigir a la página de comunidad
        navigate('/community');
      }
    } catch (error) {
      console.error("Error al publicar el itinerario:", error);
      alert("Error al publicar el itinerario. Por favor, inténtalo de nuevo más tarde.");
    } finally {
      setIsPublishing(false);
    }
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

        <div className="edit-actions">
          <button className="add-activity-button" onClick={handleOpenModal}>
            ➕ Añadir actividad
          </button>
          
          <button 
            className="share-button" 
            onClick={handleShareItinerary}
            title="Publica tu itinerario en la comunidad"
          >
            📢 Publicar en comunidad
          </button>
        </div>

        {/* Modal para añadir POIs */}
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

        {/* Modal para compartir en la comunidad */}
        <Modal show={showShareModal} onClose={() => setShowShareModal(false)}>
          <h2>Publicar itinerario en la comunidad</h2>
          <div className="share-modal-content">
            <p>Tu itinerario se hará público y aparecerá en la sección de comunidad para que otros viajeros puedan verlo.</p>
            
            <div className="itinerary-info-preview">
              <h3>{itinerary.name}</h3>
              <p>📍 {itinerary.destination}</p>
              <p>🗓️ {itinerary.startDate} - {itinerary.endDate}</p>
              <p>📆 {itinerary.days.length} día(s)</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="postDescription">Añade una descripción para tu publicación:</label>
              <textarea
                id="postDescription"
                value={postDescription}
                onChange={(e) => setPostDescription(e.target.value)}
                placeholder="¡Comparte tus impresiones sobre este itinerario!"
                rows={4}
              />
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-button" 
                onClick={() => setShowShareModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="publish-button" 
                onClick={handlePublishPost}
                disabled={isPublishing}
              >
                {isPublishing ? 'Publicando...' : '📢 Publicar ahora'}
              </button>
            </div>
          </div>
        </Modal>

        {itinerary?.days.map((day) => (
          <div key={day._id || day.id} className="day-edit-section">
            <h2>🗓️ {day.date}</h2>
            <ul className="activity-edit-list">
              {day.activities.map((activity) => (
                <li key={activity._id || activity.id} className="activity-edit-item">
                  <div>
                    <strong>{activity.poi.name}</strong> ({activity.poi.category})<br />
                    <span>{activity.startTime} - {activity.endTime}</span>
                  </div>
                  <button onClick={() => handleDeleteActivity(day._id || day.id || '', activity._id || activity.id || '')}>
                    ❌ Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="transport-selection">
          <h3>Medios de transporte:</h3>
          <div className="transport-options">
            {transportOptions.map(option => (
              <label 
                key={option.id} 
                className={`transport-option ${selectedTransport.includes(option.id) ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  value={option.id}
                  checked={selectedTransport.includes(option.id)}
                  onChange={() => handleTransportChange(option.id)}
                />
                <span>{option.icon} {option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button onClick={handleSaveChanges} className="save-itinerary-button">💾 Guardar cambios</button>
      </div>
      <Footer />
    </>
  )
}

export default ItineraryEdit