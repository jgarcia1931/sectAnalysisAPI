const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const fs = require("fs");
// const file1 = require('../files/immigration/i-90.pdf');
// const file1 = require('../files/immigration/n-400.pdf');
const {degrees, PDFDocument, rgb, StandardFonts} = require('pdf-lib');
// const baseUrl = "http://localhost:8080/files/";
const path = require('path');


// @desc      Get files
// @route     GET /api/v1/immigration/files
// @access    Public
exports.getFiles = asyncHandler(async (req, res, next) => {
    const fileUrl = `${req.protocol}://${req.get('host')}/api/v1/immigration/files/`;
    const dirpath = './files/immigration';

    console.log(dirpath);
    fs.readdir(dirpath, function (err, files) {
        console.log(dirpath);
        if(err) {
            return next(new ErrorResponse(`Unable to scan files!`), 500);
        }

        let fileInfos = [];

        files.forEach((file) => {
            fileInfos.push({
                name: file,
                url: fileUrl + file,
            });
        });

        res.status(200).json({
            success: true,
            data: fileInfos
        });
    });
});

// @desc      Get file
// @route     GET /api/v1/immigration/files/:id
// @access    Public
exports.getDownloadFile = asyncHandler(async (req, res, next) => {
    const fileName = req.params.id;
    // const dirpath = `${req.protocol}://${req.get('host')}/sectAnalysisAPI/files/immigration/${fileName}`;
    const dirpath = `./files/immigration/${fileName}`;
    console.log(dirpath);

    res.download(dirpath, fileName, (err) => {
        if(err) {
            return next(new ErrorResponse(`Could not download the file. `), 500);
        }
    });
    // var options = {
    //     root: path.join(__dirname)
    // };
    // res.sendFile(dirpath, function (err) {
    //     if (err) {
    //         return next(new ErrorResponse(`Could not download the file. `), 500);
    //     } else {
    //         console.log('Sent:', fileName);
    //     }
    // });
});

// @desc      Create new file
// @route     POST /api/v1/immigration/files
// @access    Private
exports.addFiles = asyncHandler(async (req, res, next) => {
    const dirpath = `${req.protocol}://${req.get('host')}/api/v1/immigration/files/`;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const date = Date.now();
    const fileName = firstName + "_" + lastName + "_" + date + ".pdf";


    //
    const file1 = './files/immigration/n-400test.pdf'
    const existingPdfBytes = fs.readFileSync(file1);
    // const file2PdfBytes = file2.getBytes();
    // const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())

    const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true })
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()
    firstPage.drawText(fileName, {
        x: 5,
        y: height / 2 + 300,
        size: 50,
        font: helveticaFont,
        color: rgb(0.95, 0.1, 0.1),
        rotate: degrees(-45),
    })

    const pdfBytes = await pdfDoc.save()

    fs.writeFile(`./files/immigration/${fileName}`, pdfBytes, function (err) {
        if (err) throw err;
        console.log('Results Received');
        const fileInfo = {
            name: fileName,
            url: dirpath + fileName
        }

        res.status(200).json({
            success: true,
            data: fileInfo
        });
    });

    // pdfBytes.mv(`./files/immigration/${fileName}`, async err => {
    //     if (err) {
    //         console.error(err);
    //         return next(new ErrorResponse(`Problem with file creation`, 500));
    //     }
    //
    //     const fileInfo = {
    //         name: fileName,
    //         url: dirpath + fileName
    //     }
    //
    //     res.status(200).json({
    //         success: true,
    //         data: fileInfo
    //     });
    // })
});