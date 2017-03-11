const ProfileController = require("../controller/profile_controller.js");
const Bunyan = require('bunyan');
const Express = require('express');
const Model = require('../models/model');
const RequestUtil = require('../util/request_util');
const Vasync = require('vasync');

const log = Bunyan.createLogger({ name : "ucare-node:me" });
const router = Express.Router();

var profileController = new ProfileController();

const update_profile = function (req, res) {
    log.info("Request for /profile/update: ", req.body);
    
    var updateUser = req.body.updateUser;
    updateUser.key = req.ucareUser.key;

    profileController.updateProfile(updateUser, function (error, result) {
        if (error)
            log.error("Error in updating profile: ", error);

        if (error) {
            res.fail(error);
        }
        else{
            res.success({
                data : result
            });
        }

    });
};

router.post("/", function(req, res) {

    res.success({
        data : {
            me: {
                username : req.ucareUser.username,
                displayName : req.ucareUser.displayName,
                key : req.ucareUser.key,
                version : req.ucareUser.__v
            }
        }
    });

});

router.post("/update", update_profile);

module.exports = router;
