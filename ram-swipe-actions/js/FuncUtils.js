// Generated by CoffeeScript 1.6.2
var Ram;

Ram = Ram || {};

Ram.FuncUtils = (function() {
  var first, last;

  first = function(list) {
    if (list.length > 0) {
      return list[0];
    } else {
      return null;
    }
  };
  last = function(list) {
    if (list.length > 0) {
      return list[list.length - 1];
    } else {
      return null;
    }
  };
  return {
    first: first,
    last: last
  };
})();
