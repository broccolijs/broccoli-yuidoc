# broccoli-yuidoc

This plugin provides support for generating YUIDoc via a broccoli
pipeline.

## Installation

```
npm install --save-dev broccoli-yuidoc
```

## Configuration

An options object may be passed to `generateYuidoc`. 
Available options can be found on [YUIDoc's official documentation
page](https://yui.github.io/yuidoc/args/index.html).

Note: If a `yuidoc.json` file exists in a parent directory, it will be 
used as well.

## Usage

```js
var yuidocCompiler = require('broccoli-yuidoc');

var yuidocTree = yuidocCompiler('app', {
	'srcDir': '/',
	'destDir': 'docs',
	yuidoc: {
		// .. yuidoc option overrides
	}
});

module.exports = yuidocTree;
```

It's recomended to use `broccoli-merge-trees` to finally produce
a signle tree for broccoli to work on.
