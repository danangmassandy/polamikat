var app = angular.module('polamikatApp');

app.factory('rest', function($rootScope, $http) {
    var restService = {
        activities : {
            personilActivity : function(personilUserID, onSuccess) {
                $http.post("/activity/personil_activities", {
                    user : personilUserID
                }).then(function(response) {
                    onSuccess(response);
                });
            },
            rankPersonil : function(onSuccess) {
                $http.post("/activity/rank_personil", {}).then(function(response) {
                    onSuccess(response);
                });
            }
        },
        users : {
            personilList : function(onSuccess) {
                $http.post("/user/personil_list", {}).then(function(response) {
                    onSuccess(response);
                });
            }
        }
    };

    return restService;
});