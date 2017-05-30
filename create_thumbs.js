const FS = require('fs');
const Path = require('path');
const mongoose = require('mongoose');
const Moment = require('moment');
const Bunyan = require('bunyan');
const Vasync = require('vasync');
var easyimg = require('easyimage');
const Model = require('./models/model');
const Constants = require("./util/constants");

const log = Bunyan.createLogger({ name: "polamikat:app", streams:[{path: Path.join(__dirname, 'thumbs.log')}] });

var mode = process.env.MODE ? process.env.MODE : "local";

process.env.TZ = 'Asia/Jakarta';
//read properties.json
PROPERTIES = JSON.parse(FS.readFileSync(Path.join(__dirname, 'resources/properties.json'), 'utf8'))[mode];

mongoose.connect(PROPERTIES.mongodb); //connect to mongodb
mongoose.Promise = global.Promise;


Vasync.waterfall([
    (callback) => {
        Model.UploadedFile.find({
            status : Constants.STATUS_ACTIVE
        }).exec(function(err, uploadedFiles) {
            log.info("file count: ", uploadedFiles.length);
            callback(err, uploadedFiles);
        });
    }, (uploadedFiles, callback) => {
        var totalConverted = 0;
        Vasync.forEachPipeline({
            'func' : (uploadedFile, callback) => {
                if (!uploadedFile.path)
                    return callback(null, null);
                FS.exists(uploadedFile.path, function(exists) {
                    if (exists) {
                        easyimg.info(uploadedFile.path).then(function(file) {
                            var thumbnailPath = Path.join(__dirname, 'uploads/private/thumb');
                            thumbnailPath = Path.join(thumbnailPath, uploadedFile.id+"_thumb");
                            easyimg.thumbnail({
                                src:uploadedFile.path, dst: thumbnailPath,
                                width:200, height: (file.height/file.width) * 200,
                                x:0, y:0
                            }).then(function(file) {
                                totalConverted += 1;
                                uploadedFile.thumbnailPath = thumbnailPath;
                                uploadedFile.thumbnailURL = "/files/protected/thumb/"+uploadedFile.id;
                                uploadedFile.updatedAt = new Date();
                                uploadedFile.save(function(err, uploadedFile) {
                                    if (err) {
                                        log.error("Error saving uploaded file ", err);
                                    }
                                    
                                    callback(null, null);
                                });
                            }, function(err) {
                                log.error("error converting: ", err);
                                callback(null, null);
                            });
                        }, function(err) {
                            log.error("cannot get image info: ", err);
                            callback(null, null);
                        });                        
                    } else {
                        callback(null, null);
                    }
                });
            },
            'inputs' : uploadedFiles
        }, (err, results) => {
            log.info("total converted: ", totalConverted);
            callback(err, null);
        });
    }
], (err, result) => {
    log.info("Processing done.");
    if (err) {
        process.exit(1);
    } else {
        process.exit();
    }
});