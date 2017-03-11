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
ActivityController.prototype.addActivity = function addActivity(activity, userName, callback) {
    Vasync.waterfall([
        function(callback1) {
            Model.User.findOne({
                key     : activity.user.key,
                status  : Constants.STATUS_ACTIVE
            }).exec(function(err, user) {
                if (err || !user) {
                   log.error("Invalid user ", err); 
                   return callback1("Invalid user.")
                }
                callback1(null, user);
            });
        }, function(user, callback1) {
            Model.ActivityCategory.findOne({
                _id     : activity.category,
                status  : Constants.STATUS_ACTIVE
            }).exec(function(err, newCategory) {
                if (err || newCategory) {
                    log.error("Invalid category to add activity : ", err);
                    return callback1("Invalid category.");
                }
                callback1(null, {
                    user            : user,
                    newCategory     : newCategory
                });
            });
        }, function(data, callback1) {
            var newActivityPhotos = [];
            Vasync.forEachPipeline({
                'func' : function (inputPhoto, callback2) {
                    Model.UploadedFile.findOne({
                        key     : inputPhoto.key,
                        status  : Constants.STATUS_ACTIVE
                    }).exec(function(err, uploadedFile) {
                        if (err || !uploadedFile) {
                            log.error("Error in finding UploadedFile ", inputPhoto.key," ", err);
                            return callback2(null, null);
                        }

                        newActivityPhotos.push(uploadedFile._id);
                        callback2(null, null);
                    });
                },
                'inputs' : activity.photos
            }, function(err, results) {
                if (err)
                    log.error("inserting new photos uploaded file error ", err);
                    data.newActivityPhotos = newActivityPhotos;
                callback1(null, data);
            });
        }, function (data, callback1) {
            var newActivity = new Model.Activity({
                category        : data.newCategory,
                user            : data.user,
                startDate       : activity.startDate,
                endDate         : activity.endDate,
                photos          : data.newActivityPhotos,
                notes           : activity.notes,
                creator         : userName
            });
            newActivity.save(function(err, newActivity) {
                callback1(err, newActivity);
            })
        }
    ], function(err, result) {
        if (err) {
            log.error("add activity error ", err);
            return callback(err);
        }

        callback(null, null);
    });
}

// update
ActivityController.prototype.updateActivity = function updateActivity(activity, userName, callback) {
    Vasync.waterfall([
        function(callback1) {
            Model.Activity.findOne({
                _id     : activity._id,
                status  : Constants.STATUS_ACTIVE
            }).populate('photos').exec(function(err, activityDoc) {
                if (err) {
                    return callback1(err);
                }
                
                if (!activityDoc)
                    return callback1("No activity found.");
                
                callback1(null, activityDoc);
            });
        }, function(activityDoc, callback1) {
            Model.ActivityCategory.findOne({
                _id     : activity.category,
                status  : Constants.STATUS_ACTIVE
            }).exec(function(err, newCategory) {
                if (err || newCategory) {
                    log.error("Invalid category to update activity : ", err);
                    return callback1("Invalid category.");
                }
                callback1(null, {
                    activityDoc     : activityDoc,
                    newCategory     : newCategory
                });
            });
        }, function(data, callback1) {
            var newActivityPhotos = [];
            Vasync.forEachPipeline({
                'func' : function (photo, callback2) {
                    var updatedPhoto = null;
                    for (var i = 0; i < activity.photos.length; ++i) {
                        if (photo.key == activity.photos[i].key) {
                            updatedPhoto = activity.photos[i];
                            break;
                        }
                    }

                    if (updatedPhoto) {
                        updatedPhoto.isExist = true;
                        photo.description = updatedPhoto.description;
                        photo.updatedAt = new Date();
                        photo.updater = userName;
                        photo.save(function(err, photo) {
                            newActivityPhotos.push(photo._id);
                            callback2(null, null);
                        });
                    } else {
                        // photo is removed
                        photo.status = Constants.STATUS_INACTIVE;
                        photo.updatedAt = new Date();
                        photo.updater = userName;
                        photo.save(function(err, photo) {
                            // remove from disk
                            filesController.removePhoto(photo, function(err, res) {
                                log.info("is photo removed ", res, " ", err);
                                callback2(null, null);
                            });
                        });
                    }
                },
                'inputs': data.activityDoc.photos
            }, function(err, results) {
                if (err)
                    log.error("updating activity photos error ", err);
                callback1(null, {
                    category            : data.newCategory,
                    activityDoc         : data.activityDoc,
                    newActivityPhotos   : newActivityPhotos
                });
            });
        }, function(data, callback1) {
            // iterate through input photos
            Vasync.forEachPipeline({
                'func' : function (inputPhoto, callback2) {
                    if (inputPhoto.isExist) {
                        return callback2(null, null);
                    }
                    Model.UploadedFile.findOne({
                        key     : inputPhoto.key,
                        status  : Constants.STATUS_ACTIVE
                    }).exec(function(err, uploadedFile) {
                        if (err || !uploadedFile) {
                            log.error("Error in finding UploadedFile ", inputPhoto.key," ", err);
                            return callback2(null, null);
                        }

                        data.newActivityPhotos.push(uploadedFile._id);
                        callback2(null, null);
                    });
                },
                'inputs' : activity.photos
            }, function(err, results) {
                if (err)
                    log.error("inserting new photos uploaded file error ", err);
                callback1(null, data);
            });
        }, function(data, callback1) {
            data.activityDoc.category = data.newCategory;
            data.activityDoc.startDate = activity.startDate;
            data.activityDoc.endDate = activity.endDate;
            data.activityDoc.notes = activity.notes;
            data.activityDoc.updatedAt = new Date();
            data.activityDoc.updater = userName;
            data.activityDoc.status = activity.status;
            data.activityDoc.photos = data.newActivityPhotos;
            data.activityDoc.save(function(err, activityDoc) {
                callback1(err, activityDoc);
            });
        }
    ], function(err, result) {
        if (err) {
            log.error("update activity error ", err);
            return callback(err);
        }

        callback(null, null);
    });
    
}

// delete
ActivityController.prototype.deleteActivities = function deleteActivities(activities, userName, callback) {
    Model.Activity.update(
        {
            _id         : { $in : activities },
            status      : Constants.STATUS_ACTIVE
        }, 
        {
            $set : {
                status          : Constants.STATUS_INACTIVE,
                updatedAt       : new Date(),
                updater         : userName
            }
        },
        {
            multi : true
        }).exec(function(err, res) {
            callback(err, res);
        });
}

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