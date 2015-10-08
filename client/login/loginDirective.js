angular.module("gameApp")
.directive("steamLogin", function() {
  return {
    restrict: "E",
    templateUrl: "../login/login.html"
  };
});
