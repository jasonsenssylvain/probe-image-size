'use strict';


var ParserStream = require('../common').ParserStream;


module.exports = function (input) {
  return new Promise(function (resolve) {
    var parser = new ParserStream();

    parser.on('unpipe', function () {
      resolve();
    });

    parser._bytes(6, function (data) {
      // signature + version
      if (data.toString('binary') !== '8BPS\x00\x01') {
        parser._skipBytes(Infinity);
        resolve();
        return;
      }

      parser._bytes(16, function (data) {
        parser._skipBytes(Infinity);
        resolve({
          width:  data.readUInt32BE(12),
          height: data.readUInt32BE(8),
          type: 'psd',
          mime: 'image/vnd.adobe.photoshop'
        });
      });
    });

    input.pipe(parser);
  });
};
