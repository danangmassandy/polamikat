var app = angular.module('polamikatApp');

app.controller('sideNavController', 
['$scope', '$rootScope', '$mdSidenav', '$location', '$filter', '$route', 'showMessage',
function ($scope, $rootScope, $mdSidenav, $location, $filter, $route, showMessage) {
    
    //$rootScope.selectedMenu = '';
    $rootScope.selectedMenu = 'alertCentre';
    $rootScope.selectedSubMenu = '';

    $rootScope.goToSubMenu = function goToSubMenu(parentPage, page){
        $mdSidenav('left').close();
        $rootScope.selectedMenu = parentPage;
        $rootScope.selectedSubMenu = page;
        
        if(parentPage == 'list_alert_centre'){
            
            $location.path('/' + parentPage + "/" + page);
        }
        else
            $location.path('/' + page);
    }
    
    $rootScope.initiated = false;
    $rootScope.isAdmin = $rootScope.me.isAdmin;

    //alert(JSON.stringify($rootScope.isAdmin));
    $scope.logout = function logout(page){
        showMessage.confirm(null, "Are you sure want to logout?", 
                            null, null,
                            function(ok) { window.location.href = "/logout"; },
                            function(cancel) {});
    }
}]);