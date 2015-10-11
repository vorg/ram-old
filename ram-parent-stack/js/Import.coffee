console.log('Importing...')
Ram.CacheUtils.getJson('stuff/hsbc-mi.json', (items) ->
  parentid = '19EC603D-FE7E-4492-8EB2-C3E77D16F618'
  console.log('Items', items.length)
  items.forEach (item) ->
    item.parentid = parentid
    #Ram.Data.addItem(item)
)

