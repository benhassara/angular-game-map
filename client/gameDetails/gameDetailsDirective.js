angular.module("gameApp")
.directive("pieChart", function() {
  return {
    restrict: "E",
    templateUrl: "../gameDetails/pieChart.html"
  };
});

angular.module("gameApp")
.directive("achievementList", function() {
  return {
    restrict: "E",
    templateUrl: "../gameDetails/achievementList.html"
  };
});
