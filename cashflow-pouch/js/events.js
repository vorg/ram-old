EventDispatcher = {
  extend: function(context) {
    var subscribers = {};
    var dispatcherInterface = {
      on: function(type, handler) {
        if (!subscribers[type]) subscribers[type] = [];
        subscribers[type].push(handler);
      },
      remove: function(type, handler) {
        var idx = subscribers[type].indeOf(handler);
        if (idx > -1) subscribers[type].splice(idx, 1);
      },
      fire: function(type, arg) {
        if (subscribers[type]) {
          for(var i=0; i<subscribers[type].length; i++) {
            subscribers[type][i].call(this, arg);
          }
        }
      }
    };
    for(var method in dispatcherInterface) {
      context[method] = dispatcherInterface[method];
    }
    return context;
  }
}