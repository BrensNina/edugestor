import { useEffect, useState } from 'react';
import { AlertCircle, CalendarX, BarChart3, Briefcase } from 'lucide-react';
import Layout from '../../components/Layout';
import Table from '../../components/Table';
import { catalogos, reportes } from '../../api';

export default function Reportes() {
    const [tab, setTab] = useState('riesgo-notas');
    const [periodos, setPeriodos] = useState([]);
    const [idPeriodo, setIdPeriodo] = useState('');
    const [minimoFaltas, setMinimoFaltas] = useState(3);
    const [riesgoNotas, setRiesgoNotas] = useState([]);
    const [riesgoInasistencia, setRiesgoInasistencia] = useState([]);
    const [resumenNivel, setResumenNivel] = useState([]);
    const [cargaDocente, setCargaDocente] = useState([]);

    useEffect(() => {
        catalogos.periodos().then((lista) => {
            setPeriodos(lista);
            const activo = lista.find((p) => p.esta_activo) || lista[0];
            if (activo) setIdPeriodo(activo.id_periodo);
        });
        reportes.resumenNivel().then(setResumenNivel);
        reportes.cargaDocente().then(setCargaDocente);
    }, []);

    useEffect(() => {
        if (!idPeriodo) return;
        reportes.riesgoNotas(idPeriodo).then(setRiesgoNotas);
        reportes.riesgoInasistencia(idPeriodo, minimoFaltas).then(setRiesgoInasistencia);
    }, [idPeriodo, minimoFaltas]);

    return (
        <Layout title="Reportes">
            <div className="tabs">
                <button type="button" className={`tab${tab === 'riesgo-notas' ? ' active' : ''}`} onClick={() => setTab('riesgo-notas')}><AlertCircle size={15} /> Riesgo por notas</button>
                <button type="button" className={`tab${tab === 'riesgo-inasistencia' ? ' active' : ''}`} onClick={() => setTab('riesgo-inasistencia')}><CalendarX size={15} /> Riesgo por inasistencia</button>
                <button type="button" className={`tab${tab === 'resumen-nivel' ? ' active' : ''}`} onClick={() => setTab('resumen-nivel')}><BarChart3 size={15} /> Resumen por nivel</button>
                <button type="button" className={`tab${tab === 'carga-docente' ? ' active' : ''}`} onClick={() => setTab('carga-docente')}><Briefcase size={15} /> Carga docente</button>
            </div>

            {(tab === 'riesgo-notas' || tab === 'riesgo-inasistencia') && (
                <div className="card">
                    <div className="card-header">
                        <h3>
                            {tab === 'riesgo-notas' ? <AlertCircle size={17} /> : <CalendarX size={17} />}
                            {tab === 'riesgo-notas' ? 'Alumnos con promedio menor a 11' : 'Alumnos con faltas consecutivas'}
                        </h3>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <select value={idPeriodo} onChange={(e) => setIdPeriodo(Number(e.target.value))}>
                                {periodos.map((p) => (
                                    <option key={p.id_periodo} value={p.id_periodo}>{p.nombre} {p.anio_academico}</option>
                                ))}
                            </select>
                            {tab === 'riesgo-inasistencia' && (
                                <input
                                    type="number"
                                    min={1}
                                    style={{ width: 70, padding: '9px 10px', border: '1px solid var(--color-border)', borderRadius: 8 }}
                                    value={minimoFaltas}
                                    onChange={(e) => setMinimoFaltas(Number(e.target.value))}
                                    title="Mínimo de faltas consecutivas"
                                />
                            )}
                        </div>
                    </div>
                    {tab === 'riesgo-notas' ? (
                        <Table
                            columns={[
                                { key: 'alumno', label: 'Alumno' },
                                { key: 'curso', label: 'Curso' },
                                { key: 'promedio', label: 'Promedio' }
                            ]}
                            rows={riesgoNotas}
                            emptyMessage="Ningún alumno está en riesgo por notas en este periodo."
                        />
                    ) : (
                        <Table
                            columns={[
                                { key: 'alumno', label: 'Alumno' },
                                { key: 'curso', label: 'Curso' },
                                { key: 'faltas_consecutivas', label: 'Faltas seguidas' }
                            ]}
                            rows={riesgoInasistencia}
                            emptyMessage="Ningún alumno alcanzó el mínimo de faltas consecutivas."
                        />
                    )}
                </div>
            )}

            {tab === 'resumen-nivel' && (
                <div className="card">
                    <div className="card-header"><h3><BarChart3 size={17} /> Matrículas por nivel</h3></div>
                    <Table
                        columns={[
                            { key: 'nivel', label: 'Nivel' },
                            { key: 'cantidad_matriculas', label: 'Matrículas' }
                        ]}
                        rows={resumenNivel}
                    />
                </div>
            )}

            {tab === 'carga-docente' && (
                <div className="card">
                    <div className="card-header"><h3><Briefcase size={17} /> Carga docente</h3></div>
                    <Table
                        columns={[
                            { key: 'nombre', label: 'Nombre', render: (r) => `${r.nombre} ${r.apellido}` },
                            { key: 'nivel_especialidad', label: 'Nivel' },
                            { key: 'clases_semanales', label: 'Clases/semana' },
                            { key: 'cantidad_aulas', label: 'Aulas' },
                            { key: 'horas_semanales', label: 'Horas/semana' }
                        ]}
                        rows={cargaDocente}
                    />
                </div>
            )}
        </Layout>
    );
}
