# ngmakelib
NPM command line tool for generating Angular libraries

```
npm install ngmakelib
```

To create the library run:

```
./node_modules/.bin/ngmakelib src/app/mymodule/mymodule.module.ts mymodule-library 0.1.1
```

And if all goes well you will have a file called ``mymodule-library-0.1.1.tar.gz``

Finally to install the library in another Angular project type:

```
npm install path/to/mymodule-library-0.1.1.tar.gz
```

## API to get more control of the build process

If you need to control typescript (ngc) or rollup configuration options you may use the API. E.g. if you want to use the moment library with @angular/material you need to set the allowSyntheticDefaultImports option
in tsconfig.json to true.

Here's a simple script that set this option and build a library using the NGMakeLib API. 

```
var NGMakeLib = require('ngmakelib').NGMakeLib;

// Initialize NGMakeLib with entry point source file and module name
var ngMakeLib = new NGMakeLib('src/app/mymodule/mymodule.module.ts', 'my-module-library');

// Add the allowSyntheticDefaultImports to support 'moment'
ngMakeLib.ngcConfig.compilerOptions.allowSyntheticDefaultImports = true;

// Create the library
ngMakeLib.build().then(function() { console.log("All done"); });
```
## Watch mode during development

```
./node_modules/.bin/ngmakelib --watch src/app/mymodule/mymodule.module.ts mymodule-library 0.1.1
```

And then you can link the `.ngmakelibtmp/build` folder to any project where you want to test consuming the library.

## Developing ngmakelib

The development environment is set up with mocha test suites that you can run by typing:

`npm run test`

You'll find the sources for these in the `test` folder.

Also there's is the `examplelibrary_src` folder that is used in the test suites. This contains an example source for a library.