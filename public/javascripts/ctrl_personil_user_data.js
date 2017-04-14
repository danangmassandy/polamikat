var app = angular.module('polamikatApp');

app.controller('personilUserDataCtrl', function ($scope, $rootScope, $mdDialog, $mdSidenav, $timeout, $location, showMessage, globalConstant, rest) {
    $scope.isAddPersonil = false;
    $scope.updatePersonil = {};
    $scope.originalPhotoKey = null;
    $scope.uploadedPhotos = [];

    $scope.doGetDetailPersonil = function() {
        showMessage.showLoadingIndicator($scope, "Loading personil data...");
        rest.users.me(function(response) {
            showMessage.hideLoadingIndicator($scope);
            if (!response.data || !response.data.data || !response.data.data.personil) {
                showMessage.error("Error", "Error detail personil. Silahkan kontak system administrator.", "Ok", function(){});
                $rootScope.back();
                return;    
            }
            
            $scope.isAddPersonil = false;
            $scope.updatePersonil = angular.copy(response.data.data.personil);
            $scope.updatePersonil.dob = moment($scope.updatePersonil.dob).toDate();
            if ($scope.updatePersonil.photo && $scope.updatePersonil.photo.publicURL) {
                $scope.originalPhotoKey = $scope.updatePersonil.photo.key;
                rest.files.getImage($scope.updatePersonil.photo.publicURL, function(response) {
                    $scope.profileSrc = response.blobURL;
                });
            }
        }, function(response) {
            // error
            showMessage.hideLoadingIndicator($scope);
            showMessage.error("Error", "Error pada detail personil. Silahkan kontak system administrator.", "Ok", function(){});
            $rootScope.back();
        });
    }

    $scope.doCreateOrUpdatePersonil = function() {
        $scope.updatePersonil.dob = moment($scope.updatePersonil.dob).startOf('day').format();
        console.log($scope.updatePersonil);
        showMessage.showLoadingIndicator($scope, "Saving personil data...");
        rest.users.createOrUpdatePersonil($scope.updatePersonil, function(response) {
            $scope.uploadedPhotos = $scope.uploadedPhotos.slice(0, $scope.uploadedPhotos.length - 1);
            $rootScope.deletePreviousUploadedFile($scope);

            $scope.updatePersonil.dob = moment($scope.updatePersonil.dob).toDate();
            $scope.originalPhotoKey = $scope.updatePersonil.photo.key;
            
            showMessage.hideLoadingIndicator($scope);
            console.log("createOrUpdatePersonil response ", response);
            $rootScope.me.photoSrc = $scope.profileSrc;
            if ($scope.updatePersonil.pangkat)
                $rootScope.me.displayName = $scope.updatePersonil.pangkat + " " + $scope.updatePersonil.name;
            else 
                $rootScope.me.displayName = $scope.updatePersonil.name;
            showMessage.success("Success", "Sukses update personil!", "Ok", function(){
                
            });
        }, function(response) {            
            // error
            $rootScope.deletePreviousUploadedFile($scope);
            $scope.updatePersonil.dob = moment($scope.updatePersonil.dob).toDate();
            showMessage.hideLoadingIndicator($scope);
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

        showMessage.showLoadingIndicator($scope, "Uploading photo...");
        rest.files.uploadImage(fd, function(response) {
            showMessage.hideLoadingIndicator($scope);
            console.log(JSON.stringify(response));
            $scope.updatePersonil.photo = {};
            $scope.updatePersonil.photo.key = response.data.uploadedFileKey;
            $scope.uploadedPhotos.push($scope.updatePersonil.photo.key);

            rest.files.getImage(response.data.uploadedFileUrl, function(response) {
                $scope.profileSrc = response.blobURL;
            });
        }, function(err) {
            showMessage.hideLoadingIndicator($scope);
            showMessage.error("Upload failed", "We failed to upload the file due to some server error! Please try again.", 
                              null, 
                              function(ok) {});
        });
    };

    $scope.onCancelClicked = function() {
        $rootScope.deletePreviousUploadedFile($scope);
        
        $rootScope.back();
    }

    // init
    $scope.doGetDetailPersonil();

});