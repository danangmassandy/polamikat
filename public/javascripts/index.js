var app = angular.module('polamikatApp', [ 'ngMaterial', 'ngRoute', 'chart.js', 'angular-thumbnails', 'xeditable', 'angular-cache', 'ui.bootstrap.datetimepicker', 'ui.dateTimeInput', 'ngFileUpload', 'angularUtils.directives.dirPagination' ]);

app.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

app.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: '/tpl/report',
            controller: 'reportCtrl',
        }).when('/report', {
            templateUrl: '/tpl/report',
            controller: 'reportCtrl',
        }).when('/attendance_report', {
            templateUrl: '/tpl/attendance_report',
            controller: 'attendanceReportCtrl',
        }).when('/admin_add_personil', {
            templateUrl: '/tpl/admin_add_personil',
            controller: 'adminAddPersonilCtrl',
        }).when('/admin_data_personil', {
            templateUrl: '/tpl/admin_data_personil',
            controller: 'adminDataPersonilCtrl',
        }).when('/admin_data_user', {
            templateUrl: '/tpl/admin_data_user',
            controller: 'adminDataUserCtrl',
        }).when('/admin_kategori_kegiatan', {
            templateUrl: '/tpl/admin_kategori_kegiatan',
            controller: 'adminKategoriKegiatanCtrl',
        }).when('/admin_update_personil/:personilID', {
            templateUrl: '/tpl/admin_update_personil',
            controller: 'adminUpdatePersonilCtrl',
        }).when('/admin_photos_kegiatan', {
            templateUrl: '/tpl/admin_photos_kegiatan',
            controller: 'adminPhotosKegiatanCtrl',
        }).when('/admin_attendance', {
            templateUrl: '/tpl/admin_attendance',
            controller: 'adminAttendanceCtrl',
        }).when('/admin_attendance_history', {
            templateUrl: '/tpl/admin_attendance_history',
            controller: 'adminAttendanceHistoryCtrl',
        }).when('/admin_data_management', {
            templateUrl: '/tpl/admin_data_management',
            controller: 'adminDataManagementCtrl',
        }).when('/data_kegiatan_personil', {
            templateUrl: '/tpl/data_kegiatan_personil',
            controller: 'dataKegiatanPersonilCtrl',
        }).when('/data_kegiatan_satlantas', {
            templateUrl: '/tpl/data_kegiatan_satlantas',
            controller: 'dataKegiatanSatlantasCtrl',
        }).when('/data_personil_list', {
            templateUrl: '/tpl/data_personil_list',
            controller: 'dataPersonilListCtrl',
        }).when('/kegiatan_add', {
            templateUrl: '/tpl/kegiatan_add',
            controller: 'kegiatanAddCtrl',
        }).when('/kegiatan_detail/:activityID', {
            templateUrl: '/tpl/kegiatan_detail',
            controller: 'kegiatanDetailCtrl',
        }).when('/kegiatan_update/:activityID', {
            templateUrl: '/tpl/kegiatan_update',
            controller: 'kegiatanUpdateCtrl',
        }).when('/personil_user_data', {
            templateUrl: '/tpl/personil_user_data',
            controller: 'personilUserDataCtrl',
        }).otherwise({
            redirectTo: '/'
        });
});

app.config(function($mdDateLocaleProvider) {
    $mdDateLocaleProvider.formatDate = function(date) {
        return moment(date).format('DD/MM/YYYY');
    };

    $mdDateLocaleProvider.parseDate = function(dateString) {
        var m = moment(dateString, 'DD/MM/YYYY', true);
        return m.isValid() ? m.toDate() : new Date(NaN);
    };
});

app.config(function (CacheFactoryProvider) {
    angular.extend(CacheFactoryProvider.defaults, { maxAge: 60 * 60 * 1000, capacity : 20 });
});

angular.module("material.components.virtualRepeat")._invokeQueue[1][2][1]().controller.prototype.virtualRepeatUpdate_ = function (items, oldItems) {
    this.isVirtualRepeatUpdating_ = true;

    var itemsLength = items && items.length || 0;
    var lengthChanged = false;

    // If the number of items shrank, keep the scroll position.
    if (this.items && itemsLength < this.items.length && this.container.getScrollOffset() !== 0) {
        this.items = items;
        var previousScrollOffset = this.container.getScrollOffset();
        this.container.resetScroll();
        this.container.scrollTo(previousScrollOffset);
    }

    if (itemsLength !== this.itemsLength) {
        lengthChanged = true;
        this.itemsLength = itemsLength;
    }

    this.items = items;
    if (items !== oldItems || lengthChanged) {
        this.updateIndexes_();
    }

    this.parentNode = this.$element[0].parentNode;

    if (lengthChanged) {
        this.container.setScrollSize(itemsLength * this.itemSize);
    }

    var cleanupFirstRender = false, firstRenderStartIndex;
    if (this.isFirstRender) {
        cleanupFirstRender = true;
        this.isFirstRender = false;
        firstRenderStartIndex = this.$attrs.mdStartIndex ?
            this.$scope.$eval(this.$attrs.mdStartIndex) :

            this.container.topIndex;
        this.container.scrollToIndex(firstRenderStartIndex);
    }


    // Detach and pool any blocks that are no longer in the viewport.
    Object.keys(this.blocks).forEach(function (blockIndex) {
        var index = parseInt(blockIndex, 10);
        if (index < this.newStartIndex || index >= this.newEndIndex) {
            this.poolBlock_(index);
        }
    }, this);

    // Add needed blocks.
    // For performance reasons, temporarily block browser url checks as we digest
    // the restored block scopes ($$checkUrlChange reads window.location to
    // check for changes and trigger route change, etc, which we don't need when
    // trying to scroll at 60fps).
    this.$browser.$$checkUrlChange = angular.noop;

    var i, block,
        newStartBlocks = [],
        newEndBlocks = [];

    // Collect blocks at the top.
    for (i = this.newStartIndex; i < this.newEndIndex && this.blocks[i] == null; i++) {
        block = this.getBlock_(i);
        this.updateBlock_(block, i);
        newStartBlocks.push(block);
    }

    // Update blocks that are already rendered.
    for (; this.blocks[i] != null; i++) {
        this.updateBlock_(this.blocks[i], i);
    }
    var maxIndex = i - 1;

    // Collect blocks at the end.
    for (; i < this.newEndIndex; i++) {
        block = this.getBlock_(i);
        this.updateBlock_(block, i);
        newEndBlocks.push(block);
    }

    // Attach collected blocks to the document.
    if (newStartBlocks.length) {
        this.parentNode.insertBefore(
            this.domFragmentFromBlocks_(newStartBlocks),
            this.$element[0].nextSibling);
    }
    if (newEndBlocks.length) {
        this.parentNode.insertBefore(
            this.domFragmentFromBlocks_(newEndBlocks),
            this.blocks[maxIndex] && this.blocks[maxIndex].element[0].nextSibling);
    }


    if (cleanupFirstRender) {
        this.container.scrollToIndex(firstRenderStartIndex);
    }


    // Restore $$checkUrlChange.
    this.$browser.$$checkUrlChange = this.browserCheckUrlChange;

    this.startIndex = this.newStartIndex;
    this.endIndex = this.newEndIndex;

    this.isVirtualRepeatUpdating_ = false;
};

// app.factory('httpInterceptor', ['$q', '$rootScope',
//     function ($q, $rootScope) {
//         var loadingCount = 0;

//         return {
//             request: function (config) {
//                 return config || $q.when(config);
//             },

//             response: function (response) {
//                 return response || $q.when(response);
//             },

//             responseError: function (response) {
//                 console.log("responseError");
//                 // alert("Session sudah berakhir, silahkan login lagi.");
//                 // window.location.reload(true);
//                 return $q.reject(response);
//             }
//         };
//     }
// ]).config(['$httpProvider', function ($httpProvider) {
//     $httpProvider.interceptors.push('httpInterceptor');
// }]);

app.controller('mainCtrl', function ($scope, $rootScope, $mdDialog, $mdSidenav, $location, $timeout, $filter, $route, rest, CacheFactory) {
    $rootScope.title = title;
    $rootScope.me = me;

    $rootScope.isLoaded = true;
    $rootScope.loadingText = "";

    $rootScope.back = function() {
        window.history.back();
    };

    console.log($rootScope.me);

    $scope.toggleLeft = buildDelayedToggler('left');
    // Check to make sure the cache doesn't already exist
    if (!CacheFactory.get('activityPhotosCache')) {
        $rootScope.activityPhotosCache = CacheFactory('activityPhotosCache');
    }


    if ($rootScope.me.polamikatUser.userPhoto) {
        console.log($rootScope.me.polamikatUser.userPhoto.publicURL);
        rest.files.getImage($rootScope.me.polamikatUser.userPhoto.publicURL, function(response) {
            $rootScope.me.photoSrc = response.blobURL;
        });
    }

    /**
     * Supplies a function that will continue to operate until the
     * time is up.
     */
    function debounce(func, wait, context) {
        var timer;
        return function debounced() {
            var context = $scope,
                args = Array.prototype.slice.call(arguments);
            $timeout.cancel(timer);
            timer = $timeout(function() {
                timer = undefined;
                func.apply(context, args);
            }, wait || 10);
        };
    }

    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildDelayedToggler(navID) {
        return debounce(function() {
            $mdSidenav(navID)
                .toggle()
                .then(function () {
                });
        }, 200);
    }

    $scope.goTo = function goTo(page, closeSidenav){

        if(!closeSidenav) {
            $mdSidenav('left').close();
        }

        $rootScope.selectedMenu = page;
        $location.path('/' + page);
    }

    $scope.isEmpty = function (obj) {
        for (var i in obj) if (obj.hasOwnProperty(i)) return false;
        return true;
    };

    $scope.showFooter = function() {
        // we always return true for now,
        // but leave flexibility for future
        return true;
    };


    $rootScope.fetchImageSync = function(photo, isThumbnail) {
        var url = photo.publicURL;
        if (isThumbnail && photo.thumbnailURL) {
            url = photo.thumbnailURL;
        }
        rest.files.getImage(url, function(res) {
            if (isThumbnail && photo.thumbnailURL) {
                photo.thumbnailBlobURL = res.blobURL;
            } else {
                photo.blobURL = res.blobURL;
            }
        });
    }

    $rootScope.fetchImage = function(photo, isThumbnail, callback) {
        var url = photo.publicURL;
        if (isThumbnail && photo.thumbnailURL) {
            url = photo.thumbnailURL;
        }
        rest.files.getImage(url, function(res) {
            if (isThumbnail && photo.thumbnailURL) {
                photo.thumbnailBlobURL = res.blobURL;
            } else {
                photo.blobURL = res.blobURL;
            }
            callback(null, photo);
        });
    }

    // $scope.goTo('report');

    $rootScope.deletePreviousUploadedFile = function(scope) {
        if (!scope.uploadedPhotos) return;
        for (var i = 0; i < scope.uploadedPhotos.length; ++i) {
            rest.files.delete(scope.uploadedPhotos[i]);
        }
        scope.uploadedPhotos = [];
    }

});

app.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});

 
app.factory('showMessage', ['$rootScope', '$mdDialog',  function($rootScope, $mdDialog) {
    var showMessage = {};
    showMessage.accessDenied = showAccessDenied;
    showMessage.warning = showWarningMessage;
    showMessage.confirm = showConfirmMessage;
    showMessage.success = showSuccessMessage;
    showMessage.error = showErrorMessage;
    showMessage.showLoadingIndicator = showLoadingIndicator;
    showMessage.hideLoadingIndicator = hideLoadingIndicator;

    function showAccessDenied(okButton, okListener) {
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#alertDialog')))
                .clickOutsideToClose(true)
                .title("Warning")
                .textContent("Access denied")
                .ok(okButton?okButton:"Ok")
                .targetEvent(null)
        ).then(okListener);
    }

    function showWarningMessage(title, content, okButton, okListener) {
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#alertDialog')))
                .clickOutsideToClose(true)
                .title(title?title:"Warning")
                .textContent(content)
                .ok(okButton?okButton:"Ok")
                .targetEvent(null)
        ).then(okListener);
    }

    function showConfirmMessage(title, content, okButton, cancelButton, okListener, cancelListener) {
        $mdDialog.show(
            $mdDialog.confirm()
                .parent(angular.element(document.querySelector('#alertDialog')))
                .clickOutsideToClose(true)
                .title(title?title:"Confirm")
                .textContent(content)
                .ok(okButton?okButton:"Ok")
                .cancel(cancelButton?cancelButton:"Cancel")
                .targetEvent(null)
        ).then(okListener, cancelListener);
    }

    function showSuccessMessage(title, content, okButton, okListener) {
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#alertDialog')))
                .clickOutsideToClose(true)
                .title(title?title:"Notification")
                .textContent(content)
                .ok(okButton?okButton:"Ok")
                .targetEvent(null)
        ).then(okListener);
    }

    function showErrorMessage(title, content, okButton, okListener) {
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#alertDialog')))
                .clickOutsideToClose(true)
                .title(title?title:"Error")
                .textContent(content)
                .ok(okButton?okButton:"Ok")
                .targetEvent(null)
        ).then(okListener);
    }

    function showLoadingIndicator(scope, message){
        scope.isLoaded = false;
        scope.loadingText = message;
    }

    function hideLoadingIndicator(scope){
        scope.$evalAsync(function() {
            scope.isLoaded = true;
            scope.loadingText = "";
        });
        
    }

// Test
    return showMessage;
}]);
