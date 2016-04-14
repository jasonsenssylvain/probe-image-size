'use strict';


var ParserStream = require('../common').ParserStream;


module.exports = function (input) {
  return new Promise(function (resolve) {
    var parser = new ParserStream();

    parser.on('unpipe', function () {
      resolve();
    });

    parser._bytes(26, function (data) {
      parser._skipBytes(Infinity);

      if (data.toString('binary', 0, 2) !== 'BM') {
        resolve();
        return;
      }

      resolve({
        width:  data.readUInt16LE(18),
        height: data.readUInt16LE(22),
        type: 'bmp',
        mime: 'image/bmp'
      });
    });

    input.pipe(parser);
  });
};
