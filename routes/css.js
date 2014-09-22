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

  /**
   * Renders all less file in a minimized css file.
   * 
   * In production mode, the CSS file is loaded from an already compiled file.
   * In development mode, the CSS file is generated every time.
   */
  Css.get('/photos.css', function(req, res, next) {

    if (req.app.get('env') == 'development') {
      /*
       * Development mode
       */
      requirejs([ 'less' ], function(Less) {
        var lessParser = new (Less.Parser)({
          paths: [ './views/less', './bower_components/bootstrap/less', './bower_components/bootstrap/less/mixins' ], // Specify search paths for @import directives
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
      requirejs([ 'path' ], function(Path) {
        res.sendFile(Path.join(req.app.get('dir'), '.tmp', 'photos.css'));
      });
    }
  });

  var exports = Css;

  return exports;

});
