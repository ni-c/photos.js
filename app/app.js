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
    'bootstrap-carousel-swipe': 'bootstrap-carousel-swipe',
    Openlayers: 'openlayers'
  }
});

// Application
require([ 'jquery', 'moment', 'angular', 'bootstrap', 'openlayers' ], function($, moment) {

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

    var popstate = false;

    function initMap(coordinates) {
      var map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
            title: "Location",
            source: new ol.source.TileWMS({
              url: 'http://maps.opengeo.org/geowebcache/service/wms',
              params: {LAYERS: 'openstreetmap', VERSION: '1.1.1'}
            })
          })
        ],
        view: new ol.View({
          projection: 'EPSG:4326',
          center: coordinates,
          zoom: 12
        })
      });      
    };

    // Initialize angularJs
    $http.get(baseurl + '/photo/' + $('#slug').val() + '.json', { cache: true }).success(function(data) {
      $scope.photo = data;
      $('tr.exifdata').removeClass('hide');

      if (data.exif.gps) {
        initMap([ data.exif.gps.longitude.decimal, data.exif.gps.latitude.decimal ]);
      } 
    });

    // carousel slid-event
    $('#carousel-photos').on('slid.bs.carousel', function(e) {

      // load data from server
      var href = $(this).find('.active').attr('data-json');
      $http.get(href, { cache: true }).success(function(data) {
        $scope.photo = data;

        if (e.direction == 'left') {

          // Slide to left
          if ((data.next) && (!$('.item[data-json="' + data.next.href + '.json"]').length)) {
            // Only push history if the event was not triggered by popstate
            if (!popstate) {
              history.replaceState({ json: data.prev.href + '.json', direction: e.direction }, '', data.prev.href);
            }
            // Append the new picture to the carousel
            $('#carousel-photos-inner').append('<div class="item" data-json="' + data.next.href + '.json"><img src="' + data.next.src + '" /></div>');
          }
        } else {

          // Slide to right          
          if ((data.prev) && (!$('.item[data-json="' + data.prev.href + '.json"]').length)) {
            // Only push history if the event was not triggered by popstate
            if (!popstate) {
              history.replaceState({ json: data.next.href + '.json', direction: e.direction }, '', data.next.href);
            }
            // Prepend the new picture to the carousel
            $('#carousel-photos-inner').prepend('<div class="item" data-json="' + data.prev.href + '.json"><img src="' + data.prev.src + '" /></div>');
          }
        }

        // Only push history if the event was not triggered by popstate
        if (!popstate) {
          history.pushState({ json: data.href + '.json', direction: e.direction }, '', data.href);
        }

        // Reinitialize carousel
        $('.carousel').carousel({
          interval: false,
          wrap: false
        });

        $('#map').empty();
        if (data.exif.gps) {
          initMap([ data.exif.gps.longitude.decimal, data.exif.gps.latitude.decimal ]);
        }

        // Reset popstate
        popstate = false;
      });
    });

    // Trigger carousel if back button is clicked
    $(window).on('popstate', function () {
      popstate = true;
      var index = $('#carousel-photos .active').index('#carousel-photos .item');
      var targetIndex = $('#carousel-photos .item[data-json="' +  history.state.json + '"]').index('#carousel-photos .item');
      if (index > targetIndex) {
        $('#carousel-photos').carousel('prev');
      } else {
        $('#carousel-photos').carousel('next');
      }
    });

    $(document).keydown(function(event) {
      switch (event.keyCode) {
        // right & k
        case 39:
        case 75:
          event.preventDefault();
          $('#carousel-photos').carousel('next');
          break;
        // left & j
        case 37:
        case 74:
          event.preventDefault();
          $('#carousel-photos').carousel('prev');
          break;
      }
    });

    // Openlayers CSS
    $('head').append('<link rel="stylesheet" href="' + baseurl + '/css/ol.css" type="text/css" />');

  });
  angular.element(document).ready(function() {
    angular.bootstrap(document, [ 'photosApp' ]);
  });


});