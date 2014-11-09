if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([ 'moment' ], function(moment) {

  /**
   * archive-Controller
   *
   * @class Archive
   * @constructor 
   */
  var Archive = function() {}

  /**
   * Renders the archive page
   * 
   * @method render
   * @param {Object} req The request
   * @param {Object} res The response
   * @param {Object} next The next route
   */
  Archive.render = function(req, res, next) {

    req.app.get('db').collection('image.files', function(err, imageFiles) {
      
      // TODO Error handling
      if (err) throw new Error(err);

      var categoryList = [];
      var tagList = [];
      var thumbnails = [];

      var query = {};

      if (req.params.tag) {
        query["metadata.tags.slug"] = req.params.tag;
      }

      if (req.params.category) {
        query["metadata.category.slug"] = req.params.category;
      }

      imageFiles.find().sort({'metadata.exif.datetimeoriginal': -1}).toArray(function(err, images) {
        // TODO Error handling
        if (err) throw new Error(err);

        var categories = {};
        var tags = {};

        images.forEach(function(image) {

          // Parse categories
          if (!categories[image.metadata.category.slug]) {
            categories[image.metadata.category.slug] = true;
            image.metadata.category.url = req.app.locals.baseurl + '/archive/category/' + image.metadata.category.slug;
            categoryList.push(image.metadata.category);
          }

          // Parse tags
          image.metadata.tags.forEach(function(tag) {
            if (!tags[tag.slug]) {
              tags[tag.slug] = true;
              tag.url = req.app.locals.baseurl + '/archive/tag/' + tag.slug;
              tagList.push(tag);
            }
          });
        });

        imageFiles.find(query).sort({'metadata.exif.datetimeoriginal': -1}).toArray(function(err, images) {
          // TODO Error handling
          if (err) throw new Error(err);
          images.forEach(function(image) {
            // Thumbnails
            thumbnails.push({
              title: image.metadata.title,
              url: req.app.locals.baseurl + '/photo/' + image.metadata.slug,
              "base64": "data:image/jpg;base64," + image.metadata.thumbnail
            });
          });
          // Sort categories and tags alphabetical
          alphabetical = function(a, b) {
            if (a.label < b.label) return -1;
            if (a.label > b.label) return 1;
            return 0;
          }
          categoryList.sort(alphabetical);
          tagList.sort(alphabetical);

          return res.render('archive', {
            page: 'archive',
            tags: tagList,
            categories: categoryList,
            thumbnails: thumbnails,
            activeTag: req.params.tag,
            activeCategory: req.params.category
          });
        });
      });
    });
  }

  var exports = Archive;

  return exports;

});