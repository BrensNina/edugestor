import { useEffect, useState } from 'react';
import { DoorOpen, AlertTriangle, Users, AlertCircle, BarChart3 } from 'lucide-react';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import Table from '../../components/Table';
import { aulas, catalogos, reportes } from '../../api';

export default function SecretariaDashboard() {
    const [ocupacion, setOcupacion] = useState([]);
    const [resumenNivel, setResumenNivel] = useState([]);
    const [alumnosEnRiesgo, setAlumnosEnRiesgo] = useState(0);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        async function cargar() {
            const [ocupacionData, resumenData, periodosData] = await Promise.all([
                aulas.ocupacion(),
                reportes.resumenNivel(),
                catalogos.periodos()
            ]);
            setOcupacion(ocupacionData);
            setResumenNivel(resumenData);

            const periodoActivo = periodosData.find((p) => p.esta_activo);
            if (periodoActivo) {
                const riesgo = await reportes.riesgoNotas(periodoActivo.id_periodo);
                setAlumnosEnRiesgo(new Set(riesgo.map((r) => r.alumno)).size);
            }
            setCargando(false);
        }
        cargar();
    }, []);

    if (cargando) return <Layout title="Dashboard"><p className="empty-state">Cargando...</p></Layout>;

    const totalMatriculas = resumenNivel.reduce((acc, r) => acc + r.cantidad_matriculas, 0);
    const aulasLlenas = ocupacion.filter((a) => a.estado_aula === 'Llena').length;

    return (
        <Layout title="Dashboard">
            <div className="stat-grid">
                <StatCard label="Aulas activas" value={ocupacion.length} icon={DoorOpen} tone="navy" />
                <StatCard label="Aulas llenas" value={aulasLlenas} icon={AlertTriangle} tone="orange" />
                <StatCard label="Alumnos matriculados" value={totalMatriculas} icon={Users} tone="green" />
                <StatCard label="Alumnos en riesgo (periodo activo)" value={alumnosEnRiesgo} icon={AlertCircle} tone="red" />
            </div>

            <div className="card">
                <div className="card-header">
                    <h3><BarChart3 size={17} /> Matrículas por nivel</h3>
                </div>
                <Table
                    columns={[
                        { key: 'nivel', label: 'Nivel' },
                        { key: 'cantidad_matriculas', label: 'Matrículas' }
                    ]}
                    rows={resumenNivel}
                />
            </div>
        </Layout>
    );
}
