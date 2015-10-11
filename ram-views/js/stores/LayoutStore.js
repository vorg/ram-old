var EventEmitter = require('events').EventEmitter;
var RamAppDispatcher = require('../dispatcher/RamAppDispatcher');
var ActionTypes = require('../constants/RamConstants').ActionTypes;
var merge = require('react/lib/merge');
var R = require('ramda');

var CHANGE_EVENT = 'change';

var LayoutStore = merge(EventEmitter.prototype, {
  layouts: [
    { id: 'list0', className: 'layout-list',  childrenDepth: 0, label: '0',  selected: true  },
    { id: 'list1', className: 'layout-list',  childrenDepth: 1, label: '1',  selected: false },
    { id: 'list2', className: 'layout-list',  childrenDepth: 2, label: '2',  selected: false },
    { id: 'tree',  className: 'layout-tree',  childrenDepth: 99, label: '∈',  selected: false },
    { id: 'cards', className: 'layout-cards', childrenDepth: 0, label: '::', selected: false },
  ],
  getLayouts: function() {
    return this.layouts;
  },
  getCurrentLayout: function() {
    return R.filter(R.where({ selected: true}), this.layouts)[0];
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

LayoutStore.dispatchToken = RamAppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {
    case ActionTypes.SET_LAYOUT:
      LayoutStore.layouts.forEach(function(layout) {
        layout.selected = (layout.id == action.layoutId);
      });
      LayoutStore.emitChange();
      break;
  }
});

module.exports = LayoutStore;