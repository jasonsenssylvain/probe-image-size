
'use strict';


var request  = require('request').defaults({ timeout: 30000, maxRedirects: 2, rejectUnauthorized: false });
var nextTick = require('next-tick');


var parsers = {
  bmp:  require('./parse_stream/bmp'),
  gif:  require('./parse_stream/gif'),
  jpeg: require('./parse_stream/jpeg'),
  png:  require('./parse_stream/png'),
  psd:  require('./parse_stream/psd'),
  tiff: require('./parse_stream/tiff'),
  webp: require('./parse_stream/webp')
};


function probeStream(stream, callback) {
  // prevent "possible EventEmitter memory leak" warnings
  stream.setMaxListeners(0);

  var resMap = Object.keys(parsers).map(function (fmt) {
    return parsers[fmt](stream);
  });

  var result = Promise.all(resMap).then(function (values) {
    var data = values.filter(Boolean)[0];

    if (!data || !data.type) {
      var error = new Error('unrecognized file format');
      error.code = 'ECONTENT';
      throw error;
    }

    return data;
  });

  if (callback) {
    result.then(function (data) {
      nextTick(callback.bind(null, null, data));
    }, function (err) {
      nextTick(callback.bind(null, err));
    });
  }

  return result;
}


function probeHttp(options, callback) {
  var req;

  try {
    req = request(options);
  } catch (err) {
    if (callback) callback(err);
    return Promise.reject(err);
  }

  var result = new Promise(function (resolve, reject) {
    req.on('response', function (res) {
      if (res.statusCode === 200) {
        probeStream(res, function (err, result) {
          req.abort();

          if (result) {
            var length = res.headers['content-length'];

            /* eslint-disable eqeqeq */
            if (length == +length) result.length = +length;
          }

          if (err) reject(err);
          else resolve(result);
        });
      } else {
        var err = new Error('bad status code: ' + res.statusCode);

        err.status = res.statusCode;
        reject(err);
        req.abort();
      }
    });

    req.on('error', function (err) { resolve(err); });
  });

  if (callback) {
    result.then(function (data) {
      nextTick(callback.bind(null, null, data));
    }, function (err) {
      nextTick(callback.bind(null, err));
    });
  }

  return result;
}


///////////////////////////////////////////////////////////////////////
// Exports
//
module.exports = function get_image_size(src, callback) {
  if (typeof src.on === 'function' && typeof src.emit === 'function') {
    // looks like an EventEmitter, treating it as a stream
    return probeStream(src, callback);
  }
  return probeHttp(src, callback);
};

module.exports.parsers = parsers;
