import {inlineResourcesForDirectory} from './pkg-tools/inline-resources';
import {AngularCompilerConfig} from './configs/angularcompiler.config';
import {writeFileSync,mkdirSync} from 'fs';
import * as shell from 'shelljs';

declare var process;

let libsrc: string = process.argv[2];
let moduleId: string = process.argv[3];
let liborigsrcdir: string = libsrc.substring(0,libsrc.lastIndexOf("/"));
let srcfile: string = libsrc.substring(libsrc.lastIndexOf("/")+1);

let tmpdir = ".ngmakelibtmp";
mkdirSync(tmpdir);
shell.exec("cp -r "+liborigsrcdir+" "+tmpdir+"/src");
inlineResourcesForDirectory(tmpdir);
let config = new AngularCompilerConfig().getConfig(
    "src/"+srcfile,
    "build",
    moduleId);
writeFileSync(tmpdir+'/tsconfig.json',JSON.stringify(config));
shell.exec("node_modules/.bin/ngc -p "+tmpdir+'/tsconfig.json');
shell.exec("ls -l "+tmpdir);
shell.exec("rm -Rf "+tmpdir);