const { Router } = require('express');
const { authenticate, requireRole, requireOwnProfesor } = require('../middleware/auth');
const { asignar, carga, horario, materias } = require('../controllers/profesorController');

const router = Router();

router.use(authenticate);
router.put('/curso-aula/:id/profesor', requireRole('Secretaria'), asignar);
router.get('/:id/carga', requireOwnProfesor('id'), carga);
router.get('/:id/horario', requireOwnProfesor('id'), horario);
router.get('/:id/materias', requireOwnProfesor('id'), materias);

module.exports = router;
