angular.module("gameApp")
.controller("GameController",
["$scope", "$http", "$stateParams", "mongoFactory", "steamFactory",
function($scope, $http, $stateParams, mongoFactory, steamFactory) {
  var steamId = $stateParams.id;
  var appId = $stateParams.appid;
  var completed = [];
  var open = [];
  var colorArray = ['green', 'blue'];
  $scope.showAchievements = false;


  $scope.xFunction = function(){
    return function(d) {
      return d.key;
    };
  };

  $scope.yFunction = function(){
    return function(d){
      return d.y;
    };
  };

  $scope.colorFunction = function() {
    return function(d, i) {
      return colorArray[i];
    };
  };

  mongoFactory.getUser(steamId)
  .then(function(data) {
    $scope.user = data.data;
  });

  steamFactory.getGame(appId, steamId)
  .then(function(data) {
    $scope.game = data.data;
    var achievements = data.data.achievements;
    console.log(data.data);
    for (var i = 0; i < achievements.length; i++) {
      if (achievements[i].achieved === 1) {
        completed.push(achievements[i]);
      } else {
        open.push(achievements[i]);
      }
    }

    $scope.exampleData = [
      { key: "Completed", y: completed.length },
      { key: "Open", y: open.length },
    ];
  });

  //handles click events on the pie chart created
  $scope.$on('elementClick.directive', function(angularEvent, event){
    $scope.showAchievements = true;
    if (event.label === "Completed") {
      $scope.achievements = completed;
      $scope.$apply();
    } else {
      $scope.achievements = open;
      $scope.$apply();
    }
  });


}]);
