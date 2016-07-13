/**
 * Initialize UI plugins
 */
angular.module('moringaApp').factory('InicioUI', function() {

    var accordion = {
        element: null,
        create: function (elementId) {
            this.element = $('#' + elementId).conventAccordion({
                "pauseOnHover":true,
                "actOnHover":true,
                "autoPlay":true,
                "slideInterval":"5000",
                "maxContainerWidth":"100%"});
        },
        destroy: function () {
            if (this.element && this.element.hasClass('conventAccordion')) {
                this.element.conventAccordion('destroy');
            }
        },
        play: function () {
            if (this.element && this.element.hasClass('conventAccordion')) {
                this.element.conventAccordion('play');
            }
        },
        pause: function () {
            if (this.element && this.element.hasClass('conventAccordion')) {
                this.element.conventAccordion('stop');
            }
        },
        activate: function (spine) {
            if (this.element && this.element.hasClass('conventAccordion')) {
                this.element.conventAccordion('activate', spine);
            }
        }
    };

    var chart = {
        element: null,
        dateLabel: 'x',
        valueLabel: 'Milhões de m³',
        colorPattern: ['#FF5555','#66CCEE','#FFBB33','#77CC44','#9988FF'],
        create: function () {
            var chart = this;
            this.element = c3.generate({
                data: {
                    x: this.dateLabel,
                    xFormat: '%d/%m/%Y',
                    columns: []
                },
                legend: {
                    show: true,
                    item: {
                        onmouseover: function (label) {
                            accordion.pause();
                            var names = [];
                            chart.element.data().map(function (data) {
                                names.push(data.id);
                            });
                            accordion.activate(names.indexOf(label)+1);
                        },
                        onmouseout: function () {
                            accordion.play();
                        }
                    }
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
                            text: this.valueLabel,
                            position: 'outer-middle'
                        }
                    }
                },
                padding: {
                    right: 20
                }
            });
        },
        load: function (dates, lines) {
            var chart = this;
            dates.splice(0,0,this.dateLabel);
            var data = [dates];
            if (lines) {
                lines.map(function (line) {
                    data.push(line);
                })
            }

            var colors = {};
            data.map(function (line, index) {
                if (index > 0) {
                    colors[line[0]] = chart.colorPattern[upTo(4, index)];
                }
            });
            this.element.data.colors(colors);

            this.element.load({
                columns: data,
                unload: null
            });
        }
    };

    var map = {
        element: null,
        create: function (elementId) {
            var options = {
                zoom: 4,
                center: new google.maps.LatLng(-14.0488146,-62.2094967), // Brasil
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            this.element = new google.maps.Map(document.getElementById(elementId), options);
        },
        load: function (latlng, zoom) {
            zoom = zoom ? zoom : 10;
            var options = {
                zoom: zoom,
                center: latlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            this.element = this.element ? this.element : this.create('map');
            this.element.setOptions(options);
        }
    };


    function upTo(to, n) {
        // An = (n+to) mod (to+1); https://www.wolframalpha.com/input/?i=0,1,2,3,4,0,1,2,3,4,0,1,2,3,4
        return (n + to) % (to+1);
    }

    function initialize() {

        /**
         * Initialize selectCity
         */
        $("#selectCity").select2();

        /**
         * Initialize map
         */
        map.create('map');

        /**
         * Initializing chart
         */
        chart.create();
    }
    
    return {
        initialize:         initialize,
        accordion:          accordion,
        chart:              chart,
        map:                map
    };
});

/**
 * UI Directives
 */
angular.module('moringaApp').directive('onAccordionRepeatRender', function ($rootScope) {
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