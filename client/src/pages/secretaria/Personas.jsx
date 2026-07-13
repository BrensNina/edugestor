import { useEffect, useState } from 'react';
import { UserPlus, GraduationCap, Users } from 'lucide-react';
import Layout from '../../components/Layout';
import Table from '../../components/Table';
import { personas } from '../../api';

const NIVELES = ['Inicial', 'Primaria', 'Secundaria'];

function FormularioProfesor({ onCreado }) {
    const [form, setForm] = useState({
        correo_electronico: '', contrasenia: '', nombre: '', apellido: '', dni: '', nivel_especialidad: NIVELES[0]
    });
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);

    function set(campo, valor) {
        setForm((f) => ({ ...f, [campo]: valor }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setEnviando(true);
        try {
            await personas.crearProfesor(form);
            setForm({ correo_electronico: '', contrasenia: '', nombre: '', apellido: '', dni: '', nivel_especialidad: NIVELES[0] });
            onCreado();
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo crear el profesor.');
        } finally {
            setEnviando(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="card">
            <div className="card-header"><h3><UserPlus size={17} /> Nuevo profesor</h3></div>
            {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}
            <div className="form-grid">
                <div className="field">
                    <label>Nombre</label>
                    <input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required />
                </div>
                <div className="field">
                    <label>Apellido</label>
                    <input value={form.apellido} onChange={(e) => set('apellido', e.target.value)} required />
                </div>
                <div className="field">
                    <label>DNI</label>
                    <input value={form.dni} onChange={(e) => set('dni', e.target.value)} maxLength={8} required />
                </div>
                <div className="field">
                    <label>Nivel de especialidad</label>
                    <select value={form.nivel_especialidad} onChange={(e) => set('nivel_especialidad', e.target.value)}>
                        {NIVELES.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                <div className="field">
                    <label>Correo</label>
                    <input type="email" value={form.correo_electronico} onChange={(e) => set('correo_electronico', e.target.value)} required />
                </div>
                <div className="field">
                    <label>Contraseña</label>
                    <input type="password" value={form.contrasenia} onChange={(e) => set('contrasenia', e.target.value)} required />
                </div>
            </div>
            <div style={{ marginTop: 16 }}>
                <button type="submit" className="btn" disabled={enviando}><UserPlus size={15} /> Crear profesor</button>
            </div>
        </form>
    );
}

function FormularioAlumno({ onCreado }) {
    const [form, setForm] = useState({
        correo_electronico: '', contrasenia: '', nombre: '', apellido: '', dni: '',
        fecha_nacimiento: '', via_direccion: '', distrito: ''
    });
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);

    function set(campo, valor) {
        setForm((f) => ({ ...f, [campo]: valor }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setEnviando(true);
        try {
            await personas.crearAlumno(form);
            setForm({ correo_electronico: '', contrasenia: '', nombre: '', apellido: '', dni: '', fecha_nacimiento: '', via_direccion: '', distrito: '' });
            onCreado();
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo crear el alumno.');
        } finally {
            setEnviando(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="card">
            <div className="card-header"><h3><GraduationCap size={17} /> Nuevo alumno</h3></div>
            {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}
            <div className="form-grid">
                <div className="field">
                    <label>Nombre</label>
                    <input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required />
                </div>
                <div className="field">
                    <label>Apellido</label>
                    <input value={form.apellido} onChange={(e) => set('apellido', e.target.value)} required />
                </div>
                <div className="field">
                    <label>DNI</label>
                    <input value={form.dni} onChange={(e) => set('dni', e.target.value)} maxLength={8} required />
                </div>
                <div className="field">
                    <label>Fecha de nacimiento</label>
                    <input type="date" value={form.fecha_nacimiento} onChange={(e) => set('fecha_nacimiento', e.target.value)} required />
                </div>
                <div className="field">
                    <label>Dirección</label>
                    <input value={form.via_direccion} onChange={(e) => set('via_direccion', e.target.value)} />
                </div>
                <div className="field">
                    <label>Distrito</label>
                    <input value={form.distrito} onChange={(e) => set('distrito', e.target.value)} />
                </div>
                <div className="field">
                    <label>Correo</label>
                    <input type="email" value={form.correo_electronico} onChange={(e) => set('correo_electronico', e.target.value)} required />
                </div>
                <div className="field">
                    <label>Contraseña</label>
                    <input type="password" value={form.contrasenia} onChange={(e) => set('contrasenia', e.target.value)} required />
                </div>
            </div>
            <div style={{ marginTop: 16 }}>
                <button type="submit" className="btn" disabled={enviando}><GraduationCap size={15} /> Crear alumno</button>
            </div>
        </form>
    );
}

export default function Personas() {
    const [tab, setTab] = useState('profesores');
    const [profesores, setProfesores] = useState([]);
    const [alumnos, setAlumnos] = useState([]);

    async function recargar() {
        const [p, a] = await Promise.all([personas.listarProfesores(), personas.listarAlumnos()]);
        setProfesores(p);
        setAlumnos(a);
    }

    useEffect(() => { recargar(); }, []);

    return (
        <Layout title="Personas">
            <div className="tabs">
                <button type="button" className={`tab${tab === 'profesores' ? ' active' : ''}`} onClick={() => setTab('profesores')}><UserPlus size={15} /> Profesores</button>
                <button type="button" className={`tab${tab === 'alumnos' ? ' active' : ''}`} onClick={() => setTab('alumnos')}><GraduationCap size={15} /> Alumnos</button>
            </div>

            {tab === 'profesores' ? <FormularioProfesor onCreado={recargar} /> : <FormularioAlumno onCreado={recargar} />}

            <div className="card">
                <div className="card-header">
                    <h3><Users size={17} /> {tab === 'profesores' ? 'Profesores registrados' : 'Alumnos registrados'}</h3>
                </div>
                {tab === 'profesores' ? (
                    <Table
                        columns={[
                            { key: 'id_profesor', label: 'ID' },
                            { key: 'nombre', label: 'Nombre' },
                            { key: 'apellido', label: 'Apellido' },
                            { key: 'dni', label: 'DNI' },
                            { key: 'nivel_especialidad', label: 'Nivel' },
                            { key: 'correo_electronico', label: 'Correo' }
                        ]}
                        rows={profesores}
                    />
                ) : (
                    <Table
                        columns={[
                            { key: 'id_alumno', label: 'ID' },
                            { key: 'nombre', label: 'Nombre' },
                            { key: 'apellido', label: 'Apellido' },
                            { key: 'dni', label: 'DNI' },
                            { key: 'correo_electronico', label: 'Correo' }
                        ]}
                        rows={alumnos}
                    />
                )}
            </div>
        </Layout>
    );
}
