const Bunyan = require('bunyan');
const Constants = require("../util/constants");
const Model = require('../models/model');
const Vasync = require('vasync');
const log = Bunyan.createLogger({ name: "polamikat:activity_category_controller" });
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

function ActivityCategoryController() {
    
}

// add - update - delete
ActivityCategoryController.prototype.update = function update(category, isAdd, userName, callback) {
    Model.ActivityCategory.findOne({
        name : category.name,
        status : Constants.STATUS_ACTIVE
    }).exec(function(err, activityCategory) {
        if (err) {
            log.error("query update err ", err);
            return callback(err);
        }

        if (!activityCategory) {
            var newActivityCategory = new Model.ActivityCategory({
                name    : category.name,
                value   : category.value,
                creator : userName
            });

            newActivityCategory.save(function(err, newActivityCategory) {
                callback(err, newActivityCategory);
            });
        } else if (!isAdd) {
            Vasync.waterfall([
                function(cb) {
                    activityCategory.value = category.value;
                    activityCategory.updatedAt = new Date();
                    activityCategory.updater = userName;
                    activityCategory.status = category.status;
                    activityCategory.save(function(err, activityCategory) {
                        cb(null, activityCategory);
                    });
                }, function(activityCategory, cb) {
                    if (category.status != Constants.STATUS_INACTIVE)
                        return cb(null, activityCategory);
                    Model.Activity.update({
                        category : activityCategory._id,
                        status : Constants.STATUS_ACTIVE
                    },
                    {
                        $set : {
                            status : category.status,
                            updatedAt : new Date(),
                            updater : userName
                        }
                    },
                    {
                        multi : true
                    }).exec(function(err, results1) {
                        cb(err, activityCategory);
                    });
                }
            ], function(err, activityCategory) {
                callback(err, activityCategory);
            });
        } else {
            callback("Category Activity already exists.");
        }
    });
}

// get list category
ActivityCategoryController.prototype.list = function list(callback) {
    Model.ActivityCategory.find({
        status : Constants.STATUS_ACTIVE
    }).exec(function(err, results) {
        callback(err, results);
    });
}


module.exports = ActivityCategoryController;