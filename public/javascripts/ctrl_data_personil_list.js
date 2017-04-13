var app = angular.module('polamikatApp');

app.controller('dataPersonilListCtrl', function ($scope, $rootScope, $mdDialog, $mdSidenav, $timeout, $location, showMessage, globalConstant, rest) {


    $scope.sortType     = 'total';
    $scope.sortReverse  = true;

    $scope.personilListData = [];
    
    $scope.loadPersonilList = function() {
        showMessage.showLoadingIndicator($scope, "Getting personil list...");
        rest.users.personilListAll(function(response){
            showMessage.hideLoadingIndicator($scope);
            console.log("personilListAll ", response);
            if (response.data.data)
                $scope.personilListData = angular.copy(response.data.data.personilList);
            else
                $scope.personilListData = [];
        }, function(response) {            
            showMessage.hideLoadingIndicator($scope);
            // error
            showMessage.error("Error", "Error personil data. Silahkan kontak system administrator.", "Ok", function(){});
        });
    }
    $scope.loadPersonilList();

    $scope.personilClick = function(personil) {
        if($rootScope.me.isAdmin){
            $scope.goTo('admin_update_personil/'+personil._id);
        }
    }

});