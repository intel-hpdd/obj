#!/usr/bin/env node

'use strict';

var Jasmine = require('jasmine');
var jasmine = new Jasmine();

if (process.env.RUNNER === 'CI') {
  var krustyJasmineReporter = require('krusty-jasmine-reporter');

  var junitReporter = new krustyJasmineReporter.KrustyJasmineJUnitReporter({
    specTimer: new jasmine.jasmine.Timer(),
    JUnitReportSavePath: process.env.SAVE_PATH || './',
    JUnitReportFilePrefix: process.env.FILE_PREFIX || 'obj-results-' +  process.version,
    JUnitReportSuiteName: 'Obj Reports',
    JUnitReportPackageName: 'Obj Reports'
  });

  jasmine.jasmine.getEnv().addReporter(junitReporter);
}

require('babel-register');

jasmine.loadConfig({
  spec_dir: 'test',
  spec_files: [
    '**/*.js'
  ],
  random: true
});

exports.jasmine = jasmine.jasmine;
exports.env = jasmine.jasmine.getEnv();

jasmine.execute();
