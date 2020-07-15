var Builder = require('./builder');
var TestSuite = require('./test_suite');
var TestCase = require('./test_case');

function Factory() {
}

Factory.prototype.newBuilder = function () {
  return new Builder(this);
};

Factory.prototype.newTestSuite = function () {
  return new TestSuite(this);
};

Factory.prototype.newTestCase = function () {
  return new TestCase(this);
};

module.exports = Factory;
