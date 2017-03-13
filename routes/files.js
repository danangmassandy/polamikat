const Bunyan = require('bunyan');
const Constants = require("../util/constants");
const Express = require('express');
const KeyUtil = require('../util/key_util');
const Model = require('../models/model');
const RequestUtil = require('../util/request_util');
const Vasync = require('vasync');
const Multer  =   require('multer');
const Path = require('path');
const FS = require('fs');

const log = Bunyan.createLogger({ name: "polamikat:files" });

const router = Express.Router();

var upload = Multer({
    dest : Path.join(BASE_DIR, 'uploads/private')
});

var upload_public = Multer({
    dest : Path.join(BASE_DIR, 'uploads/public')
});

router.post('/protected/:uploadedFile', function(req, res) {
    var uploadedFileId = req.params.uploadedFile;

    Vasync.waterfall([
        function (callback) {
            Model.UploadedFile.findOne({
                _id    : uploadedFileId,
                status : {$nin : [Constants.STATUS_INACTIVE]}
            }).lean().exec(function(err, res) {
                if (err)
                    return callback(err);
                if (!res)
                    return callback('No file is found.');

                callback(null, {
                    uploadedFile : res
                })
            });
        }, function(data, callback) {
            callback(null, data);
        }
    ], function(error, data) {
        if (error) {
            res.fail(error);
        } else {
            res.set('Content-Type', data.uploadedFile.mimetype);
            res.set('Content-Length', data.uploadedFile.size);
            var readStream = FS.createReadStream(data.uploadedFile.path);
            // We replaced all the event handlers with a simple call to readStream.pipe()
            readStream.pipe(res);
        }
    });
});

router.post('/upload', upload.single('file'), function (req, res) {
    var file = req.files.file[0];
    Vasync.waterfall([
        function(callback) {
            var uploadedFile = new Model.UploadedFile(file);
            uploadedFile.uploader = req.polamikatUser.username;
            uploadedFile.save(function(err, uploadedFile) {
                if (process.env.MODE == "prod")
                    uploadedFile.publicURL = req.protocol + "://" + req.get('host') + "/files/protected/" + uploadedFile._id;
                else
                    uploadedFile.publicURL = "http://localhost:3000/files/protected/" + uploadedFile._id;
                uploadedFile.key = KeyUtil.generateUploadedFileKey(uploadedFile);
                uploadedFile.save(function(err, uploadedFile) {
                    callback(null, uploadedFile);
                });
            });
        }
    ], function(err, uploadedFile) {
        if(err) {
            res.fail(err);
        } else {
            res.success({
                data : {
                    uploadedFileKey : uploadedFile.key,
                    uploadedFileUrl: uploadedFile.publicURL
                }
            });
        }

    });
});

router.post('/upload_public', upload_public.single('file'), function (req, res) {
    var file = req.files.file[0];
    Vasync.waterfall([
        function(callback) {
            var uploadedFile = new Model.UploadedFile(file);
            uploadedFile.uploader = req.polamikatUser.username;
            if (process.env.MODE == "prod")
                uploadedFile.publicURL = req.protocol + "://" + req.get('host') + "/public/" + file.filename;
            else
                uploadedFile.publicURL = "http://localhost:3000/public/";
            uploadedFile.save(function(err, uploadedFile) {
                uploadedFile.key = KeyUtil.generateUploadedFileKey(uploadedFile);
                uploadedFile.save(function(err, uploadedFile) {
                    callback(null, uploadedFile);
                });
            });
        }
    ], function(err, uploadedFile) {
        if(err) {
            res.fail(err);
        } else {
            res.success({
                data : {
                    uploadedFileKey : uploadedFile.key,
                    uploadedFileUrl: uploadedFile.publicURL
                }
            });
        }

    });
});

// upload

module.exports = router;