angular.module('routerApp').factory('InicioSrvc', function($http) {

    var geocoder = new google.maps.Geocoder();

    function geocodeCityName(latlng) {
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

                function addressComponentsLocalityFilter(address_component) {
                    return address_component.types.indexOf('locality') > -1;
                }
            }
        );

        return deferred.promise();
    }

    function queryAllCities() {
        // Using jQuery's Deferred to return a promise
        var deferred = $.Deferred();
        // and a webservice's URL
        var urlCityPerName = Properties.webserviceAddress + '/cities';
        
        // we query the webservice for the list of all cities
        $http({
            method: 'GET',
            url: urlCityPerName
        })
            .success(function(cities) {
                // and then return the full list
                deferred.resolve(cities);
            })
            .error(function (error) {
                // or throw back an error 
                deferred.reject(error);
            });

        // I promise I will return something to you =)
        return deferred.promise();
    }

    function queryCityByName(cityName) {
        // Using jQuery's Deferred to return a promise
        var deferred = $.Deferred();
        // and a webservice's URL
        var urlCityPerName = Properties.webserviceAddress + '/cities?name=' + cityName;

        // we query the webservice for the list of all cities matching the cityName parameter
        $http({
            method: 'GET',
            url: urlCityPerName
        })
            .success(function(cities) {
                // and then return the filtered list
                deferred.resolve(cities[0]);
            })
            .error(function (error) {
                // or throw back an error
                deferred.reject(error);
            });

        // I promise I will return something to you =)
        return deferred.promise();
    }

    function queryWatersources(cityId) {
        // Using jQuery's Deferred to return a promise
        var deferred = $.Deferred();
        // and a webservice's URL
        var urlWatersourcesPerCityId = Properties.webserviceAddress + '/cities/' + cityId + '/watersources';

        // we query the webservice for all watersources of a city given the city's ID on the cityId parameter
        $http({
            method: 'GET',
            url: urlWatersourcesPerCityId
        })
            .success(function(watersources) {
                // and then return a list of watersources
                deferred.resolve(watersources);
            })
            .error(function (error) {
                // or throw back an error
                deferred.reject(error);
            });

        // I promise I will return something to you =)
        return deferred.promise();
    }
    
    return {
        queryAllCities:     queryAllCities,
        geocodeCityName:    geocodeCityName,
        queryCityByName:    queryCityByName,
        queryWatersources:  queryWatersources
    };
});