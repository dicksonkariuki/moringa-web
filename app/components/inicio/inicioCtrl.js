angular.module('routerApp').controller('inicioCtrl', function ($scope) {

    var map;
    var geocoder;
    var city;
    var watersources;

    initialize();

    function initialize() {
        geocoder = new google.maps.Geocoder();
        getLocation();
    }

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
        } else {
            //TODO: No native support; Query IP geolocation
        }
    }

    function geolocationSuccess(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;

        loadMap(lat, lng);
    }

    function geolocationError(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                console.log("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                console.log("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                console.log("The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                console.log("An unknown error occurred.");
                break;
        }
    }

    function loadMap(lat, lng) {
        // Geolocation avaliable. Let's show a map!
        var latlng = new google.maps.LatLng(lat, lng);

        var options = {
            zoom: 12,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById("mapa"), options);

        loadPins();
    }

    function loadPins() {
        queryCity(map.center).then(queryCitySuccess, queryCityError);

        function queryCitySuccess(cityName) {
            queryWatersources(cityName);
        }

        function queryCityError(error) {
            console.log(error);
        }
    }

    function queryCity(latlng) {
        var deferred = $.Deferred();
        geocoder.geocode(
            {   //google.maps.GeocoderRequest
                location: latlng
            },
        function (results, status) {
            switch (status) {
                    case google.maps.GeocoderStatus.OK:
                        locality = results[0].address_components.filter(addressComponentsLocalityFilter)[0];
                        deferred.resolve(locality.long_name);
                        break;
                    case google.maps.GeocoderStatus.ZERO_RESULTS:
                    default:
                        console.log("Geocode was not successful for the following reason: " + status);
                        deferred.reject(status);
                        break;
                }
            }
        );

        return deferred.promise();
    }

    function addressComponentsLocalityFilter(address_component) {
        return address_component.types.indexOf('locality') > -1;
    }

    function queryCityId(cityName) {
        var urlCityIdPerName = '/cities?name=' + cityName;

        // Angular $http() and then() both return promises themselves
        return $http({
            method: 'GET',
            url: urlCityIdPerName
        })
            .success(function(response) {
                // What we return here is the data that will be accessible
                // to us after the promise resolves
                return response;
            });
    }

    function queryWatersources(cityId) {

        queryCityId(cityName).then(queryCityIdSuccess, queryCityIdError);

        function queryCityIdSuccess(cityId) {

        }

        function queryCityIdError(error) {

        }

        // Angular $http() and then() both return promises themselves
        return $http({
            method: 'GET',
            url: urlWatersourcesPerCity
        })
            .success(function(response) {
                // What we return here is the data that will be accessible
                // to us after the promise resolves
                return response;
            });
    }

    function loadPin(item, index) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(item.latitude, item.longitude),
            title: item.name,
            map: map,
            icon: 'assets/img/marcador.png'
        });
    }

    function codeAddress() {
        var address = document.getElementById("address").value;
        geocoder.geocode( { 'address': address}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location
                });
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
    }


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