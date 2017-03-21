const Bunyan = require('bunyan');
const Constants = require("../util/constants");
const Model = require('../models/model');
const Crypto = require('crypto');
const Vasync = require('vasync');
const log = Bunyan.createLogger({ name: "polamikat:profile_controller" });
const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const Randomstring = require('randomstring');
var request = require('request');

const keycloakAccessTokenKey = "KEYCLOAK-ACCESS-TOKEN";

function ProfileController() {
    
}

var requestKeycloakAccessToken = function(callback) {
    request.post({
        url:PROPERTIES.keycloak.restConfig.authURL, 
        form : {
            grant_type      : 'client_credentials',
            client_id       : PROPERTIES.keycloak.restConfig.clientID,
            client_secret   : PROPERTIES.keycloak.restConfig.clientSecret
        }
    }, function(err,httpResponse,body){
        if (err) {
            return callback(err);
        }
        var jsonBody = JSON.parse(body);
        log.info("AUTH Response ", jsonBody);
        if (!jsonBody.access_token && !jsonBody.expires_in) {
            return callback("Invalid format for keycloak body response");
        }
        
        var accessToken = jsonBody.access_token;
        REDIS_CLIENT.SET(keycloakAccessTokenKey, accessToken, function(err, reply) {
            // set ttl
            REDIS_CLIENT.EXPIRE(keycloakAccessTokenKey, jsonBody.expires_in - 25, function(err, reply) {
                callback(null, {accessToken});
            });
        });
    });
}

var createKeycloakUser = function(username, email, name, pwd, callback) {
    Vasync.waterfall([
        (callback) => {
            REDIS_CLIENT.GET(keycloakAccessTokenKey, function(err, accessToken) {
                callback(null, {accessToken});
            });
        }, ({accessToken}, callback) => {
            if (accessToken) {
                log.info("accessToken kc exists ", accessToken);
                callback(null, {accessToken});
            } else {
                requestKeycloakAccessToken(callback);
            }
        }, ({accessToken}, callback) => {
            // create user in keycloak
            var firstname = name.split(' ').slice(0, -1).join(' ');
            var lastname = name.split(' ').slice(-1).join(' ');
            request.post({
                url : PROPERTIES.keycloak.restConfig.restURL, 
                headers: {
                    'Authorization': 'bearer ' + accessToken
                },
                json : {
                    username : username,
                    email : email,
                    firstName : firstname,
                    lastName : lastname,
                    enabled : true,
                    emailVerified : true
                }
            }, function(err,httpResponse,body){
                if (err)
                    return callback(err);
                
                if (body && body.errorMessage) {
                    return callback("Create user in keycloak error because " + body.errorMessage);
                }
                var keycloakUserURL = httpResponse.headers.location;
                callback(null, {accessToken, keycloakUserURL}); 
            });
        }, ({accessToken, keycloakUserURL}, callback) => {
            // set temporary password for the user
            request.put({
                url : keycloakUserURL + "/reset-password",
                headers: {
                    'Authorization': 'bearer ' + accessToken
                },
                json : {
                    type : "password",
                    temporary : true,
                    value : pwd
                }
            }, function(err,httpResponse,body){
                if (err)
                    return callback(err);
                
                if (body && body.errorMessage) {
                    return callback("Set user temporary password in keycloak error because " + body.errorMessage);
                }
                callback(null, {accessToken, keycloakUserURL}); 
            });
        }, ({accessToken, keycloakUserURL}, callback) => {
            // set user role for client role
            request.post({
                url : keycloakUserURL + "/role-mappings/clients/" + PROPERTIES.keycloak.restConfig.polamikatClientID,
                headers: {
                    'Authorization': 'bearer ' + accessToken
                },
                json : [
                    {
                        id: PROPERTIES.keycloak.restConfig.polamikatUserRoleID,
                        name: PROPERTIES.keycloak.restConfig.polamikatUserRoleName,
                        scopeParamRequired: false,
                        composite: false,
                        clientRole: true,
                        containerId: PROPERTIES.keycloak.restConfig.polamikatClientID
                    }
                ]
            }, function(err,httpResponse,body){
                if (err)
                    return callback(err);
                
                if (body && body.errorMessage) {
                    return callback("Set user role in keycloak error because " + body.errorMessage);
                }
                callback(null, { status : "Ok"}); 
            });
        }
    ], function(err, result) {
        if (err)
            log.error("error in creating user in keycloak ", err);
        callback(err, result);
    });
}

var deleteKeycloakUser = function(sub, callback) {
    Vasync.waterfall([
        (callback) => {
            REDIS_CLIENT.GET(keycloakAccessTokenKey, function(err, accessToken) {
                callback(null, {accessToken});
            });
        }, ({accessToken}, callback) => {
            if (accessToken) {
                log.info("accessToken kc exists ", accessToken);
                callback(null, {accessToken});
            } else {
                requestKeycloakAccessToken(callback);
            }
        }, ({accessToken}, callback) => {
            request.delete({
                url : PROPERTIES.keycloak.restConfig.restURL+"/"+sub,
                headers: {
                    'Authorization': 'bearer ' + accessToken
                }
            }, function(err,httpResponse,body){
                if (err)
                    return callback(err);
                
                if (body && body.errorMessage) {
                    return callback("delete user in keycloak error because " + body.errorMessage);
                }
                callback(null, { status : "Ok" }); 
            });
        }
    ], function(err, result) {
        if (err)
            log.error("error in delete user in keycloak ", err);
        callback(err, result);
    });
}

// add user & personil
ProfileController.prototype.addPersonil = function addPersonil(personil, createLoginInfo, userName, callback) {
    Vasync.waterfall([
        function(callback1) {
            if (!personil.photo || !personil.photo.key) {
                return callback1(null, {});
            }
            Model.UploadedFile.findOne({
                key : personil.photo.key,
                status : Constants.STATUS_ACTIVE
            }).exec(function(err, photo){
                if (err || !photo) {
                    log.error("Photo not found.");
                    return callback1(null, {});
                }
                return callback1(null, {
                    photo : photo
                })
            });
        }, function (data, callback1) {
            var newPersonil = new Model.Personil(personil);
            if (data.photo)
                newPersonil.photo = data.photo._id;
            newPersonil.creator = userName;
            newPersonil.save(function(err, newPersonil) {
                if (err)
                    return callback1(err);
                data.personil = newPersonil;
                callback1(null, data);
            });
        }, function(data, callback1) {
            if (createLoginInfo) {
                createKeycloakUser(createLoginInfo.username, 
                    createLoginInfo.email, data.personil.name, 
                    createLoginInfo.password, 
                    function (err, keycloakUser) {
                        if (err)
                            return callback1(err, data);
                        var hash = Crypto.createHmac('sha256', keycloakUser.sub + Randomstring.generate())
                            .update(new Date() + Randomstring.generate() + keycloakUser.sub + createLoginInfo.username)
                            .digest('hex');
                        var newUser = new Model.User({
                            key         : hash,
                            username    : createLoginInfo.username,
                            displayName : data.personil.name,
                            sub         : keycloakUser.sub,
                            email       : createLoginInfo.email,
                            role        : createLoginInfo.role,
                            creator     : userName,
                            personil    : data.personil._id,
                            personilDataSetupAt : new Date()
                        });
                        if (data.personil.photo)
                            newUser.userPhoto = data.personil.photo;
                        newUser.save(function(err, newUser) {
                            if (err)
                                return callback1(err, data);
                            data.user = newUser;
                            callback1(null, data);
                        });
                    });
            } else {
                callback1(null, data);
            }
        }
    ], function(err, result) {
        if (err)
            log.error("Error on addPersonil ", err);
        callback(err, result);
    });
}

// get user & personil info
ProfileController.prototype.getPersonilInfo = function getPersonilInfo(personilID, callback) {
    Vasync.waterfall([
        function(callback1) {
            Model.Personil.findOne({
                _id : personilID,
                status : { $in : [Constants.STATUS_ACTIVE] }
            }).populate({
                path : 'photo',
                select : 'key publicURL'
            })
            .exec(function(err, personil) {
                if (err) {
                    log.error("error get Personil ", err);
                    return callback1(err);
                }
                if (!personil) {
                    log.error("personil not found");
                    return callback1("personil not found");
                }
                callback1(null, {
                    personil : personil
                });
            });
        }, function(data, callback1) {
            Model.User.findOne({
                personil : data.personil._id,
                status  : Constants.STATUS_ACTIVE
            }).exec(function(err, user) {
                if (err || !user) {
                    return callback1(null, data);
                }
                data.user = user;
                callback1(null, data);
            });
        }
    ],function(err, result) {
        callback(err, result);
    });
    
}

ProfileController.prototype.deactivatePersonil = function deactivatePersonil(personilID, userName, callback) {
    var disableKeycloakLogin = false;
    Vasync.waterfall([
        function(callback1) {
            Model.Personil.findOne({
                _id : personilID,
                status : Constants.STATUS_ACTIVE
            }).exec(function(err, personil) {
                if (err)
                    return callback1(err);
                if (!personil)
                    return callback1("Invalid personil.");
                callback1(null, {personil : personil});
            });
        }, function(data, callback1) {
            data.personil.status = Constants.STATUS_INACTIVE;
            data.personil.updatedAt = new Date();
            data.personil.updater = userName;
            data.personil.save(function(err, personil) {
                if (err)
                    return callback1(err);
                callback1(null, data);
            });
        }, function(data, callback1) {
            Model.Activity.update({
                personil : data.personil._id,
                status : Constants.STATUS_ACTIVE
            },
            {
                $set : {
                    status : Constants.STATUS_INACTIVE,
                    updatedAt : new Date(),
                    updater : userName
                }
            },
            {
                multi : true
            }).exec(function(err, results) {
                callback1(err, data);
            });
        }, function(data, callback1) {
            // disable login keycloak
            Model.User.findOne({
                personil : data.personil._id,
                status : { $in : [Constants.STATUS_ACTIVE, Constants.STATUS_NEW] }
            }).exec(function(err, user) {
                if (err || !user)
                    return callback1(null, data);
                disableKeycloakLogin = user.status == Constants.STATUS_ACTIVE;
                user.status = Constants.STATUS_INACTIVE;
                user.updatedAt = new Date();
                user.updater = userName;
                user.save(function(err, user) {
                    if (err)
                        return callback1(err);
                    data.user = user;
                    callback1(null, data);
                });
            });
        }, function(data, callback1) {
            if (!disableKeycloakLogin || !data.user)
                return callback1(null, data);
            deleteKeycloakUser(data.user.sub, function(err, results){
                callback1(null, data);
            });
        }
    ], function(err, result) {
        if (err) 
            log.error("updatePersonilStatus error ", err);
        callback(err, result);
    });
    
}

// update personil info
ProfileController.prototype.updatePersonilInfo = function updatePersonilInfo(personil, userName, callback) {
    Vasync.waterfall([
        function (callback1) {
            if (!personil.photo || !personil.photo.key) {
                return callback1(null, {});
            }
            Model.UploadedFile.findOne({
                key : personil.photo.key
            }).exec(function(err, photo) {
                if (err)
                    return callback1(err);
                
                callback1(null, {
                    photo : photo._id
                });
            });
        }, function (data, callback1) {
            Model.Personil.update({
                    _id : personil._id
                },
                {
                    $set : {
                        name                : personil.name,
                        birthTown           : personil.birthTown,
                        dob                 : personil.dob,
                        gender              : personil.gender,
                        photo               : data.photo,
                        mobileCountryArea   : personil.mobileCountryArea,
                        mobile              : personil.mobile,
                        religion            : personil.religion,
                        homeAddress         : personil.homeAddress,
                        nrp                 : personil.nrp,
                        pangkat             : personil.pangkat,
                        wilayahPenugasan    : personil.wilayahPenugasan,
                        unit                : personil.unit,
                        skep                : personil.skep,
                        dikum               : personil.dikum,
                        dikjur              : personil.dikjur,
                        dikbang             : personil.dikbang,
                        latfung             : personil.latfung,
                        prestasiDalamTugas  : personil.prestasiDalamTugas,
                        
                        updatedAt           : new Date(),
                        updater             : userName,
                        status              : personil.status
                    }
            }).exec(function(err, result){
                log.info("update info ",err,"  ", result);
                callback1(err, result);
            });
        }, function (data, callback1) {
            // find user 
            Model.User.findOne({
                personil : personil._id,
                status : Constants.STATUS_ACTIVE
            }).exec(function(err, user) {
                if (err || !user) {
                    log.info("err find user ", err);
                    return callback1(null, null);
                }
                if (personil.pangkat)
                    user.displayName = personil.pangkat + " " + personil.name;
                else
                    user.displayName = personil.name;
                user.save(function(err, user) {
                    callback1(null, null);
                })
            });
        }
    ], function (err, results) {
        if (err)
            log.error("updatePersonilInfo error ", err);
        callback(err, results);
    });
    
}

// get personil list data pagination
ProfileController.prototype.personilList = function personilList(page, callback) {
    Vasync.waterfall([
        function (callback1) {
            Model.Personil.count({
                status : Constants.STATUS_ACTIVE
            }).exec(function (err, count) {
                if (err)
                    return callback1(err);
                log.info("count personil ", count);
                callback1(null, {
                    count : count
                });
            });
        }, function(data, callback1) {
            var skip = Constants.PAGE_SIZE * page;
            Model.Personil.find({
                status  : Constants.STATUS_ACTIVE
            })
            .sort({ name : 1, pangkat : 1, nrp : 1})
            // .skip(skip).limit(Constants.PAGE_SIZE)
            .exec(function(err, results){
                if (err)
                    return callback1(err);
                callback1(null, {
                    count : data.count,
                    personilList : results
                });
            });
        }
    ], function(err, results) {
        if (err)
            log.error("personilList error ", err);
        callback(err, results);
    });
}

// get personil id and name list
ProfileController.prototype.personilListSummary = function personilListSummary(callback) {
    Model.Personil.find({
        status      : Constants.STATUS_ACTIVE
    })
    .select("_id name")
    .exec(function(err, results) {
        callback(err, results);
    });
}

ProfileController.prototype.userList = function userList(page, callback) {
    Vasync.waterfall([
        function (callback1) {
            Model.User.count({
                status : Constants.STATUS_ACTIVE
            }).exec(function (err, count) {
                if (err)
                    return callback1(err);
                log.info("count user ", count);
                callback1(null, {
                    count : count
                });
            });
        }, function(data, callback1) {
            var skip = Constants.PAGE_SIZE * page;
            Model.User.find({
                status  : Constants.STATUS_ACTIVE
            })
            .sort({ username : 1 })
            // .skip(skip).limit(Constants.PAGE_SIZE)
            .exec(function(err, results){
                if (err)
                    return callback1(err);
                callback1(null, {
                    count : data.count,
                    userList : results
                });
            });
        }
    ], function(err, results) {
        if (err)
            log.error("userList error ", err);
        callback(err, results);
    });
}

module.exports = ProfileController;

