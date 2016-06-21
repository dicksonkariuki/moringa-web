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

    function queryCityByName(cityName) {
        var urlCityPerName = Properties.webserviceAddress + '/cities?name=' + cityName;

        // Angular $http() and then() both return promises themselves
        return $http({
            method: 'GET',
            url: urlCityPerName
        })
            .success(function(city) {
                // What we return here is the data that will be accessible
                // to us after the promise resolves
                return city;
            });
    }

    function queryWatersources(cityId) {

        var urlWatersourcesPerCityId = Properties.webserviceAddress + '/cities/' + cityId + '/watersources';

        // Angular $http() and then() both return promises themselves
        return $http({
            method: 'GET',
            url: urlWatersourcesPerCityId
        })
            .success(function(response) {
                // What we return here is the data that will be accessible
                // to us after the promise resolves
                return response;
            });
    }
    
    return {
        geocodeCityName:    geocodeCityName,
        queryCityByName:    queryCityByName,
        queryWatersources:  queryWatersources
    };
});