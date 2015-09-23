'use strict';

var merge         = require('merge');
var yuidoc        = require('yuidocjs');
var rsvp          = require('rsvp');
var fs            = require('fs');
var path          = require('path');
var CachingWriter = require('broccoli-caching-writer');

var defaultOpts = {
  destDir: 'docs',
  yuidoc: {
    linkNatives: true,
    quiet: true,
    parseOnly: false,
    lint: false
  }
};

var BroccoliYuidoc = function BroccoliYuidoc(inputNodes, options) {
  if (!(this instanceof BroccoliYuidoc)) {
    return new BroccoliYuidoc(inputNodes, options);
  }

  options = options || {};
  CachingWriter.call(this, inputNodes, {
    annotation: options.annotation
  });
  this.inputNodes = inputNodes;
  this.options    = merge(defaultOpts, options);
};

BroccoliYuidoc.prototype = Object.create(CachingWriter.prototype);
BroccoliYuidoc.prototype.constructor = BroccoliYuidoc;
BroccoliYuidoc.prototype.description = 'yuidoc';
BroccoliYuidoc.prototype.write = function(readTree, destDir) {
  var self = this;
  return readTree(this.inputNodes).then(function() {
    var options = self.options;

    options.paths = options.paths || srcPaths;
    options.outdir = [destDir, self.destDir].join('/');

     try {
       var json = (new yuidoc.YUIDoc(options)).run();
     } catch(e) {
       throw e;
     }

    options = yuidoc.Project.mix(json, options);

    if (options.parseOnly) {
      fs.writeFileSync(path.join(options.outdir, 'data.json'), JSON.stringify(json, null, 4));
      return;
    }

    var builder = new yuidoc.DocBuilder(options, json);

    return new rsvp.Promise(function(resolve) {
      builder.compile(function() { resolve(); });
    });
  });
};

module.exports = BroccoliYuidoc;
