var EventEmitter = require('events').EventEmitter;
var RamAppDispatcher = require('../dispatcher/RamAppDispatcher');
var ActionTypes = require('../constants/RamConstants').ActionTypes;
var merge = require('react/lib/merge');
var R = require('ramda');

var CHANGE_EVENT = 'change';

var SyncStore = merge(EventEmitter.prototype, {
  progress: 0,
  getProgress: function() {
    return this.progress;
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

SyncStore.dispatchToken = RamAppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {
    case ActionTypes.SYNC_PROGRESS:
      SyncStore.progress = action.progress;
      SyncStore.emitChange();
      break;
    case ActionTypes.SYNC_DONE:
      SyncStore.progress = 1;
      SyncStore.emitChange();
      break;
  }
});

module.exports = SyncStore;