angular.module("gameApp")
.factory('mongoFactory', ['$http', function($http) {

  var obj = {};

  //function to get a users from mongodb
  obj.getUser = function(id) {
    return $http.get('/user/' + id);
  };

  /** Save games to games collection */
  obj.saveGames = function(games) {
    return $http.post('/games', JSON.stringify(games));
  };

  /** Get a single game from collection */
  obj.getGame = function(game) {
    var steamAppId = game.appid;
    return $http.get('/game/' + steamAppId);
  };

  /** Update a user's game list */
  obj.updateUserGames = function(id, games) {
    var endpoint = '/user/games/' + id;
    var jsonGames = JSON.stringify(games);
    return $http.post(endpoint, jsonGames);

  };

  return obj;
}]);

angular.module("gameApp")
.factory('steamFactory', ['$http', function($http) {

  var obj = {};

  //function to get ALL users from mongodb
  obj.getGames = function(id) {
    return $http.get('/games/' + id);
  };

  obj.getSteamList = function(id) {
    return $http.get('/steamlist/' + id);
  };

  obj.getGame = function(id) {
    return $http.get('game/' + id);
  };

  obj.getGameImages = function(appId, hash) {
    // return $http.get("http://media.steampowered.com/steamcommunity/public/images/apps/" + appId + "/" + hash + ".jpg");
    return $http.get("https://steamcdn-a.akamaihd.net/steam/apps/" + appId + "/header.jpg");
  };

  obj.getGame = function(appId, steamId) {
    return $http.get("/game/" + appId + "/" + steamId + "/achievements");
  };

  return obj;
}]);
