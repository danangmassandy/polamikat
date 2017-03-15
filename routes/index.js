const Bunyan = require('bunyan');
var express = require('express');
var router = express.Router();
const RequestUtil = require('../util/request_util');

const log = Bunyan.createLogger({ name : "polamikat:index" });

/* GET home page. */
router.get('/', function (req, res) {
    var displayName = req.polamikatUser.displayName;
    if (!displayName || !displayName.length) {
        if (req.polamikatPersonilProfile)
            displayName = req.polamikatPersonilProfile.name;
    }
    res.render('index', {
        title: 'Polamikat',
        me: JSON.stringify({
            polamikatUser : req.polamikatUser,
            username: req.polamikatUser.username,
            displayName: displayName,
            isAdmin : req.isAdmin
        })
    });
});

/* GET template page. */
router.get('/tpl/:page', RequestUtil.authenticate, function (req, res) {
    res.render('tpl/' + req.params.page, {});
});

module.exports = router;