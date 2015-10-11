var React = require('react');
var ParentStackStore = require('../stores/ParentStackStore');
var ItemStore = require('../stores/ItemStore');
var ItemSelectionStore = require('../stores/ItemSelectionStore');
var ListItem = require('./ListItem');
var AddButton = require('./AddButton');
var ItemActions = require('../actions/ItemActions');
var Key = require('../constants/RamConstants').Key;

var ParentStack = React.createClass({
  getInitialState: function() {
    return {
      parentStack: ParentStackStore.getParentStack()
    }
  },
  componentDidMount: function() {
    ParentStackStore.addChangeListener(this.onParentStackChange);
    ItemSelectionStore.addChangeListener(this.onParentStackChange);
    window.addEventListener('keydown', this.onKeyDown);
  },
  componentWillUnmount: function() {
    ParentStackStore.removeChangeListener(this.onParentStackChange);
    ItemSelectionStore.removeChangeListener(this.onParentStackChange);
    window.removeEventListener('keydown', this.onKeyDown);
  },
  onParentStackChange: function() {
    this.setState({ parentStack: ParentStackStore.getParentStack().concat([]).reverse() });
  },
  onItemDiggDown: function(item) {
    ItemActions.showChildren(item._id);
  },
  onAddButtonClick: function() {
    var parent = this.state.parentStack[this.state.parentStack.length-1];
    ItemActions.addItem({ pid: parent._id, editing: true });
  },
  onKeyDown: function(e) {
    var items = this.state.parentStack;
    var selectItem = ItemSelectionStore.getSelectedItem();

    if (e.keyCode == Key.UP) {
      var index = items.indexOf(selectItem);
      if (index > 0) {
        ItemActions.selectItem(items[index-1]);
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }
    if (e.keyCode == Key.DOWN) {
      var index = items.indexOf(selectItem);
      if (index != -1) {
        if (index < items.length - 1) {
          ItemActions.selectItem(items[index+1]);
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
        else {
          var children = ItemStore.getItems();
          if (children.length > 0) {
            ItemActions.selectItem(children[0]);
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
          }
        }
      }
    }
    if (e.keyCode == Key.ENTER) {
      var index = items.indexOf(selectItem);
      if (index != -1) {
        ItemActions.showChildren(items[index]._id);
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }
  },
  render: function() {
    var itemElements = this.state.parentStack.map(function(item, itemIndex) {
      var children = null;
      if (itemIndex == this.state.parentStack.length - 1) {
        children = [ AddButton({ key: 'addButton' + itemIndex, onClick: this.onAddButtonClick }) ]
      }
      return ListItem({ item: item, key: item._id, children: children, onDiggDown: this.onItemDiggDown.bind(this, item) });
    }.bind(this));
    return React.DOM.ul({ className: 'list parentStack' }, itemElements);
  }
});

module.exports = ParentStack;