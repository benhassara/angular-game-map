angular.module("gameApp")
.controller("DashboardController", ["$scope", "$http", "$stateParams", "mongoFactory", "steamFactory",
function($scope, $http, $stateParams, mongoFactory, steamFactory) {
  var steamid = $stateParams.id;

  mongoFactory.getUser(steamid)
  .then(function(data) {
    $scope.user = data.data;
  });

  steamFactory.getGames(steamid)
  .then(function(data) {
    $scope.games = data.data.steam;
    console.log(data.data);
  });
}]);
