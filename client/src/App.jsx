import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import SecretariaDashboard from './pages/secretaria/Dashboard';
import Matriculas from './pages/secretaria/Matriculas';
import Aulas from './pages/secretaria/Aulas';
import Personas from './pages/secretaria/Personas';
import Periodos from './pages/secretaria/Periodos';
import Reportes from './pages/secretaria/Reportes';
import ProfesorDashboard from './pages/profesor/Dashboard';
import Notas from './pages/profesor/Notas';
import ProfesorAsistencia from './pages/profesor/Asistencia';
import AlumnoHorario from './pages/alumno/Horario';
import Boleta from './pages/alumno/Boleta';
import AlumnoAsistencia from './pages/alumno/Asistencia';

const RUTA_POR_ROL = {
    Secretaria: '/secretaria',
    Profesor: '/profesor',
    Alumno: '/alumno'
};

function RequireRole({ rol, children }) {
    const { usuario } = useAuth();

    if (!usuario) return <Navigate to="/login" replace />;
    if (usuario.rol !== rol) return <Navigate to={RUTA_POR_ROL[usuario.rol]} replace />;

    return children;
}

function Raiz() {
    const { usuario } = useAuth();
    return <Navigate to={usuario ? RUTA_POR_ROL[usuario.rol] : '/login'} replace />;
}

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/secretaria" element={<RequireRole rol="Secretaria"><SecretariaDashboard /></RequireRole>} />
                <Route path="/secretaria/matricula" element={<RequireRole rol="Secretaria"><Matriculas /></RequireRole>} />
                <Route path="/secretaria/aulas" element={<RequireRole rol="Secretaria"><Aulas /></RequireRole>} />
                <Route path="/secretaria/personas" element={<RequireRole rol="Secretaria"><Personas /></RequireRole>} />
                <Route path="/secretaria/periodos" element={<RequireRole rol="Secretaria"><Periodos /></RequireRole>} />
                <Route path="/secretaria/reportes" element={<RequireRole rol="Secretaria"><Reportes /></RequireRole>} />

                <Route path="/profesor" element={<RequireRole rol="Profesor"><ProfesorDashboard /></RequireRole>} />
                <Route path="/profesor/notas" element={<RequireRole rol="Profesor"><Notas /></RequireRole>} />
                <Route path="/profesor/asistencia" element={<RequireRole rol="Profesor"><ProfesorAsistencia /></RequireRole>} />

                <Route path="/alumno" element={<RequireRole rol="Alumno"><AlumnoHorario /></RequireRole>} />
                <Route path="/alumno/boleta" element={<RequireRole rol="Alumno"><Boleta /></RequireRole>} />
                <Route path="/alumno/asistencia" element={<RequireRole rol="Alumno"><AlumnoAsistencia /></RequireRole>} />

                <Route path="/" element={<Raiz />} />
            </Routes>
        </AuthProvider>
    );
}
