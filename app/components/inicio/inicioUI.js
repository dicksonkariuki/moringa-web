/**
 * Initialize UI plugins
 */
angular.module('routerApp').factory('InicioUI', function() {

    var chart, chartDateLabel = 'x', chartValueLabel = 'Milhões de m³';

    function initialize() {

        $("#selectCity").select2();

        //TODO initialize map and make the other methods only set the position

        /**
         * Initializing chart
         */
        chart = generateChart();
    }

    //TODO concluir definição de cores do chart
    function repeatUpTo(upTo, n) {
        // An = (n+upTo) mod (upTo+1) https://www.wolframalpha.com/input/?i=n%2B4mod+5
        console.log('(' + n + '+' + upTo + ') mod ' + (upTo +1) + ' = ' + (n + upTo) % (upTo+1));
        return (n + upTo) % (upTo+1);
    }

    function generateChart() {

        return c3.generate({
            data: {
                x: chartDateLabel,
                xFormat: '%d/%m/%Y',
                columns: []
                // colors: function () {
                //     var colors = ['#FF5555','#66CCEE','#FFBB33','#77CC44','#9988FF'];
                //     chart.data.colors = {};
                //     chart.columns.map(function (data, index) {
                //         chart.data.colors[data] = colors[repeatUpTo(4, index+1)];
                //     });
                //     console.log(chart.data.colors);
                //     return chart.data.colors;
                // }
            },
            legend: {
                show: true
            },
            line : {
                connectNull: true
            },
            subchart : {
                show : true
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        format: '%d/%m/%Y'
                    }
                },
                y: {
                    tick: {
                        format: function (y) {
                            return (y/1000000).toFixed(1);
                        }
                    },
                    label: {
                        text: chartValueLabel,
                        position: 'outer-middle'
                    }
                }
            },
            padding: {
                right: 20
            }
        });
    }

    function loadChart(dates, lines) {

        dates.splice(0,0,chartDateLabel);

        var data = [dates];

        if (lines != null) {
            for (i=0; i<lines.length; i++) {
                data.push(lines[i]);
            }
        }

        chart.load({
            columns: data,
            unload: chart.columns
        });
    }

    function loadAccordion() {
        $("#watersourcesAccordion").conventAccordion({"pauseOnHover":true,"actOnHover":true,"autoPlay":true,"slideInterval":"5000","maxContainerWidth":"100%"});
    }

    function destroyAccordion() {
        element = $("#watersourcesAccordion")
        if (element.hasClass('conventAccordion')) {
            $("#watersourcesAccordion").conventAccordion('destroy');
        }
    }

    return {
        initialize:         initialize,
        loadChart:          loadChart,
        loadAccordion:      loadAccordion,
        destroyAccordion:   destroyAccordion
    };
});

/**
 * UI Directives
 */
angular.module('routerApp').directive('onAccordionRepeatRender', function ($rootScope) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$first) {
                $rootScope.$broadcast('accordionRepeatStarted', { temp: "some value" });
            }
            if (scope.$last) {
                $rootScope.$broadcast('accordionRepeatFinished', { temp: "some value" });
            }
        }
    };
});