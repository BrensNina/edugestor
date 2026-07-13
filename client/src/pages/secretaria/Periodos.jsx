import { useEffect, useState } from 'react';
import { Plus, CalendarRange, CheckCircle2, ShieldCheck } from 'lucide-react';
import Layout from '../../components/Layout';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import InfoTooltip from '../../components/InfoTooltip';
import { catalogos, periodos } from '../../api';

export default function Periodos() {
    const [lista, setLista] = useState([]);
    const [form, setForm] = useState({ anio_academico: new Date().getFullYear(), nombre: '', fecha_inicio: '', fecha_fin: '' });
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [mensajeVerificacion, setMensajeVerificacion] = useState('');
    const [detalleVerificacion, setDetalleVerificacion] = useState([]);

    async function recargar() {
        setLista(await catalogos.periodos());
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
            await periodos.crear(form);
            setForm({ anio_academico: new Date().getFullYear(), nombre: '', fecha_inicio: '', fecha_fin: '' });
            await recargar();
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo crear el periodo.');
        } finally {
            setEnviando(false);
        }
    }

    async function activar(id) {
        await periodos.activar(id);
        await recargar();
    }

    async function verificarActivos() {
        const { anios_corregidos, detalle } = await periodos.verificarActivos();
        setMensajeVerificacion(
            anios_corregidos === 0
                ? 'Todo en orden: cada año académico tiene como máximo un periodo activo.'
                : `Se corrigieron ${anios_corregidos} año(s) con más de un periodo activo a la vez.`
        );
        setDetalleVerificacion(detalle);
        await recargar();
    }

    return (
        <Layout title="Periodos académicos">
            <form onSubmit={handleSubmit} className="card">
                <div className="card-header"><h3><Plus size={17} /> Nuevo periodo</h3></div>
                {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}
                <div className="form-grid">
                    <div className="field">
                        <label>Año académico</label>
                        <input type="number" value={form.anio_academico} onChange={(e) => set('anio_academico', Number(e.target.value))} required />
                    </div>
                    <div className="field">
                        <label>Nombre</label>
                        <input placeholder="Bimestre I" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required />
                    </div>
                    <div className="field">
                        <label>Fecha inicio</label>
                        <input type="date" value={form.fecha_inicio} onChange={(e) => set('fecha_inicio', e.target.value)} required />
                    </div>
                    <div className="field">
                        <label>Fecha fin</label>
                        <input type="date" value={form.fecha_fin} onChange={(e) => set('fecha_fin', e.target.value)} required />
                    </div>
                </div>
                <div style={{ marginTop: 16 }}>
                    <button type="submit" className="btn" disabled={enviando}><Plus size={15} /> Crear periodo</button>
                </div>
            </form>

            <div className="card">
                <div className="card-header">
                    <h3><CalendarRange size={17} /> Periodos registrados</h3>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <button type="button" className="btn btn-outline" onClick={verificarActivos}>
                            <ShieldCheck size={15} /> Verificar periodos activos
                        </button>
                        <InfoTooltip texto="Revisa año por año que exista como máximo un periodo activo a la vez (las notas solo se registran en el periodo activo). Si una restauración de backup o migración dejó dos activos del mismo año, conserva el más reciente y desactiva los demás." />
                    </div>
                </div>
                {mensajeVerificacion && <div className="alert alert-success" style={{ marginBottom: 14 }}>{mensajeVerificacion}</div>}
                {detalleVerificacion.length > 0 && (
                    <Table
                        columns={[
                            { key: 'anio_academico', label: 'Año' },
                            { key: 'periodos_activos_encontrados', label: 'Periodos activos encontrados' },
                            { key: 'id_periodo_conservado', label: 'Periodo conservado (ID)' }
                        ]}
                        rows={detalleVerificacion}
                    />
                )}
                <Table
                    columns={[
                        { key: 'anio_academico', label: 'Año' },
                        { key: 'nombre', label: 'Nombre' },
                        { key: 'fecha_inicio', label: 'Inicio', render: (r) => r.fecha_inicio?.slice(0, 10) },
                        { key: 'fecha_fin', label: 'Fin', render: (r) => r.fecha_fin?.slice(0, 10) },
                        {
                            key: 'esta_activo',
                            label: 'Estado',
                            render: (r) => <Badge value={r.esta_activo ? 'Activo' : 'Inactivo'} />
                        },
                        {
                            key: 'acciones',
                            label: '',
                            render: (r) => !r.esta_activo && (
                                <button type="button" className="btn btn-outline" onClick={() => activar(r.id_periodo)}>
                                    <CheckCircle2 size={15} /> Activar
                                </button>
                            )
                        }
                    ]}
                    rows={lista}
                />
            </div>
        </Layout>
    );
}
