junit-report-builder
====================

[![Build Status](https://travis-ci.org/davidparsson/junit-report-builder.svg?branch=master)](https://travis-ci.org/davidparsson/junit-report-builder)
[![Dependency Status](https://david-dm.org/davidparsson/junit-report-builder.svg)](https://david-dm.org/davidparsson/junit-report-builder)
[![devDependency Status](https://david-dm.org/davidparsson/junit-report-builder/dev-status.svg)](https://david-dm.org/davidparsson/junit-report-builder#info=devDependencies)
[![Weekly Downloads](https://img.shields.io/npm/dw/junit-report-builder.svg)](https://www.npmjs.com/package/junit-report-builder)

A project aimed at making it easier to build [Jenkins](http://jenkins-ci.org/) compatible XML based JUnit reports.

Installation
------------

To install the latest version, run:

    npm install junit-report-builder --save

Usage
-----

```JavaScript
var builder = require('junit-report-builder');

// Create a test suite
var suite = builder.testSuite().name('My suite');

// Create a test case
var testCase = suite.testCase()
  .className('my.test.Class')
  .name('My first test');

// Create another test case which is marked as failed
var testCase = suite.testCase()
  .className('my.test.Class')
  .name('My second test')
  .failure();

builder.writeTo('test-report.xml');
```

This will create `test-report.xml` containing the following:

```XML
<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="My suite" tests="2" failures="1" errors="0" skipped="0">
    <testcase classname="my.test.Class" name="My first test"/>
    <testcase classname="my.test.Class" name="My second test">
      <failure/>
    </testcase>
  </testsuite>
</testsuites>
```

If you want to create another report file, start by getting a new
builder instance like this:
```JavaScript
builder = builder.newBuilder();
```

Please refer to the [e2e_spec.coffee](spec/e2e_spec.coffee) for more details on the usage.

License
-------

[MIT](LICENSE)

Changelog
---------

### 2.0.0
- Replace mkdirp by make-dir to resolve [npm advisory 1179](https://www.npmjs.com/advisories/1179).
- Dropped support for node.js 0.10.x and 0.12.x

### 1.3.3
- Updated lodash to a version without known vulnerabilities.

### 1.3.2
- Added support for emitting the type attribute for error and failure elements of test cases
- Added support for emitting cdata/content for the error element of a test case

Thanks to [rturner-edjuster](https://github.com/rturner-edjuster).

### 1.3.1
- Update dependencies to versions without known vulnerabilities.

### 1.3.0
- Support [attaching files to tests](http://kohsuke.org/2012/03/13/attaching-files-to-junit-tests/). Thanks to [anto-wahanda](https://github.com/anto-wahanda).

### 1.2.0
- Support creating XML with emojis. Thanks to [ischwarz](https://github.com/ischwarz).

### 1.1.1
- Changed `date-format` to be a dependency. Previously it was incorrectly set to be a devDependency. Thanks to [georgecrawford](https://github.com/georgecrawford).

### 1.1.0
- Added attributes for test count, failure count, error count and skipped test count to testsuite elements
- Added ability to attach standard output and standard error logs to test cases
- Added ability set execution time for test suites
- Added ability set timestamp for test suites

### 1.0.0
- Simplified API by making the index module export a builder instance

### 0.0.2
- Corrected example in readme

### 0.0.1
- Initial release
