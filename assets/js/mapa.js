var map;

function initialize() {
    var latlng = new google.maps.LatLng(-7.4965076, -36.1545404);

    var options = {
        zoom: 5,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("mapa"), options);
}

initialize();

function carregarPontos() {

    $.getJSON('assets/js/pontos.json', function(pontos) {

        var latlngbounds = new google.maps.LatLngBounds();

        $.each(pontos, function(index, ponto) {

            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(ponto.Latitude, ponto.Longitude),
                title: "Meu ponto personalizado! :-D",
                map: map,
                icon: 'assets/img/marcador.png'
            });
        });
    });
}

carregarPontos();