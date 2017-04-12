const Bunyan = require('bunyan');
const Express = require('express');
const Model = require('../models/model');
const Vasync = require('vasync');
const Constants = require("../util/constants");
const RequestUtil = require('../util/request_util');
const KeycloakUtil = require('../util/keycloak_util');
const log = Bunyan.createLogger({name: "polamikat:attendance"});
const AttendanceController = require('../controller/attendance_controller');

const router = Express.Router();

var attendanceController = new AttendanceController();

// get attendance list
router.post('/attendance_list', KeycloakUtil.protectSystemAdmin(), RequestUtil.authenticate, function(req, res) {
    var p_date = req.body.date || new Date();
    attendanceController.getAttendance(p_date, function(err, results) {
        if (err) {
            res.fail(err);
        } else {
            res.success({
                data : results
            });
        }
    });
});

// update attendance list
router.post('/update_attendance', KeycloakUtil.protectSystemAdmin(), RequestUtil.authenticate, function(req, res) {
    var p_date = req.body.date || new Date();
    var p_attendanceList = req.body.attendanceList;
    if (!p_attendanceList)
        return res.fail("Attendance list must not be empty.");
    attendanceController.updateAttendance(p_date, p_attendanceList, req.polamikatUser.username, function(err, results) {
        if (err) {
            res.fail(err);
        } else {
            res.success({
                data : results
            });
        }
    });
});

// get attendance data by value
router.post('/attendance_by_value', KeycloakUtil.protect(), RequestUtil.authenticate, function(req, res) {
    var p_value = req.body.value;
    if (!p_value)
        return res.fail("Attendance value must be supplied.");
    attendanceController.attendanceByValue(p_value, function(err, results) {
        if (err) {
            res.fail(err);
        } else {
            res.success({
                data : results
            });
        }
    });
});

// reset attendnace
router.post('/attendance_reset', KeycloakUtil.protectSystemAdmin(), RequestUtil.authenticate, function(req, res) {
    attendanceController.reset(req.polamikatUser.username, function(err, results) {
        if (err) {
            res.fail(err);
        } else {
            res.success({
                data : results
            });
        }
    });
});

// get attendance by period
router.post('/attendance_by_period', KeycloakUtil.protectSystemAdmin(), RequestUtil.authenticate, function(req, res) {
    var p_period = req.body.period;
    var p_date = req.body.date;
    if (!p_period)
        return res.fail("Period must be supplied.");
    if (!p_date)
        return res.fail("Date must be supplied.");
    attendanceController.attendanceByPeriod(p_period, p_date, function(err, results) {
        if (err) {
            res.fail(err);
        } else {
            res.success({
                data : results
            });
        }
    });
});

module.exports = router;