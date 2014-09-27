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

requirejs([ 'express', 'config-node', 'jade', 'i18next', 'moment', 'libs/mongodbHelper' ], function(express, config, jade, i18n, moment, mongodbHelper) {

  // Get environment, to start in production environment use:
  // $ NODE_ENV=production node photos.js
  var env = process.env.NODE_ENV || 'development';

  // Initialize express
  // @see http://expressjs.com/
  var app = express();

  // Set environment
  app.set('env', env);
  app.set('dir', __dirname);

  // Create temp directory
  requirejs([ 'fs', 'path' ], function(fs, path) {
    var tmpDir = path.join(__dirname, '.tmp');
    app.set('tmpDir', tmpDir);
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir);
      if (!fs.existsSync(tmpDir)) {
        throw new Error('Error creating temp-directory "' + tmpDir + '".');
      }
    }

    // Create CSS
    requirejs([ 'routes/css' ], function(css) {
      css.compile(app, function(err, result) {
        if (err) {
          throw new Error(err);
        }
      });
    });
  });

  // Initialize config-node
  // @see https://www.npmjs.org/package/config-node
  var config = config({
    dir: 'config', // where to look for files 
    ext: 'json',
    env: env
  });
  app.set('config', config);

  // Connect to the mongodb and initialize gridfs
  mongodbHelper.connect(config.mongodb, function(err, result) {

    if (err) throw new Error(err);

    app.set('db', result.db);
    app.set('grid', result.grid);
    // Initialize jade
    // @see http://jade-lang.com/
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');

    // Internationalization
    i18n.init({
      fallbackLng: 'en-US'
    });
    app.use(i18n.handle);
    i18n.registerAppHelper(app);

    // Flags
    app.use('/flags', express.static(__dirname + '/bower_components/flag-icon-css/flags'));

    // Add middlewares that are only available in development mode
    if ('development' == env) {
      // morgan
      // @see https://www.npmjs.org/package/morgan
      requirejs([ 'morgan' ], function(Morgan) {
        // Log every request to console
        app.use(Morgan('dev'));
      });
    }

    // Photo routes
    requirejs([ 'routes/photo' ], function(photo) {
      app.get('/', photo.render);
      app.get('/photo/:file', photo.render);
    });

    // About route
    app.get('/about', function(req, res) {
      return res.render('about');
    });

    // Static routes
    app.use('/photo', express.static(__dirname + '/photos'));
    app.use('/img', express.static(__dirname + '/views/img'));

    // CSS files
    requirejs([ 'routes/css' ], function(css) {
      app.use('/css', css);
    });

    // Javascript files
    requirejs([ 'routes/js' ], function(js) {
      app.use('/js', js);
    });

    // Start express
    app.listen(config.port || 8080);
    console.log('\u001b[32mphotos.js listening on port \u001b[33m%d\033[0m', config.port || 8080);

  });
});