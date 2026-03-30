const router = require('express').Router();
const { getKPI, getReportSRS, getReportTraceability } = require('../controllers/kpiController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getKPI);

module.exports = router;
