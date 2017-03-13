const Bunyan = require('bunyan');
const Express = require('express');
const Model = require('../models/model');
const RequestUtil = require('../util/request_util');
const Vasync = require('vasync');

const log = Bunyan.createLogger({ name : "polamikat:user" });
const router = Express.Router();
const ProfileController = require('../controller/profile_controller');

var profileController = new ProfileController();

router.post("/me", function(req, res) {

    // res.success({
    //     data : {
    //         me: {
    //             username : req.ucareUser.username,
    //             displayName : req.ucareUser.displayName,
    //             key : req.ucareUser.key,
    //             version : req.ucareUser.__v
    //         }
    //     }
    // });

});

// router.post("/update", update_profile);


router.post("/personil_list", function(req, res) {
    profileController.personilListSummary(function (err, results) {
        if (err)
            return res.fail(err);
        log.info("personil_list ", results);
        res.success({data:results});
    });
});

router.post("/personil_list_all", function(req, res) {
    
});

module.exports = router;
