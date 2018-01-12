import {inlineResourcesForDirectory} from './pkg-tools/inline-resources';
import {AngularCompilerConfig} from './configs/angularcompiler.config';
import { PackageJSONConfig } from './configs/packagejson.config';

import {writeFileSync,mkdirSync} from 'fs';
import * as shell from 'shelljs';
import * as rollup from 'rollup';

declare var process;

let libsrc: string = process.argv[2];
let moduleId: string = process.argv[3];
let liborigsrcdir: string = libsrc.substring(0,libsrc.lastIndexOf("/"));
let srcfile: string = libsrc.substring(libsrc.lastIndexOf("/")+1);

let tmpdir = ".ngmakelibtmp";
shell.exec("rm -Rf "+tmpdir);
mkdirSync(tmpdir);
shell.exec("cp -r "+liborigsrcdir+" "+tmpdir+"/src");
inlineResourcesForDirectory(tmpdir);
let config = new AngularCompilerConfig().getConfig(
    "src/"+srcfile,
    "build",
    moduleId);
writeFileSync(tmpdir+'/tsconfig.json',JSON.stringify(config));
shell.exec('"node_modules/.bin/ngc" -p ' + tmpdir +'/tsconfig.json');


const inputOptions = {
    input: tmpdir+"/build/"+moduleId+".js"    
};
const outputOptions = {
    file: tmpdir+"/dist/"+moduleId+".js",
    format: 'es'
}
async function build() {
    const bundle = await rollup.rollup(inputOptions);            
    await bundle.write(outputOptions);
};
build().then(() => {
    shell.exec('"node_modules/.bin/cpx" "' + tmpdir + '/build/**/*.d.ts" "' + tmpdir + '/dist"');
    shell.exec("cp "+tmpdir+"/build/*.metadata.json "+tmpdir+"/dist/");
    writeFileSync(tmpdir+"/dist/package.json",
        JSON.stringify(new PackageJSONConfig().getConfig(moduleId)
            ,null,1));
    shell.exec("cd "+tmpdir + "/dist && tar -zcvf " + "../../" + moduleId + ".tar.gz .");
    shell.exec("rm -Rf "+tmpdir);
    console.log("All done");

});

