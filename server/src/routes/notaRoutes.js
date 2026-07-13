const { Router } = require('express');
const { authenticate, requireRole, requireOwnAlumno } = require('../middleware/auth');
const {
    registrar,
    boletaAlumno,
    actaCurso,
    listarEvaluaciones,
    crearEvaluacion,
    alumnosDelCurso
} = require('../controllers/notaController');

const router = Router();

router.use(authenticate);
router.post('/', requireRole('Profesor'), registrar);
router.get('/alumno/:id/boleta', requireOwnAlumno('id'), boletaAlumno);
router.get('/curso-aula/:id/acta', requireRole('Secretaria', 'Profesor'), actaCurso);
router.get('/curso-aula/:id/evaluaciones', requireRole('Secretaria', 'Profesor'), listarEvaluaciones);
router.post('/curso-aula/:id/evaluaciones', requireRole('Profesor'), crearEvaluacion);
router.get('/curso-aula/:id/alumnos', requireRole('Secretaria', 'Profesor'), alumnosDelCurso);

module.exports = router;
