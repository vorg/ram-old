EventDispatcher =
  extend: (context) ->
    subscribers = {}
    dispatcherInterface =
      addEventListener: (type, handler) ->
        if !subscribers[type] then subscribers[type] = []
        subscribers[type].push(handler)
      removeEventListener: (type, handler) ->
        idx = subscribers[type].indeOf(handler)
        if idx > -1 then subscribers[type].splice(idx, 1)
      fire: (type, arg) ->
        if subscribers[type]
          for i in [0...subscribers[type].length]
            subscribers[type][i].call(this, arg)

    for methodName of dispatcherInterface
      context[methodName] = dispatcherInterface[methodName]
    return context
