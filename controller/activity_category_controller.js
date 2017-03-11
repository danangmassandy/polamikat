const Bunyan = require('bunyan');
const Constants = require("../util/constants");
const Model = require('../models/model');
const Vasync = require('vasync');
const log = Bunyan.createLogger({ name: "polamikat:activity_category_controller" });
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

function ActivityCategoryController() {
    
}

// add

// update

// delete


// get list category
ActivityCategoryController.prototype.list = function list(callback) {
    Model.ActivityCategory.find({
        status : Constants.STATUS_ACTIVE
    }).exec(function(err, results) {
        callback(err, results);
    });
}


module.exports = ActivityCategoryController;