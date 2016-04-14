'use strict';


var Transform    = require('stream').Transform;
var streamParser = require('stream-parser');
var inherits     = require('util').inherits;


function ParserStream() {
  Transform.call(this);
}

inherits(ParserStream, Transform);
streamParser(ParserStream.prototype);


exports.ParserStream = ParserStream;
