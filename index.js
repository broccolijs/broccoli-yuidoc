'use strict';

var merge = require('merge');
var yuidoc = require('yuidocjs');
var cachingWriter= require('broccoli-caching-writer');
var rsvp = require('rsvp');
var fs = require('fs');
var walkSync = require('walk-sync');
var path =require('path');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');

/**
 * yuidocCompiler
 * @module broccoli-yuidoc
 */
module.exports = yuidocCompiler;

yuidocCompiler.prototype = Object.create(cachingWriter.prototype);
yuidocCompiler.prototype.constructor = yuidocCompiler;

/**
 * yuidocCompiler
 *
 * @param {String} input_tree
 * @param {Object} options
 * @constructor
 * @class yuidocCompiler
 */
function yuidocCompiler(input_tree, options)
{
	if (!(this instanceof yuidocCompiler)) {
		return new yuidocCompiler(input_tree, options);
	}

	this.inputTree = input_tree;

	var defaults = {
		srcDir: 'app',
		destDir: 'docs',
		yuidoc: {
			linkNatives: true,
			quiet: true,
			parseOnly: false,
			lint: false
		}
	};

	this.options = merge(defaults, options);
}

/**
 * Generates YUIdoc documentation
 *
 * This method will be called in the event that any file has changed
 * within the specified inputTree.
 *
 * @param {String} src_dir
 * @param {String} dest_dir
 * @method updateCache
 */
yuidocCompiler.prototype.updateCache = function(src_dir, dest_dir)
{
	var options = this.options.yuidoc;

	options.paths = options.paths || [src_dir];
	options.outdir = options.outdir || dest_dir;

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

	/**
	 * Due to infavorable handling of this function's return value on the
	 * upper level at broccoli-caching-writer, we cannot return a promise.
	 *
	 * Thus, we'll need to short-circuit the task of copying the files over.
	 */

	var self = this;

	builder.compile(function()
	{
		if (fs.existsSync(self.options.destDir)) {
			rimraf.sync(self.options.destDir);
		}

		linkFromCache(dest_dir, self.options.destDir);
	});
};

/**
 * I hate duplication just as much as the next person.
 * @see https://github.com/rjackson/broccoli-caching-writer/blob/master/index.js#L62
 */
function linkFromCache(srcDir, destDir) {
  var files = walkSync(srcDir);
  var length = files.length;
  var file;

  for (var i = 0; i < length; i++) {
    file = files[i];

    var srcFile = path.join(srcDir, file);
    var stats   = fs.statSync(srcFile);

    if (stats.isDirectory()) { continue; }

    if (!stats.isFile()) { throw new Error('Can not link non-file.'); }

    destFile = path.join(destDir, file);
    mkdirp.sync(path.dirname(destFile));
    fs.linkSync(srcFile, destFile);
  }
}
