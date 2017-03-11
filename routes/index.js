const Bunyan = require('bunyan');
var express = require('express');
var router = express.Router();

const log = Bunyan.createLogger({ name : "ucare-node:index" });

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {title: 'Express'});
});

/* GET template page. */
router.get('/tpl/:page', function (req, res) {
    res.render('tpl/' + req.params.page, {});
});

module.exports = router;