const Bunyan = require('bunyan');
const Constants = require("../util/constants");
const Model = require('../models/model');
const Vasync = require('vasync');
const log = Bunyan.createLogger({ name: "polamikat:activity_controller" });
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

function ActivityController() {
    
}

// add

// update

// delete

// get activity group by category based on user
ActivityController.prototype.groupActivities = function groupActivities(user, callback) {
    log.info("user ", user);
    Model.Activity.aggregate([
        {
            $match : {
                user    : user._id,
                status  : Constants.STATUS_ACTIVE
            }
        },
        {
            $lookup : {
                from : "activitycategories",
                localField : "category",
                foreignField : "_id",
                as: "category"
            }
        },
        {
            $unwind : "$category"
        },
        {
            $group : {
                _id : {
                    categoryID : "$category._id"
                },
                category : { $first : "$category" },
                createdAt : { $last : "$createdAt" },
                total : { $sum : 1 }
            }
        },
        {
            $sort : {
                total : -1
            }
        }
    ]).exec(function(err, results) {
        callback(err, results);
    });
}

// get user rank based on user activity total value
ActivityController.prototype.rankActivities = function rankActivities(callback) {
    Model.Activity.aggregate([
        {
            $match : {
                status : Constants.STATUS_ACTIVE
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "user",
                foreignField : "_id",
                as: "user"
            }
        },
        {
            $unwind : "$user"
        },  
        {
            $lookup : {
                from : "activitycategories",
                localField : "category",
                foreignField : "_id",
                as: "category"
            }
        },
        {
            $unwind : "$category"
        },
        {
            $group : {
                _id : {
                    userID : "$user._id"
                },
                user : { $first : "$user" },
                createdAt : { $last : "$createdAt" },
                total : { $sum : "$category.value" }
            }
        },
        {
            $sort : {
                total : -1,
                "user.name" : 1
            }
        }
    ]).exec(function(err, results) {
        callback(err, results);
    });
}

module.exports = ActivityController;