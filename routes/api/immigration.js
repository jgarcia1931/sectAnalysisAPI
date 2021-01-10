const express = require('express');

const {
    getFiles,
    getDownloadFile,
    addFiles
} = require('../../controllers/immigrationForm')

const router = express.Router();

const {protect, authorize} = require('../../middleware/auth');

router
    .route('/files')
    .get(getFiles)
    .post(addFiles);

router
    .route('/files/:id')
    .get(getDownloadFile);

module.exports = router;

