"use strict";

module.exports = asString
asString.asString = asString

asString.ISO8601_FORMAT = "yyyy-MM-dd hh:mm:ss.SSS";
asString.ISO8601_WITH_TZ_OFFSET_FORMAT = "yyyy-MM-ddThh:mm:ssO";
asString.DATETIME_FORMAT = "dd MM yyyy hh:mm:ss.SSS";
asString.ABSOLUTETIME_FORMAT = "hh:mm:ss.SSS";

function padWithZeros(vNumber, width) {
  var numAsString = vNumber + "";
  while (numAsString.length < width) {
    numAsString = "0" + numAsString;
  }
  return numAsString;
}
  
function addZero(vNumber) {
  return padWithZeros(vNumber, 2);
}

/**
 * Formats the TimeOffest
 * Thanks to http://www.svendtofte.com/code/date_format/
 * @private
 */
function offset(date) {
  // Difference to Greenwich time (GMT) in hours
  var os = Math.abs(date.getTimezoneOffset());
  var h = String(Math.floor(os/60));
  var m = String(os%60);
  if (h.length == 1) {
    h = "0" + h;
  }
  if (m.length == 1) {
    m = "0" + m;
  }
  return date.getTimezoneOffset() < 0 ? "+"+h+m : "-"+h+m;
}

function asString(/*format,*/ date) {
  var format = asString.ISO8601_FORMAT;
  if (typeof(date) === "string") {
    format = arguments[0];
    date = arguments[1];
  }
  
  if (!date) {
    date = new Date();
  }

  var vDay = addZero(date.getDate());
  var vMonth = addZero(date.getMonth()+1);
  var vYearLong = addZero(date.getFullYear());
  var vYearShort = addZero(date.getFullYear().toString().substring(2,4));
  var vYear = (format.indexOf("yyyy") > -1 ? vYearLong : vYearShort);
  var vHour  = addZero(date.getHours());
  var vMinute = addZero(date.getMinutes());
  var vSecond = addZero(date.getSeconds());
  var vMillisecond = padWithZeros(date.getMilliseconds(), 3);
  var vTimeZone = offset(date);
  var formatted = format
    .replace(/dd/g, vDay)
    .replace(/MM/g, vMonth)
    .replace(/y{1,4}/g, vYear)
    .replace(/hh/g, vHour)
    .replace(/mm/g, vMinute)
    .replace(/ss/g, vSecond)
    .replace(/SSS/g, vMillisecond)
    .replace(/O/g, vTimeZone);
  return formatted;

};
