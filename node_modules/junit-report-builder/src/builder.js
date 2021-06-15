var _ = require('lodash');
var xmlBuilder = require('xmlbuilder');
var path = require('path');
var makeDir = require('make-dir');
var fs = require('fs');
var TestSuite = require('./test_suite');
var TestCase = require('./test_case');

function JUnitReportBuilder(factory) {
  this._factory = factory;
  this._testSuitesAndCases = [];
}

JUnitReportBuilder.prototype.writeTo = function (reportPath) {
  makeDir.sync(path.dirname(reportPath));
  fs.writeFileSync(reportPath, this.build(), 'utf8');
};

JUnitReportBuilder.prototype.build = function () {
  var xmlTree = xmlBuilder.create('testsuites', { encoding: 'UTF-8', allowSurrogateChars: true });
  _.forEach(this._testSuitesAndCases, function (suiteOrCase) {
    suiteOrCase.build(xmlTree);
  });
  return xmlTree.end({ pretty: true });
};

JUnitReportBuilder.prototype.testSuite = function () {
  var suite = this._factory.newTestSuite();
  this._testSuitesAndCases.push(suite);
  return suite;
};

JUnitReportBuilder.prototype.testCase = function () {
  var testCase = this._factory.newTestCase();
  this._testSuitesAndCases.push(testCase);
  return testCase;
};

JUnitReportBuilder.prototype.newBuilder = function () {
  return this._factory.newBuilder();
};

module.exports = JUnitReportBuilder;
