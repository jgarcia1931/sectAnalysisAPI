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



/**
 * @swagger
 *   paths:
 *     /api/v1/parts:
 *       get:
 *         tags:
 *           - "Parts"
 *         summary: Get All Parts
 *         responses:
 *           200:
 *             description: test
 *       post:
 *         tags:
 *           - "Parts"
 *         summary: Create Part
 *         consumes:
 *           - application/json
 *         parameters:
 *           - in: body
 *             name: user
 *             description: Create New Part
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 email:
 *                   type: string
 *         responses:
 *           200:
 *             description: Created
 *     /api/v1/parts/{id}:
 *       get:
 *         tags:
 *           - "Parts"
 *         summary: Get Part
 *         parameters:
 *           - in: path
 *             name: id
 *             description: Get parts by ID
 *             required: true
 *             type: string
 *         responses:
 *           200:
 *             description: Created
 *       put:
 *         tags:
 *           - "Parts"
 *         summary: Update Part
 *         consumes:
 *           - application/json
 *         parameters:
 *           - in: body
 *             name: user
 *             description: Update Part
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 email:
 *                   type: string
 *         responses:
 *           200:
 *             description: Created
 *       delete:
 *         tags:
 *           - "Parts"
 *         summary: Delete Part
 *         responses:
 *           200:
 *             description: Created
 */


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