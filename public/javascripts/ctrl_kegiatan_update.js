var app = angular.module('polamikatApp');

app.controller('kegiatanUpdateCtrl', function ($scope, $rootScope, $routeParams, $mdDialog, $mdSidenav, $timeout, $location, showMessage, globalConstant, rest) {
    var activityID = $routeParams.activityID;
    if (!activityID || !activityID.length) {
        $rootScope.back();
        return;
    }
    
    $scope.activity = {};
    $scope.personilList = [];
    $scope.categoryList = [];

    $scope.getPersonilList = function() {
        rest.users.personilList(function(response) {
            if (response.data)
                $scope.personilList = angular.copy(response.data);
            else
                $scope.personilList = [];
        });
    }

    $scope.getCategoryList = function() {
        rest.activities.categoryList(function(response) {
            if (response.data)
                $scope.categoryList = angular.copy(response.data);
            else
                $scope.categoryList = [];
        });
    }

    $scope.showImage = function($event, photo) {
        var parentEl = angular.element(document.body);
        $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                templateUrl: '/tpl/dialog_photo',
                locals: {
                    photo : photo,
                },
                controller: DialogController
            });
        function DialogController($scope, $mdDialog, photo) {
            $scope.photo = photo;

            $scope.close = function() {
                $mdDialog.cancel();
            }
        }
    }

    $scope.onUploadImageClicked = function(position) {
        $timeout(function() {
            document.getElementById('image' + (position)).click();
        }, 0);
    };

    $scope.uploadPhotoFile = function(file) {
        console.log("uploadPhotoFile clicked");
        var fd = new FormData();
        fd.append('file', file);

        rest.files.uploadImage(fd, function(response) {
            console.log(JSON.stringify(response));
            if (!$scope.activity.photos)
                $scope.activity.photos = [];
            
            rest.files.getImage(response.data.uploadedFileUrl, function(res) {
                $scope.activity.photos.push({
                    blobURL : res.blobURL,
                    key : response.data.uploadedFileKey,
                    publicURL : response.data.uploadedFileUrl,
                    description : ""
                });
            });
        }, function(err) {
            showMessage.error("Upload failed", "We failed to upload the file due to some server error! Please try again.", 
                              null, 
                              function(ok) {});
        });
    };

    $scope.getActivityDetail = function() {
        $scope.getPersonilList();
        $scope.getCategoryList();
        rest.activities.detail(activityID, function(response) {
            if (!response.data) {
                showMessage.error("Error", "Error detail kegiatan personil. Silahkan kontak system administrator.", "Ok", function(){});
                $rootScope.back();
                return;    
            }
            $scope.activity = angular.copy(response.data);
            $scope.activity.startDate = moment($scope.activity.startDate).toDate();
            if ($scope.activity.photos) {
                for (var i = 0; i < $scope.activity.photos.length;++i) {
                    $rootScope.fetchImage($scope.activity.photos[i]);
                }
            }
            
        }, function(response) {
            // error
            showMessage.error("Error", "Error detail personil. Silahkan kontak system administrator.", "Ok", function(){});
            $rootScope.back();
        });
    }

    $scope.doDeleteKegiatan = function() {
        showMessage.confirm("Konfirm Delete Kegiatan", "Anda yakin untuk delete kegiatan?", "Ok", "Cancel", function(){
            rest.activities.delete($scope.activity._id, function(response) {
                console.log("doDeleteKegiatan response ", response);
                showMessage.error("Success", "Sukses delete kegiatan!", "Ok", function(){
                    $rootScope.back();
                });
            }, function(response) {            
                // error
                showMessage.error("Error", "Error pada delete kegiatan. Silahkan kontak system administrator.", "Ok", function(){});
                $rootScope.back();
            });
        }, function(){});
    }

    $scope.doUpdateKegiatan = function() {
        if (!me.isAdmin) {
            if (!me.polamikatUser.personil) {
                showMessage.error("Error", "Error anda belum mengisi data personil. Silahkan kontak system administrator.", "Ok", function(){    
                });
                $rootScope.back();
                return;
            }
            $scope.activity.personil = me.polamikatUser.personil._id;    
        }
        $scope.activity.startDate = moment($scope.activity.startDate, "DD-MM-YYYY HH:mm").format();
        $scope.activity.category = $scope.activity.category._id;
        console.log("activity ", $scope.activity);
        rest.activities.update($scope.activity, function(response) {
            console.log("doUpdateKegiatan response ", response);
            showMessage.error("Success", "Sukses update kegiatan personil!", "Ok", function(){
                $rootScope.back();
            });
        }, function(response) {
            // error
            showMessage.error("Error", "Error pada update kegiatan personil. Silahkan kontak system administrator.", "Ok", function(){});
            $rootScope.back();
        });
    }

    // Init
    $scope.getActivityDetail();
});