/**
 * photos.js (https://ni-c.github.com/photos.js)
 *
 * @file photos.js
 * @brief photos.js - Photoblog in node.js
 * @author Willi Thiel (ni-c@ni-c.de)
 */

// RequireJS
// @see http://requirejs.org/docs/node.html
var requirejs = require('requirejs');
requirejs.config({
  baseUrl: __dirname,
  nodeRequire: require
});

requirejs([ 'express', 'config-node', 'jade' ], function(Express, Config, Jade) {

  // Get environment, to start in production environment use:
  // $ NODE_ENV=production node photos.js
  var env = process.env.NODE_ENV || 'development';

  // Initialize express
  // @see http://expressjs.com/
  var app = Express();

  // Set environment
  app.set('env', env);
  app.set('dir', __dirname);

  // Create temp directory
  requirejs([ 'fs', 'path' ], function(Fs, Path) {
    var tmpDir = Path.join(__dirname, '.tmp');
    app.set('tmpDir', tmpDir);
    if (!Fs.existsSync(tmpDir)) {
      Fs.mkdirSync(tmpDir);
      if (!Fs.existsSync(tmpDir)) {
        throw new Error('Error creating temp-directory "' + tmpDir + '".');
      }
    }

    // Create CSS
    requirejs([ 'less' ], function(Less) {
      var lessParser = new (Less.Parser)({
        paths: [ './views/less', './bower_components/bootstrap/less', './bower_components/bootstrap/less/mixins' ], // Specify search paths for @import directives
        filename: 'photos.less' // Specify a filename, for better error messages
      });

      // import the bootstrap.less file
      var tmpCss = Path.join(tmpDir, 'photos.css');
      lessParser.parse('@import "photos.less";', function(e, tree) {
        var css = tree.toCSS({
          compress: true
        });
        Fs.writeFile(tmpCss, css, function(err) {
          if (err) {
            throw new Error(err);
          }
          if (!Fs.existsSync(tmpCss)) {
            throw new Error('Error creating temp CSS "' + tmpCss + '".');
          }
        });
      });
    });
  });

  // Initialize config-node
  // @see https://www.npmjs.org/package/config-node
  var config = Config({
    dir: 'config', // where to look for files 
    ext: 'json',
    env: env
  });
  app.set('config', config);

  // Initialize jade
  // @see http://jade-lang.com/
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  // Add middlewares that are only available in development mode
  if ('development' == env) {
    // morgan
    // @see https://www.npmjs.org/package/morgan
    requirejs([ 'morgan' ], function(Morgan) {
      // Log every request to console
      app.use(Morgan('dev'));
    });
  }

  app.get('/', function(req, res) {
    return res.render('index');
  });

  app.use('/photos', Express.static(__dirname + '/photos'));
  
  // CSS files
  requirejs([ 'routes/css' ], function(Css) {
    app.use('/css', Css);
  });

  // Javascript files
  requirejs([ 'routes/js' ], function(Js) {
    app.use('/js', Js);
  });

  // Start express
  app.listen(config.port || 8080);
  console.log('\u001b[32mphotos.js listening on port \u001b[33m%d\033[0m', config.port || 8080);
});