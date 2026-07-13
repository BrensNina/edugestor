const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { riesgoNotas, riesgoInasistencia, resumenNivel, cargaDocente } = require('../controllers/reporteController');

const router = Router();

router.use(authenticate, requireRole('Secretaria', 'Profesor'));
router.get('/riesgo-notas', riesgoNotas);
router.get('/riesgo-inasistencia', riesgoInasistencia);
router.get('/resumen-nivel', requireRole('Secretaria'), resumenNivel);
router.get('/carga-docente', requireRole('Secretaria'), cargaDocente);

module.exports = router;
