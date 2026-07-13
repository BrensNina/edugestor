const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { crearProfesor, crearAlumno, listarProfesores, listarAlumnos } = require('../controllers/personaController');

const router = Router();

router.use(authenticate, requireRole('Secretaria'));
router.get('/profesores', listarProfesores);
router.post('/profesores', crearProfesor);
router.get('/alumnos', listarAlumnos);
router.post('/alumnos', crearAlumno);

module.exports = router;
