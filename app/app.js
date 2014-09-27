// Setup require.js
require.config({
  baseUrl: '/js/lib',
  shim: {
    "bootstrap": {
      "deps": [ 'jquery' ]
    }
  },
  paths: {
    jquery: 'jquery',
    bootstrap: 'bootstrap',
    angular: 'angular',
    moment: 'moment',
    'bootstrap-carousel-swipe': 'bootstrap-carousel-swipe'
  }
});

// Application
require([ 'jquery', 'moment', 'angular', 'bootstrap' ], function($, moment) {

  require([ 'bootstrap-carousel-swipe' ], function() {
    // DOM ready
    $(function() {
      // Bootstrap init
      $('.carousel').carousel({
        interval: false,
        wrap: false
      });
    });
  });

  var photosApp = angular.module('photosApp', []);
  photosApp.controller('photosCtrl', function($scope, $http) {
    $http.get('/photo/' + $('#slug').val() + '.json').success(function(data) {
      $scope.photo = data;
    });
  });
  angular.element(document).ready(function() {
    angular.bootstrap(document, [ 'photosApp' ]);
  });

});