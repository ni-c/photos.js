if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([ 'rss', 'moment' ], function(rss, moment) {

  /**
   * Feed-Controller
   *
   * @class Feed
   * @constructor 
   */
  var Feed = function() {
    var xml = null;
  };

  /**
   * Creates the feed from the database
   *
   * @method refresh
   * @param {Object} app The express application
   */
  Feed.refresh = function(app, callback) {

    var rssFeed = new rss({
      title: app.get('config').feed.title,
      description: app.get('config').feed.description,
      feed_url: app.get('config').feed.feed_url,
      site_url: app.get('config').feed.site_url,
      image_url: app.get('config').feed.site_url + '/favicon.png',
      copyright: app.get('config').feed.copyright,
      language: 'de',
      categories: app.get('config').feed.categories
    });

    app.get('db').collection('image.files', function(err, imageFiles) {
      imageFiles.find().sort({'metadata.exif.datetimeoriginal': -1}).toArray(function(err, images) {
        // TODO Error handling
        if (err) throw new Error(err);

        images.forEach(function(image) {
          var item = {
            title: image.metadata.title,
            description: image.metadata.description,
            url: app.get('config').feed.site_url + '/photo/' + image.metadata.slug,
            categories: [ image.metadata.category.label ],
            date: moment(image.uploadDate).format(),
            enclosure: {url: app.get('config').feed.site_url + '/photo/' + image.metadata.slug + '.jpg'}
          };

          if (image.metadata.exif.gps) {
            item.lat = image.metadata.exif.gps.latitude.decimal;
            item.long = image.metadata.exif.gps.longitude.decimal;
          }

          rssFeed.item(item);
        });
        Feed.xml = rssFeed.xml();
        if (callback)
          callback(null, Feed.xml);
      });
    });

  }

  /**
   * Renders the rss feed
   * 
   * @method render
   * @param {Object} req The request
   * @param {Object} res The response
   * @param {Object} next The next route
   */
  Feed.render = function(req, res, next) {
    Feed.refresh(req.app, function(err, result) {
      res.header('Content-Type','application/rss+xml').send(Feed.xml);
    });
  };

  var exports = Feed;

  return exports;

});
