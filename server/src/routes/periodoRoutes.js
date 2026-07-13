const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { crear, activar, verificarActivos } = require('../controllers/periodoController');

const router = Router();

router.use(authenticate, requireRole('Secretaria'));
router.post('/', crear);
router.post('/:id/activar', activar);
router.post('/verificar-activos', verificarActivos);

module.exports = router;
