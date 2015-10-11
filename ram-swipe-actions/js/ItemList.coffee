Ram.ItemList = React.createClass
  getInitialState: () ->
    { editedItemId : null }
  setEditedItem: (item) ->
    this.setState({ editedItemId : item.getId() })
    setTimeout () =>
      editableNode = this.getDOMNode().querySelector('.edited span[contenteditable]');
      if editableNode
        editableNode.focus()
        Ram.Utils.setEndOfContenteditable(editableNode)
    , 100
  onItemClick: (item, e, measurement) ->
    minTextWidth = 50
    textWidth = Math.max(minTextWidth, measurement.getDOMNode().clientWidth);
    textHit = e.clientX < textWidth + 50;
    console.log('onItemClick', item, e.clientX, textWidth, textHit)
    if item.get('editable') == false
      if item.get('text') == '+'
        this.getDOMNode().dispatchEvent(new CustomEvent('addItem', { detail: { after : null }, changed: true, bubbles: true }));
      return
    if e.target.className == 'text' && textHit
      this.setEditedItem(item)
    else if e.target.className == 'detail' || !textHit
      this.getDOMNode().dispatchEvent(new CustomEvent('drillDown', { detail: item, changed: true, bubbles: true }));
  onItemKeyDown: (item, e) ->
    item.tmpText = e.target.textContent
    e.target.focus()
    if e.keyCode == 13
      e.preventDefault()
      this.setState({ editedItemId : null })
      this.getDOMNode().blur();
      this.addNewItem(item)
      return false
  onItemKeyUp: (item, e) ->
    if item.get('text') != e.target.textContent
      item.tmpText = e.target.textContent
      this.getDOMNode().dispatchEvent(new CustomEvent('updateItem', { detail: item, changed: true, bubbles: true }));
    else
      this.getDOMNode().dispatchEvent(new CustomEvent('updateItem', { detail: null, changed: false, bubbles: true }));
  onItemInput: (item, e) ->
    #return
    #html = e.target.innerHTML
    #if html.indexOf('<div>') != -1
    #  html = html.replace('<div>', '').replace('</div>', '')
    #  e.target.innerHTML = html
    #  this.addNewItem(item)
  onItemPaste: (item, e) ->
    text = e.clipboardData.getData('text/plain')
    node = e.target
    setTimeout (() -> node.innerHTML = node.textContent), 10
  addNewItem: (afterItem) ->
    this.getDOMNode().dispatchEvent(new CustomEvent('addItem', { detail: { after : afterItem } , bubbles: true }));
  buildTreeOrderedList: (items) ->
    tree = []
    parentMap = {}

    items.forEach (item) ->
      itemInfo = { item: item, children: [], level: 0 }
      parentMap[item.getId()] = itemInfo

    items.forEach (item) ->
      parentInfo = parentMap[item.parentid]
      itemInfo = parentMap[item.getId()]
      if parentInfo
        parentInfo.children.push(itemInfo)
      else
        tree.push(itemInfo)

    orderedList = []

    visitChildren = (children, level) ->
      children.sort (a, b) -> a.item.order - b.item.order
      children.forEach (child) ->
        child.level = level
        orderedList.push(child)
        visitChildren(child.children, level + 1)

    visitChildren(tree, 0)

    return orderedList
  render: () ->
    makeItem = (item, itemIndex) =>
      Ram.Item({
        key: item.getId(),
        onClick: this.onItemClick.bind(this, item),
        onKeyDown: this.onItemKeyDown.bind(this, item),
        onKeyUp: this.onItemKeyUp.bind(this, item),
        onInput: this.onItemInput.bind(this, item),
        onPaste: this.onItemPaste.bind(this, item),
        item: item,
        edited : (item.getId() == this.state.editedItemId)
        carretPos : this.state.carretPos
        level: item.level
      })

    #orderedList = @buildTreeOrderedList(this.props.items)
    orderedList = this.props.items
    itemElements = orderedList.map(makeItem)

    if this.props.addEnabled then itemElements.push(makeItem(Ram.makeFakeDropboxItem(-1, -1, '+', false ) ))
    React.DOM.ul({ className : 'list' },
      itemElements
    )