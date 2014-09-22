if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([ 'express', 'path' ], function(Express, Path) {

  /**
   * js-Controller
   *
   * @class Js
   * @constructor 
   */
  var Js = Express.Router();

  /**
   * Contains the path to the javascript-files for production and optional development mode.
   * 
   * @property config
   * @type Object
   * @default {}
   */
  Js.config = {
    jquery: {
      development: 'bower_components/jquery/dist/jquery.js',
      production: 'bower_components/jquery/dist/jquery.min.js'
    },
    requirejs: {
      production: 'bower_components/requirejs/require.js'
    },
    bootstrap: {
      development: 'bower_components/bootstrap/dist/js/bootstrap.js',
      production: 'bower_components/bootstrap/dist/js/bootstrap.min.js'
    },
    'bootstrap-carousel-swipe': {
      production: 'bower_components/bootstrap-carousel-swipe/carousel-swipe.js'
    },
    app: {
      production: 'app/app.js'
    }
  };

  /**
   * Renders the given javascript file
   * 
   * @method render
   * @param {String} js The name of the javascript file to render
   * @param {Object} req The request
   * @param {Object} res The response
   * @param {Object} next The next route
   */
  Js.render = function(js, req, res, next) {
    if (!Js.config[js] || !Js.config[js].production) {
      throw new Error('JavaScript config for "' + js + '" not found.');
    }
    res.set('Content-Type', 'text/javascript');
    if (req.app.get('env') == 'development') {
      var dir = Js.config[js].development ? Js.config[js].development : Js.config[js].production;
      res.sendFile(Path.join(req.app.get('dir'), dir));
    } else {
      res.sendFile(Path.join(req.app.get('dir'), Js.config[js].production));
    }
  }

  /**
   * Routes
   */
  Js.get('/lib/jquery.js', function(req, res, next) {
    return Js.render('jquery', req, res, next);
  });

  Js.get('/lib/require.js', function(req, res, next) {
    return Js.render('requirejs', req, res, next);
  });

  Js.get('/lib/bootstrap.js', function(req, res, next) {
    return Js.render('bootstrap', req, res, next);
  });

  Js.get('/lib/bootstrap-carousel-swipe.js', function(req, res, next) {
    return Js.render('bootstrap-carousel-swipe', req, res, next);
  });

  Js.get('/app.js', function(req, res, next) {
    return Js.render('app', req, res, next);
  });

  var exports = Js;

  return exports;

});
