angular.module("gameApp")
.controller("GameController",
["$scope", "$http", "$stateParams", "mongoFactory", "steamFactory",
function($scope, $http, $stateParams, mongoFactory, steamFactory) {
  var steamId = $stateParams.id;
  var appId = $stateParams.appid;


  mongoFactory.getUser(steamId)
  .then(function(data) {
    $scope.user = data.data;
  });

  steamFactory.getGameAchievements(appId, steamId)
  .then(function(data) {
    console.log(data);
    if (!data.success) {
      $scope.heading = data.error;
    }
    else {
      $scope.heading = data.gameName + ': Achievements';
    }
  });
}]);
