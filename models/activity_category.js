var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ActivityCategory = new Schema({
    name            : String,
    value           : Number,

    createdAt       : { type : Date, default : Date.now },
    updatedAt       : { type : Date, default : Date.now },
    creator         : { type : String, default : 'System' },
    updater         : { type : String, default : 'System' },
    status          : { type : String, default : 'active' }
});

ActivityCategory.index({ name : 1 });
ActivityCategory.index({ value : 1 });
ActivityCategory.index({ createdAt : 1 });
ActivityCategory.index({ updatedAt : 1 });
ActivityCategory.index({ creator   : 1 });
ActivityCategory.index({ updater   : 1 });
ActivityCategory.index({ status    : 1 });

/* EXPORTS */
module.exports = mongoose.model('ActivityCategory', ActivityCategory);