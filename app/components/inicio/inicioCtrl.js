angular.module('routerApp').controller('inicioCtrl', function ($scope, $http) {

    var map;

    $http.get('assets/mock/mock.json')
        .then(function(res){
            $scope.watersource = res.data;
        });

    function initialize() {
        var latlng = new google.maps.LatLng(-7.4965076, -36.1545404);

        var options = {
            zoom: 12,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById("mapa"), options);

    }

    initialize();

    function carregarPontos() {

        $.getJSON('assets/mock/pontos.json', function(pontos) {

            $.each(pontos, function(index, ponto) {

                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(ponto.Latitude, ponto.Longitude),
                    title: "Boqueirão! :-D",
                    map: map,
                    icon: 'assets/img/marcador.png'
                });
            });
        });
    }

    carregarPontos();

    var chart = c3.generate({
        data: {
            x: 'x',
    //        xFormat: '%Y%m%d', // 'xFormat' can be used as custom format of 'x'
            columns: [
                ['x', '2013-01-01', '2013-01-02', '2013-01-03', '2013-01-04', '2013-01-05', '2013-01-06'],
    //            ['x', '20130101', '20130102', '20130103', '20130104', '20130105', '20130106'],
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 130, 340, 200, 500, 250, 350]
            ]
        },
        subchart : {
            show : true
        },
        axis: {
            x: {
                type: 'timeseries',
                tick: {
                    format: '%Y-%m-%d'
                }
            }
        }
    });

});