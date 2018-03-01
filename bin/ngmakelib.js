#!/usr/bin/env node
var NGMakeLib = require('./ngmakelib.api').NGMakeLib;

if(process.argv.findIndex(p => p === '--watch') === 2) {    
    new NGMakeLib(process.argv[3], process.argv[4], process.argv[5] ? process.argv[5] : null)
        .watch();
} else {
    new NGMakeLib(process.argv[2], process.argv[3], process.argv[4] ? process.argv[4] : null)
        .build()
        .then(function() { console.log("All done"); });
}