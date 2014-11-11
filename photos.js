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

requirejs([ 'express', 'config-node', 'jade', 'i18next', 'moment', 'path', 'libs/mongodbHelper' ], function(express, config, jade, i18n, moment, path, mongodbHelper) {

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

    app.set('package', require('./package.json'));
    app.set('bower', require('./bower.json'));
    
    // Initialize jade
    // @see http://jade-lang.com/
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');

    // Internationalization
    i18n.init({
      lng: 'de-DE',
      fallbackLng: 'de-DE',
      useCookie: false,
      detectLngFromHeaders: false
    });
    app.use(i18n.handle);
    i18n.registerAppHelper(app);
    app.set('i18n', i18n);

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

    requirejs([ 'routes/photo', 'routes/css', 'routes/js', 'routes/static', 'routes/archive', 'routes/feed', 'routes/sitemap' ], function(photo,css, js, stat, archive, feed, sitemap) {

      // Set locals
      app.all('*', function(req, res, next) {
        app.locals.baseurl = req.protocol + '://' + req.headers.host;
        app.locals.meta = req.app.get('config').meta;
        app.locals.breadcrumbs = [];
        app.locals.keywords = req.app.get('config').meta.keywords;
        next();
      });
    
      // Photo routes
      app.get('/', photo.render);
      app.get('/photo/:file', photo.render);
      
      app.get('/archive', archive.render)
      app.get('/archive/category/:category', archive.render)
      app.get('/archive/tag/:tag', archive.render)

      // Static routes
      app.use('/photo', express.static(__dirname + '/photos'));
      app.use('/img', express.static(__dirname + '/views/img'));
      
      // RSS Feed
      app.get('/feed.rss', feed.render);
      
      // Sitemap.xml
      app.get('/sitemap.xml', sitemap.render);

      // CSS files
      app.use('/css', css);

      // Javascript files
      app.use('/js', js);
      
      // Static pages
      app.get('/about', stat.about);

      // Static files
      app.use(express.static(path.join(__dirname, 'public')));

      // Not found
      app.use('*', function(req, res, next) {
        res.status(404);

        // Helper function to check for file extension
        function endsWith(str, suffix) {
          return str.indexOf(suffix, str.length - suffix.length) !== -1;
        }

        if (req.baseUrl && (endsWith(req.baseUrl, '.jpg'))) {
          res.send('404 Not Found');
        } else if (req.baseUrl && (endsWith(req.baseUrl, '.json'))) {
          res.json({
            status: 404,
            description: 'Not Found'
          });
        } else {
          res.render('error/404');
      }
      });
      
      // Errorhandler
      app.use(function(err, req, res, next) {
        var data = {};
        if ('development' == env) {
          console.error(err.stack);
          data.err = err.stack;
        }
        res.status(500);
        res.render('error/500', data);
      });

    });
    
    // Start express
    app.listen(config.port || 8080);
    console.log('\u001b[32mphotos.js listening on port \u001b[33m%d\033[0m', config.port || 8080);

  });
});