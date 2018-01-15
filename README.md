# ngmakelib
NPM command line tool for generating Angular libraries

```
npm install https://github.com/fintechneo/ngmakelib.git
```

Then create a script in the package.json file of your angular project:

```
"scripts": {
  "lib": "ngmakelib src/app/mymodule/mymodule.module.ts mymodule-library"
}
```

To create the library run:

```
npm run lib
```

And if all goes well you will have a file called ``mymodule-library.tar.gz``

Finally to install the library in another Angular project type:

```
npm install path/to/mymodule-library.tar.gz
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