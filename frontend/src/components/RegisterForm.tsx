import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"

import "../styles/Register.css"

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    setError("")

    // Validar la contraseña
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    // Llamada a la API backend para registrar el usuario
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
      })
      console.log("Registro exitoso:", response.data)
      // Guardar el token en localStorage para mantener la sesión
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))

      // Redirigir al usuario a la página de inicio
      navigate("/")
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Error al registrar el usuario"
      )
      console.error("Error al registrar el usuario:", error)
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>Crea una cuenta</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input type="text" name="userName" placeholder="Nombre de usuario" value={formData.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Correo electrónico" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Repita contraseña" value={formData.confirmPassword} onChange={handleChange} required />
          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>

        </form>
        <hr />

        <p className="login-section">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="login-link">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterForm