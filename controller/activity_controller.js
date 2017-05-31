const Bunyan = require('bunyan');
const Constants = require("../util/constants");
const Model = require('../models/model');
const Vasync = require('vasync');
const log = Bunyan.createLogger({ name: "polamikat:activity_controller" });
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const FileController = require('../controller/file_controller');

var fileCtrl = new FileController();

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
        select  : 'key description publicURL contentType type mimetype thumbnailURL'
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
            if (!activity.photos || activity.photos.length == 0)
                return callback1(null, data);
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
                if (err || !newCategory) {
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
            if (!data.activityDoc.photos || data.activityDoc.photos.length == 0) {
                data.newActivityPhotos = [];
                return callback1(null, data);
            }
                
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
                        fileCtrl.checkAndDeleteUploadedFile(photo, userName, function(err, res) {
                            callback2(null, null);
                        });
                    }
                },
                'inputs': data.activityDoc.photos
            }, function(err, results) {
                if (err)
                    log.error("updating activity photos error ", err);
                callback1(null, {
                    newCategory            : data.newCategory,
                    activityDoc         : data.activityDoc,
                    newActivityPhotos   : newActivityPhotos
                });
            });
        }, function(data, callback1) {
            if (!activity.photos || activity.photos.length == 0) {
                return callback1(null, data);
            }
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
    Vasync.waterfall([
        function(callback1) {
            Model.Activity.find({
                _id         : { $in : activities },
                status      : Constants.STATUS_ACTIVE
            })
            .select('photos')
            .exec(function(err, activities) {
                if (err) {
                    log.error("error getting activities ", err);
                    return callback1(err, null);
                }
                if (!activities || activities.length == 0) {
                    log.error("error no activities is found.");
                    return callback1("No activities is found.",null);
                }
                callback1(null, activities);
            });
        }, function(activities, callback1) {
            var photos = [];
            for (var i = 0; i < activities.length; ++i) {
                if (activities[i].photos && activities[i].photos.length) {
                    photos = photos.concat(activities[i].photos);
                }
            }
            if (photos.length) {
                Vasync.forEachPipeline({
                    'func' : function (photoId, callback2) {
                        fileCtrl.checkAndDeleteUploadedFileById(photoId, userName, callback2);
                    },
                    'inputs' : photos
                }, function(err, res) {
                    if (err)
                        log.error("error deleting activity uploaded files ", err);
                    callback1(null, null);
                });
            } else {
                callback1(null, null);
            }
        }, function(data, callback1) {
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
                callback1(err, res);
            });
        }
    ], function(err, result) {
        if (err) {
            log.error("Error deleting activities ", err);
        }
        callback(err, result);
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

ActivityController.prototype.listActivity = function listActivity(page, itemsPerPage, sort, sortReverse, callback) {
    Vasync.waterfall([
        function(callback1) {
            Model.Activity.count({
                status : Constants.STATUS_ACTIVE
            }).exec(function(err, count) {
                callback1(err, count);
            });
        }, function(count, callback1) {
            var skip = (page - 1) * itemsPerPage;
            var sortArg = {};
            if (sort) {
               sortArg[sort] = sortReverse ? -1 : 1; 
            } else {
                sortArg = {
                    startDate : -1
                }
            }

            Model.Activity.aggregate([
                {
                    $match : { status : Constants.STATUS_ACTIVE }
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
                    $unwind: "$personil"
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
                    $unwind: "$category"
                },
                {
                    $sort : sortArg
                },
                {
                    $skip : skip
                },
                {
                    $limit : itemsPerPage
                }
            ]).exec(function(err, results) {
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
            $sort : { "kegiatanTotal" : -1 }
        }
    ]).exec(function(err, results) {
        callback(err, results);
    });
}

ActivityController.prototype.getPhotos = function getPhotos(pageNumber, itemsPerPage, callback) {
    Vasync.waterfall([
        function (callback1) {
            // count total result
            Model.Activity.aggregate([
                {
                    $match : { 
                        status : Constants.STATUS_ACTIVE,
                        photos : { $ne : null }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $size:"$photos" } }
                    }
                }
            ]).exec(function(err, results) {
                if (err) {
                    log.error("error on obtaining activity photos count ", err);
                    return callback1(err);
                }
                log.info("Total activity photos ", results[0].total);
                callback1(null, results[0].total);
            });
        }, function(totalResult, callback1) {
            if (totalResult == 0) {
                return callback1(null, {
                    photos : [],
                    count: totalResult
                });
            }
            var aggregatePipes = [
                {
                    $match : { 
                        status : Constants.STATUS_ACTIVE,
                        photos : { $ne : null }
                    }
                },
                {
                    $unwind : "$photos"
                },
                {
                    $lookup : {
                        from : "uploadedfiles",
                        localField : "photos",
                        foreignField : "_id",
                        as : "photos"
                    }
                },
                {
                    $unwind : "$photos"
                },
                {
                    $project : {
                        _id : 0,
                        key : "$photos.key",
                        description : "$photos.description",
                        publicURL : "$photos.publicURL",
                        createdAt : "$photos.createdAt",
                        thumbnailURL  : "$photos.thumbnailURL"
                    }
                },
                {
                    $sort : { createdAt : -1 }
                }
            ];
            // if itemsPerPage is 0, then use no limit and ignore pageNumber to get all items
            if (itemsPerPage != 0) {
                aggregatePipes.push({
                    $skip : itemsPerPage * (pageNumber - 1)
                });
                aggregatePipes.push({
                    $limit : itemsPerPage
                });
            }
            Model.Activity.aggregate(aggregatePipes).exec(function(err, results) {
                callback1(err, {
                    photos: results,
                    count: totalResult
                });
            });
        }
    ], function(err, result) {
        callback(err, result);
    });
    

    
}

module.exports = ActivityController;