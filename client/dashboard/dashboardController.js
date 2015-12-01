angular.module("gameApp")
.controller("DashboardController",
["$scope", "$q", "$stateParams", "mongoFactory", "steamFactory",
function($scope, $q, $stateParams, mongoFactory, steamFactory) {
  var steamid = $stateParams.id;
  $scope.isCollapsed = false;
  $scope.loading = true;


  mongoFactory.getUser(steamid)
  .then(function(data) {
    $scope.user = data.data;
    steamFactory.getSteamList($scope.user.steamid)
    .then(function(result) {
      var steamList = result.data.gameList;
      var userGames = $scope.user.games.filter(function(game) { return game !== null; });

      if (steamList.length !== userGames.length) {
        getSteamGames()
        .then(function(result) {
          return mongoFactory.saveGames(mapToMongo());
        })
        .then(function(result) {
          console.log(result.data);
        });
      }
    });
  });

  function getSteamGames() {
    return $q(function(resolve, reject) {
      steamFactory.getGames(steamid)
      .then(function(data) {
        $scope.games = data.data;
        var giantBombSet = FuzzySet();
        var giantBombNames = $scope.games.gb.map(function(game) { return game.name; });
        giantBombNames.forEach(function(name) { giantBombSet.add(name); });

        $scope.gbArray = [];
        for (var i = 0; i < $scope.games.steam.length; i++) {
          var steamName = $scope.games.steam[i].name;
          var queryWith = mustHandle(steamName) ? steamToGb(steamName) : steamName;
          var query = giantBombSet.get(queryWith);
          var gbIndex = giantBombNames.indexOf(query[0][1]);
          $scope.gbArray[i] = $scope.games.gb[gbIndex];
        }

        $scope.games.gb = $scope.gbArray;
        $scope.loading = false;
        resolve(true);
      });
    });
  }

  /** Determines whether the Steam game name is one that needs to be remapped to match Giant Bomb
   * returns Giant Bomb's name for the game.
   */
  function mustHandle(steamName) {
    // model is {steamName: gbName}
    var names = ['Arma 2: DayZ Mod','Arma 2','Arma 2: Operation Arrowhead','Arma 2: Operation Arrowhead Beta (Obsolete)','Patch testing for Chivalry'];
    if (names.indexOf(steamName) !== -1) { return true; }
    return false;
  }

  function steamToGb(steamName) {
    var names = {
      'Arma 2: DayZ Mod': 'DayZ',
      'Arma 2': 'ArmA II',
      'Arma 2: Operation Arrowhead': 'ArmA II: Operation Arrowhead',
      'Arma 2: Operation Arrowhead Beta (Obsolete)': 'ArmA II: Operation Arrowhead',
      'Patch testing for Chivalry': 'Chivalry: Medieval Warfare'
    };
    return names[steamName];
  }

  function mapToMongo() {
    var games = [];
    for (var i = 0; i < $scope.games.steam.length; i++) {
      games[i] = {
        steam: $scope.games.steam[i],
        gb: $scope.games.gb[i]
      };
    }
    return games;
  }
}]);
