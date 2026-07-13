const { Router } = require('express');
const { authenticate, requireOwnAlumno } = require('../middleware/auth');
const { horario } = require('../controllers/alumnoController');

const router = Router();

router.use(authenticate);
router.get('/:id/horario', requireOwnAlumno('id'), horario);

module.exports = router;
