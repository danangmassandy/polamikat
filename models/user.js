var mongoose = require('mongoose');
const Vasync = require('vasync');

var Schema = mongoose.Schema;

var User = new Schema({
    key                     : String,
    username                : String,
    sub                     : String,
    // Individu Profile
    name                    : String,
    birthTown               : String,
    dob                     : String,
    gender                  : String,
    photo                   : { type: mongoose.Schema.Types.ObjectId, ref: 'UploadedFile' },
    mobileCountryArea       : String,
    mobile                  : String,
    email                   : String,
    religion                : String,
    homeAddress             : String,

    // Police Profile
    nrp                     : String,
    pangkat                 : String,
    wilayahPenugasan        : String,
    polsekPenugasan         : String,
    skep                    : String,
    dikum                   : String,
    dikjur                  : String,
    dikbang                 : String,
    latfung                 : String,
    prestasiDalamTugas      : String,

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