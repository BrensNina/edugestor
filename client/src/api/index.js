import client from './client';

export const auth = {
    login: (correo_electronico, contrasenia) =>
        client.post('/auth/login', { correo_electronico, contrasenia }).then((r) => r.data)
};

export const catalogos = {
    grados: () => client.get('/catalogos/grados').then((r) => r.data),
    secciones: () => client.get('/catalogos/secciones').then((r) => r.data),
    turnos: () => client.get('/catalogos/turnos').then((r) => r.data),
    cursos: () => client.get('/catalogos/cursos').then((r) => r.data),
    periodos: () => client.get('/catalogos/periodos').then((r) => r.data)
};

export const personas = {
    listarProfesores: () => client.get('/personas/profesores').then((r) => r.data),
    crearProfesor: (data) => client.post('/personas/profesores', data).then((r) => r.data),
    listarAlumnos: () => client.get('/personas/alumnos').then((r) => r.data),
    crearAlumno: (data) => client.post('/personas/alumnos', data).then((r) => r.data)
};

export const periodos = {
    crear: (data) => client.post('/periodos', data).then((r) => r.data),
    activar: (id) => client.post(`/periodos/${id}/activar`).then((r) => r.data),
    verificarActivos: () => client.post('/periodos/verificar-activos').then((r) => r.data)
};

export const aulas = {
    disponibles: () => client.get('/aulas/disponibles').then((r) => r.data),
    ocupacion: () => client.get('/aulas/ocupacion').then((r) => r.data),
    crear: (data) => client.post('/aulas', data).then((r) => r.data),
    materias: (idAulaPeriodo) => client.get(`/aulas/${idAulaPeriodo}/materias`).then((r) => r.data),
    agregarMateria: (idAulaPeriodo, data) => client.post(`/aulas/${idAulaPeriodo}/materias`, data).then((r) => r.data),
    generarHorario: (idAulaPeriodo) => client.post(`/aulas/${idAulaPeriodo}/generar-horario`).then((r) => r.data),
    generarHorariosFaltantes: () => client.post('/aulas/generar-horarios-faltantes').then((r) => r.data)
};

export const matriculas = {
    listar: (anioAcademico) =>
        client.get('/matriculas', { params: { anio_academico: anioAcademico } }).then((r) => r.data),
    matricular: (data) => client.post('/matriculas', data).then((r) => r.data)
};

export const profesores = {
    asignar: (idCursoAula, idProfesor) =>
        client.put(`/profesores/curso-aula/${idCursoAula}/profesor`, { id_profesor: idProfesor }).then((r) => r.data),
    carga: (idProfesor) => client.get(`/profesores/${idProfesor}/carga`).then((r) => r.data),
    horario: (idProfesor) => client.get(`/profesores/${idProfesor}/horario`).then((r) => r.data),
    materias: (idProfesor) => client.get(`/profesores/${idProfesor}/materias`).then((r) => r.data)
};

export const notas = {
    registrar: (data) => client.post('/notas', data).then((r) => r.data),
    boletaAlumno: (idAlumno) => client.get(`/notas/alumno/${idAlumno}/boleta`).then((r) => r.data),
    actaCurso: (idCursoAula) => client.get(`/notas/curso-aula/${idCursoAula}/acta`).then((r) => r.data),
    evaluaciones: (idCursoAula) => client.get(`/notas/curso-aula/${idCursoAula}/evaluaciones`).then((r) => r.data),
    crearEvaluacion: (idCursoAula, data) => client.post(`/notas/curso-aula/${idCursoAula}/evaluaciones`, data).then((r) => r.data),
    alumnosDelCurso: (idCursoAula) => client.get(`/notas/curso-aula/${idCursoAula}/alumnos`).then((r) => r.data)
};

export const asistencias = {
    registrar: (data) => client.post('/asistencias', data).then((r) => r.data),
    historialAlumno: (idAlumno) => client.get(`/asistencias/alumno/${idAlumno}`).then((r) => r.data)
};

export const alumnos = {
    horario: (idAlumno, anioAcademico) =>
        client.get(`/alumnos/${idAlumno}/horario`, { params: { anio_academico: anioAcademico } }).then((r) => r.data)
};

export const reportes = {
    riesgoNotas: (idPeriodo) => client.get('/reportes/riesgo-notas', { params: { id_periodo: idPeriodo } }).then((r) => r.data),
    riesgoInasistencia: (idPeriodo, minimo) =>
        client.get('/reportes/riesgo-inasistencia', { params: { id_periodo: idPeriodo, minimo } }).then((r) => r.data),
    resumenNivel: () => client.get('/reportes/resumen-nivel').then((r) => r.data),
    cargaDocente: () => client.get('/reportes/carga-docente').then((r) => r.data)
};
