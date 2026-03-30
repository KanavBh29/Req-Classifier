const router = require('express').Router();
const { createTestCase, getTestCases, updateTestCase, deleteTestCase } = require('../controllers/testCaseController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', createTestCase);
router.get('/', getTestCases);
router.put('/:id', updateTestCase);
router.delete('/:id', deleteTestCase);

module.exports = router;
