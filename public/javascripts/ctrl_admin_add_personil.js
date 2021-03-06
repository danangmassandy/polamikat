var app = angular.module('polamikatApp');

app.controller('adminAddPersonilCtrl', function ($scope, $rootScope, $mdDialog, $mdSidenav, $timeout, $location, showMessage, globalConstant, rest) {
    if(!$rootScope.me.isAdmin){
        showMessage.accessDenied(null,
                                 function(ok) {});
        $scope.goTo('/');
        return;
    }

    $scope.uploadedPhotos = [];

    $scope.updatePersonil = {
        dob : new Date()
    };
    $scope.createUserLogin = {
        value : false
    };

    $scope.updateUser = {};

    $scope.addPersonil = function() {
        // check password and retype password is match
        if ($scope.createUserLogin.value && !($scope.updateUser.password
            && $scope.updateUser.password == $scope.updateUser.repassword)) {
            showMessage.error("Error", "Password tidak sama", "Ok", function(){});
            return;
        }
        $scope.updatePersonil.dob = moment($scope.updatePersonil.dob, "DD-MM-YYYY").startOf('day').format();
        console.log($scope.updatePersonil);
        console.log($scope.updateUser);
        var updateUserInfo = null;
        if ($scope.createUserLogin.value)
            updateUserInfo = $scope.updateUser;
        showMessage.showLoadingIndicator($scope, "Adding personil...");
        rest.admin.addPersonil($scope.updatePersonil, updateUserInfo, function(response) {
            $scope.uploadedPhotos = $scope.uploadedPhotos.slice(0, $scope.uploadedPhotos.length - 1);
            $rootScope.deletePreviousUploadedFile($scope);

            console.log("addPersonil response ", response);
            showMessage.hideLoadingIndicator($scope);
            showMessage.success("Success", "Sukses tambah personil!", "Ok", function(){
                $rootScope.back();
            });
        }, function(response) {            
            $rootScope.deletePreviousUploadedFile($scope);
            
            showMessage.hideLoadingIndicator($scope);
            // error
            showMessage.error("Error", "Error pada tambah personil. Silahkan kontak system administrator.", "Ok", function(){});
            $rootScope.back();
        });
    }
    $scope.genders = ["Laki-laki", "Perempuan"];
    $scope.roles = [ "user", "administrator" ];

    $scope.getRoleName = function(v) {
        if (!v || v.length == 0) return "";
        return v.charAt(0).toUpperCase() + v.slice(1);
    }

    $scope.stateChanged = function() {
        console.log("stateChanged", $scope.createUserLogin.value);
        if ($scope.createUserLogin.value) {
            $scope.updateUser.email = $scope.updatePersonil.email;
            $scope.updateUser.role = "user";
        }
    }

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
        showMessage.showLoadingIndicator($scope, "Uploading file...");
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

});