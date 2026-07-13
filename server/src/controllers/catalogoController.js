const { execQuery } = require('../config/db');

async function grados(req, res, next) {
    try {
        const result = await execQuery('SELECT * FROM grado ORDER BY nivel, id_grado');
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

async function secciones(req, res, next) {
    try {
        const result = await execQuery('SELECT * FROM seccion ORDER BY letra');
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

async function turnos(req, res, next) {
    try {
        const result = await execQuery('SELECT * FROM turno ORDER BY id_turno');
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

async function cursos(req, res, next) {
    try {
        const result = await execQuery('SELECT * FROM curso ORDER BY nombre_curso');
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

async function periodos(req, res, next) {
    try {
        const result = await execQuery('SELECT * FROM periodo_academico ORDER BY anio_academico DESC, fecha_inicio');
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

module.exports = { grados, secciones, turnos, cursos, periodos };
