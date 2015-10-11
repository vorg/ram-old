Ram.Data = {
  loadItems: (callback) ->
    itemsStr = localStorage['ram.items']
    if itemsStr
      callback(JSON.parse(itemsStr))
    else
      callback([{_id: '1', text:['Default']}])
  saveItems: (items, callback) ->
    itemsStr = JSON.stringify(items)
    localStorage['ram.items'] = itemsStr
    if callback
      callback()
}