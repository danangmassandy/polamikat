const Bunyan = require('bunyan');
const Express = require('express');
const Model = require('../models/model');
const Vasync = require('vasync');
const Constants = require("../util/constants");
const log = Bunyan.createLogger({name: "polamikat:admin"});

const router = Express.Router();

// router.get('/', function (req, res, next) {
//     res.render('homepage', {
//         title: 'Admin Index',
//         me: JSON.stringify({
//             username: req.polamikatUser.username,
//             displayName: req.polamikatUser.name,
//             isAdmin : true
//         }).replace(/"/g, "\\\"").replace(/\n/g, "\\")
//     });
// });

// add new personil
router.post('/add_personil', function(req, res) {

});

// delete personil
router.post('/delete_personil', function(req, res) {

});

// user list
router.post('/user_list', function(req, res) {

});

// add new category
router.post('/add_category', function(req, res) {

});

// update category
router.post('/update_category', function(req, res) {

});

// delete category
router.post('/delete_category', function(req, res) {
    
});

module.exports = router;