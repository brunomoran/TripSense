import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import TravelPrep from './pages/TravelPrep'
import Itinerary from './pages/Itinerary'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/travel_preparation" element={<TravelPrep />} />
        <Route path='/itinerary' element={<Itinerary />} />
      </Routes>
    </Router>
  )
}

export default App
