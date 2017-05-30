var app = angular.module('polamikatApp');

app.controller('kegiatanAddCtrl', function ($scope, $rootScope, $mdDialog, $mdSidenav, $timeout, $location, showMessage, globalConstant, rest) {
    $scope.activity = {
        startDate : new Date()
    };
    $scope.personilList = [];
    $scope.categoryList = [];
    $scope.uploadedPhotos = [];

    $scope.showImage = function($event, photo) {
        var parentEl = angular.element(document.body);
        $rootScope.fetchImage(photo, false, function(error, photo) {
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
        // console.log("uploadPhotoFile clicked ", file);
        if (file && file.type && file.type.indexOf('image') < 0) {
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

    $scope.addKegiatan = function() {
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
        console.log("activity ", $scope.activity);
        showMessage.showLoadingIndicator($scope, "Saving activity...");
        rest.activities.add($scope.activity, function(response) {
            showMessage.hideLoadingIndicator($scope);
            $scope.uploadedPhotos = [];
            console.log("addKegiatan response ", response);
            showMessage.success("Success", "Sukses tambah kegiatan personil!", "Ok", function(){
                $rootScope.back();
            });
        }, function(response) {
            // error
            $rootScope.deletePreviousUploadedFile($scope);
            $scope.activity.photos = [];
            showMessage.hideLoadingIndicator($scope);
            showMessage.error("Error", "Error pada tambah kegiatan personil. Silahkan kontak system administrator.", "Ok", function(){});
        });
    }
    if ($rootScope.me.isAdmin) {
        showMessage.showLoadingIndicator($scope, "Loading personil list...");
        rest.users.personilList(function(response) {
            showMessage.hideLoadingIndicator($scope);
            if (response.data)
                $scope.personilList = angular.copy(response.data);
            else
                $scope.personilList = [];

            if (!$rootScope.me.isAdmin) {
                for (var i = 0; i < $scope.personilList.length; ++i) {
                    if ($scope.personilList[i]._id == $rootScope.me.polamikatUser.personil) {
                        $scope.activity.personil = $scope.personilList[i]._id;
                        break;
                    }
                }
            }
        }, function(response) {
            // error
            showMessage.hideLoadingIndicator($scope);
            showMessage.error("Error", "Error pada load personil list. Silahkan kontak system administrator.", "Ok", function(){});
        });
    }

    rest.activities.categoryList(function(response) {
        if (response.data)
            $scope.categoryList = angular.copy(response.data);
        else
            $scope.categoryList = [];
    });

    $scope.onCancelClicked = function() {
        $rootScope.deletePreviousUploadedFile($scope);
        
        $rootScope.back();
    }

    $scope.deletePhoto = function(photo) {
        rest.files.delete(photo.key);
        var index = $scope.uploadedPhotos.indexOf(photo.key);
        if (index > -1) {
            $scope.uploadedPhotos.splice(index, 1);
        }
        if (!$scope.activity.photos)
            return;
        var idxInActivity = -1;
        for (var i = 0; i < $scope.activity.photos.length; ++i) {
            if ($scope.activity.photos[i].key == photo.key) {
                idxInActivity = i;
                break;
            }
        }
        if (idxInActivity > -1) {
            $scope.activity.photos.splice(idxInActivity, 1);
        }
    }
});