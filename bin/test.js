#!/usr/bin/env node

'use strict';

var Jasmine = require('jasmine');
var jasmine = new Jasmine();

if (process.env.RUNNER === 'CI') {
  var jasmineJUnitReporter = require('intel-jasmine-junit-reporter');

  var junitReporter = jasmineJUnitReporter({
    specTimer: new jasmine.jasmine.Timer(),
    JUnitReportSavePath: process.env.SAVE_PATH || './',
    JUnitReportFilePrefix: process.env.FILE_PREFIX || 'obj-results-' +  process.version,
    JUnitReportSuiteName: 'Obj Reports',
    JUnitReportPackageName: 'Obj Reports'
  });

  jasmine.jasmine.getEnv().addReporter(junitReporter);
}

jasmine.loadConfig({
  spec_dir: 'dist/test',
  spec_files: [
    '**/*.js'
  ],
  random: true
});

jasmine.execute();
