var spawn = require('child_process').spawn;
var merge = require('merge');
var pickFiles = require('broccoli-static-compiler');
var yuidoc = require('yuidocjs');
var filter = require('broccoli-filter');
var rsvp = require('rsvp');
var fs = require('fs');

module.exports = yuidocCompiler;

yuidocCompiler.prototype = Object.create(filter.prototype);
yuidocCompiler.prototype.constructor = yuidocCompiler;

function yuidocCompiler(inputTree, options)
{
	if (!(this instanceof yuidocCompiler)) {
		return new yuidocCompiler(inputTree, options);
	}

	this.inputTree = inputTree;

	var defaults = {
		'paths': ['app'],
		'outdir': 'docs',
		'linkNatives': true,
		'quiet': true,
		'parseOnly': false,
		'lint': false
	};

	this.options = merge(defaults, options);
}

yuidocCompiler.prototype.write = function(readTree, destDir)
{
	try {
		var json = (new yuidoc.YUIDoc(this.options)).run();
	} catch(e) {
		throw e;
	}

	this.options = yuidoc.Project.mix(json, this.options);

	if (this.options.parseOnly) {
		fs.writeFileSync(path.join(this.options.outdir, 'data.json'), JSON.stringify(json, null, 4));
		return;
    } else {
		var builder = new yuidoc.DocBuilder(this.options, json);
	
		return new rsvp.Promise(function(resolve, reject)
		{
			builder.compile(function()
			{
				resolve();
			});
		}.bind(this));
	}
};
