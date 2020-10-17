const express = require('express');

const {
    getSectionProps,
    getSectionProp,
    addSectionProp,
    updateSectionProp,
    deleteSectionProp
} = require('../../controllers/sectionProps')

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