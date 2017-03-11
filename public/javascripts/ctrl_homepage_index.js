var app = angular.module('polamikatHomePageApp', [ 'ngMaterial', 'ngRoute',  'ngSanitize', 'chart.js']);

app.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/a', {
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


var helpers = Chart.helpers;

var defaultConfig = {
    position: 'bottom'
};

var MyScale = Chart.Scale.extend({
    getLabels: function() {
        var data = this.chart.data;
        return (this.isHorizontal() ? data.xLabels : data.yLabels) || data.labels;
    },
    // Implement this so that
    determineDataLimits: function() {
        var me = this;
        var labels = me.getLabels();
        me.minIndex = 0;
        me.maxIndex = labels.length - 1;
        var findIndex;

        if (me.options.ticks.min !== undefined) {
            // user specified min value
            findIndex = helpers.indexOf(labels, me.options.ticks.min);
            me.minIndex = findIndex !== -1 ? findIndex : me.minIndex;
        }

        if (me.options.ticks.max !== undefined) {
            // user specified max value
            findIndex = helpers.indexOf(labels, me.options.ticks.max);
            me.maxIndex = findIndex !== -1 ? findIndex : me.maxIndex;
        }

        me.min = labels[me.minIndex];
        me.max = labels[me.maxIndex];
    },

    buildTicks: function() {
        var me = this;
        var labels = me.getLabels();
        // If we are viewing some subset of labels, slice the original array
        me.ticks = (me.minIndex === 0 && me.maxIndex === labels.length - 1) ? labels : labels.slice(me.minIndex, me.maxIndex + 1);
    },

    getLabelForIndex: function(index, datasetIndex) {
        var me = this;
        var data = me.chart.data;
        var isHorizontal = me.isHorizontal();

        if ((data.xLabels && isHorizontal) || (data.yLabels && !isHorizontal)) {
            return me.getRightValue(data.datasets[datasetIndex].data[index]);
        }
        return me.ticks[index];
    },

    // Used to get data value locations.  Value can either be an index or a numerical value
    getPixelForValue: function(value, index, datasetIndex, includeOffset) {
        var me = this;
        // 1 is added because we need the length but we have the indexes
        var offsetAmt = Math.max((me.maxIndex + 1 - me.minIndex - ((me.options.gridLines.offsetGridLines) ? 0 : 1)), 1);

        if (value !== undefined && isNaN(index)) {
            var labels = me.getLabels();
            var idx = labels.indexOf(value);
            index = idx !== -1 ? idx : index;
        }

        if (me.isHorizontal()) {
            var innerWidth = me.width - (me.paddingLeft + me.paddingRight);
            var valueWidth = innerWidth / offsetAmt;
            var widthOffset = (valueWidth * (index - me.minIndex)) + me.paddingLeft;

            if (me.options.gridLines.offsetGridLines && includeOffset || me.maxIndex === me.minIndex && includeOffset) {
                widthOffset += (valueWidth / 2);
            }

            return me.left + Math.round(widthOffset);
        }
        var innerHeight = me.height - (me.paddingTop + me.paddingBottom);
        var valueHeight = innerHeight / offsetAmt;
        var heightOffset = (valueHeight * (index - me.minIndex)) + me.paddingTop;

        if (me.options.gridLines.offsetGridLines && includeOffset) {
            heightOffset += (valueHeight / 2);
        }

        return me.top + Math.round(heightOffset);
    },
    getPixelForTick: function(index, includeOffset) {
        return this.getPixelForValue(this.ticks[index], index + this.minIndex, null, includeOffset);
    },
    getValueForPixel: function(pixel) {
        var me = this;
        var value;
        var offsetAmt = Math.max((me.ticks.length - ((me.options.gridLines.offsetGridLines) ? 0 : 1)), 1);
        var horz = me.isHorizontal();
        var innerDimension = horz ? me.width - (me.paddingLeft + me.paddingRight) : me.height - (me.paddingTop + me.paddingBottom);
        var valueDimension = innerDimension / offsetAmt;

        pixel -= horz ? me.left : me.top;

        if (me.options.gridLines.offsetGridLines) {
            pixel -= (valueDimension / 2);
        }
        pixel -= horz ? me.paddingLeft : me.paddingTop;

        if (pixel <= 0) {
            value = 0;
        } else {
            value = Math.round(pixel / valueDimension);
        }

        return value;
    },
    getBasePixel: function() {
        return this.bottom;
    },
    draw : function(chartArea) {
        var me = this;
        var options = me.options;
        if (!options.display) {
            return;
        }

        var context = me.ctx;
        var globalDefaults = Chart.defaults.global;
        var optionTicks = options.ticks;
        var gridLines = options.gridLines;
        var scaleLabel = options.scaleLabel;

        var isRotated = me.labelRotation !== 0;
        var skipRatio;
        var useAutoskipper = optionTicks.autoSkip;
        var isHorizontal = me.isHorizontal();

        // figure out the maximum number of gridlines to show
        var maxTicks;
        if (optionTicks.maxTicksLimit) {
            maxTicks = optionTicks.maxTicksLimit;
        }

        var tickFontColor = helpers.getValueOrDefault(optionTicks.fontColor, globalDefaults.defaultFontColor);
        var tickFontSize = helpers.getValueOrDefault(optionTicks.fontSize, globalDefaults.defaultFontSize);
        var tickFontStyle = helpers.getValueOrDefault(optionTicks.fontStyle, globalDefaults.defaultFontStyle);
        var tickFontFamily = helpers.getValueOrDefault(optionTicks.fontFamily, globalDefaults.defaultFontFamily);
        var tickLabelFont = helpers.fontString(tickFontSize, tickFontStyle, tickFontFamily);
        var tl = gridLines.tickMarkLength;
        var borderDash = helpers.getValueOrDefault(gridLines.borderDash, globalDefaults.borderDash);
        var borderDashOffset = helpers.getValueOrDefault(gridLines.borderDashOffset, globalDefaults.borderDashOffset);

        var scaleLabelFontColor = helpers.getValueOrDefault(scaleLabel.fontColor, globalDefaults.defaultFontColor);
        var scaleLabelFontSize = helpers.getValueOrDefault(scaleLabel.fontSize, globalDefaults.defaultFontSize);
        var scaleLabelFontStyle = helpers.getValueOrDefault(scaleLabel.fontStyle, globalDefaults.defaultFontStyle);
        var scaleLabelFontFamily = helpers.getValueOrDefault(scaleLabel.fontFamily, globalDefaults.defaultFontFamily);
        var scaleLabelFont = helpers.fontString(scaleLabelFontSize, scaleLabelFontStyle, scaleLabelFontFamily);

        var labelRotationRadians = helpers.toRadians(me.labelRotation);
        var cosRotation = Math.cos(labelRotationRadians);
        var longestRotatedLabel = me.longestLabelWidth * cosRotation;

        // Make sure we draw text in the correct color and font
        context.fillStyle = tickFontColor;

        var itemsToDraw = [];

        if (isHorizontal) {
            skipRatio = false;

            // Only calculate the skip ratio with the half width of longestRotateLabel if we got an actual rotation
            // See #2584
            if (isRotated) {
                longestRotatedLabel /= 2;
            }

            if ((longestRotatedLabel + optionTicks.autoSkipPadding) * me.ticks.length > (me.width - (me.paddingLeft + me.paddingRight))) {
                skipRatio = 1 + Math.floor(((longestRotatedLabel + optionTicks.autoSkipPadding) * me.ticks.length) / (me.width - (me.paddingLeft + me.paddingRight)));
            }

            // if they defined a max number of optionTicks,
            // increase skipRatio until that number is met
            if (maxTicks && me.ticks.length > maxTicks) {
                while (!skipRatio || me.ticks.length / (skipRatio || 1) > maxTicks) {
                    if (!skipRatio) {
                        skipRatio = 1;
                    }
                    skipRatio += 1;
                }
            }

            if (!useAutoskipper) {
                skipRatio = false;
            }
        }


        var xTickStart = options.position === 'right' ? me.left : me.right - tl;
        var xTickEnd = options.position === 'right' ? me.left + tl : me.right;
        var yTickStart = options.position === 'bottom' ? me.top : me.bottom - tl;
        var yTickEnd = options.position === 'bottom' ? me.top + tl : me.bottom;

        helpers.each(me.ticks, function(label, index) {
            // If the callback returned a null or undefined value, do not draw this line
            if (label === undefined || label === null) {
                return;
            }

            var isLastTick = me.ticks.length === index + 1;

            // Since we always show the last tick,we need may need to hide the last shown one before
            var shouldSkip = (skipRatio > 1 && index % skipRatio > 0) || (index % skipRatio === 0 && index + skipRatio >= me.ticks.length);
            if (shouldSkip && !isLastTick || (label === undefined || label === null)) {
                return;
            }

            var lineWidth, lineColor;
            if (index === (typeof me.zeroLineIndex !== 'undefined' ? me.zeroLineIndex : 0)) {
                // Draw the first index specially
                lineWidth = gridLines.zeroLineWidth;
                lineColor = gridLines.zeroLineColor;
            } else {
                lineWidth = helpers.getValueAtIndexOrDefault(gridLines.lineWidth, index);
                lineColor = helpers.getValueAtIndexOrDefault(gridLines.color, index);
            }

            // Common properties
            var tx1, ty1, tx2, ty2, x1, y1, x2, y2, labelX, labelY;
            var textAlign = 'middle';
            var textBaseline = 'middle';

            if (isHorizontal) {
                if (!isRotated) {
                    textBaseline = options.position === 'top' ? 'bottom' : 'top';
                }

                textAlign = isRotated ? 'right' : 'center';

                var xLineValue = me.getPixelForTick(index) + helpers.aliasPixel(lineWidth); // xvalues for grid lines
                labelX = me.getPixelForTick(index, gridLines.offsetGridLines) + optionTicks.labelOffset; // x values for optionTicks (need to consider offsetLabel option)
                labelY = (isRotated) ? me.top + 12 : options.position === 'top' ? me.bottom - tl : me.top + tl;
                tx1 = tx2 = x1 = x2 = xLineValue;
                ty1 = yTickStart;
                ty2 = yTickEnd;
                y1 = chartArea.top;
                y2 = chartArea.bottom;
            } else {
                if (options.position === 'left') {
                    if (optionTicks.mirror) {
                        labelX = me.right + optionTicks.padding;
                        textAlign = 'left';
                    } else {
                        labelX = me.right - optionTicks.padding;
                        textAlign = 'right';
                    }
                // right side
                } else if (optionTicks.mirror) {
                    labelX = me.left - optionTicks.padding;
                    textAlign = 'right';
                } else {
                    labelX = me.left + optionTicks.padding;
                    textAlign = 'left';
                }

                var yLineValue = me.getPixelForTick(index); // xvalues for grid lines
                yLineValue += helpers.aliasPixel(lineWidth);
                labelY = me.getPixelForTick(index, gridLines.offsetGridLines);

                tx1 = xTickStart;
                tx2 = xTickEnd;
                x1 = chartArea.left;
                x2 = chartArea.right;
                ty1 = ty2 = y1 = y2 = yLineValue;
            }

            itemsToDraw.push({
                tx1: tx1,
                ty1: ty1,
                tx2: tx2,
                ty2: ty2,
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                labelX: labelX,
                labelY: labelY,
                glWidth: lineWidth,
                glColor: lineColor,
                glBorderDash: borderDash,
                glBorderDashOffset: borderDashOffset,
                rotation: -1 * labelRotationRadians,
                label: label,
                textBaseline: textBaseline,
                textAlign: textAlign
            });
        });

        // Draw all of the tick labels, tick marks, and grid lines at the correct places
        helpers.each(itemsToDraw, function(itemToDraw) {
            if (gridLines.display) {
                context.save();
                context.lineWidth = itemToDraw.glWidth;
                context.strokeStyle = itemToDraw.glColor;
                if (context.setLineDash) {
                    context.setLineDash(itemToDraw.glBorderDash);
                    context.lineDashOffset = itemToDraw.glBorderDashOffset;
                }

                context.beginPath();

                if (gridLines.drawTicks) {
                    context.moveTo(itemToDraw.tx1, itemToDraw.ty1);
                    context.lineTo(itemToDraw.tx2, itemToDraw.ty2);
                    
                }

                if (gridLines.drawOnChartArea) {
                    context.moveTo(itemToDraw.x1, itemToDraw.y1);
                    context.lineTo(itemToDraw.x2, itemToDraw.y2);
                }

                context.stroke();
                context.restore();
            }

            if (optionTicks.display) {
                context.save();
                context.translate(itemToDraw.labelX, itemToDraw.labelY);
                context.rotate(itemToDraw.rotation);
                context.font = tickLabelFont;
                context.textBaseline = itemToDraw.textBaseline;
                context.textAlign = itemToDraw.textAlign;

                var label = itemToDraw.label;
                if (helpers.isArray(label)) {
                    for (var i = 0, y = -(label.length - 1)*tickFontSize*0.75; i < label.length; ++i) {
                        // We just make sure the multiline element is a string here..
                        context.fillText('' + label[i], 0, y);
                        // apply same lineSpacing as calculated @ L#320
                        y += (tickFontSize * 1.5);
                    }
                } else {
                    context.fillText(label, 0, 0);
                }
                context.restore();
            }
        });
        var it = 0;
        for(it = 0; it < itemsToDraw.length; ++it) {
            if (it % 2 == 0) {
                var p1 = itemsToDraw[it];
                if (it + 1 == itemsToDraw.length) break;
                var p2 = itemsToDraw[it + 1];
                context.save();
                context.fillStyle = "#eff5f6";
                context.fillRect(p1.tx1,0,Math.abs(p2.tx2 - p1.tx1),Math.abs(0 - p1.ty1));
                context.restore();
            } else {
                var p1 = itemsToDraw[it];
                if (it + 1 == itemsToDraw.length) break;
                var p2 = itemsToDraw[it + 1];
                context.save();
                context.fillStyle = "#f4fafa";
                context.fillRect(p1.tx1,0,Math.abs(p2.tx2 - p1.tx1),Math.abs(0 - p1.ty1));
                context.restore();
            }
        }
        
        if (itemsToDraw.length % 2 != 0) {
            var p1 = itemsToDraw[it];
            context.save();
            context.fillStyle = "#eff5f6";
            context.fillRect(p1.tx1,0,Math.abs(me.right - p1.tx1),Math.abs(0 - p1.ty1));
            context.restore();
        }

        if (scaleLabel.display) {
            // Draw the scale label
            var scaleLabelX;
            var scaleLabelY;
            var rotation = 0;

            if (isHorizontal) {
                scaleLabelX = me.left + ((me.right - me.left) / 2); // midpoint of the width
                scaleLabelY = options.position === 'bottom' ? me.bottom - (scaleLabelFontSize / 2) : me.top + (scaleLabelFontSize / 2);
            } else {
                var isLeft = options.position === 'left';
                scaleLabelX = isLeft ? me.left + (scaleLabelFontSize / 2) : me.right - (scaleLabelFontSize / 2);
                scaleLabelY = me.top + ((me.bottom - me.top) / 2);
                rotation = isLeft ? -0.5 * Math.PI : 0.5 * Math.PI;
            }

            context.save();
            context.translate(scaleLabelX, scaleLabelY);
            context.rotate(rotation);
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillStyle = scaleLabelFontColor; // render in correct colour
            context.font = scaleLabelFont;
            context.fillText(scaleLabel.labelString, 0, 0);
            context.restore();
        }

        if (gridLines.drawBorder) {
            // Draw the line at the edge of the axis
            context.lineWidth = helpers.getValueAtIndexOrDefault(gridLines.lineWidth, 0);
            context.strokeStyle = helpers.getValueAtIndexOrDefault(gridLines.color, 0);
            var x1 = me.left,
                x2 = me.right,
                y1 = me.top,
                y2 = me.bottom;

            var aliasPixel = helpers.aliasPixel(context.lineWidth);
            if (isHorizontal) {
                y1 = y2 = options.position === 'top' ? me.bottom : me.top;
                y1 += aliasPixel;
                y2 += aliasPixel;
            } else {
                x1 = x2 = options.position === 'left' ? me.right : me.left;
                x1 += aliasPixel;
                x2 += aliasPixel;
            }

            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.stroke();
        }
    }
});

Chart.scaleService.registerScaleType('myScale', MyScale, defaultConfig);

var activityCustomTooltips = function(tooltip) {
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
        titleLines.forEach(function(title) {
            innerHtml += '<span>' + title + '</span>';
        });
        innerHtml += '</div>';
        innerHtml += '<div class="layout-row"><span class="tooltipTotalLabel">Total Aktivitas</span>&nbsp;&nbsp;&nbsp;<span class="tooltipNumber">'+sum+'</span></div>';
        innerHtml += '</div>';
        tooltipEl.innerHTML = innerHtml;
    }
    var position = this._chart.canvas.getBoundingClientRect();
    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.classList.remove('tooltipDivRight');
    tooltipEl.classList.remove('tooltipDivLeft');
    if (position.left + tooltip.caretX + 200 + 12 >= position.right) {
        if (position.left + tooltip.caretX - 230 > 0) {
            tooltipEl.classList.add('tooltipDivRight');
            tooltipEl.style.left = position.left + tooltip.caretX - 230 + 'px';
        } else {
            tooltipEl.classList.add('tooltipDivLeft');
            tooltipEl.style.left = position.left + tooltip.caretX + 'px';
        }
    } else {
        tooltipEl.classList.add('tooltipDivLeft');
        tooltipEl.style.left = position.left + tooltip.caretX + 'px';
    }
    
    tooltipEl.style.top = position.top + tooltip.caretY + 200 + 'px';
    tooltipEl.style.width = "200px";
    tooltipEl.style.fontFamily = tooltip._fontFamily;
    tooltipEl.style.fontSize = tooltip.fontSize;
    tooltipEl.style.fontStyle = tooltip._fontStyle;
    tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px';
};

var getLabelChart = function(data) {
    return data.category.name;
}

app.controller('mainCtrl', function ($scope, $rootScope, $mdDialog, $mdSidenav, $location, $timeout, $filter, $route, $window, rest) {
    $scope.doLogin = function() {
        $window.location.href = '/a';
    }

    /* Chart*/
    $scope.activitiesChart = {
        labels : [],
        data : [],
        colors : [],
        series : ["Aktivitas Personil"],
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
                custom: activityCustomTooltips
            },
            responsive : true,
            maintainAspectRatio : false
        },
        datasetsOverrides : {},
        canvasWidth : 1000,
        personil : "",
        loaded : false
    }

    $scope.resetActivitiesChart = function() {
        $scope.activitiesChart.labels = [];
        $scope.activitiesChart.data = [];
        $scope.activitiesChart.datasetsOverrides = {};
    }

    $scope.initActivitiesChart = function(data) {
        var labels = [];
        var data1 = [];
        var backgroundColor = [];
        for (var i = 0; i < data.length; ++i) {
            var label = getLabelChart(data[i]);
            labels.push(label);
            data1.push(data[i].total);
            backgroundColor.push('rgb(59, 191, 189)');
        }
        $scope.activitiesChart.labels = labels;
        $scope.activitiesChart.data = data1;
        $scope.activitiesChart.datasetsOverrides = {
            borderWidth: 1,
            hoverBorderWidth: 1.3,
            borderColor: backgroundColor,
            hoverBorderColor: backgroundColor,
            backgroundColor: backgroundColor,
            hoverBackgroundColor: backgroundColor
        };
        $scope.activitiesChart.canvasWidth = 125 * data.length;
        $scope.activitiesChart.loaded = true;
    }
    $scope.recallActivitiesChart = function() {
        $scope.activitiesChart.loaded = false;
        $scope.resetActivitiesChart();
        rest.activities.personilActivity($scope.activitiesChart.personil, function(response) {
            console.log("recallActivitiesChart ", response);
            $scope.initActivitiesChart(response.data.data);
        });
    }

    $scope.changePersonil = function() {
        console.log("$scope.activitiesChart personil ", $scope.activitiesChart.personil);
        $scope.recallActivitiesChart();
    }


    $scope.personilList = [];
    rest.users.personilList(function(response) {
        console.log("personilList ", response);
        if (response.data.data)
            $scope.personilList = angular.copy(response.data.data);
        else
            $scope.personilList = [];
        
        if ($scope.personilList.length) {
            $scope.activitiesChart.personil = $scope.personilList[0]._id;
            $scope.recallActivitiesChart();
        } else {
            $scope.activitiesChart.loaded = true;
        }
    });

    $scope.sortType     = 'total';
    $scope.sortReverse  = true;

    $scope.personilNilaiData = [];
    rest.activities.rankPersonil(function(response) {
        console.log("rankPersonil ", response);
        if (response.data.data)
            $scope.personilNilaiData = angular.copy(response.data.data);
        else
            $scope.personilNilaiData = [];
    });
});

