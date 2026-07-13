const { execQuery } = require('../config/db');

async function horario(req, res, next) {
    try {
        const { anio_academico } = req.query;
        const result = await execQuery(
            'SELECT * FROM fn_horario_alumno(@id, @anio) ORDER BY numero_dia, hora_inicio',
            { id: req.params.id, anio: anio_academico }
        );
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

module.exports = { horario };
