const Bunyan = require('bunyan');
const Express = require('express');
const Model = require('../models/model');
const RequestUtil = require('../util/request_util');
const Vasync = require('vasync');

const log = Bunyan.createLogger({ name : "polamikat:activity" });
const router = Express.Router();
const ActivityController = require('../controller/activity_controller');

var activityController = new ActivityController();

// get data activities by personil
router.post('/personil_activities', function(req, res) {
    var userID = req.body.user;
    if (!userID) {
        return res.fail("Invalid user.");
    }
    activityController.groupActivities(userID, function(err, results) {
        if (err)
            return res.fail(err);
        log.info("personil_activities ", results);
        res.success(results);
    });
});


// get personil rank table based on activities
router.post('/rank_personil', function(req, res) {
    activityController.rankActivities(function(err, results) {
        if (err)
            return res.fail(err);
        log.info("rank_personil ", results);
        res.success(results);
    });
});


module.exports = router;