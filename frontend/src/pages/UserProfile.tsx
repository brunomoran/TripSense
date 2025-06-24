import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Itinerary } from '../types/Itinerary'
import { ListItem } from '../types/ListItem'
import { ProfileUser } from '../types/User'

import { useAuth } from '../context/AuthContext'
import { getApiUrl } from '../config/api'

import axios from 'axios'
import ProfileHeader from '../components/ProfileHeader'
import FollowButton from '../components/FollowButton'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ListItems from '../components/ListItems'

const API_URL = getApiUrl()

type Props = {}

const UserProfile = (props: Props) => {
    const { userName } = useParams<{ userName: string }>()
    const navigate = useNavigate()
    const { user: currentUser, isLoggedIn, logout } = useAuth()

    const [profileUser, setProfileUser] = useState<ProfileUser | null>(null)
    const [itineraries, setItineraries] = useState<Itinerary[]>([])
    const [isFollowing, setIsFollowing] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const isOwnProfile = userName === currentUser?.userName

    const fetchUserData = async () => {
        setIsLoading(true)
        try {
            let userToDisplay: ProfileUser | null = null
            if (isOwnProfile) {
                const meResponse = await axios.get(`${API_URL}/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                })
                userToDisplay = meResponse.data
            } else {
                const userResponse = await axios.get(`${API_URL}/auth/user/${userName}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                userToDisplay = userResponse.data.user
                console.log(userResponse.data);
                
                setIsFollowing(userResponse.data.isFollowing)
            }

            if (!userToDisplay) {
                throw new Error('Usuario no encontrado');
            }

            setProfileUser(userToDisplay)

            // Obtener itinerarios del usuario
            const itinerariesResponse = await axios.get(`${API_URL}/itineraries/user/${userToDisplay?._id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            setItineraries(itinerariesResponse.data)

            // Mostrar itinerarios públicos si no es el propio perfil
            if (!isOwnProfile) {
                const publicItineraries = itinerariesResponse.data.filter((itinerary: Itinerary) => itinerary.isPublic)
                setItineraries(publicItineraries)
            }
        } catch (error: any) {
            console.error('Error fetching user data:', error);
            setError(error.response?.data?.message || 'Error obteniendo datos del usuario');

            // Si hay un error de autenticación, redirigir al login
            if (error.response?.status === 401) {
                navigate('/login', { state: { from: window.location.pathname } });
            }
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUserData();
    }, [userName, isLoggedIn, currentUser])

    const handleFollowToggle = async () => {
        if (!profileUser || !currentUser) return;

        try {
            const endpoint = isFollowing
                ? `${API_URL}/auth/users/${profileUser._id}/unfollow`
                : `${API_URL}/auth/users/${profileUser._id}/follow`

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            await axios.post(endpoint, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setIsFollowing(!isFollowing)

            // Actualizar el contador de seguidores
            setProfileUser(prev => {
                if (!prev) return null;

                const followers = [...prev.followers];
                if (isFollowing) {
                    // Si estábamos siguiendo, ahora dejamos de seguir
                    const index = followers.indexOf(currentUser._id);
                    if (index > -1) followers.splice(index, 1);
                } else {
                    // Si no estábamos siguiendo, ahora seguimos
                    followers.push(currentUser._id);
                }

                return {
                    ...prev,
                    followers
                };
            });
        } catch (error) {
            console.error('Error toggling follow:', error)
            setError('Error toggling follow')
        }
    }

    const handleLogout = () => {
        // Mostrar confirmación antes de cerrar sesión
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            logout();
            navigate('/');
        }
    }

    if (isLoading) {
        return (
            <>
                <Header />
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando perfil de usuario...</p>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="error-container">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/')}>Volver al inicio</button>
                </div>
                <Footer />
            </>
        );
    }

    if (!profileUser) {
        return (
            <>
                <Header />
                <div className="error-container">
                    <h2>Usuario no encontrado</h2>
                    <button onClick={() => navigate('/')}>Volver al inicio</button>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <ProfileHeader
                profileUser={profileUser}
                itinerariesLength={itineraries.length}
            />
            {!isOwnProfile && (
                <FollowButton
                    isFollowing={isFollowing}
                    handleFollow={handleFollowToggle}
                />
            )}
            {isOwnProfile && (
                <div className="profile-actions">
                    <button onClick={() => navigate('/travel_preparation')}>Crear Itinerario</button>
                    <button onClick={handleLogout}>Cerrar Sesión</button>
                </div>
            )}
            <div className="user-itineraries">
                <h2>Itinerarios de {profileUser.userName}</h2>
                {itineraries.length > 0 ? (
                    <div className="user-itineraries">
                        <h2>{isOwnProfile ? 'Tus itinerarios' : 'Itinerarios públicos'}</h2>
                        <ListItems<ListItem>
                            items={itineraries.map(itinerary => ({
                                id: itinerary._id,  // Mapear _id a id
                                name: itinerary.name,
                                description: `${itinerary.destination} | ${itinerary.startDate} - ${itinerary.endDate}`,
                                category: itinerary.isPublic ? 'Público' : 'Privado',
                                imageUrl: '',
                                originalItem: itinerary  // Guardar el objeto original para referencia
                            }))}
                            onItemClick={(item) => navigate(`/itinerary/${item.originalItem._id}`)}
                            title=""
                            className="itinerary-list"
                        />
                    </div>
                ) : (
                    <p>{isOwnProfile ? 'No has creado itinerarios aún.' : 'Este usuario no tiene itinerarios públicos.'}</p>
                )}
            </div>
            <Footer />
        </>
    )
}

export default UserProfile