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

### Note:

This is work in progress - and for now only FESM modules are supported. This works ok with at least ngc, rollup and systemjs, and also no problem to import the built libraries into Angular CLI projects.

In the future we may also add support for all other required bundles in the Angular 4 package format, but the current implementation should cover most use cases for creating libraries for use in other Angular projects.

The tool has beeen tested on Linux and OSX. Because it's using tools such as tar and cp we don't know if it works on Windows. Feel free to test and suggest a patch.
