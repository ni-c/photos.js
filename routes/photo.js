if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([ 'moment' ], function(moment) {

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
            return next();
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
                if (photo.exif.focallength) {
                  photo.exif.focallength = photo.exif.focallength.toFixed(1) + ' mm';
                }
                if (photo.exif.fnumber) {
                  photo.exif.fnumber = 'ƒ/' + photo.exif.fnumber.toFixed(1);
                }
                if (photo.exif.exposuretime) {
                  if (photo.exif.exposuretime < 1) {
                    photo.exif.exposuretime = '1/' + Math.round(1/photo.exif.exposuretime);
                  }
                  photo.exif.exposuretime = photo.exif.exposuretime + ' s';
                }

                var tagList = [];
                photo.tags.forEach(function(tag) {
                  tagList.push({
                    url: req.app.locals.baseurl + '/archive/tag/' + tag.slug,
                    label: tag.label
                  });
                });
                photo.tags = tagList;

                photo.category = {
                  url: req.app.locals.baseurl + '/archive/category/' + photo.category.slug,
                  label: photo.category.label
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
                return next();
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
