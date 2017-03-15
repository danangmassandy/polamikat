const Bunyan = require('bunyan');
const Express = require('express');
const Model = require('../models/model');
const Vasync = require('vasync');
const Constants = require("../util/constants");
const log = Bunyan.createLogger({name: "polamikat:admin"});
const ProfileController = require('../controller/profile_controller');
const ActivityCategoryController = require('../controller/activity_category_controller');

const router = Express.Router();

var profileController = new ProfileController();
var activityCategoryController = new ActivityCategoryController();

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
    profileController.addPersonil(req.body.personil, 
        req.body.createLoginInfo, req.polamikatUser.username, function(err, result) {
            if (err) {
                res.fail(err);
            } else {
                res.success({
                    data : result
                });
            }
        });
});

// delete personil
router.post('/delete_personil', function(req, res) {

});

// user list
router.post('/user_list', function(req, res) {

});

// add new category
router.post('/add_category', function(req, res) {
    activityCategoryController.update(req.body.category, true, req.polamikatUser.username, function(err, result) {
        if (err) {
            res.fail(err);
        } else {
            res.success({
                data : result
            });
        }
    });
});

// update category
router.post('/update_category', function(req, res) {
    activityCategoryController.update(req.body.category, false, req.polamikatUser.username, function(err, result) {
        if (err) {
            res.fail(err);
        } else {
            res.success({
                data : result
            });
        }
    });
});

// delete category
router.post('/delete_category', function(req, res) {
    
});

module.exports = router;