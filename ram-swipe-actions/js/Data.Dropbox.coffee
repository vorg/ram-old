DROPBOX_APP_KEY = 'n5z7guvmh1xril9'
client = new Dropbox.Client({key: DROPBOX_APP_KEY})

Ram.Data = EventDispatcher.extend({
  init: (callback) ->
    self = this

    client.authenticate({interactive:false}, (error) ->
      if error then alert('Authentication error: ' + error);
    );

    if client.isAuthenticated()
      client.getDatastoreManager().openDefaultDatastore((error, datastore) ->
        if error then alert('Error opening default datastore: ' + error)

        self.itemsTable = datastore.getTable('items')
        #Populate the initial task list.
        #updateList()

        #Ensure that future changes update the list.
        datastore.recordsChanged.addListener((e) ->
          console.log('db updated', e)
          self.fire('itemChanged', e)
        )

        callback(null, self) if (callback)
      );
  loadItems: (callback) ->
  getChildren: (parentId) ->
    items = @itemsTable.query({parentId: parentId});
  onChange: (change) ->
  addItem: (item) ->
    console.log('Data.addItem')
    console.log(self.itemsTable)
    @itemsTable.insert(item);
  updateItem: (item) ->
    item.set('text', item.tmpText)
  removeItemById: (itemid) ->
  removeItem: (item) ->
})