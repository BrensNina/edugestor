const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { grados, secciones, turnos, cursos, periodos } = require('../controllers/catalogoController');

const router = Router();

router.use(authenticate);
router.get('/grados', grados);
router.get('/secciones', secciones);
router.get('/turnos', turnos);
router.get('/cursos', cursos);
router.get('/periodos', periodos);

module.exports = router;
