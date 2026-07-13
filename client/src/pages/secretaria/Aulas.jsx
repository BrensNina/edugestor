import { useEffect, useState } from 'react';
import { DoorOpen, CalendarPlus, Plus, BookOpen, CalendarClock } from 'lucide-react';
import Layout from '../../components/Layout';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import InfoTooltip from '../../components/InfoTooltip';
import { aulas, catalogos, personas } from '../../api';

function TabOcupacion() {
    const [lista, setLista] = useState([]);
    const [mensaje, setMensaje] = useState('');

    async function recargar() {
        setLista(await aulas.ocupacion());
    }

    useEffect(() => { recargar(); }, []);

    async function generarHorariosFaltantes() {
        const { aulas_programadas } = await aulas.generarHorariosFaltantes();
        setMensaje(`Se generaron horarios para ${aulas_programadas} aula(s).`);
    }

    return (
        <div className="card">
            <div className="card-header">
                <h3><DoorOpen size={17} /> Ocupación de aulas</h3>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button type="button" className="btn btn-outline" onClick={generarHorariosFaltantes}>
                        <CalendarPlus size={15} /> Generar horarios faltantes
                    </button>
                    <InfoTooltip texto="Busca aulas que ya tienen materias asignadas pero no las 15 clases completas (3 bloques x 5 días) y les genera el horario automáticamente. Útil al abrir muchas aulas de golpe al iniciar un periodo." />
                </div>
            </div>
            {mensaje && <div className="alert alert-success" style={{ marginBottom: 14 }}>{mensaje}</div>}
            <Table
                columns={[
                    { key: 'nivel', label: 'Nivel' },
                    { key: 'numero_grado', label: 'Grado' },
                    { key: 'seccion', label: 'Sección' },
                    { key: 'nombre_turno', label: 'Turno' },
                    { key: 'anio_academico', label: 'Año' },
                    { key: 'cantidad_matriculados', label: 'Matriculados' },
                    { key: 'aforo_maximo', label: 'Aforo' },
                    { key: 'estado_aula', label: 'Estado', render: (r) => <Badge value={r.estado_aula} /> }
                ]}
                rows={lista}
            />
        </div>
    );
}

function TabCrearAula({ onCreada }) {
    const [grados, setGrados] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const [turnos, setTurnos] = useState([]);
    const [form, setForm] = useState({ id_grado: '', id_seccion: '', id_turno: '', anio_academico: new Date().getFullYear(), aforo_maximo: 30 });
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([catalogos.grados(), catalogos.secciones(), catalogos.turnos()]).then(([g, s, t]) => {
            setGrados(g);
            setSecciones(s);
            setTurnos(t);
            setForm((f) => ({ ...f, id_grado: g[0]?.id_grado, id_seccion: s[0]?.id_seccion, id_turno: t[0]?.id_turno }));
        });
    }, []);

    function set(campo, valor) {
        setForm((f) => ({ ...f, [campo]: valor }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        try {
            await aulas.crear(form);
            onCreada();
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo crear el aula.');
        }
    }

    return (
        <form onSubmit={handleSubmit} className="card">
            <div className="card-header"><h3><Plus size={17} /> Nueva aula</h3></div>
            {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}
            <div className="form-grid">
                <div className="field">
                    <label>Grado</label>
                    <select value={form.id_grado} onChange={(e) => set('id_grado', Number(e.target.value))}>
                        {grados.map((g) => <option key={g.id_grado} value={g.id_grado}>{g.nivel} - {g.numero_grado}</option>)}
                    </select>
                </div>
                <div className="field">
                    <label>Sección</label>
                    <select value={form.id_seccion} onChange={(e) => set('id_seccion', Number(e.target.value))}>
                        {secciones.map((s) => <option key={s.id_seccion} value={s.id_seccion}>{s.letra}</option>)}
                    </select>
                </div>
                <div className="field">
                    <label>Turno</label>
                    <select value={form.id_turno} onChange={(e) => set('id_turno', Number(e.target.value))}>
                        {turnos.map((t) => <option key={t.id_turno} value={t.id_turno}>{t.nombre_turno}</option>)}
                    </select>
                </div>
                <div className="field">
                    <label>Año académico</label>
                    <input type="number" value={form.anio_academico} onChange={(e) => set('anio_academico', Number(e.target.value))} />
                </div>
                <div className="field">
                    <label>Aforo máximo</label>
                    <input type="number" value={form.aforo_maximo} onChange={(e) => set('aforo_maximo', Number(e.target.value))} />
                </div>
            </div>
            <div style={{ marginTop: 16 }}>
                <button type="submit" className="btn"><Plus size={15} /> Crear aula</button>
            </div>
        </form>
    );
}

function TabMaterias() {
    const [listaAulas, setListaAulas] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [profesores, setProfesores] = useState([]);
    const [idAula, setIdAula] = useState('');
    const [materias, setMaterias] = useState([]);
    const [nuevaMateria, setNuevaMateria] = useState({ id_curso: '', id_profesor: '' });
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([aulas.ocupacion(), catalogos.cursos(), personas.listarProfesores()]).then(([a, c, p]) => {
            setListaAulas(a);
            setCursos(c);
            setProfesores(p);
            if (a[0]) setIdAula(a[0].id_aula_periodo);
        });
    }, []);

    useEffect(() => {
        if (idAula) aulas.materias(idAula).then(setMaterias);
    }, [idAula]);

    async function agregarMateria(e) {
        e.preventDefault();
        setError('');
        try {
            await aulas.agregarMateria(idAula, {
                id_curso: Number(nuevaMateria.id_curso),
                id_profesor: nuevaMateria.id_profesor ? Number(nuevaMateria.id_profesor) : null
            });
            setMaterias(await aulas.materias(idAula));
            setNuevaMateria({ id_curso: '', id_profesor: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo agregar la materia.');
        }
    }

    async function generarHorario() {
        await aulas.generarHorario(idAula);
        setMensaje('Horario generado correctamente.');
    }

    return (
        <div className="card">
            <div className="card-header">
                <h3><BookOpen size={17} /> Materias por aula</h3>
                <div className="field" style={{ minWidth: 260 }}>
                    <select value={idAula} onChange={(e) => setIdAula(Number(e.target.value))}>
                        {listaAulas.map((a) => (
                            <option key={a.id_aula_periodo} value={a.id_aula_periodo}>
                                {a.nivel} {a.numero_grado} {a.seccion} - {a.nombre_turno} ({a.anio_academico})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {mensaje && <div className="alert alert-success" style={{ marginBottom: 14 }}>{mensaje}</div>}
            {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}

            <Table
                columns={[
                    { key: 'nombre_curso', label: 'Curso' },
                    { key: 'nombre_profesor', label: 'Profesor', render: (r) => r.nombre_profesor ? `${r.nombre_profesor} ${r.apellido_profesor}` : 'Sin asignar' }
                ]}
                rows={materias}
                emptyMessage="Esta aula todavía no tiene materias asignadas."
            />

            <form onSubmit={agregarMateria} className="form-grid" style={{ marginTop: 18 }}>
                <div className="field">
                    <label>Curso</label>
                    <select value={nuevaMateria.id_curso} onChange={(e) => setNuevaMateria((m) => ({ ...m, id_curso: e.target.value }))} required>
                        <option value="">Seleccionar...</option>
                        {cursos.map((c) => <option key={c.id_curso} value={c.id_curso}>{c.nombre_curso}</option>)}
                    </select>
                </div>
                <div className="field">
                    <label>Profesor (opcional)</label>
                    <select value={nuevaMateria.id_profesor} onChange={(e) => setNuevaMateria((m) => ({ ...m, id_profesor: e.target.value }))}>
                        <option value="">Sin asignar</option>
                        {profesores.map((p) => <option key={p.id_profesor} value={p.id_profesor}>{p.nombre} {p.apellido} ({p.nivel_especialidad})</option>)}
                    </select>
                </div>
                <div className="field" style={{ justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn"><Plus size={15} /> Agregar materia</button>
                </div>
            </form>

            <div style={{ marginTop: 18 }}>
                <button type="button" className="btn btn-outline" onClick={generarHorario}>
                    <CalendarClock size={15} /> Generar horario del aula
                </button>
            </div>
        </div>
    );
}

export default function Aulas() {
    const [tab, setTab] = useState('ocupacion');

    return (
        <Layout title="Aulas">
            <div className="tabs">
                <button type="button" className={`tab${tab === 'ocupacion' ? ' active' : ''}`} onClick={() => setTab('ocupacion')}><DoorOpen size={15} /> Ocupación</button>
                <button type="button" className={`tab${tab === 'crear' ? ' active' : ''}`} onClick={() => setTab('crear')}><Plus size={15} /> Nueva aula</button>
                <button type="button" className={`tab${tab === 'materias' ? ' active' : ''}`} onClick={() => setTab('materias')}><BookOpen size={15} /> Materias y horario</button>
            </div>

            {tab === 'ocupacion' && <TabOcupacion />}
            {tab === 'crear' && <TabCrearAula onCreada={() => setTab('ocupacion')} />}
            {tab === 'materias' && <TabMaterias />}
        </Layout>
    );
}
