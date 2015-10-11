var EventEmitter = require('events').EventEmitter;
var RamAppDispatcher = require('../dispatcher/RamAppDispatcher');
var ActionTypes = require('../constants/RamConstants').ActionTypes;
var merge = require('react/lib/merge');

var CHANGE_EVENT = 'change';

var UserStore = merge(EventEmitter.prototype, {
  user: {
    name: null,
    loggedIn: false,
    connecting: false
  },
  getUser: function() {
    return this.user;
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

UserStore.dispatchToken = RamAppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {
    case ActionTypes.LOG_IN:
    console.log('UserStore.loggingIn');
      UserStore.user.loggedIn = true;
      UserStore.emitChange();
      break;

    default:
  }

});

module.exports = UserStore;