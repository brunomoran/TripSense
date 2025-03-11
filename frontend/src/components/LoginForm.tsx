import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import "../styles/LoginForm.css"
import axios from "axios"

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        // Llamada a la API backend para iniciar sesión
        try {
            const response = await axios.post("http://localhost:5000/api/auth/login", {
                email,
                password,
            });

            // Guardar el token en localStorage para mantener la sesión
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            // Redirigir al usuario a la página de inicio
            navigate("/")
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Error al iniciar sesión: Credenciales incorrectas")
            console.error("Error al iniciar sesión:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <h2 className="login-title">Iniciar sesión</h2>

                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleSubmit} className="login-form">
                    <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                    </button>
                </form>

                <hr />

                <p className="register-section">
                    ¿No tienes cuenta?{" "}
                    <Link to="/register" className="register-link">
                        Regístrate
                    </Link>
                </p>

            </div>
        </div>
    )
}

export default LoginForm