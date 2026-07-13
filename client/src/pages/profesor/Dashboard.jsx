import { useEffect, useState } from 'react';
import { CalendarClock, DoorOpen, Timer, CalendarDays } from 'lucide-react';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import Table from '../../components/Table';
import { useAuth } from '../../context/AuthContext';
import { profesores } from '../../api';
import { formatHora } from '../../utils/format';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export default function ProfesorDashboard() {
    const { usuario } = useAuth();
    const [carga, setCarga] = useState(null);
    const [horario, setHorario] = useState([]);

    useEffect(() => {
        profesores.carga(usuario.id_perfil).then(setCarga);
        profesores.horario(usuario.id_perfil).then(setHorario);
    }, [usuario.id_perfil]);

    return (
        <Layout title="Dashboard">
            <div className="stat-grid">
                <StatCard label="Clases por semana" value={carga?.clases_semanales ?? '—'} icon={CalendarClock} tone="navy" />
                <StatCard label="Aulas a cargo" value={carga?.cantidad_aulas ?? '—'} icon={DoorOpen} tone="green" />
                <StatCard label="Horas semanales" value={carga?.horas_semanales ? Number(carga.horas_semanales).toFixed(1) : '—'} icon={Timer} tone="orange" />
            </div>

            <div className="card">
                <div className="card-header"><h3><CalendarDays size={17} /> Mi horario semanal</h3></div>
                <Table
                    columns={[
                        { key: 'dia_semana', label: 'Día' },
                        { key: 'hora_inicio', label: 'Inicio', render: (r) => formatHora(r.hora_inicio) },
                        { key: 'hora_fin', label: 'Fin', render: (r) => formatHora(r.hora_fin) },
                        { key: 'nombre_curso', label: 'Curso' },
                        { key: 'aula', label: 'Aula', render: (r) => `${r.nivel} ${r.numero_grado} ${r.seccion}` }
                    ]}
                    rows={[...horario].sort((a, b) => DIAS.indexOf(a.dia_semana) - DIAS.indexOf(b.dia_semana))}
                    emptyMessage="Todavía no tienes clases programadas."
                />
            </div>
        </Layout>
    );
}
