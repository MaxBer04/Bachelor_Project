#!/usr/bin/env node
"use strict";

var join = require('path').join;

var childProcess = require('child_process');

var args = process.argv.slice(2);
args.unshift(__dirname + '/../');
console.log(__dirname + '/../');
childProcess.exec('node dist/app.js', function (err, stdout) {
  if (err) console.log(err);
  console.log(stdout);
});