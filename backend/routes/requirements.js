const router = require('express').Router();
const { uploadRequirements, getRequirements, deleteRequirement, classifyRequirement } = require('../controllers/requirementController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/upload', uploadRequirements);
router.get('/', getRequirements);
router.delete('/:id', deleteRequirement);
router.post('/classify', classifyRequirement);

module.exports = router;
