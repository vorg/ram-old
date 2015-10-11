var R = require('ramda');
var Promise = require('bluebird');
var PouchDB = require('pouchdb');
var Config = require('../config.js');

function loadJSON(url, callback) {
  var r = new XMLHttpRequest();
  r.open('GET', url, true);
  r.onreadystatechange = function() {
    if (r.readyState != 4 || r.status != 200) return;
    callback(null, JSON.parse(r.responseText));
  };
  r.send();
}

var DB_NAME = 'items';
var ROOT_ID = '-1';

var SyntheticRoot = {
  _id: ROOT_ID,
  pid: '-2',
  text: 'RAM',
  order: 0,
  created: (new Date()).toISOString()
};

var ItemAPI = {
  db: null,
  items: [],
  initDB: function() {
    //init db
    //try to retrieve root element
    //add root if it didn't exist yet
    console.log('ItemAPI.initDB');
    return new Promise(function(resolve, reject) {
      console.log('ItemAPI.initDB promise');
      if (this.db) {
        console.log('resolving db');
        return resolve(this.db);
      }
      console.log('ItemAPI.initDB try');
      try {
        this.db = new PouchDB(DB_NAME);
        console.log('ItemAPI.initDB db', this.db);
        this.db.get(ROOT_ID)
          .then(function(root) {
            console.log('ItemAPI.initDB root', root);
            resolve(root);
          })
          .catch(function(e) {
            console.log('ItemAPI.initDB not found', e);
            if (e.name == 'not_found') {
              console.log('ItemAPI.initDB SyntheticRoot');
              this.db.put(SyntheticRoot)
                .then(function(root) {
                  resolve(root)
                })
                .catch(function(e){
                  reject(e);
                })
                .done(function() {
                  console.log('done')
                })
            }
            else reject(e);
          }.bind(this))
        }
        catch(e) {
          console.log(e);
        }
    }.bind(this));
  },
  initItems: function() {
    return this.initDB().then(function() {
      return this.db.allDocs({ include_docs: true })
        .then(function(docs) {
          this.items = docs.rows.map(R.prop('doc'));
          console.log('ItemAPI.initItems numItems:', this.items.length)
          return this.items;
        }.bind(this))
    }.bind(this))
  },
  getChildren: function(pid, level) {
    level = level || 0;
    return new Promise(function(resolve, reject) {
      var children = R.filter(R.where({ pid: pid }), this.items);
      children.forEach(function(child) {
        child.level = 0;
      })
      for(var i=0; i<level; i++) {
        for(var childIndex=0; childIndex<children.length; childIndex++) {
          var child = children[childIndex];
          if (child.level == i) {
            var childChildren = R.filter(R.where({ pid: child._id }), this.items);
            childChildren.forEach(function(c) {
              c.level = i + 1;
            })
            children.splice.apply(children, [childIndex+1, 0].concat(childChildren));
            child.numChildren = childChildren.length;
          }
        }
      }
      resolve(children);
    }.bind(this));
  },
  getParentStack: function(id) {
    return new Promise(function(resolve, reject) {
      var stack = [];
      var item = R.filter(R.where({ _id: id }), this.items)[0];
      while(item) {
        stack.push(item);
        item = R.filter(R.where({ _id: item.pid }), this.items)[0];
      }
      resolve(stack);
    }.bind(this));
  },
  addItem: function(item) {
    return new Promise(function(resolve, reject) {
      if (!item.text) {
        item.text = 'New item';
      }
      if (!item.pid) {
        item.pid = '-1';
      }
      if (!item.created) {
        item.created = (new Date()).toISOString();
      }
      resolve(this.db.post(item)
        .then(function(item) {
          //reload items
          return this.initItems().then(function() {

          })
        }.bind(this))
        .catch(function(e) {
          reject(e);
        })
      )
    }.bind(this))
  },
  updateItem: function(item) {
    return this.db.put(item);
  },
  sync: function(onProgress, onDone) {
    this.syncIn(onProgress, onDone);
  },
  syncIn: function(onProgress, onDone) {
    console.log('ItemAPI.syncIn');
    var continuous = false;
    this.db.replicate.from(Config.remoteDb, {
      withCredentials: true,
      continuous: continuous,
      onChange: function(change) {
        console.log('ItemAPI.syncIn', 'read', change.docs_read, 'written', change.docs_written);
        if (onProgress) onProgress({ progress: 0.5*change.docs_written/change.docs_read });
      },
      complete: function(change) {
        console.log('ItemAPI.syncIn complete', change);
        if (onProgress) onProgress({ progress: 0.5 });
        this.syncOut(onProgress, onDone);
      }.bind(this)
    });
  },
  syncOut: function(onProgress, onDone) {
    console.log('ItemAPI.syncOut');
    var continuous = false;
    this.db.replicate.to(Config.remoteDb, {
      withCredentials: true,
      continuous: continuous,
      onChange: function(change) {
        console.log('ItemAPI.syncOut', 'read', change.docs_read, 'written', change.docs_written);
        if (onProgress) onProgress({progress:0.5 + 0.5*change.docs_written/change.docs_read });
      },
      complete: function(change) {
        if (onProgress) onProgress({ progress:1 });
        if (onDone) onDone();
        console.log('ItemAPI.syncOut complete', change);
      }
    });
  },
}


module.exports = ItemAPI;