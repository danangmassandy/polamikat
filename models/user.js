var mongoose = require('mongoose');
const Vasync = require('vasync');

var Schema = mongoose.Schema;

var User = new Schema({
    key                     : String,
    username                : String,
    sub                     : String,
    email                   : String,
    displayName             : String,
    userPhoto               : { type: mongoose.Schema.Types.ObjectId, ref: 'UploadedFile' },
    
    personil                : { type : mongoose.Schema.Types.ObjectId, ref: 'Personil' },
    role                    : String,

    createdAt               : { type : Date, default : Date.now },
    updatedAt               : { type : Date, default : Date.now },
    creator                 : { type : String, default : 'System' },
    updater                 : { type : String, default : 'System' },
    status                  : { type : String, default : 'new' }
});

User.index({ key       : 1 })
User.index({ username  : 1 });
User.index({ dob       : 1 });
User.index({ status    : 1 });

User.virtual('photoUrl').get(function () {
    return this.photo && this.photo.publicURL;
});
User.set('toJSON', { getters: true, virtuals: true });

/* EXPORTS */
module.exports = mongoose.model('User', User);