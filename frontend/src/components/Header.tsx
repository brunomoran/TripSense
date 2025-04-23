import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import '../styles/Header.css';

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { isLoggedIn, user, logout } = useAuth();

    return (
        <header className="header">
            <div className="header-container">
                {/*Botón de menú hamburguesa*/}
                <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                    ☰
                </button>

                {/* parte izquierda */}
                <nav className={`nav-left ${menuOpen ? 'open' : ''}`}>
                    <div className="nav-item">
                        <Link to="/travel_preparation">Prepara tu viaje</Link>
                    </div>
                    <div className="nav-item">
                        <Link to="/">Planifica con nuestra IA</Link>
                    </div>
                    <div className="nav-item">
                        <Link to="/">Comunidad</Link>
                    </div>
                    <div className="nav-item">
                        <Link to="/my_itineraries">Mis Itinerarios</Link>
                    </div>
                </nav>

                {/* parte central */}
                <div className="header-logo">
                    <Link to="/">TripSense</Link>
                </div>

                {/* parte derecha */}
                <nav className={`nav-right ${menuOpen ? 'open' : ''}`}>
                    <div className="nav-item">
                        <Link to="/">Ayuda</Link>
                    </div>
                    {isLoggedIn ? (
                            <div className="nav-item">
                                <Link to="/profile">Perfil</Link>
                            </div>
                    ) : (
                        <>
                            <div className="nav-item">
                                <Link to="/login">Inicia sesión</Link>
                            </div>
                            <div className="nav-item">
                                <Link to="/register">Regístrate</Link>
                            </div>
                        </>
                    )}
                </nav>
            </div>
        </header>
    )
}

export default Header