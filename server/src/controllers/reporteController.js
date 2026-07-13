const { execProcedure, execQuery } = require('../config/db');

async function riesgoNotas(req, res, next) {
    try {
        const result = await execProcedure('usp_alumnos_en_riesgo_cursor', {
            id_periodo: req.query.id_periodo
        });
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

async function riesgoInasistencia(req, res, next) {
    try {
        const params = { id_periodo: req.query.id_periodo };
        if (req.query.minimo) {
            params.faltas_consecutivas_minimas = Number(req.query.minimo);
        }
        const result = await execProcedure('usp_inasistencias_consecutivas_cursor', params);
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

async function resumenNivel(req, res, next) {
    try {
        const result = await execQuery('SELECT * FROM vw_resumen_nivel');
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

async function cargaDocente(req, res, next) {
    try {
        const result = await execQuery('SELECT * FROM vw_carga_docente ORDER BY apellido, nombre');
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

module.exports = { riesgoNotas, riesgoInasistencia, resumenNivel, cargaDocente };
