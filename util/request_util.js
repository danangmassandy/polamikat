const Bunyan = require('bunyan');
const Constants = require("../util/constants");
const Crypto = require('crypto');
const Model = require('../models/model');
const Randomstring = require('randomstring');
const Vasync = require('vasync');
const constant = require("../util/constants");
const log = Bunyan.createLogger({ name : "polamikat:request_util" });

module.exports = {
    authenticate : function(req, res, next) {
        var token = req.kauth.grant.access_token;
        // log.info("token ", token);
        Vasync.waterfall([
            function(callback) {//query for user
                if(!token) {//token not found
                    return callback("Token not found", null);
                }

                Model.User.findOne({
                    username : token.content.preferred_username,
                    status : {
                        $nin : 'inactive'
                    }
                }).populate('userPhoto').populate('personil').exec(callback);
            },
            function(user, callback) {//create user if null
                var isNewUser = false;
                if(!user) {//user is not in db
                    isNewUser = true;

                    var hash = Crypto.createHmac('sha256', token.content.sub + Randomstring.generate())
                        .update(new Date() + Randomstring.generate() + token.content.sub + token.content.preferred_username)
                        .digest('hex');

                    //insert user
                    user = new Model.User({
                        key : hash,
                        sub : token.content.sub,
                        status : 'active',
                        username: token.content.preferred_username,
                        displayName : token.content.name,    // token.content.name
                        email : token.content.email,
                        role : token.hasRole('PolamikatAdmin') ? Constants.ROLE_ADMIN : Constants.ROLE_USER
                    });
                } else {//user is in db update user
                    // user.displayName = token.content.name;
                    user.sub = token.content.sub;

                    if(user.status == 'pending' || user.status == 'new') {
                        var hash = Crypto.createHmac('sha256', token.content.sub + Randomstring.generate())
                            .update(new Date() + Randomstring.generate() + token.content.sub + token.content.preferred_username)
                            .digest('hex');

                        user.key = hash;
                        user.status = 'active';
                    }
                }

                user.save(function(err, user) {
                    if(err) {
                        return callback(err, null);
                    }

                    req.polamikatUser = user;
                    req.isAdmin = user.role == Constants.ROLE_ADMIN;
                    callback(null, {
                        isNewUser   : isNewUser, 
                        user        : user
                    });
                });
            }, function (data, callback) {
                if (data.user.personil) {
                    req.polamikatPersonilProfile = data.user.personil;
                    req.polamikatUser.personil = data.user.personil._id;
                    callback(null, data);
                } else {
                    if (data.isNewUser) {
                        // if isNewUser, check if there is personil record by email
                        Model.Personil.findOne({
                            email : data.user.email,
                            status : Constants.STATUS_ACTIVE
                        }).exec(function(err, personil) {
                            if (err)
                                return callback(err, null);

                            if (personil) {
                                req.polamikatPersonilProfile = personil;
                                if (personil.pangkat)
                                    data.user.displayName = personil.pangkat + " " + personil.name;
                                else
                                    data.user.displayName = personil.name;
                                data.user.personil = personil._id;
                                req.polamikatUser.personil = personil._id;
                                data.user.personilDataSetupAt = new Date();
                                data.user.save(function(err, user) {
                                    if (err)
                                        return callback(err, null);
                                    callback(null, data);
                                });
                            } else {
                                callback(null, data);
                            }
                        });
                    } else {
                        callback(null, data);
                    }
                }
            }
        ], function(err) {
            if(err) {
                log.info(err);
                return res.status(500);
            }

            next();
        });
    },
    checkAccessToken : function(req, res, next) {
        //log.info("ACCESS TOKEN", req.body);

        Vasync.waterfall([
            function(callback) {//query for AuthToken by Access Token
                var accessToken = req.body.accessToken || req.get('AccessToken');
                var uuid = (req.body.device && req.body.device.uuid) || req.get('DeviceUUID');

                if(!accessToken) {
                    res.status(403);
                    return res.send("Invalid Access Token");
                }

                if(!uuid) {
                    res.status(403);
                    return res.send("Invalid Mobile Device");
                }

                Model.AuthToken.findOne({
                    accessToken  : accessToken,
                    uuid         : uuid,
                    status       : 'active'
                }).populate({path: 'user', populate: {path: 'photo'}}).exec(function(err, authToken) {
                    //log.info("ACCESS TOKEN", err, authToken);
                    if(err) {
                        return callback(err, null);
                    }

                    if(!authToken) {
                        return callback("Invalid Access Token", null);
                    }

                    req.authToken = authToken;

                    // var dateDiff = new Date().getTime() - authToken.lastActivity.get();
                    // var time = 1000 * 60 * 60 * 24 * 30;
                    //
                    // if(dateDiff > time) {
                    //     return callback("Invalid Access Token", null);
                    // }

                    // authToken.lastActivity = new Date();
                    // authToken.save();

                    callback(null, authToken.user);
                });
            }
        ], function(err, user) {
            if(err) {
                if (err === "Invalid Access Token") {
                    res.status(403);
                } else {
                    res.status(500);
                }
                return res.send(err);
            }

            req.polamikatUser = user;
            next();
        });
    }
};
