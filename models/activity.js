var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Activity = new Schema({
    category        : { type: mongoose.Schema.Types.ObjectId, ref: 'ActivityCategory' },
    user            : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startDate       : Date,
    endDate         : { type : Date, default : Date.now },
    photos          : [{ type: mongoose.Schema.Types.ObjectId, ref: 'UploadedFile' }],
    notes           : String,

    createdAt       : { type : Date, default : Date.now },
    updatedAt       : { type : Date, default : Date.now },
    creator         : { type : String, default : 'System' },
    updater         : { type : String, default : 'System' },
    status          : { type : String, default : 'active' }
});

Activity.index({ category : 1 });
Activity.index({ user : 1 });
Activity.index({ createdAt : 1 });
Activity.index({ updatedAt : 1 });
Activity.index({ creator   : 1 });
Activity.index({ updater   : 1 });
Activity.index({ status    : 1 });

/* EXPORTS */
module.exports = mongoose.model('Activity', Activity);