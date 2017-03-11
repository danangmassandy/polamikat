const Bunyan = require('bunyan');
const Express = require('express');
const Model = require('../models/model');
const RequestUtil = require('../util/request_util');
const Vasync = require('vasync');

const log = Bunyan.createLogger({ name : "polamikat:activity" });
const router = Express.Router();
const ActivityController = require('../controller/activity_controller');
const ActivityCategoryController  = require('../controller/activity_category_controller');
const UserController = require('../controller/user_controller');

var activityController = new ActivityController();
var actCategoryController = new ActivityCategoryController();
var userController = new UserController();

// get data activities by personil
router.post('/personil_activities', function(req, res) {
    var userID = req.body.user;
    if (!userID) {
        return res.fail("Invalid user.");
    }
    Vasync.waterfall([
        function(callback) {
            Model.User.findOne({
                _id : userID
            }).exec(function(err, user) {
                if (err)
                    return callback(err);
                if (!user)
                    return callback('Invalid user.');
                callback(null, user);
            });
        }, function(user, callback) {
            activityController.groupActivities(user, callback);
        }
    ], function(err, result) {
        if (err)
            return res.fail(err);
        log.info("personil_activities ", result);
        res.success({data:result});
    });
    
});


// get personil rank table based on activities
router.post('/rank_personil', function(req, res) {
    activityController.rankActivities(function(err, results) {
        if (err)
            return res.fail(err);
        log.info("rank_personil ", results);
        res.success({data:results});
    });
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

router.post('/random_activities', function(req, res) {
    Vasync.waterfall([
        function(callback) {
            actCategoryController.list(callback);
        }, function(categories, callback) {
            log.info("categories ", categories);
            userController.list(function(err, results) {
                callback(null, {
                    categories : categories,
                    users : results
                });
            });
        }, function(data, callback) {
            log.info("users ", data.users);
            Vasync.forEachParallel({
                    'func' : function(user, callback1) {
                        var randActivitiesCreate = getRandomInt(5,20);
                        for (var i = 0; i < randActivitiesCreate; ++i) {
                            var category = data.categories[Math.floor(Math.random() * data.categories.length)];
                            var newActivity = new Model.Activity({
                                category : category,
                                user : user,
                                startDate : new Date()
                            });
                            newActivity.save();
                        }
                        callback1(null, null);
                    },
                    'inputs' : data.users
                }, function(error, result) {
                    if (error)
                        log.error("error random_activities ", error);
                    callback(null, null);
                });
        }
    ], function(err, results) {
        res.success();
    })
});

module.exports = router;