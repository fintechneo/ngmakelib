import {inlineResourcesForDirectory} from './pkg-tools/inline-resources';
import * as shell from 'shelljs';

declare var process;

let libsrc: string = process.argv[2];
let libdir: string = libsrc.substring(0,libsrc.lastIndexOf("/"));
console.log("Hello from tsmakelib");
let tmpdir = "/tmp/makelib"+new Date().getTime();
shell.exec("cp -r "+libdir+" "+tmpdir);
inlineResourcesForDirectory(tmpdir);
shell.exec("rm -Rf "+tmpdir);