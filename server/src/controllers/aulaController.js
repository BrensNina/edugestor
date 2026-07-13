const { execProcedure, execQuery } = require('../config/db');

async function disponibles(req, res, next) {
    try {
        const result = await execQuery('SELECT * FROM vw_aulas_disponibles ORDER BY nivel, numero_grado, seccion');
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

async function ocupacion(req, res, next) {
    try {
        const result = await execQuery('SELECT * FROM vw_ocupacion_aulas ORDER BY nivel, numero_grado, seccion');
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

async function crear(req, res, next) {
    try {
        const { id_grado, id_seccion, id_turno, anio_academico, aforo_maximo } = req.body;
        const result = await execQuery(
            `INSERT INTO aula_periodo (id_grado, id_seccion, id_turno, anio_academico, aforo_maximo, cantidad_matriculados)
             OUTPUT INSERTED.*
             VALUES (@id_grado, @id_seccion, @id_turno, @anio_academico, @aforo_maximo, 0)`,
            { id_grado, id_seccion, id_turno, anio_academico, aforo_maximo }
        );
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        next(err);
    }
}

async function materias(req, res, next) {
    try {
        const result = await execQuery(
            'SELECT * FROM vw_materias_aula WHERE id_aula_periodo = @id',
            { id: req.params.id }
        );
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

async function agregarMateria(req, res, next) {
    try {
        const { id_curso, id_profesor } = req.body;
        const result = await execQuery(
            `INSERT INTO curso_aula (id_aula_periodo, id_curso, id_profesor)
             VALUES (@id_aula_periodo, @id_curso, @id_profesor);
             SELECT * FROM curso_aula WHERE id_curso_aula = SCOPE_IDENTITY();`,
            { id_aula_periodo: req.params.id, id_curso, id_profesor: id_profesor || null }
        );
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        next(err);
    }
}

async function generarHorario(req, res, next) {
    try {
        const result = await execProcedure('usp_generar_horario_aula', {
            id_aula_periodo: req.params.id,
            mostrar_resultado: true
        });
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

async function generarHorariosFaltantes(req, res, next) {
    try {
        const result = await execProcedure('usp_generar_horarios_faltantes_cursor');
        res.json(result.recordset[0]);
    } catch (err) {
        next(err);
    }
}

async function recalcularAforos(req, res, next) {
    try {
        const result = await execProcedure('usp_recalcular_aforos_cursor');
        res.json(result.recordset[0]);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    disponibles,
    ocupacion,
    crear,
    materias,
    agregarMateria,
    generarHorario,
    generarHorariosFaltantes,
    recalcularAforos
};
