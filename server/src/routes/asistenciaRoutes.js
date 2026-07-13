const { Router } = require('express');
const { authenticate, requireRole, requireOwnAlumno } = require('../middleware/auth');
const { registrar, historialAlumno } = require('../controllers/asistenciaController');

const router = Router();

router.use(authenticate);
router.post('/', requireRole('Profesor'), registrar);
router.get('/alumno/:id', requireOwnAlumno('id'), historialAlumno);

module.exports = router;
