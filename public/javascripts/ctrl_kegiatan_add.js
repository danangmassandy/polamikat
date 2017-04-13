var app = angular.module('polamikatApp');

app.controller('kegiatanAddCtrl', function ($scope, $rootScope, $mdDialog, $mdSidenav, $timeout, $location, showMessage, globalConstant, rest) {
    $scope.activity = {};
    $scope.personilList = [];
    $scope.categoryList = [];

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
        rest.activities.add($scope.activity, function(response) {
            console.log("addKegiatan response ", response);
            showMessage.success("Success", "Sukses tambah kegiatan personil!", "Ok", function(){
                $rootScope.back();
            });
        }, function(response) {
            // error
            showMessage.error("Error", "Error pada tambah kegiatan personil. Silahkan kontak system administrator.", "Ok", function(){});
            $rootScope.back();
        });
    }

    rest.users.personilList(function(response) {
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
    });

    rest.activities.categoryList(function(response) {
        if (response.data)
            $scope.categoryList = angular.copy(response.data);
        else
            $scope.categoryList = [];
    });
});