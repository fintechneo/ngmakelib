#!/usr/bin/env node
var NGMakeLib = require('./ngmakelib.api').NGMakeLib;

new NGMakeLib(process.argv[2], process.argv[3], process.argv[4] ? process.argv[4] : '0.1.0')
    .build()
    .then(function() { console.log("All done"); });
