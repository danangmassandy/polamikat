const Bunyan = require('bunyan');
var express = require('express');
var router = express.Router();
const RequestUtil = require('../util/request_util');

const log = Bunyan.createLogger({ name : "polamikat:a" });

router.get('/', function (req, res) {
    res.render('index', {
        title: 'Polamikat',
        me: JSON.stringify({
            username: req.polamikatUser.username,
            displayName: req.polamikatUser.name,
            isAdmin : false
        })
    });
});


module.exports = router;