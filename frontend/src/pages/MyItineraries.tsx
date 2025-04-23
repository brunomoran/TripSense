import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import Header from "../components/Header"
import Footer from "../components/Footer"

import { Itinerary } from "../types/Itinerary"

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

    return (
    <div>MyItineraries</div>
  )
}

export default MyItineraries