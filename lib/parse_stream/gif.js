'use strict';


var ParserStream = require('../common').ParserStream;


module.exports = function (input) {
  return new Promise(function (resolve) {
    var parser = new ParserStream();

    parser.on('unpipe', function () {
      resolve();
    });

    parser._bytes(10, function (data) {
      parser._skipBytes(Infinity);

      // check GIF signature
      var sig = data.toString('binary', 0, 6);

      if (sig !== 'GIF87a' && sig !== 'GIF89a') {
        resolve();
        return;
      }

      resolve({
        width:  data.readUInt16LE(6),
        height: data.readUInt16LE(8),
        type: 'gif',
        mime: 'image/gif'
      });
    });

    input.pipe(parser);
  });
};
