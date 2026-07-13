const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const {
    disponibles,
    ocupacion,
    crear,
    materias,
    agregarMateria,
    generarHorario,
    generarHorariosFaltantes
} = require('../controllers/aulaController');

const router = Router();

router.use(authenticate, requireRole('Secretaria'));
router.get('/disponibles', disponibles);
router.get('/ocupacion', ocupacion);
router.post('/', crear);
router.get('/:id/materias', materias);
router.post('/:id/materias', agregarMateria);
router.post('/:id/generar-horario', generarHorario);
router.post('/generar-horarios-faltantes', generarHorariosFaltantes);

module.exports = router;
