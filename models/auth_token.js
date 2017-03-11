var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AuthToken = new Schema({
    requestToken    : String,
    accessToken     : String,
    uuid            : String,
    cordova         : String,
    model           : String,
    platform        : String,
    version         : String,
    manufacturer    : String,
    isVirtual       : String,
    serial          : String,
    snsToken        : String,
    snsEndpoint     : String,
    snsHash         : String,
    web             : Boolean,
    lastActivity    : { type : Date, default : Date.now },
    user            : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt       : { type : Date, default : Date.now },
    updatedAt       : { type : Date, default : Date.now },
    creator         : { type : String, default : 'System' },
    updater         : { type : String, default : 'System' },
    status          : { type : String, default : 'active' }
});

AuthToken.index({ requestToken : 1 });
AuthToken.index({ accessToken  : 1 });
AuthToken.index({ uuid         : 1 });
AuthToken.index({ cordova      : 1 });
AuthToken.index({ model        : 1 });
AuthToken.index({ platform     : 1 });
AuthToken.index({ version      : 1 });
AuthToken.index({ manufacturer : 1 });
AuthToken.index({ isVirtual    : 1 });
AuthToken.index({ serial       : 1 });
AuthToken.index({ lastActivity : 1 });
AuthToken.index({ snsHash      : 1 })
AuthToken.index({ user         : 1 });
AuthToken.index({ createdAt    : 1 });
AuthToken.index({ updatedAt    : 1 });
AuthToken.index({ creator      : 1 });
AuthToken.index({ updater      : 1 });
AuthToken.index({ status       : 1 });

AuthToken.index({
    requestToken : 1,
    uuid         : 1,
    status       : 1
});

AuthToken.index({
    accessToken  : 1,
    uuid         : 1,
    status       : 1
});

module.exports = mongoose.model('AuthToken', AuthToken);