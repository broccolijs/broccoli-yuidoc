'use strict';

const expect = require('chai').expect;
const helpers = require('broccoli-test-helper');
const co = require('co');
const BroccoliYUIDoc = require('../');

describe('BroccoliYUIDoc', function() {
  let input, output, subject;

  beforeEach(co.wrap(function* () {
    input = yield helpers.createTempDir();
    subject = new BroccoliYUIDoc([input.path()]);
    output = helpers.createBuilder(subject);
  }));

  afterEach(co.wrap(function* () {
    yield input.dispose();
    yield output.dispose();
  }));

  it('rebuilds and updates', co.wrap(function* () {
    input.write({
      'index.js': ''
    });

    yield output.build();

    let docs = output.read().docs;

    expect(Object.keys(docs)).to.deep.eql([
      'api.js',
      'assets',
      'classes',
      'data.json',
      'elements',
      'files',
      'index.html',
      'modules'
    ]);

    expect(JSON.parse(docs['data.json'])).to.deep.eql({
      project:  {},
      files:    {},
      modules:  {},
      classes:  {},
      elements: {},
      classitems: [],
      warnings:   []
    });

    input.write({
      'index.js': `
/**
* This is the description for my class.
*
* @class MyClass
* @constructor
*/
      `
    });

    yield output.build();

    docs = output.read().docs;

    expect(Object.keys(docs)).to.deep.eql([
      'api.js',
      'assets',
      'classes',
      'data.json',
      'elements',
      'files',
      'index.html',
      'modules'
    ]);

    let data = JSON.parse(docs['data.json']);

    expect(Object.keys(data)).to.deep.eql([
      'project',
      'files',
      'modules',
      'classes',
      'elements',
      'classitems',
      'warnings'
    ]);

    expect(Object.keys(docs.classes)).to.deep.eql([
      'MyClass.html',
      'index.html'
    ]);

    expect(data.classes.MyClass).to.be.ok;
    expect(data.classes.MyClass.file).to.be.a('string');
    delete data.classes.MyClass.file
    expect(data.classes).to.deep.eql({
      MyClass: {
        classitems: [],
        description: 'This is the description for my class.',
        extension_for: [],
        extensions: [],
        is_constructor: 1,
        line: 2,
        name: 'MyClass',
        plugin_for: [],
        plugins: [],
        shortname: 'MyClass'
      }
    });

    input.write({
      'index.js': `
/**
* This is the description for my class.
*
* @class MyNewClass
* @constructor
*/
      `
    });

    yield output.build();

    docs = output.read().docs;

    expect(Object.keys(docs)).to.deep.eql([
      'api.js',
      'assets',
      'classes',
      'data.json',
      'elements',
      'files',
      'index.html',
      'modules'
    ]);

    data = JSON.parse(docs['data.json']);

    expect(Object.keys(data)).to.deep.eql([
      'project',
      'files',
      'modules',
      'classes',
      'elements',
      'classitems',
      'warnings'
    ]);

    expect(Object.keys(docs.classes)).to.deep.eql([
      'MyNewClass.html',
      'index.html'
    ]);

    expect(data.classes.MyNewClass).to.be.ok;
    expect(data.classes.MyNewClass.file).to.be.a('string');
    delete data.classes.MyNewClass.file
    expect(data.classes).to.deep.eql({
      MyNewClass: {
        classitems: [],
        description: 'This is the description for my class.',
        extension_for: [],
        extensions: [],
        is_constructor: 1,
        line: 2,
        name: 'MyNewClass',
        plugin_for: [],
        plugins: [],
        shortname: 'MyNewClass'
      }
    });
  }));


  it('does not rebuild if no changes occured', co.wrap(function* () {
    input.write({
      "index.js": ""
    });

    yield output.build();
    expect(Object.keys(output.changes()).length > 0).to.eql(true);

    yield output.build();
    expect(Object.keys(output.changes()).length > 0).to.eql(false);

    input.write({
      'index.js': `
/**
* This is the description for my class.
*
* @class MyClass
* @constructor
*/
      `
    });
    yield output.build();
    expect(Object.keys(output.changes()).length > 0).to.eql(true);

    yield output.build();
    expect(Object.keys(output.changes()).length > 0).to.eql(false);
    // no changes
  }));
});
