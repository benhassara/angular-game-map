angular.module("gameApp")
.factory('mongoFactory', ['$http', function($http) {

  var obj = {};

  //function to get ALL users form mongodb
  obj.getUser = function(id) {
    return $http.get('/user/' + id);
  };

  /** Save games to database */
  obj.saveGames = function(games) {
    return $http.post('/games');
  };

  return obj;
}]);

angular.module("gameApp")
.factory('steamFactory', ['$http', function($http) {

  var obj = {};

  //function to get ALL users form mongodb
  obj.getGames = function(id) {
    return $http.get('/games/' + id);
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
