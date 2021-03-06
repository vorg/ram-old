Ram.App = React.createClass
  getInitialState: () ->
    parentStack: [{ text: 'RAM', _id: 0 }],
    items: [],
    pendingItemUpdates: []

  componentDidMount: () ->
    @savingTimeoutId = -1
    Ram.Data.init (db) =>
      db.addEventListener('itemChanged', (e) => @onDataItemChanged(e) )
      Ram.Data.loadItems (items) =>
        if items.length == 0
          Ram.Data.addItem({text: 'Empty', order: 0, tags: [], parentid: 0})
        else
          this.setState({items:Ram.Data.getChildren(0)})
          this.refs.items.getDOMNode().addEventListener('drillDown', this.onDrillDown)
          this.refs.parentStack.getDOMNode().addEventListener('drillDown', this.onDrillDown)

  render: () ->
    React.DOM.div({ className: 'app' }
      React.DOM.div({ id: 'parentStack' }
        Ram.ItemList({ ref: 'parentStack', items : this.state.parentStack })
      ),
      React.DOM.div({ id: 'items' }
        Ram.ItemList({ ref: 'items', items : this.state.items })
      )
    )

  onDrillDown: (e) ->
    item = e.detail
    stackIndex = @state.parentStack.indexOf(item)
    console.log(stackIndex)
    if stackIndex != -1
      @setState({ parentStack: @state.parentStack.slice(0, stackIndex + 1), items: Ram.Data.getChildren(item._id) } )
    else
      @state.parentStack.push(item)
      @setState({ parentStack: @state.parentStack, items: Ram.Data.getChildren(item._id) } )
    ###
    this.refs.items.getDOMNode().addEventListener('addItem', this.onAddItem)
    this.refs.items.getDOMNode().addEventListener('updateItem', this.onUpdateItem)
    this.refs.items.getDOMNode().addEventListener('itemEditAction', this.onItemEditAction)
    this.refs.items.getDOMNode().addEventListener('itemDeleteAction', this.onItemDeleteAction)
    this.refs.items.getDOMNode().addEventListener('itemMoveRightAction', this.onItemMoveRightAction)
    this.refs.items.getDOMNode().addEventListener('itemMoveLeftAction', this.onItemMoveLeftAction)

  nextSibling: (item) ->
    itemIndex = this.state.items.indexOf(item) + 1
    if itemIndex < this.state.items.length
      sibling = this.state.items[itemIndex]
      if sibling.parentid == item.parentid
        return sibling
      return null
    return null

  onDataItemChanged: (changedItem) ->
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
        #nothing to do
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

  onAddItem: (e) ->
    afterItem = e.detail.after
    if afterItem
      sibling = @nextSibling(afterItem)
      itemOrder = afterItem.order + 1
      if sibling
        console.log('sib', afterItem.order + sibling.order)
        itemOrder = (afterItem.order + sibling.order)/2
      console.log('onAddItem', afterItem.order, itemOrder)

      newItem = {
        parentid: afterItem.parentid
        order: itemOrder
        text: ''
        tags: []
      }
      Ram.Data.addItem(newItem, (e) -> console.log(e))

  onUpdateItem: (e) ->
    if e.detail
      this.state.pendingItemUpdates.push(e.detail)
    if @savingTimeoutId
      console.log('Postponing')
      clearTimeout(@savingTimeoutId)

    @savingTimeoutId = setTimeout (() => @saveUpdates()), Ram.Config.LOCAL_UPDATE_TIMEOUT

  saveUpdates: () ->
    console.log('Saving..')
    uniqueUpdates = {}
    for item in this.state.pendingItemUpdates
      uniqueUpdates[item._id] = item
    for itemId, item of uniqueUpdates
      Ram.Data.updateItem(item)

    this.state.pendingItemUpdates = []

  onItemsChange: (e) ->
    console.log()
  ###