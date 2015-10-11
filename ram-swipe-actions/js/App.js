// Generated by CoffeeScript 1.7.1
Ram.makeFakeDropboxItem = function(id, parentid, text, editable) {
  return {
    id: id,
    parentid: parentid,
    text: text,
    editable: editable,
    get: function(prop) {
      return this[prop];
    },
    getId: function() {
      return this.id;
    }
  };
};

Ram.App = React.createClass({
  getInitialState: function() {
    return {
      parentStack: [Ram.makeFakeDropboxItem(0, -1, 'RAM')],
      items: [],
      pendingItemUpdates: []
    };
  },
  componentDidMount: function() {
    this.refs.items.getDOMNode().addEventListener('addItem', this.onAddItem);
    return Ram.Data.init((function(_this) {
      return function(err, db) {
        if (err) {
          console.log(err);
        }
        db.addEventListener('itemChanged', function(e) {
          return _this.onDataItemChanged(e);
        });
        _this.onDrillDown({
          detail: _this.state.parentStack[0]
        });
        _this.refs.items.getDOMNode().addEventListener('drillDown', _this.onDrillDown);
        return _this.refs.parentStack.getDOMNode().addEventListener('drillDown', _this.onDrillDown);
      };
    })(this));
  },
  render: function() {
    return React.DOM.div({
      className: 'app'
    }, React.DOM.div({
      id: 'parentStack'
    }, Ram.ItemList({
      ref: 'parentStack',
      items: this.state.parentStack
    })), React.DOM.div({
      id: 'items'
    }, Ram.ItemList({
      ref: 'items',
      items: this.state.items,
      addEnabled: true
    })));
  },
  onDrillDown: function(e) {
    var item, stackIndex;
    item = e.detail;
    console.log('onDrillDown', e);
    stackIndex = this.state.parentStack.indexOf(item);
    if (stackIndex !== -1) {
      this.setState({
        parentStack: this.state.parentStack.slice(0, stackIndex + 1),
        items: Ram.Data.getChildren(item.getId())
      });
    } else {
      this.state.parentStack.push(item);
      this.setState({
        parentStack: this.state.parentStack,
        items: Ram.Data.getChildren(item.getId())
      });
    }
    this.refs.items.getDOMNode().addEventListener('addItem', this.onAddItem);
    return this.refs.items.getDOMNode().addEventListener('updateItem', this.onUpdateItem);

    /*
    
    this.refs.items.getDOMNode().addEventListener('itemEditAction', this.onItemEditAction)
    this.refs.items.getDOMNode().addEventListener('itemDeleteAction', this.onItemDeleteAction)
    this.refs.items.getDOMNode().addEventListener('itemMoveRightAction', this.onItemMoveRightAction)
    this.refs.items.getDOMNode().addEventListener('itemMoveLeftAction', this.onItemMoveLeftAction)
     */
  },
  onAddItem: function(e) {
    var parentId;
    parentId = this.state.parentStack[this.state.parentStack.length - 1].getId();
    return console.log('add item', 'to', parentId);
  },
  onAddItem: function(e) {
    var afterItem, itemOrder, newItem, sibling;
    afterItem = e.detail.after;
    if (afterItem) {
      sibling = this.nextSibling(afterItem);
      itemOrder = afterItem.get('order') + 1;
      if (sibling) {
        console.log('sib', afterItem.get('order') + sibling.get('order'));
        itemOrder = (afterItem.get('order') + sibling.get('order')) / 2;
      }
      console.log('onAddItem', afterItem.get('order'), itemOrder);
      newItem = {
        parentId: afterItem.get('parentId'),
        order: itemOrder,
        text: '',
        tags: []
      };
      return Ram.Data.addItem(newItem, function(e) {
        return console.log(e);
      });
    } else {
      itemOrder = 0;
      if (this.state.items.length > 0) {
        itemOrder = (this.state.items[this.state.items.length - 1].get('order') || 0) + 1;
      }
      return Ram.Data.addItem({
        parentId: parentId,
        text: 'New Item',
        created: new Date()
      });
    }
  },
  nextSibling: function(item) {
    var itemIndex, sibling;
    itemIndex = this.state.items.indexOf(item) + 1;
    if (itemIndex < this.state.items.length) {
      sibling = this.state.items[itemIndex];
      if (sibling.get('parentId') === item.get('parentId')) {
        return sibling;
      }
      return null;
    }
    return null;
  },
  onDataItemChanged: function(changedItem) {
    var parentId;
    parentId = this.state.parentStack[this.state.parentStack.length - 1].getId();
    return this.setState({
      parentStack: this.state.parentStack,
      items: Ram.Data.getChildren(parentId)
    });

    /*
    console.log('onDataItemChanged', changedItem)
    
    if changedItem._deleted
      itemToDelete = this.state.items.filter (item) -> item._id == changedItem._id
      indexToDelete = this.state.items.indexOf(itemToDelete[0])
      if indexToDelete > -1
        console.log('deleting', changedItem, itemToDelete, 'at', indexToDelete)
        this.state.items.splice(indexToDelete, 1)
        this.setState({items: this.state.items})
      else
        console.log('onItemChanged: ERROR nothing to delete')
    else
      parent = this.state.items.filter (item) -> item._id == changedItem.parentid
      siblings = this.state.items.filter (item) -> item.parentid == changedItem.parentid
      siblingsAfter = siblings.filter (item) -> item.order >= changedItem.order
    
      siblingsAfter.sort (a, b) -> a.order - b.order
    
      insertIndex = -1
      replace = 0
    
      if siblingsAfter.length > 0
        nextSibling = siblingsAfter[0]
        if nextSibling._id == changedItem._id
          replace = 1
        insertIndex = this.state.items.indexOf(nextSibling)
      else if siblings.length > 0
        insertIndex = this.state.items.indexOf(siblings[siblings.length-1]) + 1
      else if parent.length > 0
        insertIndex = this.state.items.indexOf(parent[0]) + 1
      else
        console.log('onItemChanged: ERROR no idea where to put', changedItem)
        return
    
      this.state.items.splice(insertIndex, replace, changedItem)
      this.state.items.sort (a, b) ->
        if a.parentid > b.parentid
          return 1
        if a.parentid < b.parentid
          return -1
        else a.order - b.order
      if replace == 1
        offsets = null
        offsets = Ram.Utils.getModernOffsets(document.getSelection().baseNode.parentNode) if document.getSelection() && document.getSelection().baseNode
        this.setState({items: this.state.items}, () ->
          Ram.Utils.setModernOffsets(document.getSelection().baseNode.parentNode, offsets) if offsets
        )
      else
        this.setState({items: this.state.items})
        this.refs.items.setEditedItem(changedItem)
    
      onItemEditAction: (e) ->
    console.log('edit', e.detail)
    
      onItemDeleteAction: (e) ->
    console.log('delete', e.detail)
    if confirm('Are you sure to delete "' + e.detail.text + '"')
      Ram.Data.removeItem(e.detail)
    
      onItemMoveRightAction: (e) ->
    console.log('moveRight', e.detail)
    movingItem = e.detail
    siblings = this.state.items.filter (item) -> item.parentid == movingItem.parentid
    siblingsBefore = siblings.filter (item) -> item.order < movingItem.order
    newParent = Ram.FuncUtils.last(siblingsBefore)
    if newParent
      if movingItem.parentid == newParent._id
         *nothing to do
        return
    
      newSiblings = this.state.items.filter (item) -> item.parentid == newParent._id
    
      if newSiblings.length > 0
        movingItem.order = Ram.FuncUtils.last(newSiblings).order + 1
      else
        movingItem.order = 0
    
      movingItem.parentid = newParent._id
      Ram.Data.updateItem(movingItem)
    else
      console.log('No new parent')
    
      onItemMoveLeftAction: (e) ->
    console.log('moveLeft', e.detail)
    movingItem = e.detail
    parent = Ram.FuncUtils.first(this.state.items.filter (item) -> item._id == movingItem.parentid)
    if parent
      newParent = Ram.FuncUtils.first(this.state.items.filter (item) -> item._id == parent.parentid)
      newParentId = 0
      if newParent
        newParentId = newParent._id
      parentSiblings = this.state.items.filter (item) -> item.parentid == newParentId
      parentSiblingsAfter = parentSiblings.filter (item) -> item.order > parent.order
      nextParentSibling = Ram.FuncUtils.first(parentSiblingsAfter)
      if nextParentSibling
        movingItem.order = (parent.order + nextParentSibling.order)/2
      else
        movingItem.order = parent.order + 1
      movingItem.parentid = newParentId
      Ram.Data.updateItem(movingItem)
    else
      console.log('ERROR: onItemMoveLeftAction node is top level')
     */
  },
  onUpdateItem: function(e) {
    if (e.detail) {
      this.state.pendingItemUpdates.push(e.detail);
    }
    if (this.savingTimeoutId) {
      console.log('Postponing');
      clearTimeout(this.savingTimeoutId);
    }
    return this.savingTimeoutId = setTimeout(((function(_this) {
      return function() {
        return _this.saveUpdates();
      };
    })(this)), Ram.Config.LOCAL_UPDATE_TIMEOUT);
  },
  saveUpdates: function() {
    var item, itemId, uniqueUpdates, _i, _len, _ref;
    console.log('Saving..');
    uniqueUpdates = {};
    _ref = this.state.pendingItemUpdates;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      uniqueUpdates[item.get('id')] = item;
    }
    for (itemId in uniqueUpdates) {
      item = uniqueUpdates[itemId];
      Ram.Data.updateItem(item);
    }
    return this.state.pendingItemUpdates = [];
  }
});