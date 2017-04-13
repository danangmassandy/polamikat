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
    if (req.polamikatPersonilProfile) {
        profileController.getPersonilInfo(req.polamikatPersonilProfile._id, function (err, results) {
            if (err)
                return res.fail(err);
            log.info("personil_list ", results);
            res.success({data:results});
        });
    } else {
        // user is created from external registration rather than create by Admin, not supported yet
        res.fail("No profile yet.");
    }
});

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
    if (!req.body.personil || !req.body.personil._id) {
        return res.fail("Invalid personil input data in request.");
    }
    
    if (JSON.stringify(req.body.personil._id) != JSON.stringify(req.polamikatUser.personil)) {
        if (!req.isAdmin) {
            return res.fail("Not authorized to update other personil info.");
        }
    } 
    profileController.updatePersonilInfo(req.body.personil, req.polamikatUser.username, function (err, results) {
        if (err)
            return res.fail(err);
        log.info("update_personil_info ", results);
        res.success({data:results});
    });
});

router.post("/create_or_update_personil", function(req, res) {
    if (!req.body.personil) {
        return res.fail("Invalid personil input data in request.");
    }

    if (req.body.personil._id) {
        // update
        if (JSON.stringify(req.body.personil._id) != JSON.stringify(req.polamikatUser.personil)) {
            if (!req.isAdmin) {
                return res.fail("Not authorized to update other personil info.");
            }
        }
        profileController.updatePersonilInfo(req.body.personil, req.polamikatUser.username, function (err, results) {
            if (err)
                return res.fail(err);
            log.info("update_personil_info ", results);
            res.success({data:results});
        });
    } else {
        // create
        // user is created from external registration rather than create by Admin, not supported yet
        res.fail("No profile yet. Currently not supported yet.");
    }

});

module.exports = router;
