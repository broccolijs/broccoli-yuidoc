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


// /**
//  * yuidocCompiler
//  * @module broccoli-yuidoc
//  */
// module.exports = yuidocCompiler;
//
// yuidocCompiler.prototype = Object.create(cachingWriter.prototype);
// yuidocCompiler.prototype.constructor = yuidocCompiler;
//
// /**
//  * yuidocCompiler
//  *
//  * @param {String} input_tree
//  * @param {Object} options
//  * @constructor
//  * @class yuidocCompiler
//  */
// function yuidocCompiler(input_tree, options)
// {
//  if (!(this instanceof yuidocCompiler)) {
//    return new yuidocCompiler(input_tree, options);
//  }
//
//  this.inputTree = input_tree;
//
//  var defaults = {
//    srcDir: 'app',
//    destDir: 'docs',
//    yuidoc: {
//      linkNatives: true,
//      quiet: true,
//      parseOnly: false,
//      lint: false
//    }
//  };
//
//  this.options = merge(defaults, options);
// }
//
// /**
//  * Generates YUIdoc documentation
//  *
//  * This method will be called in the event that any file has changed
//  * within the specified inputTree.
//  *
//  * @param {String} src_dir
//  * @param {String} dest_dir
//  * @method updateCache
//  */
// yuidocCompiler.prototype.updateCache = function(src_dir, dest_dir)
// {
//  var options = this.options.yuidoc;
//
//  options.paths = options.paths || [src_dir];
//  options.outdir = [dest_dir, this.options.destDir].join('/');
//
//  try {
//    var json = (new yuidoc.YUIDoc(options)).run();
//  } catch(e) {
//    throw e;
//  }
//
//  options = yuidoc.Project.mix(json, options);
//
//  if (options.parseOnly) {
//    fs.writeFileSync(path.join(options.outdir, 'data.json'), JSON.stringify(json, null, 4));
//
//    return;
//     }
//
//  var builder = new yuidoc.DocBuilder(options, json);
//  var self = this;
//
//  return new rsvp.Promise(function(resolve)
//  {
//    builder.compile(function()
//    {
//      resolve();
//    });
//  });
// };
//