angular.module("gameApp")
.directive("gameContainer", function() {
  return {
    restrict: "E",
    templateUrl: "../game/game.html"
  };
});

// adds a different image if the original image is 404
angular.module("gameApp")
.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {
        if (attrs.src != attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);
        }
      });
    }
  };
});
