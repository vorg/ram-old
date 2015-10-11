Ram.Data = EventDispatcher.extend({
  local: null,
  init: (callback) ->
    console.log('DataSource.init')
    self = this
    this.local = new Pouch(Ram.Config.DB_NAME, (error, db) ->
      console.timeEnd('DataSource.init');
      console.log('DataSource.init createdDataBase', Ram.Config.DB_NAME);
      db.info((err, info) ->
        console.log('DataSource.init info', info);
        db.changes({
          continuous: true,
          include_docs: true,
          since: info.update_seq,
          onChange: self.onChange.bind(self)
        })
      )
      callback(self) if (callback)
    )
  loadItems: (callback) ->
    mapItems = "function(doc) { return emit([doc.parentid || 0, doc.order], doc); }";
    getRowValue = (row) -> row.value
    this.local.query({'map':mapItems}, {reduce: false}, (error, result) ->
      console.log('DataSource.getItems', error, result)
      items = result.rows.map(getRowValue)
      callback(items) if (callback)
    )
  onChange: (change) ->
    if change.doc
      if change.doc._deleted
        item = { _id:change.doc._id, _deleted:true }
        @fire('itemChanged', item)
      else
        @fire('itemChanged', change.doc)
  addItem: (item) ->
    this.local.post(item, (err, response) ->
      console.log('Added item', item, err, response)
    )
  updateItem: (item) ->
    this.local.post(item, (err, response) ->
      console.log('Updated item', item, err, response)
    )
  removeItemById: (itemid) ->
    console.log('DataSourceService.removeItemById', itemid)
    this.local.get(itemid, (err, doc) =>
      if err then return console.log('DataSourceService.removeItemById error', err)
      this.local.remove(doc, (err, response) ->
        if err then console.log('DataSourceService.removeItemById error', err)
        else console.log('DataSourceService.removeItemById log', response)
      )
    )
  removeItem: (item) ->
    console.log('DataSourceService.removeItem', item)
    this.local.remove(item, (err, response) ->
      if err then console.log('DataSourceService.removeItem error', err)
      else console.log('DataSourceService.removeItem log', response)
    )
})