const Bunyan = require('bunyan');
const Express = require('express');
const Model = require('../models/model');
const Vasync = require('vasync');
var mime = require('mime-types');
const Path = require('path');
const FS = require('fs');
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
    profileController.deactivatePersonil(req.body.personilID, req.polamikatUser.username, function(err, result) {
        if (err) {
            res.fail(err);
        } else {
            res.success({
                data : result
            });
        }
    });
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

router.post('/db_backup_list', function(req, res) {
    var backupDir = Path.join(__dirname, '../backup');
    FS.access(backupDir, function(err) {
        if (err) {
            log.warn("Error access backupdir", err);
            FS.mkdirSync(backupDir);
        }

        FS.readdir(backupDir, function(err, items) {
            if (err) {
                log.error("Error readdir ", err);
                return res.fail("Error readdir ", err);
            }
            var filteredList = [];
            Vasync.forEachPipeline({
                'func' : function(file, callback) {
                    var matched = file.match(/dump[0-9]{8}\.tar/);
                    if (matched) {
                        FS.stat(Path.join(backupDir, file), function(err, stats) {
                            if (err)
                                return callback(err);
                            filteredList.push({
                                filename    : file,
                                size        : stats.size,
                                createdDate : stats.ctime
                            });
                            callback(null, null);
                        });
                    } else {
                        callback(null, null);
                    }
                },
                'inputs' : items
            }, function(err, result) {
                if (err) {
                    log.error("error getting file info ", err);
                    return res.fail("Error getting file info");
                }
                res.success({
                    data : filteredList
                });
            });
        });
    });
    
});

router.post('/db_backup_download', function(req, res) {
    var file = req.body.backup_file;
    if (!file) {
        log.error("no file in request in db_backup_download");
        return res.fail("No file in parameter request.");
    }
    
    var backupFile = Path.join(__dirname, '../backup', file);
    FS.stat(backupFile, function(err, stats) {
        if (err) {
            log.error("Error getting file", err);
            return res.fail("Invalid file.");
        }
        log.info("File requested : ", file);
        log.info("File stats size : ", stats.size);
        var contentType = mime.contentType(Path.extname(backupFile));
        log.info("Content Type : ", contentType);
        res.set('Content-Disposition', 'attachment;filename='+file);
        res.set('Content-Type', contentType);
        res.set('Content-Length', stats.size);
        var readStream = FS.createReadStream(backupFile);
        // We replaced all the event handlers with a simple call to readStream.pipe()
        readStream.pipe(res);
    });
});


module.exports = router;