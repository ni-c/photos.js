if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([ 'express', 'moment' ], function(express, moment) {

  /**
   * photo-Controller
   *
   * @class Photo
   * @constructor 
   */
  var Photo = function() {}

  /**
   * Put the given photo into the gridfs database
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
    requirejs( [ 'fs', 'path' ], function(fs, path) {
      fs.readFile(filename,  function(err, data) {
        if (err) callback(err, data);
        grid.put(data, { 
          filename: path.basename(filename), 
          metadata: metadata, 
          aliases: aliases,
          content_type: 'application/jgp' 
        }, function (err, result) {
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

    req.app.get('db').collection('image.files', function(err, imageFiles) {
      // TODO Error handling
      if (err) throw new Error(err);
      // Helper function to check for file extension
      function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
      }

      // For jpg go to static route
      if (req.params.file && (endsWith(req.params.file, '.jpg'))) {
        imageFiles.findOne({filename: req.params.file}, {_id: 1}, function(err, image) {
          if (err) throw new Error(err);
          req.app.get('grid').get(image._id, function(err, data) {
            if (err) throw new Error(err);
            return res.send(data);
          });
        });
      } else {

        var query = null;
        if (req.params.file && (endsWith(req.params.file, '.json'))) {
          query = {
            aliases:  req.params.file.replace('.json', '')
          }
        } else if (req.params.file) {
          query = {
            aliases:  req.params.file
          }
        }

        // Load image from database
        imageFiles.find(query).sort({'metadata.exif.datetimeoriginal': -1}).limit(1).toArray(function(err, image) {
          if (err) throw new Error(err);
          if (image.length == 0) {
            return res.status(404).send('404 - Not found');
          }
          // Load previous image
          imageFiles.find({'metadata.exif.datetimeoriginal': { $gt: image[0].metadata.exif.datetimeoriginal }}, {'metadata.slug': 1}).sort({'metadata.exif.datetimeoriginal': 1}).limit(1).toArray(function(err, previous) {
            if (err) throw new Error(err);
            // Load next image
            imageFiles.find({'metadata.exif.datetimeoriginal': { $lt: image[0].metadata.exif.datetimeoriginal }}, {'metadata.slug': 1}).sort({'metadata.exif.datetimeoriginal': -1}).limit(1).toArray(function(err, next) {
              if (err) throw new Error(err);

              // Set photo properties
              if (image.length == 1) {
                var photo = image[0].metadata;
                if (previous.length == 1) {
                  photo.prev = {
                    src: req.app.locals.baseurl + '/photo/' + previous[0].metadata.slug + '.jpg',
                    href: req.app.locals.baseurl + '/photo/' + previous[0].metadata.slug
                  } 
                }
                if (next.length == 1) {
                  photo.next = {
                    src: req.app.locals.baseurl + '/photo/' + next[0].metadata.slug + '.jpg',
                    href: req.app.locals.baseurl + '/photo/' + next[0].metadata.slug
                  }
                }

                photo.src = req.app.locals.baseurl + '/photo/' + image[0].metadata.slug + '.jpg';
                photo.href = req.app.locals.baseurl + '/photo/' + image[0].metadata.slug;
                photo.date = moment(image[0].metadata.exif.datetimeoriginal).format('YYYY-MM-DD HH:mm:ss');
                photo.exif.focallength = photo.exif.focallength.toFixed(1) + ' mm';
                if (photo.exif.fnumber) {
                  photo.exif.fnumber = 'ƒ/' + photo.exif.fnumber.toFixed(1);
                }
                if (photo.exif.exposuretime < 1) {
                  photo.exif.exposuretime = '1/' + 1/photo.exif.exposuretime;
                }
                photo.exif.exposuretime = photo.exif.exposuretime + ' s';

                var tagList = [];
                photo.tags.forEach(function(tag) {
                  tagList.push({
                    url: req.app.locals.baseurl + '/archive/tag/' + tag,
                    name: tag
                  });
                });
                photo.tags = tagList;

                photo.category = {
                  url: req.app.locals.baseurl + '/archive/category/' + photo.category.toLowerCase(),
                  name: photo.category
                };

                if (req.params.file && (endsWith(req.params.file, '.json'))) {
                  return res.json(photo);
                } else {
                  return res.render('index', {
                    photo: photo,
                    ngController: 'photosCtrl'
                  });
                }

              } else {
                res.status(404).send('404 - Not found');
                throw new Error('Image not found');
              }
            });
          });
        });
      }
    });

  }

  var exports = Photo;

  return exports;

});
