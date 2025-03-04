import { Link } from "react-router-dom";

import '../styles/Header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="header-container">
                {/* parte izquierda */}
                <nav className="nav-left">
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
                <nav className="nav-right">
                    <div className="nav-item">
                        <Link to="/">Ayuda</Link>
                    </div>
                    <div className="nav-item">
                        <Link to="/">Inicia</Link>
                    </div>
                    <div className="nav-item">
                        <Link to="/">Regístrate</Link>
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Header