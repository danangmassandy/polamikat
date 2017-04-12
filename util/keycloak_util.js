const Keycloak = require('keycloak-connect');

var _keycloakInstance;

function _isSystemAdministrator(token) {
    if (token.content.realm_access.roles.indexOf('admin') < 0 && !token.hasRole('PolamikatAdmin')) {
        return false;
    }
    return true;
}

module.exports = {
    init: function(storeConfig, keycloakConfig){
        _keycloakInstance = new Keycloak(storeConfig, keycloakConfig);
        return _keycloakInstance;
    },
    get: function(){
        return _keycloakInstance;
    },
    /* middlewares */
    protect: function() {
        return _keycloakInstance.protect();
    },
    protectSystemAdmin: function(){
        return _keycloakInstance.protect(_isSystemAdministrator);
    },
};
