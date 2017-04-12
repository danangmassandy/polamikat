var app = angular.module('polamikatApp');


var attendanceRankCustomTooltips = function(tooltip) {
    // Tooltip Element
    var tooltipEl = document.getElementById('chartjs-tooltip');
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'chartjs-tooltip';
        tooltipEl.innerHTML = ""
        document.body.appendChild(tooltipEl);
    }
    // Hide if no tooltip
    if (tooltip.opacity === 0) {
        tooltipEl.style.opacity = 0;
        return;
    }
    // Set caret Position
    tooltipEl.classList.remove('above', 'below', 'no-transform');
    if (tooltip.yAlign) {
        tooltipEl.classList.add(tooltip.yAlign);
    } else {
        tooltipEl.classList.add('no-transform');
    }
    function getBody(bodyItem) {
        return bodyItem.lines;
    }
    // Set Text
    if (tooltip.body) {
        var sum = tooltip.dataPoints[0].yLabel;
        var titleLines = tooltip.title || [];
        var bodyLines = tooltip.body.map(getBody);
        var innerHtml = '<div class="arrowRight tooltipBody layout-column flex">';
        innerHtml += '<div class="tooltipTitle">';
        if (tooltip.dataPoints.length && tooltip.dataPoints[0].displayName) {
            innerHtml += '<span>' + tooltip.dataPoints[0].displayName + '</span>';
        } else {
            titleLines.forEach(function(title) {
                innerHtml += '<span>' + title + '</span>';
            });
        }
        innerHtml += '</div>';

        innerHtml += '<div class="tooltipSubtitle">';
        if (tooltip.dataPoints.length && tooltip.dataPoints[0].personilNRP) {
            innerHtml += '<span>' + tooltip.dataPoints[0].personilNRP + '</span>';
        }
        innerHtml += '</div>';
        
        innerHtml += '<div class="layout-row"><span class="tooltipTotalLabel">Total</span>&nbsp;&nbsp;&nbsp;<span class="tooltipNumber">'+sum+'</span></div>';
        innerHtml += '</div>';
        tooltipEl.innerHTML = innerHtml;
    }
    var position = this._chart.canvas.getBoundingClientRect();
    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.classList.remove('tooltipDivRight');
    tooltipEl.classList.remove('tooltipDivLeft');
    if (position.left + tooltip.caretX + 300 + 12 >= position.right) {
        if (position.left + tooltip.caretX - 330 > 0) {
            tooltipEl.classList.add('tooltipDivRight');
            tooltipEl.style.left = position.left + tooltip.caretX - 330 + 'px';
        } else {
            tooltipEl.classList.add('tooltipDivLeft');
            tooltipEl.style.left = position.left + tooltip.caretX + 'px';
        }
    } else {
        tooltipEl.classList.add('tooltipDivLeft');
        tooltipEl.style.left = position.left + tooltip.caretX + 'px';
    }
    
    // fix position.top because getBoundingClientRect gets values with respect to the window
    tooltipEl.style.top = position.top + window.scrollY + tooltip.caretY + 'px';
    tooltipEl.style.width = "300px";
    tooltipEl.style.fontFamily = tooltip._fontFamily;
    tooltipEl.style.fontSize = tooltip.fontSize;
    tooltipEl.style.fontStyle = tooltip._fontStyle;
    tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px';
};

var getLabelAttendanceRankChart = function(data) {
    var split = data.personilName.split(' ');
    if (split.length)
        return split[0];
    return data.personilName;
}

app.controller('attendanceReportCtrl', function ($scope, $rootScope, $routeParams, $mdDialog, $mdSidenav, $timeout, $location, showMessage, globalConstant, rest) {
    // graphs
    $scope.attendanceRankByOnLeaveChart = {
        labels : [],
        data : [],
        colors : [],
        series : ["Personil Ijin"],
        options : {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true,
                        userCallback: function(label, index, labels) {
                            // when the floored value is the same as the value we have a whole number
                            if (Math.floor(label) === label) {
                                return label;
                            }
                        },
                    },
                    gridLines : {
                        display : true,
                        borderDash : [2, 5],
                        drawBorder : false
                    }
                }],
                xAxes: [{
                    type : 'myScale',
                    categoryPercentage : 0.4,
                    gridLines : {
                        display : false,
                        drawBorder : true,
                        zeroLineWidth : 0,
                        zeroLineColor : 'rgba(0,0,0,0)',
                        offsetGridLines : true
                    }
                }]
            },
            tooltips: {
                enabled: false,
                mode: 'index',
                position: 'average',
                custom: attendanceRankCustomTooltips,
                callbacks : {
                    label : function(tooltipItem, data) {
                        // console.log("tooltipItem ", tooltipItem);
                        if (!$scope.attendanceRankByOnLeaveChart.originalData[tooltipItem.index]) {
                            tooltipItem.displayName = "";
                            return "";
                        }
                        tooltipItem.displayName = $scope.attendanceRankByOnLeaveChart.originalData[tooltipItem.index].personilPangkat + " " + $scope.attendanceRankByOnLeaveChart.originalData[tooltipItem.index].personilName;
                        tooltipItem.personilNRP = $scope.attendanceRankByOnLeaveChart.originalData[tooltipItem.index].personilNRP;
                        return $scope.attendanceRankByOnLeaveChart.originalData[tooltipItem.index].personilName;
                    }
                }
            },
            responsive : true,
            maintainAspectRatio : false
        },
        datasetsOverrides : {},
        canvasWidth : 1000,
        personil : "",
        loaded : false,
        originalData : []
    }

    $scope.resetAttendanceRankByOnLeaveChart = function() {
        $scope.attendanceRankByOnLeaveChart.labels = [];
        $scope.attendanceRankByOnLeaveChart.data = [];
        $scope.attendanceRankByOnLeaveChart.datasetsOverrides = {};
    }

    $scope.initAttendanceRankByOnLeaveChart = function(data) {
        var labels = [];
        var data1 = [];
        var backgroundColor = [];
        for (var i = 0; i < data.length; ++i) {
            var label = getLabelAttendanceRankChart(data[i]);
            labels.push(label);
            data1.push(data[i].total);
            backgroundColor.push('rgb(30, 66, 199)');
        }
        $scope.attendanceRankByOnLeaveChart.originalData = data;
        $scope.attendanceRankByOnLeaveChart.labels = labels;
        $scope.attendanceRankByOnLeaveChart.data = data1;
        $scope.attendanceRankByOnLeaveChart.datasetsOverrides = {
            borderWidth: 1,
            hoverBorderWidth: 1.3,
            borderColor: backgroundColor,
            hoverBorderColor: backgroundColor,
            backgroundColor: backgroundColor,
            hoverBackgroundColor: backgroundColor
        };
        $scope.attendanceRankByOnLeaveChart.canvasWidth = 125 * data.length;
        $scope.attendanceRankByOnLeaveChart.loaded = true;
    }
    $scope.recallAttendanceRankByOnLeaveChart = function() {
        $scope.attendanceRankByOnLeaveChart.loaded = false;
        $scope.resetAttendanceRankByOnLeaveChart();
        rest.attendance.attendanceByValue(globalConstant.ATTENDANCE_VALUES.ON_LEAVE, function(response) {
            console.log("recallAttendanceRankByOnLeaveChart ", response);
            $scope.initAttendanceRankByOnLeaveChart(response.data.data);
        });
    }
    // init
    $scope.recallAttendanceRankByOnLeaveChart();

    $scope.attendanceRankByMedicalLeaveChart = {
        labels : [],
        data : [],
        colors : [],
        series : ["Personil Ijin Sakit"],
        options : {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true,
                        userCallback: function(label, index, labels) {
                            // when the floored value is the same as the value we have a whole number
                            if (Math.floor(label) === label) {
                                return label;
                            }
                        },
                    },
                    gridLines : {
                        display : true,
                        borderDash : [2, 5],
                        drawBorder : false
                    }
                }],
                xAxes: [{
                    type : 'myScale',
                    categoryPercentage : 0.4,
                    gridLines : {
                        display : false,
                        drawBorder : true,
                        zeroLineWidth : 0,
                        zeroLineColor : 'rgba(0,0,0,0)',
                        offsetGridLines : true
                    }
                }]
            },
            tooltips: {
                enabled: false,
                mode: 'index',
                position: 'average',
                custom: attendanceRankCustomTooltips,
                callbacks : {
                    label : function(tooltipItem, data) {
                        // console.log("tooltipItem ", tooltipItem);
                        if (!$scope.attendanceRankByMedicalLeaveChart.originalData[tooltipItem.index]) {
                            tooltipItem.displayName = "";
                            return "";
                        }
                        tooltipItem.displayName = $scope.attendanceRankByMedicalLeaveChart.originalData[tooltipItem.index].personilPangkat + " " + $scope.attendanceRankByMedicalLeaveChart.originalData[tooltipItem.index].personilName;
                        tooltipItem.personilNRP = $scope.attendanceRankByMedicalLeaveChart.originalData[tooltipItem.index].personilNRP;
                        return $scope.attendanceRankByMedicalLeaveChart.originalData[tooltipItem.index].personilName;
                    }
                }
            },
            responsive : true,
            maintainAspectRatio : false
        },
        datasetsOverrides : {},
        canvasWidth : 1000,
        personil : "",
        loaded : false,
        originalData : []
    }

    $scope.resetAttendanceRankByMedicalLeaveChart = function() {
        $scope.attendanceRankByMedicalLeaveChart.labels = [];
        $scope.attendanceRankByMedicalLeaveChart.data = [];
        $scope.attendanceRankByMedicalLeaveChart.datasetsOverrides = {};
    }

    $scope.initAttendanceRankByMedicalLeaveChart = function(data) {
        var labels = [];
        var data1 = [];
        var backgroundColor = [];
        for (var i = 0; i < data.length; ++i) {
            var label = getLabelAttendanceRankChart(data[i]);
            labels.push(label);
            data1.push(data[i].total);
            backgroundColor.push('rgb(225, 149, 18)');
        }
        $scope.attendanceRankByMedicalLeaveChart.originalData = data;
        $scope.attendanceRankByMedicalLeaveChart.labels = labels;
        $scope.attendanceRankByMedicalLeaveChart.data = data1;
        $scope.attendanceRankByMedicalLeaveChart.datasetsOverrides = {
            borderWidth: 1,
            hoverBorderWidth: 1.3,
            borderColor: backgroundColor,
            hoverBorderColor: backgroundColor,
            backgroundColor: backgroundColor,
            hoverBackgroundColor: backgroundColor
        };
        $scope.attendanceRankByMedicalLeaveChart.canvasWidth = 125 * data.length;
        $scope.attendanceRankByMedicalLeaveChart.loaded = true;
    }
    $scope.recallAttendanceRankByMedicalLeaveChart = function() {
        $scope.attendanceRankByMedicalLeaveChart.loaded = false;
        $scope.resetAttendanceRankByMedicalLeaveChart();
        rest.attendance.attendanceByValue(globalConstant.ATTENDANCE_VALUES.MEDICAL_LEAVE, function(response) {
            console.log("recallAttendanceRankByMedicalLeaveChart ", response);
            $scope.initAttendanceRankByMedicalLeaveChart(response.data.data);
        });
    }
    // init
    $scope.recallAttendanceRankByMedicalLeaveChart();

    $scope.attendanceRankByNoNoticeChart = {
        labels : [],
        data : [],
        colors : [],
        series : ["Personil Ijin Sakit"],
        options : {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true,
                        userCallback: function(label, index, labels) {
                            // when the floored value is the same as the value we have a whole number
                            if (Math.floor(label) === label) {
                                return label;
                            }
                        },
                    },
                    gridLines : {
                        display : true,
                        borderDash : [2, 5],
                        drawBorder : false
                    }
                }],
                xAxes: [{
                    type : 'myScale',
                    categoryPercentage : 0.4,
                    gridLines : {
                        display : false,
                        drawBorder : true,
                        zeroLineWidth : 0,
                        zeroLineColor : 'rgba(0,0,0,0)',
                        offsetGridLines : true
                    }
                }]
            },
            tooltips: {
                enabled: false,
                mode: 'index',
                position: 'average',
                custom: attendanceRankCustomTooltips,
                callbacks : {
                    label : function(tooltipItem, data) {
                        // console.log("tooltipItem ", tooltipItem);
                        if (!$scope.attendanceRankByNoNoticeChart.originalData[tooltipItem.index]) {
                            tooltipItem.displayName = "";
                            return "";
                        }
                        tooltipItem.displayName = $scope.attendanceRankByNoNoticeChart.originalData[tooltipItem.index].personilPangkat + " " + $scope.attendanceRankByNoNoticeChart.originalData[tooltipItem.index].personilName;
                        tooltipItem.personilNRP = $scope.attendanceRankByNoNoticeChart.originalData[tooltipItem.index].personilNRP;
                        return $scope.attendanceRankByNoNoticeChart.originalData[tooltipItem.index].personilName;
                    }
                }
            },
            responsive : true,
            maintainAspectRatio : false
        },
        datasetsOverrides : {},
        canvasWidth : 1000,
        personil : "",
        loaded : false,
        originalData : []
    }

    $scope.resetAttendanceRankByNoNoticeChart = function() {
        $scope.attendanceRankByNoNoticeChart.labels = [];
        $scope.attendanceRankByNoNoticeChart.data = [];
        $scope.attendanceRankByNoNoticeChart.datasetsOverrides = {};
    }

    $scope.initAttendanceRankByNoNoticeChart = function(data) {
        var labels = [];
        var data1 = [];
        var backgroundColor = [];
        for (var i = 0; i < data.length; ++i) {
            var label = getLabelAttendanceRankChart(data[i]);
            labels.push(label);
            data1.push(data[i].total);
            backgroundColor.push('rgb(59, 191, 189)');
        }
        $scope.attendanceRankByNoNoticeChart.originalData = data;
        $scope.attendanceRankByNoNoticeChart.labels = labels;
        $scope.attendanceRankByNoNoticeChart.data = data1;
        $scope.attendanceRankByNoNoticeChart.datasetsOverrides = {
            borderWidth: 1,
            hoverBorderWidth: 1.3,
            borderColor: backgroundColor,
            hoverBorderColor: backgroundColor,
            backgroundColor: backgroundColor,
            hoverBackgroundColor: backgroundColor
        };
        $scope.attendanceRankByNoNoticeChart.canvasWidth = 125 * data.length;
        $scope.attendanceRankByNoNoticeChart.loaded = true;
    }
    $scope.recallAttendanceRankByNoNoticeChart = function() {
        $scope.attendanceRankByNoNoticeChart.loaded = false;
        $scope.resetAttendanceRankByNoNoticeChart();
        rest.attendance.attendanceByValue(globalConstant.ATTENDANCE_VALUES.WITHOUT_NOTICE, function(response) {
            console.log("recallAttendanceRankByNoNoticeChart ", response);
            $scope.initAttendanceRankByNoNoticeChart(response.data.data);
        });
    }
    // init
    $scope.recallAttendanceRankByNoNoticeChart();
});
