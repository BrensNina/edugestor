const { Router } = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { listar, matricular } = require('../controllers/matriculaController');

const router = Router();

router.use(authenticate, requireRole('Secretaria'));
router.get('/', listar);
router.post('/', matricular);

module.exports = router;
