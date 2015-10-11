var React = require('react');
var ItemStore = require('../stores/ItemStore');
var ItemSelectionStore = require('../stores/ItemSelectionStore');
var LayoutStore = require('../stores/LayoutStore');
var ListItem = require('./ListItem');
var ItemActions = require('../actions/ItemActions');
var Key = require('../constants/RamConstants').Key;

var ItemList = React.createClass({
  getInitialState: function() {
    return {
      items: ItemStore.getItems()
    }
  },
  componentDidMount: function() {
    ItemStore.addChangeListener(this.onItemsChange);
    ItemSelectionStore.addChangeListener(this.onItemsChange);
    window.addEventListener('keydown', this.onKeyDown);
  },
  componentWillUnmount: function() {
    ItemStore.removeChangeListener(this.onItemsChange);
    ItemSelectionStore.removeChangeListener(this.onItemsChange);
    window.removeEventListener('keydown', this.onKeyDown);
  },
  onItemsChange: function() {
    this.setState({ items: ItemStore.getItems() });
  },
  onItemDiggDown: function(item) {
    ItemActions.showChildren(item._id);
  },
  onKeyDown: function(e) {
    console.log('ItemList', 'onKeyDown', e.keyCode);

    var items = this.state.items;
    var selectItem = ItemSelectionStore.getSelectedItem();

    if (e.keyCode == Key.UP) {
      var index = items.indexOf(selectItem);
      if (index > 0) {
        ItemActions.selectItem(items[index-1]);
        e.preventDefault();
        e.stopPropagation();
      }
      else if (index == 0) {
        ItemActions.selectItemById(items[0].pid);
        e.preventDefault();
        e.stopPropagation();
      }
    }
    if (e.keyCode == Key.DOWN) {
      var index = items.indexOf(selectItem);
      if (index != -1 && index < items.length - 1) {
        ItemActions.selectItem(items[index+1]);
        e.preventDefault();
        e.stopPropagation();
      }
    }
    if (e.keyCode == Key.ENTER) {
      var index = items.indexOf(selectItem);
      if (index != -1) {
        ItemActions.showChildren(items[index]._id);
      }
    }
    if (e.keyCode == Key.DELETE) {
    }
  },
  render: function() {
    var itemElements = this.state.items.map(function(item, itemIndex) {
      return ListItem({ item: item, key: item._id, onDiggDown: this.onItemDiggDown.bind(this, item) });
    }.bind(this));
    return React.DOM.ul({ className: 'list itemList' }, itemElements);
  }
});

module.exports = ItemList;