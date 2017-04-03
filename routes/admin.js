const Bunyan = require('bunyan');
const Express = require('express');
const Model = require('../models/model');
const Vasync = require('vasync');
const Constants = require("../util/constants");
const log = Bunyan.createLogger({name: "polamikat:admin"});
const ProfileController = require('../controller/profile_controller');
const ActivityCategoryController = require('../controller/activity_category_controller');
const AttendanceController = require('../controller/attendance_controller');

const router = Express.Router();

var profileController = new ProfileController();
var activityCategoryController = new ActivityCategoryController();
var attendanceController = new AttendanceController();

// router.get('/', function (req, res, next) {
//     res.render('homepage', {
//         title: 'Admin Index',
//         me: JSON.stringify({
//             username: req.polamikatUser.username,
//             displayName: req.polamikatUser.name,
//             isAdmin : true
//         }).replace(/"/g, "\\\"").replace(/\n/g, "\\")
//     });
// });

// add new personil
router.post('/add_personil', function(req, res) {
    profileController.addPersonil(req.body.personil, 
        req.body.createLoginInfo, req.polamikatUser.username, function(err, result) {
            if (err) {
                res.fail(err);
            } else {
                res.success({
                    data : result
                });
            }
        });
});

// delete personil
router.post('/delete_personil', function(req, res) {
    profileController.deactivatePersonil(req.body.personilID, req.polamikatUser.username, function(err, result) {
        if (err) {
            res.fail(err);
        } else {
            res.success({
                data : result
            });
        }
    });
});

// user list
router.post('/user_list', function(req, res) {

});

// add new category
router.post('/add_category', function(req, res) {
    activityCategoryController.update(req.body.category, true, req.polamikatUser.username, function(err, result) {
        if (err) {
            res.fail(err);
        } else {
            res.success({
                data : result
            });
        }
    });
});

// update category
router.post('/update_category', function(req, res) {
    activityCategoryController.update(req.body.category, false, req.polamikatUser.username, function(err, result) {
        if (err) {
            res.fail(err);
        } else {
            res.success({
                data : result
            });
        }
    });
});

// get attendance list
router.post('/attendance_list', function(req, res) {
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
router.post('/update_attendance', function(req, res) {
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
router.post('/attendance_by_value', function(req, res) {
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

module.exports = router;