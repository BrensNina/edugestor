import { useEffect, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import Layout from '../../components/Layout';
import Table from '../../components/Table';
import { useAuth } from '../../context/AuthContext';
import { asistencias } from '../../api';

export default function Asistencia() {
    const { usuario } = useAuth();
    const [historial, setHistorial] = useState([]);

    useEffect(() => {
        asistencias.historialAlumno(usuario.id_perfil).then(setHistorial);
    }, [usuario.id_perfil]);

    return (
        <Layout title="Mi asistencia">
            <div className="card">
                <div className="card-header"><h3><CalendarCheck size={17} /> Asistencia por curso</h3></div>
                <Table
                    columns={[
                        { key: 'nombre_curso', label: 'Curso' },
                        { key: 'total_sesiones', label: 'Sesiones' },
                        { key: 'sesiones_asistidas', label: 'Asistidas' },
                        { key: 'ausencias', label: 'Ausencias' },
                        { key: 'justificados', label: 'Justificadas' },
                        {
                            key: 'porcentaje_asistencia',
                            label: '% Asistencia',
                            render: (r) => `${Number(r.porcentaje_asistencia).toFixed(1)}%`
                        }
                    ]}
                    rows={historial}
                    emptyMessage="Todavía no tienes registros de asistencia."
                />
            </div>
        </Layout>
    );
}
