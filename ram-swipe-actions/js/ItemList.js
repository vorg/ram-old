// Generated by CoffeeScript 1.7.1
Ram.ItemList = React.createClass({
  getInitialState: function() {
    return {
      editedItemId: null
    };
  },
  setEditedItem: function(item) {
    this.setState({
      editedItemId: item.getId()
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
    console.log('onItemClick', item, e.clientX, textWidth, textHit);
    if (item.get('editable') === false) {
      if (item.get('text') === '+') {
        this.getDOMNode().dispatchEvent(new CustomEvent('addItem', {
          detail: {
            after: null
          },
          changed: true,
          bubbles: true
        }));
      }
      return;
    }
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
    item.tmpText = e.target.textContent;
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
    if (item.get('text') !== e.target.textContent) {
      item.tmpText = e.target.textContent;
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
      return parentMap[item.getId()] = itemInfo;
    });
    items.forEach(function(item) {
      var itemInfo, parentInfo;
      parentInfo = parentMap[item.parentid];
      itemInfo = parentMap[item.getId()];
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
    var itemElements, makeItem, orderedList;
    makeItem = (function(_this) {
      return function(item, itemIndex) {
        return Ram.Item({
          key: item.getId(),
          onClick: _this.onItemClick.bind(_this, item),
          onKeyDown: _this.onItemKeyDown.bind(_this, item),
          onKeyUp: _this.onItemKeyUp.bind(_this, item),
          onInput: _this.onItemInput.bind(_this, item),
          onPaste: _this.onItemPaste.bind(_this, item),
          item: item,
          edited: item.getId() === _this.state.editedItemId,
          carretPos: _this.state.carretPos,
          level: item.level
        });
      };
    })(this);
    orderedList = this.props.items;
    itemElements = orderedList.map(makeItem);
    if (this.props.addEnabled) {
      itemElements.push(makeItem(Ram.makeFakeDropboxItem(-1, -1, '+', false)));
    }
    return React.DOM.ul({
      className: 'list'
    }, itemElements);
  }
});
