/**
 * photos.js (https://ni-c.github.com/photos.js)
 *
 * import.js is a command-line tool to import photos into the mongodb
 *
 * @file import.js
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

requirejs([ 'fs', 'config-node', 'exif', 'moment', 'readline-sync', 'slug', 'fs', 'path', 'gm', 'libs/mongodbHelper', 'routes/photo' ], function(fs, config, exif, moment, rl, slug, fs, path, gm, mongodbHelper, photo) {

  if (!process.argv[2]) {
    console.log('Usage: node import.js photo.jpg');
    process.exit(2);
  }

  var filename = path.resolve(__dirname, process.argv[2]);


  // Get environment, to start in production environment use:
  // $ NODE_ENV=production node photos.js
  var env = process.env.NODE_ENV || 'development';

  // Initialize config-node
  // @see https://www.npmjs.org/package/config-node
  var config = config({
    dir: 'config', // where to look for files 
    ext: 'json',
    env: env
  });

  // Connect to the mongodb and initialize gridfs
  mongodbHelper.connect(config.mongodb, function(err, result) {
    if (err) throw new Error(err);
    var db = result.db;
    var grid = result.grid;

    new exif.ExifImage({
      image: filename
    }, function(err, result) {
      if (err) throw new Error(err);

      /**
       * Parse exif strings and remove \u0000
       */
      function parse(item) {
        if (typeof item == "string")
          return item ? item.replace('\u0000', '') : null;
        return item;
      }

      /**
       * Convert degrees, minutes, seconds into decimal coordinates
       */
      function gpsformat(degrees, minutes, seconds) {
        var d = degrees;
        d += minutes/60;
        d += seconds/3600;
        return Math.round(100000000 * d) / 100000000;
      };

      // Collect required exif data
      var exifData = {
        make: parse(result.image.Make),
        model: parse(result.image.Model),
        exposuretime: parse(result.exif.ExposureTime),
        fnumber: parse(result.exif.FNumber),
        exposureprogram: parse(result.exif.ExposureProgram),
        iso: parse(result.exif.ISO),
        datetimeoriginal: moment(parse(result.exif.DateTimeOriginal), 'YYYY:MM:DD HH:mm:ss').toDate(),
        meteringmode: parse(result.exif.MeteringMode),
        flash: parse(result.exif.Flash),
        focallength: parse(result.exif.FocalLength),
        exposuremode: parse(result.exif.ExposureMode)
      };

      // Parse GPS coordinates is available
      if (result.gps.GPSLatitudeRef) {
        exifData.gps = {
          latitude:{
            ref: parse(result.gps.GPSLatitudeRef),
            degrees: result.gps.GPSLatitude,
            decimal: gpsformat(result.gps.GPSLatitude[2], result.gps.GPSLatitude[1], result.gps.GPSLatitude[0])
          },
          longitude: {
            ref: parse(result.gps.GPSLongitudeRef),
            degrees: result.gps.GPSLongitude,
            decimal: gpsformat(result.gps.GPSLongitude[2], result.gps.GPSLongitude[1], result.gps.GPSLongitude[0])
          }
        }
      }

      var metadata = {};

      if (result.image.ImageDescription) {
        if (/^[\],:{}\s]*$/.test(result.image.ImageDescription.replace(/\\["\\\/bfnrtu]/g, '@').
          replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
          replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
          try { 
            var json = JSON.parse(result.image.ImageDescription);
            metadata.title = json.Title;
            metadata.description = json.Description;
            metadata.category = json.Category;
            metadata.tags = json.Tags;
          } catch(err) {

          }
        }
      }

      console.log('Found EXIF data:');
      console.log('');
      console.log(exifData);

      console.log('');
      for (var prop in exifData) {
        if (exifData.hasOwnProperty(prop)) {
          if (exifData[prop] == null) {
            exifData[prop] = rl.question(prop + ': ');
            console.log('');
          }
        }
      }

      function askForMetadata(item) {
        if (metadata[item]) {
          var answer = rl.question(item + ' [' + metadata[item] + '] : ');
          if (answer.length > 0) {
            metadata[item] = answer;
          }
        } else {
          metadata[item] = rl.question(item + ': ');
        }
        console.log('');
      };

      askForMetadata('title');
      askForMetadata('description');
      askForMetadata('category');
      console.log('tags are comma-separated ("tag1,tag2,tag3")');
      askForMetadata('tags');


      metadata.slug = slug(metadata.title).toLowerCase();

      metadata.exif = exifData;
      console.log('');
      console.log('---------------------------------------------');
      console.log('');
      console.log(metadata);
      console.log('');

      var answer = rl.question('write image to database? [N] : ');
      if (answer == 'y' || answer == 'Y') {

        // Create temp directory
        var tmpDir = path.join(__dirname, '.tmp');
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir);
          if (!fs.existsSync(tmpDir)) {
            throw new Error('Error creating temp-directory "' + tmpDir + '".');
          }
        }
        // Create temp directory
        var photosDir = path.join(__dirname, 'photos');
        if (!fs.existsSync(photosDir)) {
          fs.mkdirSync(photosDir);
          if (!fs.existsSync(photosDir)) {
            throw new Error('Error creating photos-directory "' + photosDir + '".');
          }
        }

        fs.writeFileSync(path.join(__dirname, 'photos', moment(exifData.datetimeoriginal).format('YYYY-MM-DD-HH-mm-ss') + '-' + metadata.slug + '.jpg'), fs.readFileSync(path.resolve(__dirname, filename)));

        var resizedFilename = path.join(__dirname, '.tmp', metadata.slug + '.jpg');
        console.log(resizedFilename);
        gm(filename).resize(1140).write(resizedFilename, function(err) {
          console.log('bla');
          if (err) throw new Error(err);
          photo.put(grid, resizedFilename, [metadata.slug], metadata, function(err, result) {
            if (err) throw new Error(err);
            process.exit(0);
          });
        });
      }
    });

  });

});