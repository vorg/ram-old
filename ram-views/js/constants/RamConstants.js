var keyMirror = require('react/lib/keyMirror');

module.exports = {
  ActionTypes: keyMirror({
    LOG_IN: null,
    SHOW_ITEMS: null,
    SHOW_PARENT_STACK: null,
    SET_LAYOUT: null,
    UPDATE_ITEM: null,
    SYNC_PROGRESS: null,
    SYNC_DONE: null,
    SELECT_ITEM: null
  }),
  PayloadSources: keyMirror({
    VIEW_ACTION: null
  }),
  Key: {
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 97,
    ENTER: 13,
    DELETE: 46,
    F1: 112,
    F2: 113
  }
};