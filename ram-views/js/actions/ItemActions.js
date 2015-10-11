var RamAppDispatcher = require('../dispatcher/RamAppDispatcher');
var RamConstants = require('../constants/RamConstants');
var ItemAPI = require('../apis/ItemAPI');
var ActionTypes = RamConstants.ActionTypes;
var ItemStore = require('../stores/ItemStore');
var ParentStackStore = require('../stores/ParentStackStore');
var R = require('ramda');

var ItemActions = {
  showItems: function(items) {
    RamAppDispatcher.handleViewAction({
      type: ActionTypes.SHOW_ITEMS,
      items: items
    });
  },
  showParentStack: function(parentStack) {
    RamAppDispatcher.handleViewAction({
      type: ActionTypes.SHOW_PARENT_STACK,
      parentStack: parentStack
    });
  },
  showChildren: function(id, level) {
    console.log('ItemActions.showChildren', id);
    ItemActions.setCurrentParent(id);
    ItemAPI.getChildren(id, level).then(function(children) {
      ItemActions.showItems(children);
      ItemActions.selectItemById(id);
    })
    .catch(function(e) {
      console.log('ItemActions.showChildren', e);
    })
  },
  addItem: function(newItem) {
    ItemAPI.addItem(newItem)
    .then(function() {
      return ItemActions.showChildren(newItem.pid);
    })
    .catch(function(e) {
      console.log('ItemActions.addItem', e);
    })
  },
  updateItem: function(item) {
    if (item.editing != undefined) {
      delete item.editing;
    }
    ItemAPI.updateItem(item)
    .then(function(updatedItem) {
      //TODO: handle conflict if .ok != true
      item._rev = updatedItem.rev;
      RamAppDispatcher.handleViewAction({
        type: ActionTypes.UPDATE_ITEM,
        item: item
      });
    })
    .catch(function(e) {
      console.log('ItemActions.updateItem', e);
    })
  },
  setCurrentParent: function(id) {
    console.log('ItemActions.setCurrentParent', id);
    ItemAPI.getParentStack(id).then(function(parentStack) {
      console.log('ItemActions.setCurrentParent', parentStack);
      ItemActions.showParentStack(parentStack);
    })
  },
  selectItem: function(item) {
    RamAppDispatcher.handleViewAction({
      type: ActionTypes.SELECT_ITEM,
      selectedItem: item
    });
  },
  selectItemById: function(id) {
    var itemToSelect = R.find(R.where({_id: id }), ItemStore.getItems());
    if (itemToSelect) {
      ItemActions.selectItem(itemToSelect);
      return;
    }

    itemToSelect = R.find(R.where({_id: id }), ParentStackStore.getParentStack());
    if (itemToSelect) {
      ItemActions.selectItem(itemToSelect);
      return;
    }

    ItemActions.selectItem(null);
  },
  syncItems: function() {
    function onProgress(e) {
      RamAppDispatcher.handleViewAction({
        type: ActionTypes.SYNC_PROGRESS,
        progress: e.progress
      });
    }
    function onDone() {
      RamAppDispatcher.handleViewAction({
        type: ActionTypes.SYNC_DONE
      });
    }
    ItemAPI.sync(onProgress, onDone);
  }
};

module.exports = ItemActions;