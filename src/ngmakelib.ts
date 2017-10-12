import * as inlineresources from './pkg-tools/inline-resources';
import * as shell from 'shelljs';

declare var process;

let libsrc: string = process.argv[2];

console.log("Hello from tsmakelib",);
shell.exec("echo shell.exec works");
//inlineresources.inlineResourcesForDirectory(libsrc)