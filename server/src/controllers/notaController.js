const { execProcedure, execQuery } = require('../config/db');

async function registrar(req, res, next) {
    try {
        const { id_evaluacion, id_matricula, nota, observacion } = req.body;
        const result = await execProcedure('usp_registrar_nota', {
            id_evaluacion,
            id_matricula,
            nota,
            observacion: observacion || null
        });
        res.json(result.recordset[0]);
    } catch (err) {
        next(err);
    }
}

async function boletaAlumno(req, res, next) {
    try {
        const result = await execQuery(
            'SELECT * FROM vw_boleta_alumno WHERE id_alumno = @id ORDER BY anio_academico, periodo, nombre_curso',
            { id: req.params.id }
        );
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

async function actaCurso(req, res, next) {
    try {
        const query = req.user.rol === 'Profesor'
            ? 'SELECT * FROM vw_acta_curso WHERE id_curso_aula = @id AND id_profesor = @id_profesor ORDER BY apellido, nombre'
            : 'SELECT * FROM vw_acta_curso WHERE id_curso_aula = @id ORDER BY apellido, nombre';

        const result = await execQuery(query, {
            id: req.params.id,
            id_profesor: req.user.id_perfil
        });
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

async function listarEvaluaciones(req, res, next) {
    try {
        const result = await execQuery(
            'SELECT * FROM evaluacion WHERE id_curso_aula = @id ORDER BY fecha DESC',
            { id: req.params.id }
        );
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

async function crearEvaluacion(req, res, next) {
    try {
        const { id_periodo, nombre, peso, fecha } = req.body;
        const result = await execQuery(
            `INSERT INTO evaluacion (id_curso_aula, id_periodo, nombre, peso, fecha)
             VALUES (@id_curso_aula, @id_periodo, @nombre, @peso, @fecha);
             SELECT * FROM evaluacion WHERE id_evaluacion = SCOPE_IDENTITY();`,
            { id_curso_aula: req.params.id, id_periodo, nombre, peso, fecha }
        );
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        next(err);
    }
}

async function alumnosDelCurso(req, res, next) {
    try {
        const result = await execQuery(
            `SELECT m.id_matricula, a.id_alumno, a.nombre, a.apellido
             FROM curso_aula ca
             INNER JOIN matricula m ON m.id_aula_periodo = ca.id_aula_periodo
             INNER JOIN alumno a ON a.id_alumno = m.id_alumno
             WHERE ca.id_curso_aula = @id
             ORDER BY a.apellido, a.nombre`,
            { id: req.params.id }
        );
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

module.exports = { registrar, boletaAlumno, actaCurso, listarEvaluaciones, crearEvaluacion, alumnosDelCurso };
