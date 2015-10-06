angular.module("gameApp")
.factory('mongoFactory', ['$http', function($http) {

  var obj = {};

  //function to get ALL users form mongodb
  obj.getUser = function(id) {
    return $http.get('/user/' + id);
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

  return obj;
}]);
