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
    $scope.uploadedPhotos = [];

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
        showMessage.showLoadingIndicator($scope, "Loading photo...");
        $rootScope.fetchImage(photo, false, function(error, photo) {
            showMessage.hideLoadingIndicator($scope);
            if (error) {
                showMessage.error("Error", "Error pada load foto. Silahkan kontak system administrator.", "Ok", function(){});
            } else {
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
            
        });
    }

    $scope.uploadPhotoFile = function(file) {
        console.log("uploadPhotoFile clicked ", file);
        if (file && angular.isDefined(file.type) && file.type.indexOf('image') < 0) {
            showMessage.error("Upload failed", "Please choose image file only!", 
                              null, 
                              function(ok) {
                                  return;
                              });
            return;
        } else if (file == null) {
            return;
        }

        var fd = new FormData();
        fd.append('file', file);
        showMessage.showLoadingIndicator($scope, "Uploading photo...");
        rest.files.uploadImage(fd, function(response) {
            showMessage.hideLoadingIndicator($scope);
            console.log(JSON.stringify(response));
            if (!$scope.activity.photos)
                $scope.activity.photos = [];
            $scope.uploadedPhotos.push(response.data.uploadedFileKey);
            var photoURL = response.data.uploadedFileUrl;
            if (response.data.uploadedFileThumbUrl) {
                photoURL = response.data.uploadedFileThumbUrl;
            }
            rest.files.getImage(photoURL, function(res) {
                if (response.data.uploadedFileThumbUrl) {
                    $scope.activity.photos.push({
                        thumbnailBlobURL : res.blobURL,
                        key : response.data.uploadedFileKey,
                        publicURL : response.data.uploadedFileUrl,
                        thumbnailURL : response.data.uploadedFileThumbUrl,
                        description : ""
                    });
                } else {
                    $scope.activity.photos.push({
                        blobURL : res.blobURL,
                        key : response.data.uploadedFileKey,
                        publicURL : response.data.uploadedFileUrl,
                        description : ""
                    });
                }
            });
        }, function(err) {
            showMessage.hideLoadingIndicator($scope);
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
                    $rootScope.fetchImageSync($scope.activity.photos[i], true);
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
            showMessage.showLoadingIndicator($scope, "Deleting activity...");
            rest.activities.delete($scope.activity._id, function(response) {
                $rootScope.deletePreviousUploadedFile($scope);
                showMessage.hideLoadingIndicator($scope);
                console.log("doDeleteKegiatan response ", response);
                showMessage.success("Success", "Sukses delete kegiatan!", "Ok", function(){
                    $rootScope.back();
                });
            }, function(response) {            
                // error
                $rootScope.deletePreviousUploadedFile($scope);
                showMessage.hideLoadingIndicator($scope);
                showMessage.error("Error", "Error pada delete kegiatan. Silahkan kontak system administrator.", "Ok", function(){});
                $rootScope.back();
            });
        }, function(){});
    }

    $scope.doUpdateKegiatan = function() {
        if (!$rootScope.me.isAdmin) {
            if (!$rootScope.me.polamikatUser.personil) {
                showMessage.error("Error", "Error anda belum mengisi data personil. Silahkan kontak system administrator.", "Ok", function(){    
                });
                $rootScope.back();
                return;
            }
            $scope.activity.personil = $rootScope.me.polamikatUser.personil;    
        }
        $scope.activity.startDate = moment($scope.activity.startDate, "DD-MM-YYYY HH:mm").format();
        $scope.activity.category = $scope.activity.category._id;
        console.log("activity ", $scope.activity);
        showMessage.showLoadingIndicator($scope, "Saving activity...");
        rest.activities.update($scope.activity, function(response) {
            showMessage.hideLoadingIndicator($scope);
            $scope.uploadedPhotos = [];
            console.log("doUpdateKegiatan response ", response);
            showMessage.success("Success", "Sukses update kegiatan personil!", "Ok", function(){
                
            });
        }, function(response) {
            // error
            $rootScope.deletePreviousUploadedFile($scope);
            showMessage.hideLoadingIndicator($scope);
            showMessage.error("Error", "Error pada update kegiatan personil. Silahkan kontak system administrator.", "Ok", function(){});
            $rootScope.back();
        });
    }

    $scope.onCancelClicked = function() {
        $rootScope.deletePreviousUploadedFile($scope);
        
        $rootScope.back();
    }

    $scope.deletePhoto = function(photo) {
        if ($scope.activity.photos) {
            var idxInActivity = -1;
            for (var i = 0; i < $scope.activity.photos.length; ++i) {
                if ($scope.activity.photos[i].key == photo.key) {
                    idxInActivity = i;
                    break;
                }
            }
            if (idxInActivity > -1) {
                $scope.activity.photos.splice(idxInActivity, 1);
                return;
            }
        }

        var index = $scope.uploadedPhotos.indexOf(photo.key);
        if (index > -1) {
            // it's new uploaded photo
            $scope.uploadedPhotos.splice(index, 1);
            rest.files.delete(photo.key);
        }
    }

    // Init
    $scope.getActivityDetail();
});