# typescript.api

The typescript.api is a lightweight api that enables nodejs developers to compile 
and run typescript source code. 

## Compiler Version

TypeScript 0.9 alpha

## Quick Start 

The following is an example of using the api to compile the source file 'program.ts'. 

The process will first resolve 'program.ts' and all its reference sources. The resolved 
sources (units) are then passed to the compiler for compilation. The compilation object
is then sent to be run.

```javascript
var typescript = require("typescript.api");

var sources = ["test/program.ts"];

function has_errors(compilation) {
	
	// errors can be listed on the compilation.diagnostics array.
	
	return compilation.diagnostics.length > 0; 
}

typescript.units.resolve(sources, function(units) {
	
	typescript.compile(units, function(compilation) {
		
		if(!has_errors (compilation) ) {
			
			typescript.run(compilation, null, function(context) {
				 
				 // exported members available on the context...
				 
			});
		}
	});
});
'''

## Reference

### typescript.units.resolve(sources, callback)

Will resolve compilation units by crawling the document space. 

__Arguments__

* sources - An array of source filenames. 
* callback(units) - A callback with located units.

__Example__

Will resolve 'program.ts' and print all referenced source files.

```js
typescript.units.resolve(["program.ts"], function(units) { 
	
	for(var n in units) {
		console.log( units[n].path );
		console.log( units[n].content );
		for(var m in units[n].references) {
			console.log( units[n].references[m] )
		}
	}
});
'''

### typescript.units.create(filename, code)

Will create a unit from the supplied filename and source code.

__Arguments__

* filename - The filename for this unit.
* code - Source code for this unit.

__Example__

The following will create a unit. and send to the compiler for compilation.

```js
var unit = typescript.units.create("temp.ts", "console.log('hello world');");
	
typescript.compile([unit], function(compilation) {
	
	typescript.run(compilation, null, function(context) { });
	
});
'''
