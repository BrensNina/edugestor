import { useEffect, useState } from 'react';
import { CalendarCheck, Save } from 'lucide-react';
import Layout from '../../components/Layout';
import Table from '../../components/Table';
import { useAuth } from '../../context/AuthContext';
import { asistencias, notas, profesores } from '../../api';

const ESTADOS = ['Presente', 'Tarde', 'Ausente', 'Justificado'];
const hoy = () => new Date().toISOString().slice(0, 10);

export default function Asistencia() {
    const { usuario } = useAuth();
    const [horarios, setHorarios] = useState([]);
    const [idHorario, setIdHorario] = useState('');
    const [fecha, setFecha] = useState(hoy());
    const [alumnos, setAlumnos] = useState([]);
    const [estados, setEstados] = useState({});
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        profesores.horario(usuario.id_perfil).then((h) => {
            setHorarios(h);
            if (h[0]) setIdHorario(h[0].id_horario);
        });
    }, [usuario.id_perfil]);

    const horarioSeleccionado = horarios.find((h) => h.id_horario === Number(idHorario));

    useEffect(() => {
        if (horarioSeleccionado) {
            notas.alumnosDelCurso(horarioSeleccionado.id_curso_aula).then(setAlumnos);
        }
    }, [idHorario, horarios.length]);

    async function guardarEstado(idMatricula) {
        const estado = estados[idMatricula];
        if (!estado) return;
        setError('');
        try {
            await asistencias.registrar({ id_horario: Number(idHorario), id_matricula: idMatricula, fecha, estado });
            setMensaje('Asistencia registrada.');
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo registrar la asistencia.');
        }
    }

    return (
        <Layout title="Asistencia">
            <div className="card">
                <div className="card-header">
                    <h3><CalendarCheck size={17} /> Tomar asistencia</h3>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <select value={idHorario} onChange={(e) => setIdHorario(e.target.value)}>
                            {horarios.map((h) => (
                                <option key={h.id_horario} value={h.id_horario}>
                                    {h.dia_semana} {h.hora_inicio?.slice(0, 5)} · {h.nombre_curso} ({h.nivel} {h.numero_grado} {h.seccion})
                                </option>
                            ))}
                        </select>
                        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }} />
                    </div>
                </div>

                {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}
                {mensaje && <div className="alert alert-success" style={{ marginBottom: 14 }}>{mensaje}</div>}

                <Table
                    columns={[
                        { key: 'alumno', label: 'Alumno', render: (r) => `${r.nombre} ${r.apellido}` },
                        {
                            key: 'estado',
                            label: 'Estado',
                            render: (r) => (
                                <select
                                    value={estados[r.id_matricula] ?? ''}
                                    onChange={(e) => setEstados((s) => ({ ...s, [r.id_matricula]: e.target.value }))}
                                >
                                    <option value="">Seleccionar...</option>
                                    {ESTADOS.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                                </select>
                            )
                        },
                        {
                            key: 'acciones',
                            label: '',
                            render: (r) => <button type="button" className="btn btn-outline" onClick={() => guardarEstado(r.id_matricula)}><Save size={14} /> Guardar</button>
                        }
                    ]}
                    rows={alumnos}
                    emptyMessage="No hay alumnos matriculados en esta aula."
                />
            </div>
        </Layout>
    );
}
