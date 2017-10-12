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

## WARNING:

This is work in progress - and for now only FESM modules are supported. This works ok with at least ngc, rollup and systemjs.

In the future we may also add support for all other required bundles in the Angular 4 package format such as UMD and more.
