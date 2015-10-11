var RamAppDispatcher = require('../dispatcher/RamAppDispatcher');
var RamConstants = require('../constants/RamConstants');
var ActionTypes = RamConstants.ActionTypes;

var LayoutActions = {
  setLayout: function(layoutId) {
    RamAppDispatcher.handleViewAction({
      type: ActionTypes.SET_LAYOUT,
      layoutId: layoutId
    });
  }
};

module.exports = LayoutActions;