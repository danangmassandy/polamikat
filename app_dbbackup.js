const FS = require('fs');
const Path = require('path');
const mongoose = require('mongoose');
const Moment = require('moment');
const Bunyan = require('bunyan');

const log = Bunyan.createLogger({ name: "polamikat:app", streams:[{path: Path.join(__dirname, 'dbbackup.log')}] });

var mode = process.env.MODE ? process.env.MODE : "local";

process.env.TZ = 'Asia/Jakarta';
//read properties.json
PROPERTIES = JSON.parse(FS.readFileSync('./resources/properties.json', 'utf8'))[mode];

var backup = require('mongodb-backup');

var backupDir = Path.join(__dirname, 'backup');

try {
  FS.accessSync(backupDir);
} catch (e) {
  log.warn("backup dir doesnot exist yet, creating...");
  FS.mkdirSync(backupDir);
}

var todayDateStr = Moment().format("YYYYMMDD");
var backupFileName = 'dump'+todayDateStr+'.tar';
log.info("Starting backup");
backup({
  uri: PROPERTIES.mongodb, 
  root: backupDir, // write files into this dir
  tar: backupFileName, // save backup into this tar file
  callback: function(err) {
    if (err) {
      log.error(err);
    } else {
      log.info('Finish backup to ', backupFileName);
      // check dir backup
      FS.readdir(backupDir, function(err, items) {
        if (items.length > 10) {
          var checkTime = Moment();
          var oldest = checkTime;
          for (var i = 0; i < items.length; ++i) {
            var matched = items[i].match(/[0-9]{8}/);
            if (matched) {
              var m = Moment(matched[0],"YYYYMMDD");
              if (m < oldest) {
                oldest = m;
              }
            }
          }
          if (checkTime != oldest) {
            log.info("oldest ", oldest.format("YYYYMMDD"));
            FS.unlink(Path.join(backupDir, 'dump'+oldest.format("YYYYMMDD")+'.tar'), function(err) {
              if (err) {
                log.error("unlink error ", err);
              } else {
                log.info("Oldest file deleted.");
              }
            });
          } else {
            log.info("no oldest is found");
          }
        }
      });
    }
  }
});