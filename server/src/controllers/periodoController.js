const { execProcedure, execQuery } = require('../config/db');

async function crear(req, res, next) {
    try {
        const { anio_academico, nombre, fecha_inicio, fecha_fin } = req.body;
        const result = await execQuery(
            `INSERT INTO periodo_academico (anio_academico, nombre, fecha_inicio, fecha_fin, esta_activo)
             OUTPUT INSERTED.*
             VALUES (@anio_academico, @nombre, @fecha_inicio, @fecha_fin, 0)`,
            { anio_academico, nombre, fecha_inicio, fecha_fin }
        );
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        next(err);
    }
}

async function activar(req, res, next) {
    try {
        const result = await execProcedure('usp_activar_periodo', { id_periodo: req.params.id });
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

module.exports = { crear, activar };
