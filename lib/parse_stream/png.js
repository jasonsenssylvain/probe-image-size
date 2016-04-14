'use strict';


var ParserStream = require('../common').ParserStream;


module.exports = function (input) {
  return new Promise(function (resolve) {
    var parser = new ParserStream();

    parser.on('unpipe', function () {
      resolve();
    });

    parser._bytes(24, function (data) {
      parser._skipBytes(Infinity);

      // check PNG signature
      if (data.toString('binary', 0, 8) !== '\x89PNG\r\n\x1a\n') {
        resolve();
        return;
      }

      // check that first chunk is IHDR
      if (data.toString('binary', 12, 16) !== 'IHDR') {
        resolve();
        return;
      }

      resolve({
        width:  data.readUInt32BE(16),
        height: data.readUInt32BE(20),
        type: 'png',
        mime: 'image/png'
      });
    });

    input.pipe(parser);
  });
};
