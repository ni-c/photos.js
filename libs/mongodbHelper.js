if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([ 'mongodb' ], function(mongodb) {

  /**
   * MongodbHelper
   *
   * @class MongodbHelper
   * @constructor 
   */
  var MongodbHelper = function() {}

  /**
   * Connects to the database
   * 
   * @method render
   * @param {Object} config The configuration options
   * @param {String} config.database The database name
   * @param {String} config.host The mongodb host
   * @param {Integer} config.port The mongodb port
   * @param {Object} config.user The user credentials
   * @param {Function} callback The callback method to execute after rendering
   * @param {String} callback.err null if no error occured, otherwise the error
   * @param {String} callback.result.db The database 
   * @param {String} callback.result.grid The gridfs
   */
  MongodbHelper.connect = function(config, callback) {

    if (!callback) callback = function() {};

    // Initialize database
    var db = new mongodb.Db(config.database, new mongodb.Server(config.host, parseInt(config.port), config.user), {
      native_parser: false,
      auto_reconnect: true,
      safe: true
    });

    // Open database
    db.open(function(err, db) {
      if (err) callback(err, db);
      var grid = new mongodb.Grid(db, 'image');
      callback(null, {
        db: db,
        grid: grid
      });
    });
  }

  var exports = MongodbHelper;

  return exports;

});
