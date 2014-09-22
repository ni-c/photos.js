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
    bootstrap: 'bootstrap'
  }
});

// Application
require([ 'jquery', 'bootstrap' ], function($) {

  // DOM ready
  $(function() {
  });

});