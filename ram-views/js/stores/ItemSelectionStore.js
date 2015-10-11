var EventEmitter = require('events').EventEmitter;
var RamAppDispatcher = require('../dispatcher/RamAppDispatcher');
var ActionTypes = require('../constants/RamConstants').ActionTypes;
var merge = require('react/lib/merge');
var R = require('ramda');

var CHANGE_EVENT = 'change';

var ItemSelectionStore = merge(EventEmitter.prototype, {
  selectedItem: null,
  getSelectedItem: function() {
    return this.selectedItem;
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

ItemSelectionStore.dispatchToken = RamAppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {
    case ActionTypes.SELECT_ITEM:
      ItemSelectionStore.selectedItem = action.selectedItem;
      ItemSelectionStore.emitChange();
      break;
  }
});

module.exports = ItemSelectionStore;