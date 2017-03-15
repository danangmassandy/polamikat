var mongoose = require('mongoose');
const Vasync = require('vasync');

var Schema = mongoose.Schema;

var Personil = new Schema({
    // Individu Profile
    email                   : String,
    name                    : String,
    birthTown               : String,
    dob                     : String,
    gender                  : String,
    photo                   : { type: mongoose.Schema.Types.ObjectId, ref: 'UploadedFile' },
    mobileCountryArea       : String,
    mobile                  : String,
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

    createdAt               : { type : Date, default : Date.now },
    updatedAt               : { type : Date, default : Date.now },
    creator                 : { type : String, default : 'System' },
    updater                 : { type : String, default : 'System' },
    status                  : { type : String, default : 'active' }
});

Personil.index({ name       : 1 });
Personil.index({ dob       : 1 });
Personil.index({ status    : 1 });
Personil.index({ wilayahPenugasan       : 1 });
Personil.index({ polsekPenugasan       : 1 });
Personil.index({ pangkat       : 1 });

/* EXPORTS */
module.exports = mongoose.model('Personil', Personil);