const Bunyan = require('bunyan');
const Constants = require("../util/constants");
const Model = require('../models/model');
const Vasync = require('vasync');
const log = Bunyan.createLogger({ name: "polamikat:file_controller" });
const mongoose = require('mongoose');
const Moment = require('moment');
const FS = require('fs');
const Path = require('path');

function FileController() {

}

FileController.prototype.checkAndDeleteUploadedFile = function checkAndDeleteUploadedFile(uploadedFile, userName, callback) {
    Vasync.waterfall([
        function(callback1) {
            uploadedFile.status = Constants.STATUS_INACTIVE;
            uploadedFile.updatedAt = new Date();
            uploadedFile.updater = userName;
            uploadedFile.save(function(err, uploadedFile) {
                callback1(err, uploadedFile);
            });
        }, function(uploadedFile, callback1) {
            FS.access(uploadedFile.path, FS.constants.F_OK | FS.constants.R_OK | FS.constants.W_OK, function(err){
                if (err) {
                    log.warn('File is already deleted ', uploadedFile._id, ' - ', uploadedFile.filename);
                    callback1(null, null);
                } else {
                    FS.unlink(uploadedFile.path, function (err) {
                        log.info("is file removed ", err);
                        callback1(null, null);
                    });
                }
            });
        }
    ], function(err, result) {
        if (err)
            log.error("error delete file ", err);
        callback(err, result);
    });
}

FileController.prototype.checkAndDeleteUploadedFileById = function checkAndDeleteUploadedFileById(uploadedFileId, userName, callback) {
    var self = this;
    Vasync.waterfall([
        function(callback1) {
            Model.UploadedFile.findOne({
                _id : uploadedFileId
            }).exec(function(err, uploadedFile) {
                callback1(err, uploadedFile);
            });
        }, function(uploadedFile, callback1) {
            if (!uploadedFile) {
                log.warn("No uploaded file is found.");
                return callback1(null, null);
            }
            self.checkAndDeleteUploadedFile(uploadedFile, userName, function(err, res) {
                callback1(err, res);
            });
        }
    ], function(err, result) {
        if (err)
            log.error("error delete file ", err);
        callback(err, result);
    });
}

FileController.prototype.checkAndDeleteUploadedFileByKey = function checkAndDeleteUploadedFileByKey(uploadedFileKey, userName, callback) {
    var self = this;
    Vasync.waterfall([
        function(callback1) {
            Model.UploadedFile.findOne({
                key : uploadedFileKey
            }).exec(function(err, uploadedFile) {
                callback1(err, uploadedFile);
            });
        }, function(uploadedFile, callback1) {
            if (!uploadedFile) {
                log.warn("No uploaded file is found.");
                return callback1(null, null);
            }
            self.checkAndDeleteUploadedFile(uploadedFile, userName, function(err, res) {
                callback1(err, res);
            });
        }
    ], function(err, result) {
        if (err)
            log.error("error delete file ", err);
        callback(err, result);
    });
}


module.exports = FileController;