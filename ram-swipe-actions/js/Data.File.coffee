Ram.Data = EventDispatcher.extend({
  init: (callback) ->
    callback(self) if (callback)
  loadItems: (callback) ->
    @items = items = []
    parentId = []
    parentLevel = 0
    prevId = 0
    prevLevel = 0
    id = 1
    maxLevel = 0
    itemsById = {}
    Ram.CacheUtils.getUrl('data/tasks.txt', (str) ->
      str.trim().split('\n').forEach((line, lineIndex) ->
        level = 0
        while line[level] == '\t'
          level += 1
        level += 1
        maxLevel = Math.max(maxLevel, level)
        text = line.trim()
        item = {}
        item.text = line.trim()
        atIndex = item.text.indexOf('@')
        if atIndex > 0
          item.tags = item.text.substr(atIndex)
          item.text = item.text.substr(0, atIndex-1)
        if item.text.substr(0, 2) == '- '
          item.text = item.text.substr(2)
        if item.text[item.text.length-1] == ':'
          item.text = item.text.substr(0, item.text.length)
        item._id = id++
        itemsById[item._id] = item
        if level > prevLevel
          if level - prevLevel > 1
            level = prevLevel + 1
            #throw 'to big jump in : ' + item.text
          parentId.push(prevId)
        else if level < prevLevel
          for i in [0...prevLevel-level]
            parentId.pop()

        item.parentid = parentId[parentId.length-1]
        prevLevel = level
        prevId = item._id
        items.push(item)
      )
      callback(items)
    )
  getChildren: (parentid) ->
    return @items.filter (item) -> item.parentid == parentid
  onChange: (change) ->
  addItem: (item) ->
  updateItem: (item) ->
  removeItemById: (itemid) ->
  removeItem: (item) ->
})