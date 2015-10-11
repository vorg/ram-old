Ram = Ram || {}

Ram.FuncUtils = (() ->
  first = (list) ->
    if list.length > 0
      list[0]
    else
      null
  last = (list) ->
    if list.length > 0
      list[list.length-1]
    else
      null

  return {
    first: first
    last: last
  }
)()