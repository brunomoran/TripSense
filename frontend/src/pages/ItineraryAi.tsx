import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';
import { AiGeneratedItinerary, ItineraryDay, ItineraryActivity } from '../types/Itinerary';
import { POI } from '../types/ListItem';

import Header from '../components/Header';
import Footer from '../components/Footer';

import '../styles/ItineraryAi.css'; // Asegúrate de tener estilos adecuados para esta página

import axios from 'axios';

const API_URL = getApiUrl();

type Props = {}

const ItineraryAi = (props: Props) => {
    const { isLoggedIn, user } = useAuth()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        destination: '',
        startDate: '',
        endDate: '',
        transportModes: [] as string[],
        preferences: ''
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [result, setResult] = useState<AiGeneratedItinerary | null>(null);
    const [error, setError] = useState<string>('');

    const transportOptions = [
        { id: "walking", label: "A pie" },
        { id: "driving", label: "Coche" },
        { id: "transit", label: "Transporte público" },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTransportChange = (transportId: string) => {
        setFormData(prev => ({
            ...prev,
            transportModes: prev.transportModes.includes(transportId)
                ? prev.transportModes.filter(id => id !== transportId)
                : [...prev.transportModes, transportId]
        }));
    };

    const validateForm = () => {
        if (!formData.destination.trim()) {
            setError('El destino es obligatorio');
            return false;
        }
        if (!formData.startDate) {
            setError('La fecha de inicio es obligatoria');
            return false;
        }
        if (!formData.endDate) {
            setError('La fecha de fin es obligatoria');
            return false;
        }
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            setError('La fecha de inicio debe ser anterior a la fecha de fin');
            return false;
        }
        if (new Date(formData.startDate).getTime() < new Date(new Date().toISOString().split('T')[0]).getTime()) {
            setError('La fecha de inicio no puede ser en el pasado');
            return false;
        }
        if (formData.transportModes.length === 0) {
            setError('Debes seleccionar al menos un medio de transporte');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        setError('');

        if (!validateForm()) return;

        if (!isLoggedIn) {
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }

        setLoading(true);

        try {

            let poisToUse = []

            try {
                const poisResponse = await axios.post(`${API_URL}/map/places`, {
                    city: formData.destination
                })

                if (poisResponse.data && poisResponse.data.pois) {
                    poisToUse = poisResponse.data.pois;
                    console.log(`Se encontraron ${poisToUse.length} puntos de interés en ${formData.destination}`);
                }
            } catch (poisError) {
                console.error('Error al obtener puntos de interés:', poisError);
                setError('No se pudieron obtener puntos de interés para el destino. Intente de nuevo más tarde.');
                return;
            }

            const response = await axios.post(`${API_URL}/ai/generate-itinerary`, {
                destination: formData.destination,
                startDate: formData.startDate,
                endDate: formData.endDate,
                transportModes: formData.transportModes,
                preferences: formData.preferences,
                availablePois: poisToUse
            });

            // Extraer el contenido JSON de la respuesta de Gemini
            const textContent = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (textContent) {
                try {
                    const parsedContent = JSON.parse(textContent);

                    if (parsedContent && parsedContent.days) {
                        // Si tenemos POIs reales, podríamos mejorar el itinerario generado
                        if (poisToUse.length > 0) {
                            // Intentar enriquecer el itinerario con información más precisa de los POIs
                            parsedContent.days.forEach((day: ItineraryDay) => {
                                day.activities.forEach((activity: ItineraryActivity )=> {
                                    // Buscar si existe un POI similar en nuestra lista
                                    const matchingPoi = poisToUse.find((poi: POI) =>
                                        poi.name.toLowerCase().includes(activity.poi.name.toLowerCase()) ||
                                        activity.poi.name.toLowerCase().includes(poi.name.toLowerCase())
                                    );

                                    // Si encontramos uno similar, usamos sus datos reales
                                    if (matchingPoi) {
                                        activity.poi = {
                                            ...activity.poi,
                                            id: matchingPoi.id,
                                            location: matchingPoi.location,
                                            category: matchingPoi.category,
                                            description: matchingPoi.description || activity.poi.description,
                                            imageUrl: matchingPoi.imageUrl || activity.poi.imageUrl
                                        };
                                    }
                                });
                            });
                        }

                        setResult(parsedContent as AiGeneratedItinerary);
                        console.log('Itinerario generado:', parsedContent);
                    } else {
                        setError('La respuesta no contiene un itinerario válido');
                    }
                } catch (parseError) {
                    console.error('Error al parsear la respuesta JSON:', parseError);
                    setError('Error al procesar la respuesta de la IA');
                }
            } else {
                console.error('Respuesta de AI en formato inesperado:', response.data);
                setError('El formato de la respuesta no es válido. Intente de nuevo.');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error generando el itinerario');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveItinerary = async () => {
        if (!result || !isLoggedIn) return;

        try {
            // Verificamos que result.days esté presente y tenga al menos un día
            if (!result.days || result.days.length === 0) {
                throw new Error('El itinerario generado no contiene días');
            }

            // Aseguramos que cada día y actividad tenga IDs válidos y la estructura correcta
            const formattedDays = result.days.map(day => ({
                id: day.id || `day_${Math.random().toString(36).substring(2, 9)}`,
                date: day.date,
                activities: day.activities?.map(activity => ({
                    id: activity.id || `act_${Math.random().toString(36).substring(2, 9)}`,
                    poi: {
                        id: activity.poi.id || Math.floor(Math.random() * 10000),
                        name: activity.poi.name,
                        description: activity.poi.description || "",
                        location: {
                            lat: activity.poi.location.lat || 0,
                            lng: activity.poi.location.lng || 0
                        },
                        category: activity.poi.category || "Punto de interés",
                        imageUrl: activity.poi.imageUrl || ""
                    },
                    startTime: activity.startTime,
                    endTime: activity.endTime,
                    notes: activity.notes || ""
                })) || []
            }));

            // Enviar la solicitud al backend para guardar el itinerario
            const response = await axios.post(`${API_URL}/itineraries`, {
                name: `Viaje a ${formData.destination}`,
                description: `Itinerario generado con IA para ${formData.destination}`,
                destination: formData.destination,
                startDate: formData.startDate,
                endDate: formData.endDate,
                userId: user?.id,
                days: formattedDays,
                isPublic: false,
                transportModes: formData.transportModes
            });

            if (response.status === 201) {
                alert('¡Itinerario guardado con éxito!');
                navigate(`/itinerary/${response.data._id}`);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message;
            console.error('Error detallado:', err);
            alert('Error guardando el itinerario: ' + errorMessage);
        }
    };

    const getDurationText = () => {
        if (!formData.startDate || !formData.endDate) return '';

        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        return `${diffDays} día${diffDays > 1 ? 's' : ''}`;
    };

    return (
        <>
            <Header />
            <div className="itinerary-ai-container">
                <div className="ai-header">
                    <h1>Generador de Itinerarios con IA</h1>
                    <p>Crea el viaje perfecto con nuestra inteligencia artificial</p>
                </div>

                <div className="ai-form">
                    {/* Destino */}
                    <div className="form-group">
                        <label>
                            <i className="icon-map"></i>
                            Destino
                        </label>
                        <input
                            type="text"
                            name="destination"
                            value={formData.destination}
                            onChange={handleInputChange}
                            placeholder="Ej: Madrid, Barcelona, París..."
                            required
                        />
                    </div>

                    {/* Fechas */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <i className="icon-calendar"></i>
                                Fecha de inicio
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                <i className="icon-calendar"></i>
                                Fecha de fin
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                min={formData.startDate || new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>
                    </div>

                    {/* Duración */}
                    {getDurationText() && (
                        <div className="duration-info">
                            <p>
                                <i className="icon-clock"></i>
                                Duración del viaje: {getDurationText()}
                            </p>
                        </div>
                    )}

                    {/* Medios de transporte */}
                    <div className="form-group">
                        <label>Medios de transporte disponibles</label>
                        <div className="transport-options">
                            {transportOptions.map(option => {
                                const isSelected = formData.transportModes.includes(option.id);

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
                                        <span>{option.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Información adicional */}
                    <div className="form-group">
                        <label>
                            <i className="icon-plus"></i>
                            Preferencias (opcional)
                        </label>
                        <textarea
                            name="preferences"
                            value={formData.preferences}
                            onChange={handleInputChange}
                            placeholder="Ej: Interesado en museos, comida local, vida nocturna, viaje familiar..."
                            rows={4}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {/* Botón de envío */}
                    <button
                        onClick={handleSubmit}
                        className="generate-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                Generando itinerario...
                            </>
                        ) : (
                            'Generar itinerario'
                        )}
                    </button>
                </div>

                {/* Resultado */}
                {result && (
                    <div className="result-container">
                        <div className="result-header">
                            <h2>¡Itinerario generado!</h2>
                            <button
                                onClick={saveItinerary}
                                className="save-button"
                            >
                                💾 Guardar itinerario
                            </button>
                        </div>

                        <div className="result-summary">
                            <h3>Resumen:</h3>
                            <p><strong>Destino:</strong> {formData.destination}</p>
                            <p><strong>Duración:</strong> {getDurationText()}</p>
                            <p><strong>Días planificados:</strong> {result.days?.length || 0}</p>

                            <div className="itinerary-preview">
                                {result.days?.map((day: any, index: number) => (
                                    <div key={day.id || index} className="day-preview">
                                        <h4>Día {index + 1}: {day.date}</h4>
                                        <ul>
                                            {day.activities?.map((activity: any, actIndex: number) => (
                                                <li key={activity.id || actIndex}>
                                                    <strong>{activity.poi.name}</strong>
                                                    <span>{activity.startTime} - {activity.endTime}</span>
                                                    <p>{activity.poi.description}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default ItineraryAi