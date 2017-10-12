#!/usr/bin/env node
'use strict';

var path = require('path');
var fs = require('fs');
var glob = require('glob');
var shell = require('shelljs');

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
/** Inlines the templates of Angular components for a specified source file. */
function inlineTemplate(fileContent, filePath) {
    return fileContent.replace(/templateUrl:\s*["']([^']+?\.html)["']/g, function (_match, templateUrl) {
        var templatePath = path.join(path.dirname(filePath), templateUrl);
        var templateContent = loadResourceFile(templatePath);
        return "template: \"" + templateContent + "\"";
    });
}
/** Inlines the external styles of Angular components for a specified source file. */
function inlineStyles(fileContent, filePath) {
    return fileContent.replace(/styleUrls:\s*(\[[\s\S]*?])/gm, function (_match, styleUrlsValue) {
        // The RegExp matches the array of external style files. This is a string right now and
        // can to be parsed using the `eval` method. The value looks like "['AAA.css', 'BBB.css']"
        var styleUrls = eval(styleUrlsValue);
        var styleContents = styleUrls
            .map(function (url) { return path.join(path.dirname(filePath), url); })
            .map(function (path$$1) { return loadResourceFile(path$$1); });
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
                "emitDecoratorMetadata": false,
                "experimentalDecorators": true,
                "declaration": true,
                "lib": ["es2015", "dom"],
                "noImplicitAny": true,
                "suppressImplicitAnyIndexErrors": true
            },
            "files": [],
            "angularCompilerOptions": {
                "genDir": "build",
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

var libsrc = process.argv[2];
var moduleId = process.argv[3];
var liborigsrcdir = libsrc.substring(0, libsrc.lastIndexOf("/"));
var srcfile = libsrc.substring(libsrc.lastIndexOf("/") + 1);
var tmpdir = ".ngmakelibtmp";
fs.mkdirSync(tmpdir);
shell.exec("cp -r " + liborigsrcdir + " " + tmpdir + "/src");
inlineResourcesForDirectory(tmpdir);
var config = new AngularCompilerConfig().getConfig("src/" + srcfile, "build", moduleId);
fs.writeFileSync(tmpdir + '/tsconfig.json', JSON.stringify(config));
shell.exec("node_modules/.bin/ngc -p " + tmpdir + '/tsconfig.json');
shell.exec("ls -l " + tmpdir);
shell.exec("rm -Rf " + tmpdir);
