angular.module('gameApp', ["ui.router"])

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
      });
  });
