'use strict';

var merge   = require('merge');
var yuidoc  = require('yuidocjs');
var rsvp    = require('rsvp');
var fs      = require('fs');
var path    = require('path');
var CachingWriter = require('broccoli-caching-writer');

var defaultOpts = {
  srcDir: 'app',
  destDir: 'docs',
  yuidoc: {
    linkNatives: true,
    quiet: true,
    parseOnly: false,
    lint: false
  }
};


var BroccoliYuidoc = CachingWriter.extend({
  init: function(inputTree) {
    this.inputTree = inputTree;
    this.yuidoc = merge(defaultOpts, this.yuidoc);
  },

  updateCache: function(srcPaths, destDir) {
    var options = this.yuidoc;

    options.paths = options.paths || srcPaths;
    options.outdir = [destDir, this.destDir].join('/');

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
    var self = this;

    return new rsvp.Promise(function(resolve) {
      builder.compile(function() { resolve(); });
    });
  }
});

module.exports = BroccoliYuidoc;