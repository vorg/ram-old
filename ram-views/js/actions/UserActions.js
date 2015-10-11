var RamAppDispatcher = require('../dispatcher/RamAppDispatcher');
var RamConstants = require('../constants/RamConstants');
var ActionTypes = RamConstants.ActionTypes;

var UserActions = {
  logIn: function(user, password) {
    console.log('UserActions.logIn', user, password);
    RamAppDispatcher.handleViewAction({
      type: ActionTypes.LOG_IN,
      user: user,
      password: password
    });
  }
};

module.exports = UserActions;