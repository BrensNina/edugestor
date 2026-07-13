import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, UserPlus, DoorOpen, Users, CalendarRange, BarChart3,
    ClipboardList, CalendarCheck, CalendarDays, FileText, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const NAV_POR_ROL = {
    Secretaria: [
        { to: '/secretaria', label: 'Dashboard', end: true, icon: LayoutDashboard },
        { to: '/secretaria/matricula', label: 'Matrícula', icon: UserPlus },
        { to: '/secretaria/aulas', label: 'Aulas', icon: DoorOpen },
        { to: '/secretaria/personas', label: 'Personas', icon: Users },
        { to: '/secretaria/periodos', label: 'Periodos', icon: CalendarRange },
        { to: '/secretaria/reportes', label: 'Reportes', icon: BarChart3 }
    ],
    Profesor: [
        { to: '/profesor', label: 'Dashboard', end: true, icon: LayoutDashboard },
        { to: '/profesor/notas', label: 'Notas', icon: ClipboardList },
        { to: '/profesor/asistencia', label: 'Asistencia', icon: CalendarCheck }
    ],
    Alumno: [
        { to: '/alumno', label: 'Mi horario', end: true, icon: CalendarDays },
        { to: '/alumno/boleta', label: 'Mi boleta', icon: FileText },
        { to: '/alumno/asistencia', label: 'Mi asistencia', icon: CalendarCheck }
    ]
};

export default function Layout({ title, children }) {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const links = NAV_POR_ROL[usuario.rol] || [];
    const paginaActiva = links.find((link) => (link.end ? location.pathname === link.to : location.pathname.startsWith(link.to)));

    function handleLogout() {
        logout();
        navigate('/login');
    }

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <img src={logo} alt="EduGestor" />
                    <span>EduGestor</span>
                </div>
                <nav className="sidebar-nav">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                        >
                            <link.icon size={17} strokeWidth={2} />
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <strong>{usuario.nombre} {usuario.apellido}</strong>
                        <span>{usuario.rol}</span>
                    </div>
                    <button type="button" className="btn btn-outline" onClick={handleLogout} style={{ width: '100%' }}>
                        <LogOut size={15} strokeWidth={2} />
                        Cerrar sesión
                    </button>
                </div>
            </aside>
            <div className="main-area">
                <header className="topbar">
                    <h2>
                        {paginaActiva && (
                            <span className="topbar-icon">
                                <paginaActiva.icon size={18} strokeWidth={2} />
                            </span>
                        )}
                        {title}
                    </h2>
                </header>
                <main className="page">{children}</main>
            </div>
        </div>
    );
}
