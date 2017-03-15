var app = angular.module('polamikatApp');

app.factory('rest', function($rootScope, $http) {
    var restService = {
        activities : {
            personilActivity : function(personilID, onSuccess) {
                $http.post("/activity/personil_activities", {
                    personil : personilID
                }).then(function(response) {
                    onSuccess(response);
                });
            },
            rankPersonil : function(onSuccess) {
                $http.post("/activity/rank_personil", {}).then(function(response) {
                    onSuccess(response);
                });
            },
            list : function(onSuccess) {
                $http.post("/activity/list", {}).then(function(response) {
                    onSuccess(response);
                });
            },
            listByCategory : function(onSuccess) {
                $http.post("/activity/list_by_categories", {}).then(function(response) {
                    onSuccess(response);
                });
            },
            categoryList : function(onSuccess) {
                $http.post("/activity/list_category", {}).then(function(response) {
                    onSuccess(response);
                });
            },
            add : function(onSuccess) {
                $http.post("/activity/add", {
                    activity : activity
                }).then(function(response) {
                    onSuccess(response);
                });
            }
        },
        users : {
            personilList : function(onSuccess) {
                $http.post("/user/personil_list", {}).then(function(response) {
                    onSuccess(response);
                });
            },
            personilListAll : function(onSuccess) {
                $http.post("/user/personil_list_all", {}).then(function(response) {
                    onSuccess(response);
                });
            }
        },
        admin : {
            addPersonil : function(personil, createLoginInfo, onSuccess, onError) {
                $http.post("/admin/add_personil", {
                    personil : personil,
                    createLoginInfo : createLoginInfo
                }).then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response);
                    else if (onError) onError(response);
                }, function(response) {
                    console.log("add personil error ", response);
                    if (onError) onError(response);
                });
            },
            addKategoriKegiatan : function(category, onSuccess, onError) {
                $http.post("/admin/add_category", {
                    category : category
                }).then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response);
                    else if (onError) onError(response);
                }, function(response) {
                    console.log("addKategoriKegiatan error ", response);
                    if (onError) onError(response);
                });
            },
            updateKategoriKegiatan : function(category, onSuccess, onError) {
                $http.post("/admin/update_category", {
                    category : category
                }).then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response);
                    else if (onError) onError(response);
                }, function(response) {
                    console.log("updateKategoriKegiatan error ", response);
                    if (onError) onError(response);
                });
            }
        },
        files : {
            uploadImage : function(fd, onSuccess, onError) {
                $http.post("/files/upload", fd, {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                }).then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response);
                    else if (onError) onError(response);
                }, function(response) {
                    console.log("ERROR in upload protected image", response);
                    if (onError) onError(response);
                });
            },
            getImage : function(p_url, onSuccess, onError) {
                $http({
                    url: p_url,
                    method: "POST",
                    responseType : 'arraybuffer',
                    headers: {
                        'Content-Type' : 'application/json',
                        //'Access-Control-Allow-Credentials' : 'true',
                        //'Access-Control-Allow-Origin' : s_base,
                        // 'Access-Control-Allow-Origin' : '*',
                        'Access-Control-Allow-Methods' : 'GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD',
                        'Access-Control-Allow-Headers' : 'Access-Control-Allow-Headers, Authorization, Origin, Accept, Key, If-None-Match, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, X-CLIENT-ID, X-CLIENT_SECRET',
                        //'Access-Control-Max-Age' : '2520',
                    }
                }).success(function (data, status, headers, config, statusText) {
                    var file = new Blob([data], {type: headers('Content-Type')});
                    var fileURL = URL.createObjectURL(file);
                    // window.open(fileURL);
                    if (onSuccess) onSuccess({blobURL : fileURL});
                }).error(function (data, status, headers, config, statusText) {
                    console.log('Error getting file : ', status);
                    if (onError) onError({message : statusText});
                });
            }
        }
    };

    return restService;
});