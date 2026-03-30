const router = require('express').Router();
const { linkRequirement, getTraceability, updateLink, deleteLink } = require('../controllers/traceabilityController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/link', linkRequirement);
router.get('/', getTraceability);
router.put('/:id', updateLink);
router.delete('/:id', deleteLink);

module.exports = router;
