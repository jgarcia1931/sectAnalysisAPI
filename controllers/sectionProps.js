const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const SectionProp = require('../models/SectionProp');
const Part = require('../models/Parts');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// @desc      Get sectionProps
// @route     GET /api/v1/sectionProps
// @route     GET /api/v1/parts/:partId/sectionProps
// @access    Public
exports.getSectionProps = asyncHandler(async (req, res, next) => {
    if (req.params.partId) {
        const sectionProps = await SectionProp.find({part: req.params.partId})
        return res.status(200).json({
            success: true,
            count: sectionProps.length,
            data: sectionProps
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
});

// @desc      Get sectionProp
// @route     GET /api/v1/sectionProps/:id
// @access    Public
exports.getSectionProp = asyncHandler(async (req, res, next) => {
    const sectionProp = await SectionProp.findById(req.params.id).populate({
        path: 'part',
        select: 'name description'
    });

    if(!sectionProp) {
        return next(new ErrorResponse(`No SectionProp with the id of ${req.params.id}`), 404);
    }

    res.status(200).json({
        success: true,
        data: sectionProp
    });
});

// @desc      Add sectionProp
// @route     POST /api/v1/parts/:partId/sectionProps
// @access    Private
exports.addSectionProp = asyncHandler(async (req, res, next) => {
    req.body.part = req.params.partId;
    req.body.user = req.user.id;

    const { sectionName} = req.body;
    const partId = req.params.partId;
    const part = await Part.findById(req.params.partId);

    if (!part) {
        return next(
            new ErrorResponse(
                `No part with the id of ${req.params.partId}`,
                404
            )
        );
    }

    // Make sure user is part owner
    if (part.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to add a section properties to part ${part._id}`,
                401
            )
        );
    }

    let result = await sectionTool(req.body.geom);

    // let result = await spawTool(req.body.geom)

    req.body = Object.assign(req.body, result.props)

    let sectionProp = await SectionProp.find({"sectionName":sectionName, "part":partId});

    if (sectionProp.length===0) {
        sectionProp = await SectionProp.create(req.body);
    } else {
        return next(
            new ErrorResponse(
                `Section Properties with name ${req.body.sectionName} already exist`,
                404
            )
        );
    }

    res.status(200).json({
        success: true,
        data: sectionProp
    });
});

// @desc      Update sectionProp
// @route     PUT /api/v1/sectionProps/:id
// @access    Private
exports.updateSectionProp = asyncHandler(async (req, res, next) => {
    let sectionProp = await SectionProp.findById(req.params.id);

    if (!sectionProp) {
        return next(
            new ErrorResponse(`No sectionProp with the id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is section properties owner
    if (sectionProp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update section properties ${part._id}`,
                401
            )
        );
    }

    sectionProp = await SectionProp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    sectionProp.save();

    res.status(200).json({
        success: true,
        data: sectionProp
    });
});

// @desc      Delete sectionProp
// @route     DELETE /api/v1/sectionProps/:id
// @access    Private
exports.deleteSectionProp = asyncHandler(async (req, res, next) => {
    const sectionProp = await SectionProp.findById(req.params.id);

    if (!sectionProp) {
        return next(
            new ErrorResponse(`No sectionProp with the id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is section properties owner
    if (sectionProp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to delete section properties ${part._id}`,
                401
            )
        );
    }

    await sectionProp.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// async function spawTool(geom) {
//     const { spawn } = require('child_process');
//     const inputString = [];
//     for (i = 0; i < geom.length; i++) {
//         inputString.push("[" + geom + "]");
//     }
//
//     let resultDataSet = []
//     // const process = spawn('python', ['controllers/sectionProps.py', inputString.join(" ")]);
//
//     const { stdout, stderr } = await exec(`python controllers/sectionProps.py ${inputString.join(" ")}`);
//
//     if (stderr) {
//         console.error(`error: ${stderr}`);
//     }
//     // console.log(`Number of files ${stdout}`);
//
//     return JSON.parse(Buffer.from(stdout))
// };

async function sectionTool(geom) {

    let result = {
        "elemX": {
            "areay":0,
            "Ax":0,
            "Ax_sq":0,
            "Ioy":0},
        "elemY": {
            "areax":0,
            "Ay":0,
            "Ay_sq":0,
            "Iox":0},
        "props":{
            "Iox":0,
            "Ioy":0,
            "xbar":0,
            "ybar":0
        }
    }

    // Y moment
    for (i = 0; i < geom.length; i++) {
        // elemX.basey      += geom[i][2];
        // elemX.heighty    += geom[i][3];
        result.elemX.areay += geom[i][2] * geom[i][3];
        // elemX.xbar       += geom[i][0] + geom[i][2] / 2;
        result.elemX.Ax += (geom[i][2] * geom[i][3]) * (geom[i][0] + geom[i][2] / 2);
        result.elemX.Ax_sq += ((geom[i][2] * geom[i][3]) * (geom[i][0] + geom[i][2] / 2)) * (geom[i][0] + geom[i][2] / 2);
        result.elemX.Ioy += (geom[i][3] * geom[i][2] ** 3) / 12;
    }

    let xbar_cg = result.elemX.Ax / result.elemX.areay;
    let Ioy_all = result.elemX.Ioy + result.elemX.Ax_sq - xbar_cg * result.elemX.Ax;

    // X moment
    for (i = 0; i < geom.length; i++) {
        // elemY.basex      += geom[i][2];
        // elemY.heightx    += geom[i][3];
        result.elemY.areax += geom[i][2] * geom[i][3];
        // elemY.ybar       += geom[i][1] + geom[i][3] / 2;
        result.elemY.Ay += (geom[i][2] * geom[i][3]) * (geom[i][1] + geom[i][3] / 2);
        result.elemY.Ay_sq += ((geom[i][2] * geom[i][3]) * (geom[i][1] + geom[i][3] / 2)) * (geom[i][1] + geom[i][3] / 2);
        result.elemY.Iox += (geom[i][2] * geom[i][3] ** 3) / 12;
    }

    let ybar_cg = result.elemY.Ay / result.elemY.areax;
    let Iox_all = result.elemY.Iox + result.elemY.Ay_sq - ybar_cg * result.elemY.Ay;

    result.props.Iox  = Iox_all.valueOf();
    result.props.Ioy  = Ioy_all.valueOf();
    result.props.xbar = xbar_cg.valueOf();
    result.props.ybar = ybar_cg.valueOf();

    return result;
}

