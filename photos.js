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

requirejs([ 'express', 'config-node', 'jade', 'i18next', 'moment' ], function(express, config, jade, i18n, moment) {

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

  // TODO: create own file in /routes
  function renderPhoto(req, res, next) {

    // TODO: load photo from database
    var photo = {
      title: 'A really long and fancy image title',
      date: moment().format('YYYY-MM-DD, HH:mm'),
      description: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
      category: 'Images',
      tags: [ 'colorful', 'rectangular', 'visible', 'fancy' ],
      camera: 'Canon EOS 1D Mark III',
      focallength: '300 mm',
      aperture: 'f/8.0',
      exposure: '1/250s',
      iso: '100',
      lens: 'Tamron 70-300mm f/4-5.6 Di VC US',
      url: {
        jpg: {
          prev: 'http://localhost:8080/photo/image1.jpg',
          current: 'http://localhost:8080/photo/image2.jpg',
          next: 'http://localhost:8080/photo/image3.jpg'
        },
        html: {
          prev: 'http://localhost:8080/photo/image1',
          current: 'http://localhost:8080/photo/image2',
          next: 'http://localhost:8080/photo/image3'
        }
      }
    };

    // Helper function to check for file extension
    function endsWith(str, suffix) {
      return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    // Render JSON for angularjs
    if (req.params.file && (endsWith(req.params.file, '.json'))) {
      return res.json(photo);
    }

    // For jpg go to static route
    if (req.params.file && (endsWith(req.params.file, '.jpg'))) {
      return next();
    }

    // Render HTML page
    return res.render('index', {
      photo: photo
    });
  }

  // Photo routes
  app.get('/', renderPhoto);
  app.get('/photo/:file', renderPhoto);

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