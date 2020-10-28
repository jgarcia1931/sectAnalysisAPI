const express = require('express');

const {
    getSectionProps,
    getSectionProp,
    addSectionProp,
    updateSectionProp,
    deleteSectionProp
} = require('../../controllers/sectionProps')

/**
 * @swagger
 *   paths:
 *     /api/v1/sectionProps:
 *       get:
 *         tags:
 *           - "Properties"
 *         summary: Get All sectionProps
 *         responses:
 *           200:
 *             description: test
 *     /api/v1/parts/{partId}/sectionProps:
 *       get:
 *         tags:
 *           - "Properties"
 *         summary: Get section props
 *         parameters:
 *           - in: path
 *             name: partId
 *             description: Get sectionProps by ID
 *             required: true
 *             type: string
 *         responses:
 *           200:
 *             description: Created
 *       post:
 *         tags:
 *           - "Properties"
 *         summary: Create Section Property
 *         parameters:
 *           - in: path
 *             name: partId
 *             description: Create sectionProps by ID
 *             required: true
 *             type: string
 *           - in: body
 *             name: user
 *             description: The user to be registered
 *             schema:
 *               type: object
 *               properties:
 *                 sectionName:
 *                   type: string
 *                 geom:
 *                   type: array
 *                   items:
 *                     type: array
 *                     items:
 *                       type: float
 *         responses:
 *           200:
 *             description: Created
 *     /api/v1/sectionProps/{id}:
 *       get:
 *         tags:
 *           - "Properties"
 *         summary: Get All Section Property
 *         responses:
 *           200:
 *             description: test
 *       put:
 *         tags:
 *           - "Properties"
 *         summary: Update Section Property
 *         parameters:
 *           - in: body
 *             name: user
 *             description: Update Section Property
 *             schema:
 *               type: object
 *               properties:
 *                 sectionName:
 *                   type: string
 *                 geom:
 *                   type: array
 *                   items:
 *                     type: array
 *                     items:
 *                       type: float
 *         responses:
 *           200:
 *             description: Created
 *       delete:
 *         tags:
 *           - "Properties"
 *         summary: Delete Section Property
 *         responses:
 *           200:
 *             description: Created
 */

const SectionProp = require('../../models/SectionProp');

const router = express.Router({mergeParams: true});

const {protect, authorize} = require('../../middleware/auth');

const advancedResults = require('../../middleware/advancedResults');

router
    .route('/')
    .get(advancedResults(SectionProp, {
        path: 'part',
        select: 'name description'
    }),getSectionProps
    )
    .post(protect, authorize('publisher', 'admin'), addSectionProp);

router
    .route('/:id')
    .get(getSectionProp)
    .put(protect, authorize('publisher', 'admin'), updateSectionProp)
    .delete(protect, authorize('publisher', 'admin'), deleteSectionProp);

module.exports = router;