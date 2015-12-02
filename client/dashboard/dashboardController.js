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
    // deal with possible null values in user.games array
    // TODO: Implement the else for this.
    if ($scope.user.games && $scope.user.games.length > 0) {
      $scope.user.games = $scope.user.games.filter(function(game) {
        return game !== null;
      });
    }

    steamFactory.getSteamList($scope.user.steamid)
    .then(function(result) {
      var steamList = result.data.gameList;
      var userGames = $scope.user.games;

      if (steamList.length !== userGames.length) {
        getSteamGames()
        .then(function(result) {
          console.log(result);
          console.log(mapToMongo(result));
          $scope.games = mapToMongo(result);
          $scope.loading = false;
          return mongoFactory.saveGames(mapToMongo(result));
        })
        .then(function(result) {
          var gamesForUser = result.data.games;

          // check for games already added to the user
          if ($scope.user.games && $scope.user.games.length > 0) {
            $scope.user.games.forEach(function(userGame) {
              // if the userGame._id matches none of the _ids in gamesForUser
              var match = gamesForUser.every(function(newGame) {
                return userGame._id !== newGame.__id;
              });
              // if there's no match, add it to gamesForUser
              if (!match) { gamesForUser.push(userGame); }
            });
          }

          return mongoFactory.updateUserGames($scope.user.steamid, gamesForUser);
        })
        .then(function(result) {
          if (result.data.success) {
            $scope.user = result.data.user;
          }
        });
      }
      else {

      }
    });
  });

  function getSteamGames() {
    return $q(function(resolve, reject) {
      steamFactory.getGames(steamid)
      .then(function(data) {
        var apiGames = data.data;
        var giantBombSet = FuzzySet();
        var giantBombNames = apiGames.gb.map(function(game) { return game.name; });
        giantBombNames.forEach(function(name) { giantBombSet.add(name); });

        var gbArray = [];
        for (var i = 0; i < apiGames.steam.length; i++) {
          var steamName = apiGames.steam[i].name;
          var queryWith = mustHandle(steamName) ? steamToGb(steamName) : steamName;
          var query = giantBombSet.get(queryWith);
          var gbIndex = giantBombNames.indexOf(query[0][1]);
          gbArray[i] = apiGames.gb[gbIndex];
        }

        apiGames.gb = gbArray;
        // $scope.loading = false;
        resolve(apiGames);
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

  function mapToMongo(gameObj) {
    var games = [];
    for (var i = 0; i < gameObj.steam.length; i++) {
      games[i] = {
        steam: gameObj.steam[i],
        gb: gameObj.gb[i]
      };
    }
    return games;
  }
}]);
