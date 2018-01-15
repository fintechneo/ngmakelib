import { NGMakeLib } from './ngmakelib.api';

let libsrc: string = process.argv[2];
let moduleId: string = process.argv[3];

const ngMakeLib = new NGMakeLib(libsrc, moduleId);
ngMakeLib.build().then(() => console.log("All done"));