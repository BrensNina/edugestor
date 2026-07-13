const TONO_POR_VALOR = {
    Llena: 'red',
    'Por llenarse': 'orange',
    Disponible: 'green',
    Aprobado: 'green',
    Desaprobado: 'red',
    'Sin promedio': 'gray',
    Presente: 'green',
    Tarde: 'orange',
    Ausente: 'red',
    Justificado: 'gray',
    Secretaria: 'gray',
    Profesor: 'orange',
    Alumno: 'green',
    Activo: 'green',
    Inactivo: 'gray'
};

export default function Badge({ value }) {
    const tono = TONO_POR_VALOR[value] || 'gray';
    return <span className={`badge badge-${tono}`}>{value}</span>;
}
