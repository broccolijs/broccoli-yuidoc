'use strict';

const merge         = require('merge');
const yuidoc        = require('yuidocjs');
const rsvp          = require('rsvp');
const fs            = require('fs');
const path          = require('path');
const CachingWriter = require('broccoli-caching-writer');

const defaultOpts = {
  destDir: 'docs',
  yuidoc: {
    linkNatives: true,
    quiet: true,
    parseOnly: false,
    lint: false
  }
};

module.exports = class BroccoliYuidoc extends CachingWriter {
  constructor(inputNodes, options) {
    options = options || {};

    super(inputNodes, {
      annotation: options.annotation
    });

    this.inputNodes = inputNodes;
    this.options = merge(defaultOpts, options);
  }

  build() {
    let destDir = this.options.destDir;
    let yuiOptions = this.options.yuidoc;

    yuiOptions.paths = this.inputPaths;
    yuiOptions.outdir = path.join(this.outputPath, destDir);

    let json = (new yuidoc.YUIDoc(yuiOptions)).run();

    yuiOptions = yuidoc.Project.mix(json, yuiOptions);

    if (yuiOptions.parseOnly) {
      fs.writeFileSync(path.join(yuiOptions.outdir, 'data.json'), JSON.stringify(json, null, 4));
      return;
    }

    let builder = new yuidoc.DocBuilder(yuiOptions, json);

    return new rsvp.Promise(resolve => builder.compile(resolve));
  }
};
