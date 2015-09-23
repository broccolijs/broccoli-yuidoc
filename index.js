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
  options = options || {};
  CachingWriter.call(this, inputNodes, {
    annotation: options.annotation
  });

  this.inputNodes = inputNodes;
  this.options = merge(defaultOpts, options);
};

BroccoliYuidoc.prototype = Object.create(CachingWriter.prototype);
BroccoliYuidoc.prototype.constructor = BroccoliYuidoc;
BroccoliYuidoc.prototype.description = 'yuidoc';
BroccoliYuidoc.prototype.build = function() {
  var destDir = this.options.destDir;
  var yuiOptions = this.options.yuidoc;

  yuiOptions.paths = this.inputNodes;
  yuiOptions.outdir = path.join(this.outputPath, destDir);

  try {
    var json = (new yuidoc.YUIDoc(yuiOptions)).run();
  } catch(e) {
    throw e;
  }

  yuiOptions = yuidoc.Project.mix(json, yuiOptions);

  if (yuiOptions.parseOnly) {
    fs.writeFileSync(path.join(yuiOptions.outdir, 'data.json'), JSON.stringify(json, null, 4));
    return;
  }

  var builder = new yuidoc.DocBuilder(yuiOptions, json);

  return new rsvp.Promise(function(resolve) {
    builder.compile(function() { resolve(); });
  });
};

module.exports = BroccoliYuidoc;
