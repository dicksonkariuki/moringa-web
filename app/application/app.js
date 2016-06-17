// app.js
var routerApp = angular.module('routerApp', ['ui.router']);

routerApp.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/status');

    $stateProvider

    // HOME STATES AND NESTED VIEWS ========================================
        .state('status', {
            url: '/status',
            templateUrl: 'app/components/reports/status/report.html'
        })
        .state('user', {
            url: '/user',
            templateUrl: 'app/components/reports/user/report.html'
        })

        .state('call', {
            url: '/call',
            templateUrl: 'app/components/reports/call/report.html'
        })

        // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
        .state('about', {
            // we'll get to this in a bit
        });

});