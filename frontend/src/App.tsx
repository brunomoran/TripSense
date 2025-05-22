import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import TravelPrep from './pages/TravelPrep'
import MyItineraries from './pages/MyItineraries'
import ItineraryDetail from './pages/ItineraryDetail'
import ItineraryEdit from './pages/ItineraryEdit'
import UserProfile from './pages/UserProfile'
import CommunityFeed from './pages/CommunityFeed'
import { AuthProvider } from './context/AuthContext'

function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/travel_preparation" element={<TravelPrep />} />
          <Route path="/my_itineraries" element={<MyItineraries />} />
          <Route path="/itinerary/:id" element={<ItineraryDetail />} />
          <Route path="/itinerary/:id/edit" element={<ItineraryEdit />} />
          <Route path="/user/:userName" element={<UserProfile />} />
          <Route path="/community" element={<CommunityFeed />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
