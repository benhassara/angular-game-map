angular.module("gameApp")
.controller("GameController",
["$scope", "$http", "$stateParams", "mongoFactory", "steamFactory",
function($scope, $http, $stateParams, mongoFactory, steamFactory) {
  var steamId = $stateParams.id;
  var appId = $stateParams.appid;


  mongoFactory.getUser(steamId)
  .then(function(data) {
    $scope.user = data.data;
    console.log(data.data);
  });

  steamFactory.getGameAchievements(appId, steamId)
  .then(function(data) {
    console.log(data);
  });
}]);
