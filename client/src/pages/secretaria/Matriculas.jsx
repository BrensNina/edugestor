import { useEffect, useState } from 'react';
import { UserCheck, GraduationCap } from 'lucide-react';
import Layout from '../../components/Layout';
import Table from '../../components/Table';
import { aulas, matriculas, personas } from '../../api';

export default function Matriculas() {
    const [listaAlumnos, setListaAlumnos] = useState([]);
    const [aulasDisponibles, setAulasDisponibles] = useState([]);
    const [matriculados, setMatriculados] = useState([]);
    const [form, setForm] = useState({ id_alumno: '', id_aula_periodo: '', anio_academico: new Date().getFullYear() });
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);

    async function recargar() {
        const [a, au, m] = await Promise.all([
            personas.listarAlumnos(),
            aulas.disponibles(),
            matriculas.listar()
        ]);
        setListaAlumnos(a);
        setAulasDisponibles(au);
        setMatriculados(m);
    }

    useEffect(() => { recargar(); }, []);

    function set(campo, valor) {
        setForm((f) => ({ ...f, [campo]: valor }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setEnviando(true);
        try {
            await matriculas.matricular({
                id_alumno: Number(form.id_alumno),
                id_aula_periodo: Number(form.id_aula_periodo),
                anio_academico: Number(form.anio_academico)
            });
            setForm((f) => ({ ...f, id_alumno: '', id_aula_periodo: '' }));
            await recargar();
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo matricular al alumno.');
        } finally {
            setEnviando(false);
        }
    }

    return (
        <Layout title="Matrícula">
            <form onSubmit={handleSubmit} className="card">
                <div className="card-header"><h3><UserCheck size={17} /> Matricular alumno</h3></div>
                {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}
                <div className="form-grid">
                    <div className="field">
                        <label>Alumno</label>
                        <select value={form.id_alumno} onChange={(e) => set('id_alumno', e.target.value)} required>
                            <option value="">Seleccionar...</option>
                            {listaAlumnos.map((a) => (
                                <option key={a.id_alumno} value={a.id_alumno}>{a.nombre} {a.apellido} ({a.dni})</option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>Aula (con cupo disponible)</label>
                        <select value={form.id_aula_periodo} onChange={(e) => set('id_aula_periodo', e.target.value)} required>
                            <option value="">Seleccionar...</option>
                            {aulasDisponibles.map((a) => (
                                <option key={a.id_aula_periodo} value={a.id_aula_periodo}>
                                    {a.nivel} {a.numero_grado} {a.seccion} - {a.nombre_turno} ({a.anio_academico}) · {a.cupos_disponibles} cupos
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>Año académico</label>
                        <input type="number" value={form.anio_academico} onChange={(e) => set('anio_academico', e.target.value)} required />
                    </div>
                </div>
                <div style={{ marginTop: 16 }}>
                    <button type="submit" className="btn" disabled={enviando}><UserCheck size={15} /> Matricular</button>
                </div>
            </form>

            <div className="card">
                <div className="card-header"><h3><GraduationCap size={17} /> Alumnos matriculados</h3></div>
                <Table
                    columns={[
                        { key: 'nombre', label: 'Nombre', render: (r) => `${r.nombre} ${r.apellido}` },
                        { key: 'dni', label: 'DNI' },
                        { key: 'nivel', label: 'Nivel' },
                        { key: 'numero_grado', label: 'Grado' },
                        { key: 'seccion', label: 'Sección' },
                        { key: 'nombre_turno', label: 'Turno' },
                        { key: 'anio_academico', label: 'Año' }
                    ]}
                    rows={matriculados}
                />
            </div>
        </Layout>
    );
}
