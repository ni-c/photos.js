if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([ 'express' ], function(express) {

  /**
   * photo-Controller
   *
   * @class Photo
   * @constructor 
   */
  var Photo = function() {}

  /**
   * Renders the given javascript file
   * 
   * @method render
   * @param {Object} grid The gridfs object
   * @param {String} filename The filename of the image
   * @param {String} aliases An array of aliases for the image
   * @param {Object} metadata The metadata to save with the image
   * @param {Function} callback The callback method to execute after rendering
   * @param {String} callback.err null if no error occured, otherwise the error
   * @param {String} callback.result The rendered CSS string
   */
  Photo.put = function(grid, filename, aliases, metadata, callback) {
    if (!callback) callback = function() {};
    console.log('save');
    requirejs( [ 'fs', 'path' ], function(fs, path) {
      fs.readFile(filename,  function(err, data) {
        if (err) callback(err, data);
        grid.put(data, { 
          filename: path.basename(filename), 
          metadata: metadata, 
          aliases: aliases,
          content_type: 'application/jgp' 
        }, function (err, result) {
          console.log(result);
          if (err) callback(err, result);
          return callback(null, result);
        });
      });
    });
  }

  /**
   * Renders the given javascript file
   * 
   * @method render
   * @param {String} js The name of the javascript file to render
   * @param {Object} req The request
   * @param {Object} res The response
   * @param {Object} next The next route
   */
  Photo.render = function(req, res, next) {

    // TODO: load photo from database
    var photo = {
      title: 'A really long and fancy image title',
      date: '2012-10-12 12:12',
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

  var exports = Photo;

  return exports;

});
