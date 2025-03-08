import "../styles/Hero.css"
import heroImage from "../assets/gettyimages-1405609669-612x612.jpg"

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-container">
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
        </section>
    )
}

export default Hero