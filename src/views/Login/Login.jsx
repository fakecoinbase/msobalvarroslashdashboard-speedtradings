import React, { useState } from "react"
import Validator from "validator"
import { Link } from 'react-router-dom'

// import Assets
import "./Login.scss"
import Logo from "../../static/images/logo.png"
import ActivityIndicator from "../../components/ActivityIndicator/Activityindicator"
import Axios from "axios"
import { urlServer } from "../../utils/constanst"
import Swal from "sweetalert2"

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Error state
  const [errEmail, setErrEmail] = useState(false)
  const [errPassword, setErrPassword] = useState(false)

  // Loading state
  const [loading, setLoading] = useState(false)

  const submitLogin = () => {
    // Validamos el correo electronico
    if (Validator.isEmail(email)) {
      // Si el correo es correcto
      setErrEmail(false)

      // Validamos el password
      if (password.length === 0) {
        setErrPassword(true)
      } else {
        // Si todo esta correcto

        ComprobateLogin()
      }
    } else {
      setErrEmail(true)
    }
  }

  /**Create a petition request for get information login */
  const ComprobateLogin = async () => {
    setLoading(true)

    const data = {
      email,
      password
    }

    try {
      await Axios.post(`${urlServer}/login`, data)
        .then(response => {
          console.log(response)
          if (response.data.error) {
            Swal.fire('Error al auntenticar', response.data.message, 'warning')
          } else {
            console.log(response.data)
          }
        })

    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-login">
      <div className="form-control">
        <img className="img-logo" src={Logo} alt="logo" />

        <h2>Inicio de Sesion - Dashboard</h2>

        <div className="row">
          {
            errEmail
              ? <span className="error">Email no es Correcto</span>
              : <span>Correo Electronico</span>
          }
          <input onChange={e => setEmail(e.target.value)} autoFocus value={email} type="text" className="text-input" />
        </div>

        <div className="row">
          {
            errPassword
              ? <span className="error">Contraseña es requerida</span>
              : <span>Contraseña</span>
          }
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="text-input" />

          <a className="password-forgot link">¿Olvido su contraseña?</a>
        </div>

        <div className="row">
          <button className="button" disabled={loading} onClick={submitLogin}>
            {
              loading
                ? <><ActivityIndicator size={20} /> Cargando..</>
                : 'Login'
            }
          </button>
        </div>

        <div className="row">
          <Link className="link register" to="/register">Registarse</Link>
        </div>
      </div>
    </div>
  )
}

export default Login