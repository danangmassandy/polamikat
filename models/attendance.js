var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Attendance = new Schema({
    personil        : { type: mongoose.Schema.Types.ObjectId, ref: 'Personil' },
    date            : Date,
    value           : Number, // 0 : hadir, 1 : ijin, 2 : sakit, 3 : tanpa keterangan

    createdAt       : { type : Date, default : Date.now },
    updatedAt       : { type : Date, default : Date.now },
    creator         : { type : String, default : 'System' },
    updater         : { type : String, default : 'System' },
    status          : { type : String, default : 'active' }
});


Attendance.index({ personil       : 1 });
Attendance.index({ status    : 1 });
Attendance.index({ value       : 1 });

/* EXPORTS */
module.exports = mongoose.model('Attendance', Attendance);