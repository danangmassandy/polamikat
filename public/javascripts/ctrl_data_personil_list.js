var app = angular.module('polamikatApp');

app.controller('dataPersonilListCtrl', function ($scope, $rootScope, $mdDialog, $mdSidenav, $timeout, $location, showMessage, globalConstant, rest) {


    $scope.sortType     = 'total';
    $scope.sortReverse  = true;

    $scope.personilListData = [];
    
    $scope.loadPersonilList = function() {
        rest.users.personilListAll(function(response){
            console.log("personilListAll ", response);
            if (response.data.data)
                $scope.personilListData = angular.copy(response.data.data.personilList);
            else
                $scope.personilListData = [];
        });
    }
    $scope.loadPersonilList();

    $scope.personilClick = function(personil) {
        if($rootScope.me.isAdmin){
            $scope.goTo('admin_update_personil/'+personil._id);
        }
    }

});