const Bunyan = require('bunyan');
const Constants = require("../util/constants");
const Model = require('../models/model');
const Vasync = require('vasync');
const log = Bunyan.createLogger({ name: "polamikat:activity_controller" });
const mongoose = require('mongoose');
const Moment = require('moment');

function AttendanceController() {
    
}


AttendanceController.prototype.getAttendance = function getAttendance(p_date, callback) {
    var isRecordExist;
    var p_startDate = Moment(p_date).startOf('day');
    var p_endDate = Moment(p_date).endOf('day');

    Vasync.waterfall([
        function(cb) {
            Model.Attendance.count({
                date    : {
                    $gte : p_startDate,
                    $lte : p_endDate
                },
                status  : Constants.STATUS_ACTIVE
            }).exec(function(err, attendanceCount) {
                isRecordExist = attendanceCount != 0;
                cb(err, {});
            });
        }, function(data, cb) {
            if (!isRecordExist) {
                Model.Personil.find({
                    status : Constants.STATUS_ACTIVE
                }).select('name nrp pangkat').exec(function(err, results) {
                    if (err)
                        return cb(err);
                    if (results == null || results.length == 0)
                        return cb("Personil list is empty");
                    var attendanceData = [];
                    for (var i = 0; i < results.length; ++i) {
                        attendanceData.push({
                            personil    : results[i],
                            value       : Constants.ATTENDANCE_PRESENT,
                            date        : p_date
                        });
                    }
                    cb(null, attendanceData);
                });
            } else {
                Model.Attendance.find({
                    date    : {
                        $gte : p_startDate,
                        $lte : p_endDate
                    },
                    status  : Constants.STATUS_ACTIVE
                }).populate({
                    path    : 'personil',
                    select  : 'name nrp pangkat'
                }).exec(function(err, results) {
                    cb(err, results);
                });
            }
        }
    ], function(err, results) {
        if (err) {
            log.error("error getAttendance: ", err);
            return callback(err, null);
        }
        callback(null, results);
    });
}

AttendanceController.prototype.updateAttendance = function updateAttendance(p_date, attendanceList, userName, callback) {
    if (attendanceList == null || attendanceList.length == 0)
        return callback("list is empty");
    
    Vasync.forEachParallel({
        'func' : function(attendance, cb1) {
            Vasync.waterfall([
                function(cb2) {
                    Model.Personil.findOne({
                        _id : attendance.personil._id
                    }).exec(function(err, personil) {
                        if (err)
                            return cb2(err);
                        if (!personil) {
                            return cb2("Invalid personil.");
                        }
                        cb2(null, personil);
                    });
                }, function(personil, cb2) {
                    if (attendance._id) {
                        Model.Attendance.update({
                            _id         : attendance._id
                        }, 
                        {
                            $set: {
                                value       : attendance.value,
                                updatedAt   : new Date(),
                                updater     : userName
                            }
                        }).exec(function(err, result) {
                            cb2(err, result);
                        });
                    } else {
                        var newAttendance = new Model.Attendance({
                            date        : attendance.date,
                            personil    : personil._id,
                            value       : attendance.value,
                            createdAt   : new Date(),
                            creator     : userName
                        });
                        newAttendance.save(function(err, newAttendance) {
                            cb2(err, newAttendance);
                        });
                    }
                }
            ], function(err, results) {
                cb1(err, null);
            });
        },
        'inputs' : attendanceList
    }, function(err, results) {
        callback(err, null);
    });
}

AttendanceController.prototype.attendanceByValue = function attendanceByValue(p_value, callback) {
    Model.Attendance.aggregate([
        {
            $match : { 
                value   : p_value,
                status  : Constants.STATUS_ACTIVE 
            }
        },
        {
            $lookup : {
                from : "personils",
                localField : "personil",
                foreignField : "_id",
                as: "personil"
            }
        },
        {
            $unwind : "$personil"
        },
        {
            $group : {
                _id              : "$personil._id",
                total            : { $sum : 1 },
                personilName     : { $last : "$personil.name" },
                personilPangkat  : { $last : "$personil.pangkat" },
                lastAttendance   : { $last :"$date"  }
            }
        },
        {
            $sort : { "total" : -1 }
        }
    ]).exec(function(err, results) {
        callback(err, results);
    });
}

module.exports = AttendanceController;