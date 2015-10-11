var EventEmitter = require('events').EventEmitter;
var RamAppDispatcher = require('../dispatcher/RamAppDispatcher');
var ActionTypes = require('../constants/RamConstants').ActionTypes;
var merge = require('react/lib/merge');
var R = require('ramda');

var CHANGE_EVENT = 'change';

function compareItemOrder(a, b) {
  return a.order - b.order;
}


var ItemStore = merge(EventEmitter.prototype, {
  items: [],
  getItems: function() {
    return this.items;
  },
  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },
});

ItemStore.dispatchToken = RamAppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {
    case ActionTypes.SHOW_ITEMS:
      ItemStore.items = action.items;
      ItemStore.items.sort(compareItemOrder);
      ItemStore.emitChange();
      break;
    case ActionTypes.UPDATE_ITEM:
      var updatedItem = R.filter(R.where({ _id: action.item._id }), ItemStore.items);
      if (updatedItem.length > 0) {
        updatedItem[0]._rev = action.item.rev;
      }
      ItemStore.items.sort(compareItemOrder);
      ItemStore.emitChange();
      break;
  }
});

module.exports = ItemStore;