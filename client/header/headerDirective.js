angular.module("gameApp")
.directive("userHeader", function() {
  return {
    restrict: "E",
    templateUrl: "../header/header.html"
  };
});
