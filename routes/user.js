const Bunyan = require('bunyan');
const Express = require('express');
const Model = require('../models/model');
const RequestUtil = require('../util/request_util');
const Vasync = require('vasync');

const log = Bunyan.createLogger({ name : "polamikat:user" });
const router = Express.Router();
const ProfileController = require('../controller/profile_controller');

var profileController = new ProfileController();

router.post("/personil_list", function(req, res) {
    profileController.personilListSummary(function (err, results) {
        if (err)
            return res.fail(err);
        log.info("personil_list ", results);
        res.success({data:results});
    });
});

router.post("/personil_list_all", function(req, res) {
    profileController.personilList(1, function (err, results) {
        if (err)
            return res.fail(err);
        log.info("personil_list ", results);
        res.success({data:results});
    });
});


router.post("/personil_detail", function(req, res) {
    profileController.getPersonilInfo(req.body.personilID, function (err, results) {
        if (err)
            return res.fail(err);
        log.info("personil_list ", results);
        res.success({data:results});
    });
});

router.post("/update_personil_info", function(req, res) {
    profileController.updatePersonilInfo(req.body.personil, req.polamikatUser.username, function (err, results) {
        if (err)
            return res.fail(err);
        log.info("update_personil_info ", results);
        res.success({data:results});
    });
});

module.exports = router;
