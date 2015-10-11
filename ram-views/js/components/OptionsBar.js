var React = require('react');
var ItemActions = require('../actions/ItemActions');
var SyncStore = require('../stores/SyncStore');

var OptionsBar = React.createClass({
  getInitialState: function() {
    return {
      syncProgress: 0,
    }
  },
  componentDidMount: function() {
    SyncStore.addChangeListener(this.onSyncUpdate);
  },
  componentWillUnmount: function() {
    SyncStore.removeChangeListener(this.onSyncUpdate);
  },
  onSyncUpdate: function() {
    this.setState({ syncProgress: SyncStore.getProgress() });
  },
  sync: function() {
    ItemActions.syncItems();
  },
  render: function() {
    var items = [];
    items.push(React.DOM.li({ key: 'sync', onClick: this.sync }, 'Sync ' + this.state.syncProgress))

    return React.DOM.ul({ className: 'optionsBar'}, items);
  }
});

module.exports = OptionsBar;