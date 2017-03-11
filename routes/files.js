const Bunyan = require('bunyan');
const Constants = require("../util/constants");
const Express = require('express');
const KeyUtil = require('../util/key_util');
const Model = require('../models/model');
const RequestUtil = require('../util/request_util');
const Vasync = require('vasync');

const log = Bunyan.createLogger({ name: "polamikat:files" });

const router = Express.Router();

router.post('/protected/:uploadedFile', RequestUtil.authenticate, function(req, res) {
    
});

router.post('/public/:uploadedFile', function (req, res) {
    
});

// upload

module.exports = router;