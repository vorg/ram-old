var DataSource = EventDispatcher.extend({
  local: null,
  init: function(callback) {
    console.log('DataSource.init');
    console.time('DataSource.init');
    var self = this;
    this.local = new Pouch(DB_NAME, function(error, db) {
      console.timeEnd('DataSource.init');
      console.log('DataSource.init createdDataBase', DB_NAME);
      db.info(function(err, info){
        console.log('DataSource.init info', info);
        db.changes({
          continuous: true,
          include_docs: true,
          since: info.update_seq,
          onChange: self.onChange.bind(self)
        });
      })
      if (callback) callback(self);
    });
  },
  getAccounts: function(callback) {
    console.log('DataSource.getAccounts');
    var mapAccounts = "function(doc) { if (doc.type == 'account') { emit(null, doc) } }";
    var getRowValue = function(row) { return row.value; };
    console.time('DataSource.getAccounts');
    this.local.query({'map':mapAccounts}, {reduce: false}, function(error, result) {
      console.log('DataSource.getAccounts', error, result);
      console.time('DataSource.getAccountsJSONMap');
      var accounts = result.rows.map(getRowValue);
      console.timeEnd('DataSource.getAccountsJSONMap');
      console.timeEnd('DataSource.getAccounts');
      if (callback) callback(accounts);
    });
  },
  getItems: function(accountId, callback) {
    var mapItems = "function(doc) { if (doc.type == 'item' && doc.accountid == '" + accountId + "') { emit(null, doc) } }";
    var getRowValue = function(row) { return row.value; };
    console.time('DataSource.getItems');
    this.local.query({'map':mapItems}, {reduce: false}, function(error, result) {
      var items = result.rows.map(function(row) {
        var item = row.value;
        return {
          _id: item._id,
          tags: item.category.split(' '),
          date: item.date,
          text: item.notes,
          price: item.operation + ' ' + item.value
        };
      });
      var s = JSON.stringify(items);
      console.time('DataSource.getItemsJSONMap');
      var items = result.rows.map(getRowValue);
      console.timeEnd('DataSource.getItemsJSONMap');
      console.timeEnd('DataSource.getItems');
      if (callback) callback(items);
    });
  },
  sync: function(onProgress, onDone) {
    this.syncIn(onProgress, onDone);
  },
  syncIn: function(onProgress, onDone) {
    console.log('DataSource.syncIn');
    var continuous = false;
    this.local.replicate.from(REMOTE_DB, {
      withCredentials: true,
      continuous: continuous,
      onChange: function(change) {
        console.log('DataSource.syncIn', 'read', change.docs_read, 'written', change.docs_written);
        if (onProgress) onProgress({progress:0.5*change.docs_written/change.docs_read});
      },
      complete: function(change) {
        console.log('DataSource.syncIn complete', change);
        if (onProgress) onProgress({progress:0.5});
        this.syncOut(onProgress, onDone);
      }.bind(this)
    });
  },
  syncOut: function(onProgress, onDone) {
    console.log('DataSource.syncOut');
    var continuous = false;
    this.local.replicate.to(REMOTE_DB, {
      withCredentials: true,
      continuous: continuous,
      onChange: function(change) {
        console.log('DataSource.syncOut', 'read', change.docs_read, 'written', change.docs_written);
        if (onProgress) onProgress({progress:0.5 + 0.5*change.docs_written/change.docs_read});
      },
      complete: function(change) {
        if (onProgress) onProgress({progress:1});
        if (onDone) onDone();
        console.log('DataSource.syncOut complete', change);
      }
    });
  },
  addItem: function(item) {
    this.local.post(item, function(err, response) {
      console.log('Added item', item, err, response);
    });
  },
  updateItem: function(item) {
    this.local.post(item, function(err, response) {
      console.log('Added item', item, err, response);
    });
  },
  prepareItem: function(item) {
    item.date = new Date(item.date);
    item.value = Number(item.value);
    return item;
  },
  removeItemById: function(itemid) {
    console.log('DataSourceService.removeItemById', itemid);
    this.local.get(itemid, function(err, doc) {
      if (err) {
        console.log('DataSourceService.removeItemById error', err);
        return;
      }
      this.local.remove(doc, function(err, response) {
        if (err) {
          console.log('DataSourceService.removeItemById error', err);
        }
        else {
          console.log('DataSourceService.removeItemById log', response);
        }
      });
    }.bind(this));
  },
  removeItem: function(item) {
    console.log('DataSourceService.removeItem', item)
    this.local.remove(item, function(err, response) {
      if (err) {
        console.log('DataSourceService.removeItem error', err);
      }
      else {
        console.log('DataSourceService.removeItem log', response);
      }
    });
  },
  onChange: function(change) {
    if (change.doc) {
      if (change.doc._deleted) {
        var item = { _id:change.doc._id, _deleted:true };
        this.fire('itemChanged', item);
      }
      else if (change.doc.type == 'item') {
        var item = this.prepareItem(change.doc);
        this.fire('itemChanged', item);
      }
    }
  }
});