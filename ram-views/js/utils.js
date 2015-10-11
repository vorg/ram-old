module.exports.NULL_GUID = "00000000-0000-0000-0000-000000000000";

module.exports.guid = (function() {
  //http://note19.com/2007/05/27/javascript-guid-generator/
  function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  }
  return function() {
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  }
})();