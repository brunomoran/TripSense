import { Link } from "react-router-dom";
import "../styles/Footer.css";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h3>TripSense</h3>
                    <p>La mejor guía para explorar a tu alrededor y descubrir nuevas experiencias</p>
                </div>

                <div className="footer-section">
                    <h3>Enlaces rápidos</h3>
                    <ul>
                        <li><Link to="/">Inicio</Link></li>
                        <li><Link to="/about">Sobre nosotros</Link></li>
                        <li><Link to="/chat">Chatea con LucAI</Link></li>
                        <li><Link to="/community">Comunidad</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Recursos</h3>
                    <ul>
                        <li><Link to="/blog">Blog</Link></li>
                        <li><Link to="/faq">Preguntas frecuentes</Link></li>
                        <li><Link to="/guides">Guías de viaje</Link></li>
                        <li><Link to="/contact">Contáctanos</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Legal</h3>
                    <ul>
                        <li><Link to="/terms">Términos y condiciones</Link></li>
                        <li><Link to="/privacy">Política de privacidad</Link></li>
                        <li><Link to="/cookies">Política de cookies</Link></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {currentYear} TripSense. Todos los derechos reservados.</p>
            </div>
        </footer>
    )
}

export default Footer