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

  var baseurl = $('base').attr('href');

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

      var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.transform(coordinates, 'EPSG:4326', 'EPSG:3857'))
      });

      var iconStyle = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
          anchor: [0.5, 105],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          opacity: 0.75,
          scale: 0.3,
          src: '../img/mapmarker.svg'
        }))
      });

      iconFeature.setStyle(iconStyle);

      var vectorSource = new ol.source.Vector({
        features: [iconFeature]
      });

      var vectorLayer = new ol.layer.Vector({
        source: vectorSource
      });

      var view = new ol.View({
        center: ol.proj.transform(coordinates, 'EPSG:4326', 'EPSG:3857'),
        zoom: 10
      });

      var map = new ol.Map({
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          }),
          vectorLayer
        ],
        target: 'map',
        controls: ol.control.defaults({
        }),
        view: view
      });
    };

    // Initialize angularJs
    var url = baseurl + '/photo/' + $('#slug').val() + '.json';
    url = url + '?r=true';
    $http.get(url, { cache: true }).success(function(data) {
      $scope.photo = data;
      $('tr.exifdata').removeClass('hide');

      
      if (data.exif.gps) {
        initMap([ data.exif.gps.longitude.decimal, data.exif.gps.latitude.decimal ]);
      } else {
        $('#map').css('display', 'none');
      }
    });

    // carousel slid-event
    $('#carousel-photos').on('slid.bs.carousel', function(e) {

      // load data from server
      var url = $(this).find('.active').attr('data-json');
      url = url + '?w=' + $(window).width() + '&h=' + $(window).height();
      $http.get(url, { cache: true }).success(function(data) {
        $scope.photo = data;

        if (e.direction == 'left') {

          // Slide to left
          if ((data.next) && (!$('.item[data-json="' + data.next.href + '.json"]').length)) {
            // Only push history if the event was not triggered by popstate
            if (!popstate) {
              history.replaceState({ json: data.prev.href + '.json', direction: e.direction }, '', data.prev.href);
            }
            // Append the new picture to the carousel
            $('#carousel-photos-inner').append('<div class="item" data-json="' + data.next.href + '.json"><img src="' + data.next.src + '" alt="' + data.next.title + '" /></div>');
          }
        } else {

          // Slide to right          
          if ((data.prev) && (!$('.item[data-json="' + data.prev.href + '.json"]').length)) {
            // Only push history if the event was not triggered by popstate
            if (!popstate) {
              history.replaceState({ json: data.next.href + '.json', direction: e.direction }, '', data.next.href);
            }
            // Prepend the new picture to the carousel
            $('#carousel-photos-inner').prepend('<div class="item" data-json="' + data.prev.href + '.json"><img src="' + data.prev.src + '" alt="' + data.prev.title + '"  /></div>');
          }
        }

        // Set title
        $(document).prop('title',data.title + ' | ' + $('meta[name="DC.Title"]').attr('content'));

        // Only push history if the event was not triggered by popstate
        if (!popstate) {
          history.pushState({ json: data.href + '.json', direction: e.direction }, '', data.href);
        }

        // Reinitialize carousel
        $('.carousel').carousel({
          interval: false,
          wrap: false
        });

        // Reinitialize Map
        $('#map').empty();
        $('#map').css('display', 'none');
        if (data.exif.gps) {
          $('#map').css('display', '');
          initMap([ data.exif.gps.longitude.decimal, data.exif.gps.latitude.decimal ]);
        }

        $('.carousel-control').removeClass("hidden");

        // Reset popstate
        popstate = false;
      });
    });

    // Hide & Show arrows
    function hideControls() {
      $('.carousel-control').fadeOut(500);
    }
    var hideFunc = setTimeout(hideControls, 2000);
    $('#carousel-photos').bind('mouseenter touchstart', function() {
      clearTimeout(hideFunc);
      $('.carousel-control').fadeIn(500); 
    });
    $('#carousel-photos').bind('mouseleave touchend', function() {
      clearTimeout(hideFunc);
      hideFunc = setTimeout(hideControls, 1000);
    });

    // Trigger carousel if back button is clicked
    $(window).on('popstate', function () {
      popstate = true;
      var index = $('#carousel-photos .active').index('#carousel-photos .item');
      var targetIndex = $('#carousel-photos .item[data-json="' +  history.state.json + '"]').index('#carousel-photos .item');
      if (index > targetIndex) {
        $('#carousel-photos').carousel('prev');
        hideControls();
      } else {
        $('#carousel-photos').carousel('next');
        hideControls();
      }
    });

    $(document).keydown(function(event) {
      switch (event.keyCode) {
        // right & k
        case 39:
        case 75:
          event.preventDefault();
          $('#carousel-photos').carousel('next');
          clearTimeout(hideFunc);
          hideFunc = setTimeout(hideControls, 1000);
          break;
        // left & j
        case 37:
        case 74:
          event.preventDefault();
          $('#carousel-photos').carousel('prev');
          clearTimeout(hideFunc);
          hideFunc = setTimeout(hideControls, 1000);
          break;
      }
    });

    // Openlayers CSS
    $('head').append('<link rel="stylesheet" href="' + baseurl + '/css/ol.css" type="text/css" />');
  });

  angular.element(document).ready(function() {
    angular.bootstrap(document, [ 'photosApp' ]);
  });

  // Archive Map
  if ($('#archivemap').length > 0) {
    
    // Openlayers CSS
    $('head').append('<link rel="stylesheet" href="' + baseurl + '/css/ol.css" type="text/css" />');

    var coordinates = [65, 30];

    $.get(baseurl + '/archive/map.json', function( images ) {

      var features = [];

      images.forEach(function(image) {

        var iconFeature = new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.transform(image.coordinates, 'EPSG:4326', 'EPSG:3857')),
          url: image.url
        });

        var iconStyle = new ol.style.Style({
          image: new ol.style.Icon(({
            anchor: [0.5, 75],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            opacity: 0.9,
            scale: 1.0,
            src: image.base64,
          }))
        });

        iconFeature.setStyle(iconStyle);

        features.push(iconFeature);

      });

      var vectorSource = new ol.source.Vector({
        features: features
      });

      var vectorLayer = new ol.layer.Vector({
        source: vectorSource
      });

      var view = new ol.View({
        center: ol.proj.transform(coordinates, 'EPSG:4326', 'EPSG:3857'),
        zoom: 2.8
      });

      var map = new ol.Map({
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          }),
          vectorLayer
        ],
        target: 'archivemap',
        controls: ol.control.defaults({
        }),
        view: view
      });

      // go to url on click
      map.on('singleclick', function(evt) {
        var feature = map.forEachFeatureAtPixel(evt.pixel,
          function(feature, layer) {
            return feature;
          });
        if (feature) {
          window.location.href = feature.get('url');
        }
      });

      // change mouse cursor when over marker
      $(map.getViewport()).on('mousemove', function(e) {
        var pixel = map.getEventPixel(e.originalEvent);
        var hit = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
          return true;
        });
        if (hit) {
          $('#archivemap').css('cursor', 'pointer');
        } else {
          $('#archivemap').css('cursor', '');
        }
      });      

    }, 'json');

  }

});