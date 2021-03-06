if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([ 'express','libs/piwikHelper' ], function(Express, piwikHelper) {

  /**
   * Static-Controller
   *
   * @class Static
   * @constructor 
   */
  var Static = Express.Router();

  /**
   * Renders the about page
   * 
   * @param {Object} req The request
   * @param {Object} res The response
   * @param {Object} next The next route
   */
  Static.about = function(req, res, next) {
    var packages = [];
    var components = [];
    for (item in req.app.get('package').dependencies) {
      packages.push(item);
    }
    for (item in req.app.get('bower').dependencies) {
      components.push(item);
    }

    piwikHelper.track(req, req.app.locals.baseurl + '/about', 'about');

    return res.render('about', {
      packages: packages,
      components: components,
      pagetitle: 'About',
      page: 'about'
    });
  }; 
   
  var exports = Static;

  return exports;

});
