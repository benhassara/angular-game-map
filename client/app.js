angular.module('gameApp', ["ui.router", 'ngAnimate', 'ui.bootstrap'])

  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('/', {
        url: '/',
        templateUrl: './views/home.html'
      })
      .state('dashboard', {
        url: '/dashboard/:id',
        templateUrl: './dashboard/dashboard.html',
        controller: 'DashboardController'
      })
      .state('gameDetails', {
        url: '/dashboard/:id/game/:appid',
        templateUrl: './gameDetails/gameDetails.html',
        controller: 'GameController'
      });
  });
