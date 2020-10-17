const path = require('path')
const Part = require('../models/Parts')
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse')
const geocoder = require('../utils/geocoder');

// @desc        Get all parts
// @route       GET /api/v1/parts
// @access      Public
exports.getParts = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc        Get single parts
// @route       GET /api/v1/parts/:id
// @access      Public
exports.getPart = asyncHandler(async (req, res, next) => {
    const part = await Part.findById(req.params.id);

    if (!part) {
        return next(new ErrorResponse(`Part not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({success: true, data: part});
});

// @desc        Create new parts
// @route       POST /api/v1/parts/
// @access      Private
exports.createPart = asyncHandler(async (req, res, next) => {
    // Add user to req,body
    req.body.user = req.user.id;

    // Check for published part
    const publishedPart = await Part.findOne({ user: req.user.id });

    // If the user is not an admin, they can only add one part
    if (publishedPart && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `The user with ID ${req.user.id} has already published a part`,
                400
            )
        );
    }

    const part = await Part.create(req.body);

    res.status(201).json({
        success: true,
        data: part
    });
});

// @desc        Update parts
// @route       PUT /api/v1/parts/:id
// @access      Private
exports.updatePart = asyncHandler(async (req, res, next) => {
    let part = await Part.findById(req.params.id);

    if (!part) {
        return next(
            new ErrorResponse(`Part not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is part owner
    if (part.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this part`,
                401
            )
        );
    }

    part = await Part.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: part });
});

// @desc        Delete parts
// @route       DELETE /api/v1/parts/:id
// @access      Private
exports.deletePart = asyncHandler(async (req, res, next) => {
    const part = await Part.findById(req.params.id);

    if (!part) {
        return next(
            new ErrorResponse(`Part not found with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is part owner
    if (part.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to delete this part`,
                401
            )
        );
    }

    await part.remove();

    res.status(200).json({ success: true, data: {} });
});