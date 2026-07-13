import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import Layout from '../../components/Layout';
import Table from '../../components/Table';
import { useAuth } from '../../context/AuthContext';
import { alumnos } from '../../api';
import { formatHora } from '../../utils/format';

export default function Horario() {
    const { usuario } = useAuth();
    const [horario, setHorario] = useState([]);
    const [anio] = useState(new Date().getFullYear());

    useEffect(() => {
        alumnos.horario(usuario.id_perfil, anio).then(setHorario);
    }, [usuario.id_perfil, anio]);

    return (
        <Layout title="Mi horario">
            <div className="card">
                <div className="card-header"><h3><CalendarDays size={17} /> Horario semanal {anio}</h3></div>
                <Table
                    columns={[
                        { key: 'dia_semana', label: 'Día' },
                        { key: 'hora_inicio', label: 'Inicio', render: (r) => formatHora(r.hora_inicio) },
                        { key: 'hora_fin', label: 'Fin', render: (r) => formatHora(r.hora_fin) },
                        { key: 'nombre_curso', label: 'Curso' },
                        {
                            key: 'profesor',
                            label: 'Profesor',
                            render: (r) => r.nombre_profesor ? `${r.nombre_profesor} ${r.apellido_profesor}` : 'Sin asignar'
                        }
                    ]}
                    rows={horario}
                    emptyMessage="Todavía no tienes clases programadas este año."
                />
            </div>
        </Layout>
    );
}
