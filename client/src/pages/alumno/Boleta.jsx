import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import Layout from '../../components/Layout';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import { notas } from '../../api';

export default function Boleta() {
    const { usuario } = useAuth();
    const [boleta, setBoleta] = useState([]);

    useEffect(() => {
        notas.boletaAlumno(usuario.id_perfil).then(setBoleta);
    }, [usuario.id_perfil]);

    return (
        <Layout title="Mi boleta">
            <div className="card">
                <div className="card-header"><h3><FileText size={17} /> Notas por curso y periodo</h3></div>
                <Table
                    columns={[
                        { key: 'periodo', label: 'Periodo' },
                        { key: 'anio_academico', label: 'Año' },
                        { key: 'nombre_curso', label: 'Curso' },
                        { key: 'promedio', label: 'Promedio' },
                        { key: 'estado', label: 'Estado', render: (r) => <Badge value={r.estado} /> }
                    ]}
                    rows={boleta}
                    emptyMessage="Todavía no tienes notas registradas."
                />
            </div>
        </Layout>
    );
}
