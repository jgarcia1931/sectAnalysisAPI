const express = require('express');

const {
    getParts,
    getPart,
    createPart,
    updatePart,
    deletePart
} = require('../../controllers/parts')

const Part = require('../../models/Parts');

// Include other resource routers
const sectionPropRouter = require('./sectionProps');


const router = express.Router()

const {protect, authorize} = require('../../middleware/auth');

const advancedResults = require('../../middleware/advancedResults');


// Re-route into other resource routers
router.use('/:partId/sectionProps', sectionPropRouter);






router
    .route('/')
    .get(advancedResults(Part, 'sectionProps'),getParts)
    .post(protect, authorize('publisher', 'admin'), createPart);

router
    .route('/:id')
    .get(getPart)
    .put(protect, authorize('publisher', 'admin'), updatePart)
    .delete(protect, authorize('publisher', 'admin'), deletePart);

module.exports = router;