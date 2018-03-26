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
npm install file:path/to/mymodule-library-0.1.1.tar.gz
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

### Note when linking from an @angular/cli host app

In `angular-cli.json` under `defaults -> build` you should set the `preserveSymlinks` to true like this:

```
"defaults": {
   "build": {
      "preserveSymlinks": true
    }
}
```
this prevents the linked library from using it's own `node_modules` folder for resolving dependencies - which can cause unwanted effects when using linked mode.

## Adding assets

If you need to include assets like images, other js script files, webassembly binaries etc, ngmakelib supports adding these to the assets folder of the exported library.

When consuming a library in assets in Angular CLI, you need to add the following to your `angular-cli.json`:

```
    "assets": [
      "assets",
      "favicon.ico",
      { "glob": "**/*", "input": "../node_modules/my-library/assets/", "output": "./assets/" }        
    ],
```
Replace `my-library` with the name of your library.

For adding assets with ngmakelib you will use the `addAssets` method of the ngmakelib api.

Here's an example script for building a library with assets (taken from the angular-git-filebrowser project https://github.com/fintechneo/angular-git-filebrowser):

```
var NGMakeLib = require('ngmakelib').NGMakeLib;

// Initialize NGMakeLib with entry point source file and module name
var ngMakeLib = new NGMakeLib('src/lib/filebrowser.module.ts', 'angular-filebrowser');

// Add assets
ngMakeLib.addAssets([
        'stupid_worker.js',
        'libgit2.js',
        'libgit2.wasm'
    ].map(a => 'src/assets/' +a)
);


if(process.argv[process.argv.length-1] === '--watch') {
    // Create the library and watch for changes
    ngMakeLib.watch();
} else {
    // Build package that can be published
    ngMakeLib.build();
}
```

## Developing ngmakelib

The development environment is set up with mocha test suites that you can run by typing:

`npm run test`

You'll find the sources for these in the `test` folder.

Also there's is the `examplelibrary_src` folder that is used in the test suites. This contains an example source for a library.
