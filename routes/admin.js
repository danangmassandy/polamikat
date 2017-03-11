const Bunyan = require('bunyan');
const Express = require('express');
const Model = require('../models/model');
const Vasync = require('vasync');
const Constants = require("../util/constants");
const log = Bunyan.createLogger({name: "ucare-node:admin"});

const router = Express.Router();

router.get('/', function (req, res, next) {
    res.render('admin', {
        title: 'Admin',
        me: JSON.stringify({
            username: req.ucareUser.username,
            displayName: req.ucareUser.displayName
        }).replace(/"/g, "\\\"").replace(/\n/g, "\\")
    });
});

// add new personil

// update personil


module.exports = router;