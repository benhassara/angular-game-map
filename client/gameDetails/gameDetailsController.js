angular.module("gameApp")
.controller("GameController",
["$scope", "$http", "$stateParams", "mongoFactory", "steamFactory",
function($scope, $http, $stateParams, mongoFactory, steamFactory) {
  var steamid = $stateParams.id;
  var gameid = $stateParams.appid;

  mongoFactory.getUser(steamid)
  .then(function(data) {
    $scope.user = data.data;
  });
}]);
