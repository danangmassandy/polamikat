var app = angular.module('polamikatApp', [ 'ngMaterial', 'ngRoute', 'ngLodash' ]);

app.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: '/tpl/home_index',
        // }).when('/update_user_profile', {
        //     templateUrl: '/tpl/clinic_user_profile',
        //     controller: 'userProfileCtrl',
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

app.controller('mainCtrl', function ($scope, $rootScope, $mdDialog, $mdSidenav, $location, $timeout, $filter, $route) {
    $rootScope.me = me;

    $rootScope.back = function() {
        window.history.back();
    };

    console.log($rootScope.me);

    $scope.toggleLeft = buildDelayedToggler('left');

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
});

app.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});
