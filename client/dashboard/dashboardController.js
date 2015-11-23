angular.module("gameApp")
.controller("DashboardController",
["$scope", "$http", "$stateParams", "mongoFactory", "steamFactory",
function($scope, $http, $stateParams, mongoFactory, steamFactory) {
  var steamid = $stateParams.id;
  $scope.isCollapsed = false;

  mongoFactory.getUser(steamid)
  .then(function(data) {
    $scope.user = data.data;
  });

  // steamFactory.getSteamList($scope.user)
  // .then(function(data) {
  //   var steamList = data.data;
  //   if (steamList.length !== $scope.user.games.length) {
  //     steamFactory.getGames(steamid)
  //     .then(function(data) {
  //       $scope.games = data.data;
  //       var steam = FuzzySet();
  //       var steamGameNames = $scope.games.steam.map(function(game) {return game.name;});
  //       steamGameNames.forEach(function(name) {steam.add(name);});
  //
  //       $scope.gbArray = [];
  //       for (var i = 0; i < $scope.games.gb.length; i++) {
  //         var query = steam.get($scope.games.gb[i].name);
  //         var steamIndex = steamGameNames.indexOf(query[0][1]);
  //         $scope.gbArray[steamIndex] = $scope.games.gb[i];
  //       }
  //       $scope.games.gb = $scope.gbArray;
  //     });
  //   }
  // });

  steamFactory.getGames(steamid)
  .then(function(data) {
    $scope.games = data.data;
    var steam = FuzzySet();
    var steamGameNames = $scope.games.steam.map(function(game) {return game.name;});
    steamGameNames.forEach(function(name) {steam.add(name);});

    $scope.gbArray = [];
    for (var i = 0; i < $scope.games.gb.length; i++) {
      var query = steam.get($scope.games.gb[i].name);
      var steamIndex = steamGameNames.indexOf(query[0][1]);
      $scope.gbArray[steamIndex] = $scope.games.gb[i];
    }
    $scope.games.gb = $scope.gbArray;
  });

  $scope.saveGames = function() {
    var games = [];
    for (var i = 0; i < $scope.games.steam.length; i++) {
      games[i] = {
        steam: $scope.games.steam[i],
        gb: $scope.games.gb[i]
      };
    }
    mongoFactory.saveGames(games);
  };
}]);
