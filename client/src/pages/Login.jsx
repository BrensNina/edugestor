import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const RUTA_POR_ROL = {
    Secretaria: '/secretaria',
    Profesor: '/profesor',
    Alumno: '/alumno'
};

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [correo, setCorreo] = useState('');
    const [contrasenia, setContrasenia] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setCargando(true);
        try {
            const usuario = await login(correo, contrasenia);
            navigate(RUTA_POR_ROL[usuario.rol] || '/');
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo iniciar sesión.');
        } finally {
            setCargando(false);
        }
    }

    return (
        <div className="login-shell">
            <form className="login-card" onSubmit={handleSubmit}>
                <div className="login-logo">
                    <img src={logo} alt="EduGestor" />
                    <span>Sistema de gestión para colegios</span>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <div className="field">
                    <label htmlFor="correo">Correo electrónico</label>
                    <div className="input-icon-wrap">
                        <Mail size={16} className="input-icon" />
                        <input
                            id="correo"
                            type="email"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="field">
                    <label htmlFor="contrasenia">Contraseña</label>
                    <div className="input-icon-wrap">
                        <Lock size={16} className="input-icon" />
                        <input
                            id="contrasenia"
                            type="password"
                            value={contrasenia}
                            onChange={(e) => setContrasenia(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <button type="submit" className="btn" disabled={cargando}>
                    <LogIn size={15} /> {cargando ? 'Ingresando...' : 'Ingresar'}
                </button>
            </form>
        </div>
    );
}
