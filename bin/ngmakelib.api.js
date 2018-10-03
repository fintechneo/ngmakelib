'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');
var fs = require('fs');
var glob = require('glob');
var nodeSass = require('node-sass');
var rxjs = require('rxjs');
require('rxjs/operators');
var child_process = require('child_process');
var shelljs = require('shelljs');
var rollup = require('rollup');
var cpx = require('cpx');

var resourceSourceFileRefs = {};
/** Finds all JavaScript files in a directory and inlines all resources of Angular components. */
function inlineResourcesForDirectory(folderPath) {
    glob.sync(path.join(folderPath, '**/*.ts')).forEach(function (filePath) { return inlineResources(filePath); });
}
/** Inlines the external resources of Angular components of a file. */
function inlineResources(filePath) {
    console.log("Inlining resources", filePath);
    var fileContent = fs.readFileSync(filePath, 'utf-8');
    fileContent = inlineTemplate(fileContent, filePath);
    fileContent = inlineStyles(fileContent, filePath);
    fileContent = removeModuleId(fileContent);
    fs.writeFileSync(filePath, fileContent, 'utf-8');
}
/** Inlines the external resources of Angular components of a file. */
function inlineResourcesAsync(filePath) {
    return new rxjs.Observable(function (observer) {
        fs.readFile(filePath, 'utf-8', function (err, fileContent) {
            fileContent = inlineTemplate(fileContent, filePath);
            fileContent = inlineStyles(fileContent, filePath);
            fileContent = removeModuleId(fileContent);
            fs.writeFile(filePath, fileContent, { encoding: 'utf-8' }, function () {
                console.log('Inlined resources', filePath);
                // console.log(fileContent);
                observer.next(fileContent);
            });
        });
    });
}
/** Inlines the templates of Angular components for a specified source file. */
function inlineTemplate(fileContent, filePath) {
    return fileContent.replace(/templateUrl:\s*["']([^']+?\.html)["']/g, function (_match, templateUrl) {
        var templatePath = path.join(path.dirname(filePath), templateUrl);
        var templateContent = loadResourceFile(templatePath);
        addResourceSourceFileRef(filePath, templatePath);
        return "template: \"" + templateContent + "\"";
    });
}
function addResourceSourceFileRef(tsfile, resourcefile) {
    if (!resourceSourceFileRefs[resourcefile]) {
        resourceSourceFileRefs[resourcefile] = {};
    }
    resourceSourceFileRefs[resourcefile][tsfile] = true;
}
function getAffectedTypeScriptSourceFilesForResource(resourcefile) {
    if (!resourceSourceFileRefs[resourcefile]) {
        return [];
    }
    else {
        return Object.keys(resourceSourceFileRefs[resourcefile]);
    }
}

/** Inlines the external styles of Angular components for a specified source file. */
function inlineStyles(fileContent, filePath) {
    return fileContent.replace(/styleUrls:\s*(\[[\s\S]*?])/gm, function (_match, styleUrlsValue) {
        // The RegExp matches the array of external style files. This is a string right now and
        // can to be parsed using the `eval` method. The value looks like "['AAA.css', 'BBB.css']"
        var styleUrls = eval(styleUrlsValue);
        var styleContents = styleUrls
            .map(function (url) { return path.join(path.dirname(filePath), url); })
            .map(function (path$$1) {
            addResourceSourceFileRef(filePath, path$$1);
            if (path$$1.endsWith(".scss")) {
                var rendered = nodeSass.renderSync({
                    file: path$$1
                });
                return rendered.css.toString()
                    .replace(/([\n\r]\s*)+/gm, ' ')
                    .replace(/"/g, '\\"');
                
            }
            else {
                return loadResourceFile(path$$1);
            }
        });
        return "styles: [\"" + styleContents.join(' ') + "\"]";
    });
}
/** Remove every mention of `moduleId: module.id` */
function removeModuleId(fileContent) {
    return fileContent.replace(/\s*moduleId:\s*module\.id\s*,?\s*/gm, '');
}
/** Loads the specified resource file and drops line-breaks of the content. */
function loadResourceFile(filePath) {
    console.log("Inlining resource", filePath);
    return fs.readFileSync(filePath, 'utf-8')
        .replace(/([\n\r]\s*)+/gm, ' ')
        .replace(/"/g, '\\"');
}

var AngularCompilerConfig = /** @class */ (function () {
    function AngularCompilerConfig() {
        this.config = {
            "compilerOptions": {
                "target": "es5",
                "module": "es2015",
                "moduleResolution": "node",
                "sourceMap": true,
                "emitDecoratorMetadata": true,
                "experimentalDecorators": true,
                "declaration": true,
                "lib": ["es2015", "dom"],
                "suppressImplicitAnyIndexErrors": true
            },
            "files": [],
            "angularCompilerOptions": {
                "annotationsAs": "decorators",
                "flatModuleOutFile": null,
                "flatModuleId": null,
                "skipTemplateCodegen": true,
                "annotateForClosureCompiler": true,
                "strictMetadataEmit": true
            }
        };
    }
    AngularCompilerConfig.prototype.getConfig = function (tsfile, outDir, moduleId) {
        this.config.files[0] = tsfile;
        this.config.compilerOptions.outDir = outDir;
        this.config.angularCompilerOptions.flatModuleOutFile = moduleId + ".js";
        this.config.angularCompilerOptions.flatModuleId = moduleId;
        return this.config;
    };
    return AngularCompilerConfig;
}());

var PackageJSONConfig = /** @class */ (function () {
    function PackageJSONConfig() {
    }
    PackageJSONConfig.prototype.getConfig = function (moduleId, version) {
        var packageJSON = JSON.parse(fs.readFileSync('package.json').toString());
        if (!packageJSON.version && !version) {
            packageJSON.version = '0.1.0';
            console.log("Defaulting to version {{version}} since no version were provided, and couldn't find version in package.json of your project");
        }
        if (version) {
            packageJSON.version = version;
        }
        Object.assign(packageJSON, {
            "name": moduleId,
            "main": moduleId + ".js",
            "types": moduleId + ".d.ts"
        });
        delete packageJSON.scripts;
        return packageJSON;
    };
    return PackageJSONConfig;
}());

var NGMakeLib = /** @class */ (function () {
    function NGMakeLib(libsrc, moduleId, version) {
        this.libsrc = libsrc;
        this.moduleId = moduleId;
        this.version = version;
        this.tmpdir = ".ngmakelibtmp";
        this.assets = [];
        this.liborigsrcdir = libsrc.substring(0, libsrc.lastIndexOf("/"));
        this.srcfile = libsrc.substring(libsrc.lastIndexOf("/") + 1);
        // Prepare configs
        this.ngcConfig = new AngularCompilerConfig().getConfig("src/" + this.srcfile, "build", this.moduleId);
        this.packageJSONConfig = new PackageJSONConfig().getConfig(moduleId, version);
        this.version = this.packageJSONConfig.version;
        this.rollupInputOptions = {
            input: this.tmpdir + "/build/" + this.moduleId + ".js"
        };
        this.rollupOutputOptions = {
            file: this.tmpdir + "/dist/" + this.moduleId + ".js",
            format: 'es'
        };
    }
    NGMakeLib.prototype.createDirs = function (deleteFirst) {
        if (deleteFirst === void 0) { deleteFirst = false; }
        if (deleteFirst && fs.existsSync(this.tmpdir)) {
            var recurseDelete_1 = function (folder) {
                fs.readdirSync(folder).forEach(function (f) {
                    var s = fs.statSync(folder + '/' + f);
                    if (s.isDirectory()) {
                        recurseDelete_1(folder + '/' + f);
                    }
                    else if (s.isFile()) {
                        fs.unlinkSync(folder + '/' + f);
                    }
                });
                fs.rmdirSync(folder);
            };
            recurseDelete_1(this.tmpdir);
        }
        if (!fs.existsSync(this.tmpdir)) {
            fs.mkdirSync(this.tmpdir);
        }
        var builddir = this.tmpdir + '/build';
        if (!fs.existsSync(builddir)) {
            fs.mkdirSync(builddir);
        }
    };
    NGMakeLib.prototype.addAssets = function (paths) {
        var _this = this;
        paths.forEach(function (p) { return _this.assets.push(p); });
    };
    /**
     * If not the default README.md, you can specify the path of the readme file you want to use for the library here
     * @param readmepath
     */
    NGMakeLib.prototype.setREADME = function (readmepath) {
        this.readmepath = readmepath;
    };
    NGMakeLib.prototype.copyAssets = function () {
        var assetsdir = this.tmpdir + "/build/assets";
        if (!fs.existsSync(assetsdir)) {
            fs.mkdirSync(assetsdir);
        }
        this.assets.forEach(function (path$$1) {
            var filename = path$$1.split(/\//).pop();
            fs.copyFileSync(path$$1, assetsdir + "/" + filename);
        });
    };
    NGMakeLib.prototype.watch = function () {
        var _this = this;
        this.createDirs();
        this.copyAssets();
        return new Promise(function (resolve, reject) {
            _this.ngcConfig.angularCompilerOptions.generateCodeForLibraries = false;
            fs.writeFileSync(_this.tmpdir + '/tsconfig.json', JSON.stringify(_this.ngcConfig));
            fs.writeFileSync(_this.tmpdir + '/build/package.json', JSON.stringify(_this.packageJSONConfig, null, 1));
            var watcher = cpx.watch(_this.liborigsrcdir + '/**', _this.tmpdir + '/src/');
            watcher.on('watch-error', function (err) { return console.log(err); });
            // watcher.on('remove', (evt) => console.log('remove', evt));
            watcher.on('watch-ready', function () {
                inlineResourcesForDirectory(_this.tmpdir + '/src');
                watcher.on('copy', function (evt) {
                    var path$$1 = evt.srcPath.substring(_this.liborigsrcdir.length + 1);
                    if (path$$1.indexOf('.ts') > 0) {
                        inlineResourcesAsync(_this.tmpdir + '/src/' + path$$1).subscribe();
                    }
                    else if (['.css', '.scss', '.html'].find(function (ext) { return path$$1.indexOf(ext) > -1; })) {
                        getAffectedTypeScriptSourceFilesForResource(_this.tmpdir + '/src/' + path$$1)
                            .forEach(function (tsfile) {
                            // console.log(tsfile);
                            fs.copyFile(_this.liborigsrcdir + '/' + tsfile.substring((_this.tmpdir + '/src/').length), tsfile, function () { return inlineResourcesAsync(tsfile).subscribe(); });
                        });
                    }
                });
                var ngcproc = child_process.spawn(/^win/.test(process.platform) ?
                    'node_modules\\.bin\\ngc.cmd' : 'node_modules/.bin/ngc', [
                    '-w',
                    '-p',
                    _this.tmpdir + '/tsconfig.json'
                ]);
                ngcproc.stdout.pipe(process.stdout);
                ngcproc.stderr.pipe(process.stderr);
                resolve(ngcproc);
            });
        });
    };
    NGMakeLib.prototype.build = function () {
        var _this = this;
        this.createDirs(true);
        this.copyAssets();
        shelljs.exec("cp -r " + this.liborigsrcdir + " " + this.tmpdir + "/src");
        inlineResourcesForDirectory(this.tmpdir);
        fs.writeFileSync(this.tmpdir + '/tsconfig.json', JSON.stringify(this.ngcConfig));
        shelljs.exec('"node_modules/.bin/ngc" -p ' + this.tmpdir + '/tsconfig.json');
        return rollup.rollup(this.rollupInputOptions)
            .then(function (bundle) { return bundle.write(_this.rollupOutputOptions); })
            .then(function () {
            shelljs.exec('"node_modules/.bin/cpx" "' + _this.tmpdir + '/build/**/*.d.ts" "' + _this.tmpdir + '/dist"');
            shelljs.exec('"node_modules/.bin/cpx" "' + _this.tmpdir + '/build/assets/**/*" "' + _this.tmpdir + '/dist/assets"');
            shelljs.exec("cp " + _this.tmpdir + "/build/*.metadata.json " +
                _this.tmpdir + "/dist/");
            if (!_this.readmepath) {
                shelljs.exec("cp README* " + _this.tmpdir + "/dist/");
            }
            else {
                shelljs.exec("cp " + _this.readmepath + " " + _this.tmpdir + "/dist/README.md");
            }
            fs.writeFileSync(_this.tmpdir + "/dist/package.json", JSON.stringify(_this.packageJSONConfig, null, 1));
            shelljs.exec("cd " + _this.tmpdir + "/dist && tar -zcvf " + "../../" +
                _this.moduleId + '-' +
                _this.version +
                ".tar.gz .");
            // exec("rm -Rf "+this.tmpdir);                            
        });
    };
    return NGMakeLib;
}());

exports.NGMakeLib = NGMakeLib;
