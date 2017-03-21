var app = angular.module('polamikatApp');

app.controller('adminUpdatePersonilCtrl', function ($scope, $rootScope, $routeParams, $mdDialog, $mdSidenav, $timeout, $location, showMessage, globalConstant, rest) {
    if(!$rootScope.me.isAdmin){
        showMessage.accessDenied(null,
                                 function(ok) {});
        $scope.goTo('/');
        return;
    }
    $scope.personilID = $routeParams.personilID;
    if (!$scope.personilID || !$scope.personilID.length) {
        $rootScope.back();
        return;
    }
    $scope.updatePersonil = {};

    $scope.doGetDetailPersonil = function() {
        rest.users.personilDetail($scope.personilID, function(response) {
            if (!response.data || !response.data.personil) {
                showMessage.error("Error", "Error detail personil. Silahkan kontak system administrator.", "Ok", function(){});
                $rootScope.back();
                return;    
            }
            $scope.updatePersonil = angular.copy(response.data.personil);
            $scope.updatePersonil.dob = moment($scope.updatePersonil.dob).toDate();
            if ($scope.updatePersonil.photo && $scope.updatePersonil.photo.publicURL) {
                rest.files.getImage($scope.updatePersonil.photo.publicURL, function(response) {
                    $scope.profileSrc = response.blobURL;
                });
            }
        }, function(response) {
            // error
            showMessage.error("Error", "Error pada detail personil. Silahkan kontak system administrator.", "Ok", function(){});
            $rootScope.back();
        });
    }

    $scope.doDeletePersonil = function() {
        showMessage.confirm("Konfirm Delete Personil", "Anda yakin untuk delete personil?", "Ok", "Cancel", function(){
            rest.admin.deletePersonil($scope.updatePersonil._id, function(response) {
                console.log("doDeletePersonil response ", response);
                showMessage.error("Success", "Sukses delete personil!", "Ok", function(){
                    $rootScope.back();
                });
            }, function(response) {            
                // error
                showMessage.error("Error", "Error pada delete personil. Silahkan kontak system administrator.", "Ok", function(){});
                $rootScope.back();
            });
        }, function(){});
    }

    $scope.doUpdatePersonil = function() {
        $scope.updatePersonil.dob = moment($scope.updatePersonil.dob, "DD-MM-YYYY").startOf('day').format();
        console.log($scope.updatePersonil);
        rest.users.updatePersonil($scope.updatePersonil, function(response) {
            console.log("doUpdatePersonil response ", response);
            showMessage.error("Success", "Sukses update personil!", "Ok", function(){
                $rootScope.back();
            });
        }, function(response) {            
            // error
            showMessage.error("Error", "Error pada update personil. Silahkan kontak system administrator.", "Ok", function(){});
            $rootScope.back();
        });
    }
    $scope.genders = ["Laki-laki", "Perempuan"];

    $scope.onUploadImageClicked = function(position) {
        $timeout(function() {
            document.querySelector('#image' + (position)).click();
        }, 10);
    };

    $scope.uploadPhotoFile = function(file) {
        console.log("uploadPhotoFile clicked");
        var fd = new FormData();
        fd.append('file', file);

       console.log(JSON.stringify(file));
        rest.files.uploadImage(fd, function(response) {
            console.log(JSON.stringify(response));
            $scope.updatePersonil.photo = {};
            $scope.updatePersonil.photo.key = response.data.uploadedFileKey;

            rest.files.getImage(response.data.uploadedFileUrl, function(response) {
                $scope.profileSrc = response.blobURL;
            });
        }, function(err) {
            showMessage.error("Upload failed", "We failed to upload the file due to some server error! Please try again.", 
                              null, 
                              function(ok) {});
        });
    };

    // init
    $scope.doGetDetailPersonil();

});