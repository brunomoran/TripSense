import { useState } from "react";
import { Link } from "react-router-dom";

import '../styles/Header.css';

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);

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
                        <Link to="/">Prepara tu viaje</Link>
                    </div>
                    <div className="nav-item">
                        <Link to="/">Chatea con LucAi</Link>
                    </div>
                    <div className="nav-item">
                        <Link to="/">Comunidad</Link>
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
                    <div className="nav-item">
                        <Link to="/login">Inicia sesión</Link>
                    </div>
                    <div className="nav-item">
                        <Link to="/register">Regístrate</Link>
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Header