if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([ 'express' ], function(Express) {

  /**
   * Css-Controller
   *
   * @class Css
   * @constructor 
   */
  var Css = Express.Router();

  Css.directories = [ './views/less', './bower_components/bootstrap/less', './bower_components/bootstrap/less/mixins', './bower_components/flag-icon-css/less' ];

  /**
   * Compiles the css files to the disc
   * 
   * @param {Object} app The express application
   * @param {Function} callback The callback method to execute after rendering
   * @param {String} callback.err null if no error occured, otherwise the error
   * @param {String} callback.result The rendered CSS string
   */
  Css.compile = function(app, callback) {
    requirejs([ 'less', 'path', 'fs' ], function(less, path, fs) {
      var lessParser = new (less.Parser)({
        paths: Css.directories, // Specify search paths for @import directives
        filename: 'photos.less' // Specify a filename, for better error messages
      });

      // import the bootstrap.less file
      var tmpCss = path.join(app.get('tmpDir'), 'photos.css');
      lessParser.parse('@import "photos.less";', function(e, tree) {
        if (e) {
          return callback(e, '');
        } else {
          var css = tree.toCSS({
            compress: true
          });
          fs.writeFile(tmpCss, css, function(err) {
            if (err) {
              return callback(err, css);
            }
            if (!fs.existsSync(tmpCss)) {
              return callback('Error creating temp CSS "' + tmpCss + '".', css);
            }
            return callback(null, css);
          });
        }
      });
    });
  }
  
  /**
   * Renders all less file in a minimized css file.
   * 
   * In production mode, the CSS file is loaded from an already compiled file.
   * In development mode, the CSS file is generated every time.
   * 
   * @param {Object} req The request
   * @param {Object} res The response
   * @param {Object} next The next route
   */
  Css.get('/photos.css', function(req, res, next) {

    if (req.app.get('env') == 'development') {
      /*
       * Development mode
       */
      requirejs([ 'less' ], function(less) {
        var lessParser = new (less.Parser)({
          paths: Css.directories, // Specify search paths for @import directives
          filename: 'photos.less' // Specify a filename, for better error messages
        });

        // import the bootstrap.less file
        lessParser.parse('@import "photos.less";', function(e, tree) {
          res.set('Content-Type', 'text/css');
          res.send(tree.toCSS({
            compress: false
          }));
        });
      });
    } else {
      /*
       * Production mode 
       */
      requirejs([ 'path' ], function(path) {
        res.sendFile(path.join(req.app.get('dir'), '.tmp', 'photos.css'));
      });
    }
  });

  /**
   * Gets the ol.css file of ol3-unofficial
   * 
   * @param {Object} req The request
   * @param {Object} res The response
   * @param {Object} next The next route
   */
  Css.get('/ol.css', function(req, res, next) {
    requirejs([ 'path' ], function(path) {
      console.log(path.join(req.app.get('dir'), 'bower_components', 'ol3-unofficial' , 'ol.css'));
      res.sendFile(path.join(req.app.get('dir'), 'bower_components', 'ol3-unofficial' , 'ol.css'));
    });
  });

  var exports = Css;

  return exports;

});
