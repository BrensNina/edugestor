import { useEffect, useState } from 'react';
import { BookOpen, Plus, ClipboardList, Save, Award, ClipboardCheck } from 'lucide-react';
import Layout from '../../components/Layout';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import { catalogos, notas, profesores } from '../../api';

export default function Notas() {
    const { usuario } = useAuth();
    const [materias, setMaterias] = useState([]);
    const [idCursoAula, setIdCursoAula] = useState('');
    const [periodos, setPeriodos] = useState([]);
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [idEvaluacion, setIdEvaluacion] = useState('');
    const [alumnos, setAlumnos] = useState([]);
    const [notasIngresadas, setNotasIngresadas] = useState({});
    const [acta, setActa] = useState([]);
    const [nuevaEvaluacion, setNuevaEvaluacion] = useState({ id_periodo: '', nombre: '', peso: 1, fecha: '' });
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        profesores.materias(usuario.id_perfil).then((m) => {
            setMaterias(m);
            if (m[0]) setIdCursoAula(m[0].id_curso_aula);
        });
        catalogos.periodos().then((p) => {
            setPeriodos(p);
            const activo = p.find((x) => x.esta_activo);
            if (activo) setNuevaEvaluacion((f) => ({ ...f, id_periodo: activo.id_periodo }));
        });
    }, [usuario.id_perfil]);

    async function recargarCursoAula() {
        if (!idCursoAula) return;
        const [ev, al, ac] = await Promise.all([
            notas.evaluaciones(idCursoAula),
            notas.alumnosDelCurso(idCursoAula),
            notas.actaCurso(idCursoAula)
        ]);
        setEvaluaciones(ev);
        setAlumnos(al);
        setActa(ac);
        setIdEvaluacion(ev[0]?.id_evaluacion || '');
    }

    useEffect(() => { recargarCursoAula(); }, [idCursoAula]);

    async function crearEvaluacion(e) {
        e.preventDefault();
        setError('');
        try {
            await notas.crearEvaluacion(idCursoAula, nuevaEvaluacion);
            setNuevaEvaluacion((f) => ({ ...f, nombre: '', fecha: '' }));
            const ev = await notas.evaluaciones(idCursoAula);
            setEvaluaciones(ev);
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo crear la evaluación.');
        }
    }

    async function guardarNota(idMatricula) {
        setError('');
        const datos = notasIngresadas[idMatricula];
        if (!datos?.nota) return;
        try {
            await notas.registrar({
                id_evaluacion: Number(idEvaluacion),
                id_matricula: idMatricula,
                nota: Number(datos.nota),
                observacion: datos.observacion || null
            });
            setMensaje('Nota guardada.');
            setActa(await notas.actaCurso(idCursoAula));
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo guardar la nota.');
        }
    }

    return (
        <Layout title="Notas">
            <div className="card">
                <div className="card-header">
                    <h3><BookOpen size={17} /> Materia</h3>
                    <select value={idCursoAula} onChange={(e) => setIdCursoAula(Number(e.target.value))}>
                        {materias.map((m) => (
                            <option key={m.id_curso_aula} value={m.id_curso_aula}>
                                {m.nombre_curso} · {m.nivel} {m.numero_grado} {m.seccion}
                            </option>
                        ))}
                    </select>
                </div>

                <form onSubmit={crearEvaluacion} className="form-grid">
                    <div className="field">
                        <label>Periodo</label>
                        <select value={nuevaEvaluacion.id_periodo} onChange={(e) => setNuevaEvaluacion((f) => ({ ...f, id_periodo: Number(e.target.value) }))}>
                            {periodos.map((p) => <option key={p.id_periodo} value={p.id_periodo}>{p.nombre} {p.anio_academico}</option>)}
                        </select>
                    </div>
                    <div className="field">
                        <label>Nombre de evaluación</label>
                        <input value={nuevaEvaluacion.nombre} onChange={(e) => setNuevaEvaluacion((f) => ({ ...f, nombre: e.target.value }))} required />
                    </div>
                    <div className="field">
                        <label>Peso</label>
                        <input type="number" step="0.5" min="0.5" value={nuevaEvaluacion.peso} onChange={(e) => setNuevaEvaluacion((f) => ({ ...f, peso: Number(e.target.value) }))} />
                    </div>
                    <div className="field">
                        <label>Fecha</label>
                        <input type="date" value={nuevaEvaluacion.fecha} onChange={(e) => setNuevaEvaluacion((f) => ({ ...f, fecha: e.target.value }))} required />
                    </div>
                    <div className="field" style={{ justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn"><Plus size={15} /> Crear evaluación</button>
                    </div>
                </form>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {mensaje && <div className="alert alert-success">{mensaje}</div>}

            <div className="card">
                <div className="card-header">
                    <h3><ClipboardList size={17} /> Registrar notas</h3>
                    <select value={idEvaluacion} onChange={(e) => setIdEvaluacion(e.target.value)}>
                        <option value="">Seleccionar evaluación...</option>
                        {evaluaciones.map((ev) => (
                            <option key={ev.id_evaluacion} value={ev.id_evaluacion}>
                                {ev.nombre} (peso {ev.peso}) - {ev.fecha?.slice(0, 10)}
                            </option>
                        ))}
                    </select>
                </div>

                {idEvaluacion ? (
                    <Table
                        columns={[
                            { key: 'alumno', label: 'Alumno', render: (r) => `${r.nombre} ${r.apellido}` },
                            {
                                key: 'nota',
                                label: 'Nota',
                                render: (r) => (
                                    <input
                                        type="number" min="0" max="20" step="0.5" style={{ width: 70, padding: '6px 8px', border: '1px solid var(--color-border)', borderRadius: 6 }}
                                        value={notasIngresadas[r.id_matricula]?.nota ?? ''}
                                        onChange={(e) => setNotasIngresadas((n) => ({ ...n, [r.id_matricula]: { ...n[r.id_matricula], nota: e.target.value } }))}
                                    />
                                )
                            },
                            {
                                key: 'observacion',
                                label: 'Observación',
                                render: (r) => (
                                    <input
                                        style={{ width: 180, padding: '6px 8px', border: '1px solid var(--color-border)', borderRadius: 6 }}
                                        value={notasIngresadas[r.id_matricula]?.observacion ?? ''}
                                        onChange={(e) => setNotasIngresadas((n) => ({ ...n, [r.id_matricula]: { ...n[r.id_matricula], observacion: e.target.value } }))}
                                    />
                                )
                            },
                            {
                                key: 'acciones',
                                label: '',
                                render: (r) => <button type="button" className="btn btn-outline" onClick={() => guardarNota(r.id_matricula)}><Save size={14} /> Guardar</button>
                            }
                        ]}
                        rows={alumnos}
                    />
                ) : (
                    <div className="empty-state">
                        <ClipboardCheck size={28} strokeWidth={1.5} />
                        <p>Selecciona una evaluación para registrar notas.</p>
                    </div>
                )}
            </div>

            <div className="card">
                <div className="card-header"><h3><Award size={17} /> Acta del curso</h3></div>
                <Table
                    columns={[
                        { key: 'alumno', label: 'Alumno', render: (r) => `${r.nombre} ${r.apellido}` },
                        { key: 'promedio', label: 'Promedio' },
                        { key: 'estado', label: 'Estado', render: (r) => <Badge value={r.estado} /> }
                    ]}
                    rows={acta}
                />
            </div>
        </Layout>
    );
}
