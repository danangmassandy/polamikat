const Bunyan = require('bunyan');
const Express = require('express');
const Model = require('../models/model');
const RequestUtil = require('../util/request_util');
const Vasync = require('vasync');

const log = Bunyan.createLogger({ name : "polamikat:activity" });
const router = Express.Router();
const ActivityController = require('../controller/activity_controller');
const ActivityCategoryController  = require('../controller/activity_category_controller');
const ProfileController = require('../controller/profile_controller');

var activityController = new ActivityController();
var actCategoryController = new ActivityCategoryController();
var profileController = new ProfileController();

// get data activities by personil
router.post('/personil_activities', function(req, res) {
    var personilID = req.body.personil;
    if (!personilID) {
        return res.fail("Invalid personil.");
    }
    Vasync.waterfall([
        function(callback) {
            Model.Personil.findOne({
                _id : personilID
            }).exec(function(err, personil) {
                if (err)
                    return callback(err);
                if (!personil)
                    return callback('Invalid personil.');
                callback(null, personil);
            });
        }, function(personil, callback) {
            activityController.groupActivities(personil, callback);
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
            profileController.personilListSummary(function(err, results) {
                callback(null, {
                    categories : categories,
                    personils : results
                });
            });
        }, function(data, callback) {
            log.info("personils ", data.personils);
            Vasync.forEachParallel({
                    'func' : function(personil, callback1) {
                        var randActivitiesCreate = getRandomInt(5,20);
                        for (var i = 0; i < randActivitiesCreate; ++i) {
                            var category = data.categories[Math.floor(Math.random() * data.categories.length)];
                            var newActivity = new Model.Activity({
                                category : category,
                                personil : personil._id,
                                startDate : new Date()
                            });
                            newActivity.save();
                        }
                        callback1(null, null);
                    },
                    'inputs' : data.personils
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

router.post('/add', function(req, res) {

});

router.post('/update', function(req, res) {

});

router.post('/delete', function(req, res) {

});

router.post('/detail', function(req, res) {

});

router.post('/list', function(req, res) {

});

router.post('/list_category', function(req, res) {

});


module.exports = router;