const Bunyan = require('bunyan');
var express = require('express');
var router = express.Router();
const RequestUtil = require('../util/request_util');

const log = Bunyan.createLogger({ name : "polamikat:index" });

/* GET home page. */
router.get('/', function (req, res) {
    res.render('homepage', {
        title: 'Index'
    });
});

/* GET template page. */
router.get('/tpl/:page', RequestUtil.authenticate, function (req, res) {
    res.render('tpl/' + req.params.page, {});
});

module.exports = router;