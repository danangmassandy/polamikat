var app = angular.module('polamikatApp');

app.factory('rest', function($rootScope, $http) {
    var restService = {
        activities : {
            personilActivity : function(personilID, onSuccess, onError) {
                $http.post("/activity/personil_activities", {
                    personil : personilID
                }).then(function(response) {
                    onSuccess(response);
                }, function(response) {
                    console.log('Error personilActivity');
                    if(onError) onError(response.data.message);
                });
            },
            rankPersonil : function(onSuccess, onError) {
                $http.post("/activity/rank_personil", {}).then(function(response) {
                    onSuccess(response);
                }, function(response) {
                    console.log('Error rankPersonil');
                    if(onError) onError(response.data.message);
                });
            },
            list : function(onSuccess, onError) {
                $http.post("/activity/list").then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response.data);
                    else if (onError) onError(response.data.message);
                }, function(response) {
                    console.log('Error activity list');
                    if(onError) onError(response.data.message);
                });
            },
            listByCategory : function(onSuccess, onError) {
                $http.post("/activity/list_by_categories", {}).then(function(response) {
                    onSuccess(response);
                }, function(response) {
                    console.log('Error listByCategory');
                    if(onError) onError(response.data.message);
                });
            },
            categoryList : function(onSuccess, onError) {
                $http.post("/activity/list_category", {}).then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response.data);
                    else if (onError) onError(response.data.message);
                }, function(response) {
                    console.log('Error categoryList');
                    if(onError) onError(response.data.message);
                });
            },
            add : function(activity, onSuccess, onError) {
                $http.post("/activity/add", {
                    activity : activity
                }).then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response.data);
                    else if (onError) onError(response.message);
                }, function(response) {
                    console.log("add activity error ", response);
                    if (onError) onError(response.message);
                });
            },
            detail : function(activityID, onSuccess, onError) {
                $http.post("/activity/detail", {
                    activityID : activityID
                }).then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response.data);
                    else if (onError) onError(response.message);
                }, function(response) {
                    console.log("add activity error ", response);
                    if (onError) onError(response.message);
                });
            },
            update : function(activity, onSuccess, onError) {
                $http.post("/activity/update", {
                    activity : activity
                }).then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response.data);
                    else if (onError) onError(response.message);
                }, function(response) {
                    console.log("update activity error ", response);
                    if (onError) onError(response.message);
                });
            },
            delete : function(activityID, onSuccess, onError) {
                $http.post("/activity/delete", {
                    activityID : activityID
                }).then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response.data);
                    else if (onError) onError(response.message);
                }, function(response) {
                    console.log("update activity error ", response);
                    if (onError) onError(response.message);
                });
            },
            photos : function(onSuccess, onError) {
                $http.post("/activity/photos", {}).then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response.data);
                    else if (onError) onError(response.message);
                }, function(response) {
                    console.log("photos activity error ", response);
                    if (onError) onError(response.message);
                });
            },
        },
        users : {
            personilList : function(onSuccess, onError) {
                $http.post("/user/personil_list", {}).then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response.data);
                    else if (onError) onError(response.data.message);
                }, function(response) {
                    console.log('Error personilList');
                    if(onError) onError(response.data.message);
                });
            },
            personilListAll : function(onSuccess) {
                $http.post("/user/personil_list_all", {}).then(function(response) {
                    onSuccess(response);
                });
            },
            personilDetail : function(personilID, onSuccess, onError) {
                $http.post("/user/personil_detail", {
                    personilID : personilID
                }).then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response.data);
                    else if (onError) onError(response.data.message);
                }, function(response) {
                    console.log('Error personil_detail');
                    if(onError) onError(response.data.message);
                });
            },
            updatePersonil : function(personil, onSuccess, onError) {
                $http.post("/user/update_personil_info", {
                    personil : personil
                }).then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response);
                    else if (onError) onError(response.message);
                }, function(response) {
                    console.log("update personil error ", response);
                    if (onError) onError(response.message);
                });
            },
            me : function(onSuccess, onError) {
                $http.post("/user/me", {}).then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response);
                    else if (onError) onError(response.message);
                }, function(response) {
                    console.log("user me error ", response);
                    if (onError) onError(response.message);
                });
            },
            createOrUpdatePersonil : function(personil, onSuccess, onError) {
                $http.post("/user/create_or_update_personil", {
                    personil : personil
                }).then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response);
                    else if (onError) onError(response.message);
                }, function(response) {
                    console.log("createOrUpdatePersonil error ", response);
                    if (onError) onError(response.message);
                });
            }
        },
        attendance : {
            attendanceList : function(p_date, onSuccess, onError) {
                $http.post("/attendance/attendance_list", {
                    date : p_date
                }).then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response);
                    else if (onError) onError(response);
                }, function(response) {
                    console.log("attendanceList error ", response);
                    if (onError) onError(response);
                });
            },
            attendanceByValue : function(p_value, onSuccess, onError) {
                $http.post("/attendance/attendance_by_value", {
                    value : p_value
                }).then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response);
                    else if (onError) onError(response);
                }, function(response) {
                    console.log("attendanceByValue error ", response);
                    if (onError) onError(response);
                });
            },
            updateAttendance : function(p_date, attendance_list, onSuccess, onError) {
                $http.post("/attendance/update_attendance", {
                    attendanceList : attendance_list,
                    date : p_date
                }).then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response);
                    else if (onError) onError(response);
                }, function(response) {
                    console.log("updateAttendance error ", response);
                    if (onError) onError(response);
                });
            },
            attendanceByPeriod : function(p_period, p_date, onSuccess, onError) {
                $http.post("/attendance/attendance_by_period", {
                    period  : p_period,
                    date    : p_date
                }).then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response);
                    else if (onError) onError(response);
                }, function(response) {
                    console.log("attendanceByPeriod error ", response);
                    if (onError) onError(response);
                });
            },
            resetAttendance : function(onSuccess, onError) {
                $http.post("/attendance/attendance_reset", {
                }).then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response);
                    else if (onError) onError(response);
                }, function(response) {
                    console.log("resetAttendance error ", response);
                    if (onError) onError(response);
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
                    else if (onError) onError(response.message);
                }, function(response) {
                    console.log("add personil error ", response);
                    if (onError) onError(response.message);
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
            },
            deletePersonil : function(personilID, onSuccess, onError) {
                $http.post("/admin/delete_personil", {
                    personilID : personilID
                }).then(function(response) {
                    if (response.data.status == "Ok")
                        onSuccess(response);
                    else if (onError) onError(response);
                }, function(response) {
                    console.log("deletePersonil error ", response);
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
                        onSuccess(response.data);
                    else if (onError) onError(response.data.message);
                }, function(response) {
                    console.log("ERROR in upload protected image", response);
                    if (onError) onError(response.data.message);
                });
            },
            getImage : function(p_url, onSuccess, onError) {
                var fromCache = $rootScope.activityPhotosCache.get(p_url);
                if (fromCache) {
                    if (onSuccess) onSuccess({blobURL : fromCache});
                } else {
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
                    }).then(function successCallback(response) {
                        var file = new Blob([response.data], {type: response.headers('Content-Type')});
                        var fileURL = URL.createObjectURL(file);
                        $rootScope.activityPhotosCache.put(p_url, fileURL);
                        // window.open(fileURL);
                        if (onSuccess) onSuccess({blobURL : fileURL});
                    }, function errorCallback(response) {
                        console.log('Error getting file : ', response.status);
                        if (onError) onError({message : response.statusText});
                    });
                }
            }
        }
    };

    return restService;
});