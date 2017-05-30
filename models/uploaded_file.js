var mongoose = require('mongoose');
const Vasync = require('vasync');
const Constants = require("../util/constants");

var Schema = mongoose.Schema;

var UploadedFile = new Schema({
    name            : String,
    originalname    : String,
    filename        : String,
    description     : String,
    encoding        : String,
    mimetype        : String,
    size            : Number,
    bucket          : String,
    key             : String,
    acl             : String,
    contentType     : String,
    etag            : String,
    publicURL       : String,
    rawData         : String,
    path            : String,
    thumbnailPath   : String,
    thumbnailURL    : String,
    uploader        : { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Real uploader
    user            : { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Destination user
    type            : Number, // 0: Profile Image, 1: Activity Image
    createdAt       : { type : Date, default : Date.now },
    updatedAt       : { type : Date, default : Date.now },
    creator         : { type : String, default : 'System' },
    updater         : { type : String, default : 'System' },
    status          : { type : String, default : 'active' }
});

UploadedFile.index({ uploader  : 1 });
UploadedFile.index({ createdAt : 1 });
UploadedFile.index({ updatedAt : 1 });
UploadedFile.index({ creator   : 1 });
UploadedFile.index({ updater   : 1 });
UploadedFile.index({ status    : 1 });

UploadedFile.statics.findUploadedFileById = function(id, callback) {
    var ThisModel = mongoose.model('UploadedFile');

    if (!id) {
        return callback(null, null);
    }

    ThisModel.findOne({
        _id: id,
        status: Constants.STATUS_ACTIVE
    }, callback);
};


/* EXPORTS */
module.exports = mongoose.model('UploadedFile', UploadedFile);
