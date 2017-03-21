const Bunyan = require('bunyan');
const Constants = require("../util/constants");
const Model = require('../models/model');
const Vasync = require('vasync');
const log = Bunyan.createLogger({ name: "polamikat:activity_controller" });
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const FS = require('fs');
const Path = require('path');

function ActivityController() {
    
}

// details
ActivityController.prototype.details = function details(activityId, callback) {
    Model.Activity.findOne({
        _id     : activityId
    }).populate({
        path    : 'category',
        select  : 'name value'
    }).populate({
        path    : 'personil',
        select  : 'name pangkat nrp wilayahPenugasan unit'
    }).populate({
        path    : 'photos',
        select  : 'description publicURL contentType type mimetype'
    }).exec(function(err, activity) {
        callback(err, activity);
    });
}

// add
ActivityController.prototype.addActivity = function addActivity(activity, userName, callback) {
    Vasync.waterfall([
        function(callback1) {
            Model.Personil.findOne({
                _id     : activity.personil,
                status  : Constants.STATUS_ACTIVE
            }).exec(function(err, personil) {
                if (err || !personil) {
                   log.error("Invalid personil ", err); 
                   return callback1("Invalid personil.")
                }
                callback1(null, personil);
            });
        }, function(personil, callback1) {
            Model.ActivityCategory.findOne({
                _id     : activity.category,
                status  : Constants.STATUS_ACTIVE
            }).exec(function(err, newCategory) {
                if (err || !newCategory) {
                    log.error("Invalid category to add activity : ", err);
                    return callback1("Invalid category.");
                }
                callback1(null, {
                    personil        : personil,
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

                        uploadedFile.type = Constants.UPLOADED_FILE_TYPE_ACTIVITY_IMAGE;
                        uploadedFile.description = inputPhoto.description;
                        uploadedFile.save(function(err, uploadedFile){
                            newActivityPhotos.push(uploadedFile._id);
                            callback2(null, null);
                        });
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
                personil        : data.personil,
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
                            FS.unlink(Path.join(BASE_DIR, photo.path), function (err) {
                                log.info("is photo removed ", err);
                                callback2(null, null);
                            });
                            // filesController.removePhoto(photo, function(err, res) {
                            //     log.info("is photo removed ", res, " ", err);
                            //     callback2(null, null);
                            // });
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
                        uploadedFile.type = Constants.UPLOADED_FILE_TYPE_ACTIVITY_IMAGE;
                        uploadedFile.description = inputPhoto.description;
                        uploadedFile.save(function(err, uploadedFile) {
                            data.newActivityPhotos.push(uploadedFile._id);
                            callback2(null, null);
                        });
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
ActivityController.prototype.groupActivities = function groupActivities(personil, callback) {
    log.info("personil ", personil);
    Model.Activity.aggregate([
        {
            $match : {
                personil    : personil._id,
                status      : Constants.STATUS_ACTIVE
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
                _id         : {
                    categoryID : "$category._id"
                },
                category        : { $first : "$category" },
                createdAt       : { $last : "$createdAt" },
                lastActivity    : { $last : "$startDate" },
                total           : { $sum : 1 },
                totalValue      : { $sum : "$category.value" }
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
                    personilID : "$personil._id"
                },
                personil : { $first : "$personil" },
                createdAt : { $last : "$createdAt" },
                total : { $sum : "$category.value" }
            }
        },
        {
            $sort : {
                total : -1,
                "personil.name" : 1
            }
        }
    ]).exec(function(err, results) {
        callback(err, results);
    });
}

ActivityController.prototype.listActivity = function listActivity(page, callback) {
    Vasync.waterfall([
        function(callback1) {
            Model.Activity.count({
                status : Constants.STATUS_ACTIVE
            }).exec(function(err, count) {
                callback1(err, count);
            });
        }, function(count, callback1) {
            var skip = page * Constants.PAGE_SIZE;
            Model.Activity.find({
                status : Constants.STATUS_ACTIVE
            }).populate('personil category')
            .sort({startDate : -1})
            // .skip(skip).limit(Constants.PAGE_SIZE)
            .exec(function(err, results) {
                callback1(err, {
                    count : count,
                    activities : results
                });
            });
        }
    ], function(err, result) {
        if (err)
            log.error("Error on list Activity ", err);
        callback(err, result);
    });
    
}

ActivityController.prototype.groupActivityCategories = function groupActivityCategories(callback) {
    Model.Activity.aggregate([
        {
            $match : { status : Constants.STATUS_ACTIVE }
        },
        {
            $sort : { startDate : -1 }
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
                _id : "$category._id",
                kegiatanTotal : { $sum : 1 },
                category : { $last : "$category" },
                lastActivity : { $first :"$startDate"  }
            }
        },
        {
            $sort : { "category.value" : -1 }
        }
    ]).exec(function(err, results) {
        callback(err, results);
    });
}

module.exports = ActivityController;