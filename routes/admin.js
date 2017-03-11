const Bunyan = require('bunyan');
const Express = require('express');
const Model = require('../models/model');
const Vasync = require('vasync');
const Constants = require("../util/constants");
const log = Bunyan.createLogger({name: "polamikat:admin"});

const router = Express.Router();

router.get('/', function (req, res, next) {
    res.render('homepage', {
        title: 'Admin Index',
        me: JSON.stringify({
            username: req.polamikatUser.username,
            displayName: req.polamikatUser.name,
            isAdmin : true
        }).replace(/"/g, "\\\"").replace(/\n/g, "\\")
    });
});

// add new personil

// update personil


module.exports = router;