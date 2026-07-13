const { execProcedure, execQuery } = require('../config/db');

async function listar(req, res, next) {
    try {
        const { anio_academico } = req.query;
        const result = anio_academico
            ? await execQuery(
                  'SELECT * FROM vw_alumnos_matriculados WHERE anio_academico = @anio ORDER BY apellido, nombre',
                  { anio: anio_academico }
              )
            : await execQuery('SELECT * FROM vw_alumnos_matriculados ORDER BY apellido, nombre');
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

async function matricular(req, res, next) {
    try {
        const { id_alumno, id_aula_periodo, anio_academico } = req.body;
        const result = await execProcedure('usp_matricular_alumno', {
            id_alumno,
            id_aula_periodo,
            anio_academico
        });
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        next(err);
    }
}

module.exports = { listar, matricular };
