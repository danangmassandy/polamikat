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
    $scope.uploadedPhotos = [];

    $scope.doGetDetailPersonil = function() {
        showMessage.showLoadingIndicator($scope, "Getting personil detail...");
        rest.users.personilDetail($scope.personilID, function(response) {
            showMessage.hideLoadingIndicator($scope);
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
            showMessage.hideLoadingIndicator($scope);
            showMessage.error("Error", "Error pada detail personil. Silahkan kontak system administrator.", "Ok", function(){});
            $rootScope.back();
        });
    }

    $scope.doDeletePersonil = function() {
        showMessage.confirm("Konfirm Delete Personil", "Anda yakin untuk delete personil?", "Ok", "Cancel", function(){
            showMessage.showLoadingIndicator($scope, "Deleting personil...");
            rest.admin.deletePersonil($scope.updatePersonil._id, function(response) {
                $rootScope.deletePreviousUploadedFile($scope);
                showMessage.hideLoadingIndicator($scope);
                console.log("doDeletePersonil response ", response);
                showMessage.success("Success", "Sukses delete personil!", "Ok", function(){
                    $rootScope.back();
                });
            }, function(response) {            
                // error
                showMessage.hideLoadingIndicator($scope);
                showMessage.error("Error", "Error pada delete personil. Silahkan kontak system administrator.", "Ok", function(){});
                $rootScope.back();
            });
        }, function(){});
    }

    $scope.doUpdatePersonil = function() {
        $scope.updatePersonil.dob = moment($scope.updatePersonil.dob).startOf('day').format();
        console.log($scope.updatePersonil);
        showMessage.showLoadingIndicator($scope, "Saving personil data...");
        rest.users.updatePersonil($scope.updatePersonil, function(response) {
            $scope.uploadedPhotos = $scope.uploadedPhotos.slice(0, $scope.uploadedPhotos.length - 1);
            $rootScope.deletePreviousUploadedFile($scope);

            $scope.updatePersonil.dob = moment($scope.updatePersonil.dob).toDate();
            showMessage.hideLoadingIndicator($scope);
            console.log("doUpdatePersonil response ", response);
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

    $scope.uploadPhotoFile = function(file) {
        // console.log("uploadPhotoFile clicked");
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

        console.log(JSON.stringify(file));
        showMessage.showLoadingIndicator($scope, "Uploading photo...");
        rest.files.uploadImage(fd, function(response) {
            console.log(JSON.stringify(response));
            $scope.updatePersonil.photo = {};
            $scope.updatePersonil.photo.key = response.data.uploadedFileKey;
            $scope.uploadedPhotos.push($scope.updatePersonil.photo.key);
            showMessage.hideLoadingIndicator($scope);
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