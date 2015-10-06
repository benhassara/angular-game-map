angular.module("gameApp")
.factory('mongoFactory', ['$http', function($http) {

  var obj = {};

  //function to get ALL users form mongodb
  obj.getUser = function(id) {
    return $http.get('/user/' + id);
  };

  return obj;
}]);
