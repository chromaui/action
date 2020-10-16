function TestCase() {
  this._error = false;
  this._failure = false;
  this._skipped = false;
  this._standardOutput = undefined;
  this._standardError = undefined;
  this._stacktrace = undefined;
  this._attributes = {};
  this._errorAttributes = {};
  this._failureAttributes = {};
  this._errorAttachment = undefined;
  this._errorContent = undefined;
}

TestCase.prototype.className = function (className) {
  this._attributes.classname = className;
  return this;
};

TestCase.prototype.name = function (name) {
  this._attributes.name = name;
  return this;
};

TestCase.prototype.time = function (timeInSeconds) {
  this._attributes.time = timeInSeconds;
  return this;
};

TestCase.prototype.failure = function (message, type) {
  this._failure = true;
  if (message) {
    this._failureAttributes.message = message;
  }
  if (type) {
    this._failureAttributes.type = type;
  }
  return this;
};

TestCase.prototype.error = function (message, type, content) {
  this._error = true;
  if (message) {
    this._errorAttributes.message = message;
  }
  if (type) {
    this._errorAttributes.type = type;
  }
  if (content) {
    this._errorContent = content;
  }
  return this;
};

TestCase.prototype.stacktrace = function (stacktrace) {
  this._failure = true;
  this._stacktrace = stacktrace;
  return this;
};

TestCase.prototype.skipped = function () {
  this._skipped = true;
  return this;
};

TestCase.prototype.standardOutput = function (log) {
  this._standardOutput = log;
  return this;
};

TestCase.prototype.standardError = function (log) {
  this._standardError = log;
  return this;
};

TestCase.prototype.getFailureCount = function () {
  return Number(this._failure);
};

TestCase.prototype.getErrorCount = function () {
  return Number(this._error);
};

TestCase.prototype.getSkippedCount = function () {
  return Number(this._skipped);
};

TestCase.prototype.errorAttachment = function (path) {
  this._errorAttachment = path;
  return this;
};

TestCase.prototype.build = function (parentElement) {
  var testCaseElement = parentElement.ele('testcase', this._attributes);
  if (this._failure) {
    var failureElement = testCaseElement.ele('failure', this._failureAttributes);
    if (this._stacktrace) {
      failureElement.cdata(this._stacktrace);
    }
  }
  if (this._error) {
    var errorElement = testCaseElement.ele('error', this._errorAttributes);
    if (this._errorContent) {
      errorElement.cdata(this._errorContent);
    }
  }
  if (this._skipped) {
    testCaseElement.ele('skipped');
  }
  if (this._standardOutput) {
    testCaseElement.ele('system-out').cdata(this._standardOutput);
  }
  var systemError;
  if (this._standardError) {
    systemError = testCaseElement.ele('system-err').cdata(this._standardError);

    if(this._errorAttachment) {
      systemError.txt('[[ATTACHMENT|' + this._errorAttachment + ']]');
    }
  }
};

module.exports = TestCase;
