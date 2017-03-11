const Bunyan = require('bunyan');
const Constants = require("../util/constants");
const Model = require('../models/model');
const Vasync = require('vasync');
const log = Bunyan.createLogger({ name: "polamikat:user_controller" });
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

function UserController() {
    
}



// update user info

// get user data pagination
UserController.prototype.list = function list(callback) {
    Model.User.find({
        status  : Constants.STATUS_ACTIVE,
        role    : Constants.ROLE_USER
    }).exec(function(err, results){
        callback(err, results);
    });
}


module.exports = UserController;

