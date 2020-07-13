var _ = require('lodash');
var formatDate = require('date-format').asString;

function TestSuite(factory) {
  this._factory = factory;
  this._attributes = {};
  this._testCases = [];
  this._properties = [];
}

TestSuite.prototype.name = function (name) {
  this._attributes.name = name;
  return this;
};

TestSuite.prototype.time = function (timeInSeconds) {
  this._attributes.time = timeInSeconds;
  return this;
};

TestSuite.prototype.timestamp = function (timestamp) {
  if (_.isDate(timestamp)) {
    this._attributes.timestamp = formatDate('yyyy-MM-ddThh:mm:ss', timestamp);
  } else {
    this._attributes.timestamp = timestamp;
  }
  return this;
};

TestSuite.prototype.property = function (name, value) {
  this._properties.push({'name': name, 'value': value});
  return this;
};

TestSuite.prototype.testCase = function () {
  var testCase = this._factory.newTestCase();
  this._testCases.push(testCase);
  return testCase;
};

TestSuite.prototype.getFailureCount = function () {
  return this._sumTestCaseCounts(function (testCase) {
    return testCase.getFailureCount();
  });
};

TestSuite.prototype.getErrorCount = function () {
  return this._sumTestCaseCounts(function (testCase) {
    return testCase.getErrorCount();
  });
};

TestSuite.prototype.getSkippedCount = function () {
  return this._sumTestCaseCounts(function (testCase) {
    return testCase.getSkippedCount();
  });
};

TestSuite.prototype._sumTestCaseCounts = function (counterFunction) {
  var counts = _.map(this._testCases, counterFunction);
  return _.sum(counts);
};

TestSuite.prototype.build = function (parentElement) {
  this._attributes.tests = this._testCases.length;
  this._attributes.failures = this.getFailureCount();
  this._attributes.errors = this.getErrorCount();
  this._attributes.skipped = this.getSkippedCount();
  var suiteElement = parentElement.ele('testsuite', this._attributes);

  if (this._properties.length) {
    var propertiesElement = suiteElement.ele('properties');
    _.forEach(this._properties, function (property) {
      propertiesElement.ele('property', {
        name: property.name,
        value: property.value
      });
    });
  }

  _.forEach(this._testCases, function (testCase) {
    testCase.build(suiteElement);
  });
};

module.exports = TestSuite;
