import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Itinerary } from '../types/Itinerary'
import { ProfileUser } from '../types/User'

import { useAuth } from '../context/AuthContext'
import { getApiUrl } from '../config/api'

import axios from 'axios'
import ProfileHeader from '../components/ProfileHeader'

const API_URL = getApiUrl()

type Props = {}

const UserProfile = (props: Props) => {
    const { userName } = useParams<{ userName: string }>()
    const navigate = useNavigate()
    const { user: currentUser, isLoggedIn } = useAuth()

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
                userToDisplay = userResponse.data
            }

            setProfileUser(userToDisplay)
            // Comprobar si el usuario actual está siguiendo al usuario del perfil
            setIsFollowing(
                userToDisplay && currentUser?.following?.some((id: string) => id === userToDisplay._id) || false
            );

            // Obtener itinerarios del usuario
            const itinerariesResponse = await axios.get(`${API_URL}/itineraries/user/${userToDisplay?._id}`)
            setItineraries(itinerariesResponse.data)

            // Mostrar itinerarios públicos si no es el propio perfil
            if (!isOwnProfile) {
                const publicItineraries = itinerariesResponse.data.filter((itinerary: Itinerary) => itinerary.isPublic)
                setItineraries(publicItineraries)
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
            setError('Error fetching user data')
        }
    }

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login', { state: { from: window.location.pathname } })
            return;
        }
        fetchUserData();
        setIsLoading(false)
    }, [userName, isLoggedIn, currentUser, isOwnProfile, navigate])

    const handleFollowToggle = async () => {
        if (!profileUser || !currentUser) return;

        try {
            const endpoint = isFollowing
                ? `${API_URL}/auth/${profileUser._id}/unfollow`
                : `${API_URL}/auth/${profileUser._id}/follow`

            await axios.post(endpoint)

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

    if (isLoading) return <div>Cargando...</div>
    if (error) return <div>{error}</div>
    if (!profileUser) return <div>Usuario no encontrado</div>

    return (
        <>
            <ProfileHeader />
            
        </>
    )
}

export default UserProfile