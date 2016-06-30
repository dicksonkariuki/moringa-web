/**
 * Initialize UI plugins
 */
angular.module('routerApp').factory('InicioUI', function() {

    var chart, chartDateLabel = 'x';

    $(document).ready(function() {

        $("#selectCity").select2();

        //TODO initialize map and make the other methods only set the position

        /**
         * Initializing chart
         */
        chart = generateChart();

    });

    function generateChart() {
        return c3.generate({
            data: {
                x: chartDateLabel,
                xFormat: '%d/%m/%Y',
                columns: []
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

    return {
        loadChart:     loadChart
    };
});

