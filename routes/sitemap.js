if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([ 'sitemap' ], function(sm) {

  /**
   * Sitemap-Controller
   *
   * @class Sitemap
   * @constructor 
   */
  var Sitemap = function() {
    var xml = null;
  };

  /**
   * Creates the feed from the database
   *
   * @method refresh
   * @param {Object} app The express application
   */
  Sitemap.refresh = function(app, callback) {

    var sitemap = sm.createSitemap({
      hostname: app.get('config').sitemap.site_url,
      cacheTime: 600000,        // 600 sec - cache purge period
      urls: [
        { url: app.get('config').sitemap.site_url, priority: 1.0 },
        { url: app.get('config').sitemap.site_url + '/about', priority: 1.0 }
      ]
    });

    app.get('db').collection('image.files', function(err, imageFiles) {
      imageFiles.find().sort({'metadata.exif.datetimeoriginal': -1}).toArray(function(err, images) {
        // TODO Error handling
        if (err) throw new Error(err);

        images.forEach(function(image) {
          
          var item = {
            url: app.get('config').sitemap.site_url + '/photo/' + image.metadata.slug,
            priority: 0.8
          };
          sitemap.add(item);

        });
        Sitemap.xml = sitemap.toString();
        if (callback)
          callback(null, Sitemap.xml);
      });
    });

  }

  /**
   * Renders the sitemap.xml
   * 
   * @method render
   * @param {Object} req The request
   * @param {Object} res The response
   * @param {Object} next The next route
   */
  Sitemap.render = function(req, res, next) {
    Sitemap.refresh(req.app, function(err, result) {
      res.header('Content-Type','application/xml').send(Sitemap.xml);
    });
  };

  var exports = Sitemap;

  return exports;

});
