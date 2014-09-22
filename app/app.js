// Setup require.js
require.config({
  baseUrl: 'js/lib',
  shim: {
    "bootstrap": {
      "deps": [ 'jquery' ]
    }
  },
  paths: {
    jquery: 'jquery',
    bootstrap: 'bootstrap',
    'bootstrap-carousel-swipe': 'bootstrap-carousel-swipe',
  }
});

// Application
require([ 'jquery', 'bootstrap' ], function($) {
  require([ 'bootstrap-carousel-swipe' ], function() {
    // DOM ready
    $(function() {
      $('.carousel').carousel({
        interval: false
      });
    });
  })
});