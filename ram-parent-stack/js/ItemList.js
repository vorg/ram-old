// Generated by CoffeeScript 1.7.1
Ram.ItemList = React.createClass({
  getInitialState: function() {
    return {
      editedItemId: null
    };
  },
  setEditedItem: function(item) {
    this.setState({
      editedItemId: item._id
    });
    return setTimeout((function(_this) {
      return function() {
        var editableNode;
        editableNode = _this.getDOMNode().querySelector('.edited span[contenteditable]');
        if (editableNode) {
          editableNode.focus();
          return Ram.Utils.setEndOfContenteditable(editableNode);
        }
      };
    })(this), 100);
  },
  onItemClick: function(item, e, measurement) {
    var minTextWidth, textHit, textWidth;
    minTextWidth = 50;
    textWidth = Math.max(minTextWidth, measurement.getDOMNode().clientWidth);
    textHit = e.clientX < textWidth + 50;
    if (e.target.className === 'text' && textHit) {
      return this.setEditedItem(item);
    } else if (e.target.className === 'detail' || !textHit) {
      return this.getDOMNode().dispatchEvent(new CustomEvent('drillDown', {
        detail: item,
        changed: true,
        bubbles: true
      }));
    }
  },
  onItemKeyDown: function(item, e) {
    item.text = e.target.textContent;
    e.target.focus();
    if (e.keyCode === 13) {
      e.preventDefault();
      this.setState({
        editedItemId: null
      });
      this.getDOMNode().blur();
      this.addNewItem(item);
      return false;
    }
  },
  onItemKeyUp: function(item, e) {
    if (item.text !== e.target.textContent) {
      item.text = e.target.textContent;
      return this.getDOMNode().dispatchEvent(new CustomEvent('updateItem', {
        detail: item,
        changed: true,
        bubbles: true
      }));
    } else {
      return this.getDOMNode().dispatchEvent(new CustomEvent('updateItem', {
        detail: null,
        changed: false,
        bubbles: true
      }));
    }
  },
  onItemInput: function(item, e) {},
  onItemPaste: function(item, e) {
    var node, text;
    text = e.clipboardData.getData('text/plain');
    node = e.target;
    return setTimeout((function() {
      return node.innerHTML = node.textContent;
    }), 10);
  },
  addNewItem: function(afterItem) {
    return this.getDOMNode().dispatchEvent(new CustomEvent('addItem', {
      detail: {
        after: afterItem
      },
      bubbles: true
    }));
  },
  buildTreeOrderedList: function(items) {
    var orderedList, parentMap, tree, visitChildren;
    tree = [];
    parentMap = {};
    items.forEach(function(item) {
      var itemInfo;
      itemInfo = {
        item: item,
        children: [],
        level: 0
      };
      return parentMap[item._id] = itemInfo;
    });
    items.forEach(function(item) {
      var itemInfo, parentInfo;
      parentInfo = parentMap[item.parentid];
      itemInfo = parentMap[item._id];
      if (parentInfo) {
        return parentInfo.children.push(itemInfo);
      } else {
        return tree.push(itemInfo);
      }
    });
    orderedList = [];
    visitChildren = function(children, level) {
      children.sort(function(a, b) {
        return a.item.order - b.item.order;
      });
      return children.forEach(function(child) {
        child.level = level;
        orderedList.push(child);
        return visitChildren(child.children, level + 1);
      });
    };
    visitChildren(tree, 0);
    return orderedList;
  },
  render: function() {
    var makeItem, orderedList;
    makeItem = (function(_this) {
      return function(itemInfo, itemIndex) {
        var item;
        item = itemInfo.item;
        return Ram.Item({
          key: item._id,
          onClick: _this.onItemClick.bind(_this, item),
          onKeyDown: _this.onItemKeyDown.bind(_this, item),
          onKeyUp: _this.onItemKeyUp.bind(_this, item),
          onInput: _this.onItemInput.bind(_this, item),
          onPaste: _this.onItemPaste.bind(_this, item),
          item: item,
          edited: item._id === _this.state.editedItemId,
          carretPos: _this.state.carretPos,
          level: itemInfo.level
        });
      };
    })(this);
    orderedList = this.buildTreeOrderedList(this.props.items);
    return React.DOM.ul({
      className: 'list'
    }, orderedList.map(makeItem));
  }
});