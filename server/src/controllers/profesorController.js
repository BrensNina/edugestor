const { execProcedure, execQuery } = require('../config/db');

async function asignar(req, res, next) {
    try {
        const result = await execProcedure('usp_asignar_profesor', {
            id_curso_aula: req.params.id,
            id_profesor: req.body.id_profesor
        });
        res.json(result.recordset[0]);
    } catch (err) {
        next(err);
    }
}

async function carga(req, res, next) {
    try {
        const result = await execQuery(
            'SELECT * FROM vw_carga_docente WHERE id_profesor = @id',
            { id: req.params.id }
        );
        res.json(result.recordset[0] || null);
    } catch (err) {
        next(err);
    }
}

async function horario(req, res, next) {
    try {
        const result = await execQuery(
            `SELECT
                h.id_horario, ca.id_curso_aula, h.dia_semana, h.hora_inicio, h.hora_fin,
                c.nombre_curso, g.nivel, g.numero_grado, s.letra AS seccion,
                ap.anio_academico
             FROM curso_aula ca
             INNER JOIN horario_clase h ON h.id_curso_aula = ca.id_curso_aula
             INNER JOIN curso c ON c.id_curso = ca.id_curso
             INNER JOIN aula_periodo ap ON ap.id_aula_periodo = ca.id_aula_periodo
             INNER JOIN grado g ON g.id_grado = ap.id_grado
             INNER JOIN seccion s ON s.id_seccion = ap.id_seccion
             WHERE ca.id_profesor = @id
             ORDER BY
                CASE h.dia_semana
                    WHEN 'Lunes' THEN 1 WHEN 'Martes' THEN 2 WHEN 'Miércoles' THEN 3
                    WHEN 'Jueves' THEN 4 WHEN 'Viernes' THEN 5
                END,
                h.hora_inicio`,
            { id: req.params.id }
        );
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

async function materias(req, res, next) {
    try {
        const result = await execQuery(
            'SELECT * FROM vw_materias_aula WHERE id_profesor = @id ORDER BY nivel, numero_grado, seccion',
            { id: req.params.id }
        );
        res.json(result.recordset);
    } catch (err) {
        next(err);
    }
}

module.exports = { asignar, carga, horario, materias };
