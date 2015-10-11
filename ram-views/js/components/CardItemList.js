var React = require('react');
var ItemStore = require('../stores/ItemStore');
var CardItem = require('./CardItem');
var R = require('ramda');
var ItemActions = require('../actions/ItemActions');

var CardItemList = React.createClass({
  getInitialState: function() {
    return {
      items: ItemStore.getItems()
    }
  },
  componentDidMount: function() {
    ItemStore.addChangeListener(this.onItemsChange);
  },
  componentWillUnmount: function() {
    ItemStore.removeChangeListener(this.onItemsChange);
  },
  onItemsChange: function() {
    this.setState({ items: ItemStore.getItems() });
  },
  onItemDiggDown: function(item) {
    ItemActions.showChildren(item._id);
  },
  render: function() {
    var numColumns = 4;
    if (window.innerWidth < window.innerHeight) {
      //portrait mode
      numColumns = 2;
    }
    var columns = R.range(0, numColumns).map(function() { return []; });
    this.state.items.forEach(function(item, itemIndex) {
      columns[itemIndex % numColumns].push( CardItem({ item: item, key: item._id, onDiggDown: this.onItemDiggDown.bind(this, item) }))
    }.bind(this))

    var columnElements = columns.map(function(col) {
      return React.DOM.li({ className: 'column'},
        React.DOM.ul({}, col)
      );
    })

    return React.DOM.ul({ className: 'list itemList' }, columnElements);
  }
});

module.exports = CardItemList;