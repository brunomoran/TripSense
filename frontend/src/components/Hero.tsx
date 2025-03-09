import "../styles/Hero.css"
import heroImage from "../assets/gettyimages-1405609669-612x612.jpg"
import mapsvg from "../assets/8726007_map_marker_icon.svg"
import clocksvg from "../assets/8725620_clock_icon.svg"
import robotsvg from "../assets/8726291_robot_icon.svg"

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-top-container">
                {/*Texto del hero*/}
                <div className="hero-text">
                    <h1>La mejor guía para explorar a tu alrededor</h1>
                    <p>
                        Indica tu ubicación y el tiempo disponible, y deja que la
                        inteligencia artifical te sufiera los mejores lugares y
                        actividades a tu alrededor.
                    </p>
                    <div className="hero-buttons">
                        <button className="btn-primary">Empecemos</button>
                        <button className="btn-secondary">Saber más</button>
                    </div>
                </div>

                {/*Imagen del hero*/}
                <div className="hero-image">
                    <img
                        src={heroImage}
                        alt="Hero"
                    />
                </div>
            </div>

            <div className="hero-bottom-section">
                <div className="features-container">
                    <div className="feature">
                        <div className="feature-icon"><img src={mapsvg} alt="map icon" width={36} /></div>
                        <h3>Descubre tu entorno</h3>
                        <p>Encuentra lugares increíbles cerca de ti o descubre tu próximo destino</p>
                    </div>

                    <div className="feature">
                        <div className="feature-icon"><img src={clocksvg} alt="clock icon" width={36} /></div>
                        <h3>Optimiza tu tiempo</h3>
                        <p>Planea actividades según el tiempo que tengas disponible</p>
                    </div>

                    <div className="feature">
                        <div className="feature-icon"><img src={robotsvg} alt="ai icon" width={36} /></div>
                        <h3>Recomendaciones personalizadas</h3>
                        <p>Nuestra GuIA de viaje aprende tus preferencias para mejores sugerencias</p>
                    </div>
                </div>

                <div className="quick-start">
                    <h2>¿Cómo funciona?</h2>
                    <div className="steps">
                        <div className="step">
                            <span className="step-number">1</span>
                            <p>Indica tu ubicación o tu próximo destino</p>
                        </div>

                        <div className="step">
                            <span className="step-number">2</span>
                            <p>Indica el tiempo que tienes disponible</p>
                        </div>

                        <div className="step">
                            <span className="step-number">3</span>
                            <p>Recibe sugerencias personalizadas</p>
                        </div>

                        <div className="step">
                            <span className="step-number">4</span>
                            <p>Compártelo con la comunidad</p>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    )
}

export default Hero