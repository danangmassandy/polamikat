const Crypto = require('crypto');
const Randomstring = require('randomstring');

module.exports = {
    generateUserKey : function(user) {
        return Crypto.createHmac('sha256', user._id.toString() + Randomstring.generate())
            .update(new Date() + Randomstring.generate() + user._id.toString() + user.displayName)
            .digest('hex');
    },
    generateWebAccessToken : function(authToken) {
        return 'w' + Crypto.createHmac('sha256', authToken.user._id.toString() + Randomstring.generate())
            .update(new Date() + Randomstring.generate() + authToken.user._id.toString())
            .digest('hex');
    },
    generateUploadedFileKey : function(uploadedFile) {
        return Crypto.createHmac('sha256', uploadedFile._id.toString() + Randomstring.generate())
            .update(new Date() + Randomstring.generate() + uploadedFile._id.toString() + uploadedFile.filename)
            .digest('hex');
    }
};