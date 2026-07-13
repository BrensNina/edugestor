const { execProcedure, execQuery } = require('../config/db');

async function registrar(req, res, next) {
    try {
        const { id_horario, id_matricula, fecha, estado } = req.body;
        const result = await execProcedure('usp_registrar_asistencia', {
            id_horario,
            id_matricula,
            fecha,
            estado
        });
        res.json(result.recordset[0]);
    } catch (err) {
        next(err);
    }
}

async function historialAlumno(req, res, next) {
    try {
        const result = await execQuery(
            'SELECT * FROM vw_asistencia_alumno WHERE id_alumno = @id ORDER BY nombre_curso',
            { id: req.params.id }
        );
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

module.exports = { registrar, historialAlumno };
