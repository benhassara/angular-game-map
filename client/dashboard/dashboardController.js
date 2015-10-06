angular.module("gameApp")
.controller("DashboardController", ["$scope", "$http", "$stateParams", "mongoFactory",
function($scope, $http, $stateParams, mongoFactory) {
  var steamid = $stateParams.id;
  console.log(steamid);

  mongoFactory.getUser(steamid)
  .then(function(data) {
    console.log(data);
    // $scope.user = data.data
  });


}]);
