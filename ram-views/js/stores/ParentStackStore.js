var EventEmitter = require('events').EventEmitter;
var RamAppDispatcher = require('../dispatcher/RamAppDispatcher');
var ActionTypes = require('../constants/RamConstants').ActionTypes;
var merge = require('react/lib/merge');
var R = require('ramda');

var CHANGE_EVENT = 'change';

var ParentStack = merge(EventEmitter.prototype, {
  parentStack: [],
  getParentStack: function() {
    return this.parentStack;
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

ParentStack.dispatchToken = RamAppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {
    case ActionTypes.SHOW_PARENT_STACK:
      ParentStack.parentStack = action.parentStack;
      ParentStack.emitChange();
      break;
    case ActionTypes.UPDATE_ITEM:
      ParentStack.parentStack.forEach(function(item) {
        if (item._id == action.item._id) {
          Object.keys(action.item).forEach(function(prop) {
            console.log(prop);
            item[prop] = action.item[prop];
          });
        }
      })
      ParentStack.emitChange();
      break;
  }
});

module.exports = ParentStack;