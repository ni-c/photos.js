if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([ 'crypto' ], function(crypto) {

  /**
   * PiwikHelper
   *
   * @class PiwikHelper
   * @constructor 
   */
  var PiwikHelper = function() {}

  /**
   * Track a piwik visit
   * 
   * @method track
   * @param {Object} req The node request
   */
  PiwikHelper.track = function(req, url, action_name) {
    if (req.app.get('piwik')) {
      var ip = req.headers['X-Forwarded-For'] || req.connection.remoteAddress;
      var uid = crypto.createHash('sha1');
      uid.update(ip + '-' + req.headers['user-agent']);
      var data = {
        url: url,
        action_name: action_name,
        ua: req.headers['user-agent'],
        cip: ip,
        uid: uid.digest('hex'),
        lang: req.headers['accept-language']
      };
      if (req.query.w && req.query.h) {
        data.res = req.query.w + 'x' + req.query.h
      }
      req.app.get('piwik').track(data);
    }
  }

  var exports = PiwikHelper;

  return exports;

});
                  

