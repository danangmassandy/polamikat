var app = angular.module('polamikatApp');

app.controller('adminPhotosKegiatanCtrl', function ($scope, $rootScope, $mdDialog, $mdSidenav, $timeout, $location, showMessage, globalConstant, rest) {
    if(!$rootScope.me.isAdmin){
        showMessage.accessDenied(null,
                                 function(ok) {});
        $scope.goTo('/');
        return;
    }

    $scope.photos = [];

    $scope.getPhotos = function() {
        rest.activities.photos(function(response){
            console.log("photos ", response);
            if (response.data) {
                $scope.photos = angular.copy(response.data);
                for (var i = 0; i < $scope.photos.length;++i) {
                    $rootScope.fetchImage($scope.photos[i]);
                }
            } else {
                $scope.photos = [];
            }
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


    // Init
    $scope.getPhotos();
});