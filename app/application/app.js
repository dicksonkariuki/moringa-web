// app.js
var routerApp = angular.module('routerApp', ['ui.router']);

routerApp.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/inicio');

    $stateProvider

    // HOME STATES AND NESTED VIEWS ========================================
        .state('inicio', {
            url: '/inicio',
            templateUrl: 'app/components/inicio/inicio.html'
        })
        .state('acude', {
            url: '/acude',
            templateUrl: 'app/components/acude/acude.html'
        })
        .state('sobre', {
        url: '/sobre',
        templateUrl: 'app/components/sobre/sobre.html'
    });

});