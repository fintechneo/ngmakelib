#!/usr/bin/env node
var NGMakeLib = require('./ngmakelib.api').NGMakeLib;

new NGMakeLib(process.argv[2], process.argv[3])
    .build()
    .then(function() { console.log("All done"); });
