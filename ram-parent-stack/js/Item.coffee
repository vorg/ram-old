addItemEventHandlers = (itemElem, item) ->
  backgroundElem = itemElem
  foregroundElem = itemElem.querySelector('div')
  startX = 0
  startY = 0
  deltaX = 0
  deltaY = 0
  bgIcon = null
  touchDragging = null
  activeAction = null

  onSlideStart = (x, y) ->
    startX = x
    startY = y
    bgIcon = null
    foregroundElem.className += " dragged"
    return
  onSlide = (x, y) ->
    deltaX = x - startX
    deltaY = y - startY
    if deltaX > 0 and startX > 0 and item.actions.left and item.actions.left.primary
      foregroundElem.style.left = deltaX + "px"
      k = deltaX / itemElem.clientWidth
      alpha = 1
      if k < Ram.Config.ACTION_THRESHOLD
        alpha = k / Ram.Config.ACTION_THRESHOLD * 0.6
        activeAction = null
      else activeAction = item.actions.left.primary  if k > Ram.Config.ACTION_THRESHOLD
      color = item.actions.left.primary.color
      icon = item.actions.left.primary.icon
      if k > Ram.Config.SUB_ACTION_THRESHOLD and item.actions.left.secondary
        color = item.actions.left.secondary.color
        icon = item.actions.left.secondary.icon
        activeAction = item.actions.left.secondary
      backgroundElem.style.backgroundColor = "rgba(" + color.join(",") + "," + alpha + ")"
      unless bgIcon is icon
        bgIcon = icon
        backgroundElem.style.backgroundImage = "url(" + icon + ")"
        backgroundElem.style.backgroundPosition = "center left"
    else if deltaX < 0 and startX > 0 and item.actions.right and item.actions.right.primary
      foregroundElem.style.left = deltaX + "px"
      k = -deltaX / itemElem.clientWidth
      alpha = 1
      if k < Ram.Config.ACTION_THRESHOLD
        alpha = k / Ram.Config.ACTION_THRESHOLD * 0.6
        activeAction = null
      else activeAction = item.actions.right.primary  if k > Ram.Config.ACTION_THRESHOLD
      color = item.actions.right.primary.color
      icon = item.actions.right.primary.icon
      if k > Ram.Config.SUB_ACTION_THRESHOLD and item.actions.right.secondary
        color = item.actions.right.secondary.color
        icon = item.actions.right.secondary.icon
        activeAction = item.actions.right.secondary
      backgroundElem.style.backgroundColor = "rgba(" + color.join(",") + "," + alpha + ")"
      unless bgIcon is icon
        bgIcon = icon
        backgroundElem.style.backgroundImage = "url(" + icon + ")"
        backgroundElem.style.backgroundPosition = "center right"
    return
  onSlideScroll = (x, y) ->
    foregroundElem.style.left = 0 + "px"
    return
  onSlideEnd = (x, y) ->
    foregroundElem.className = foregroundElem.className.replace("dragged", "")
    foregroundElem.style.left = "0px"
    activeAction.callback()  if activeAction and activeAction.callback
    return
  onDragStart = (e) ->
    return  if e.touches #ignore duplicated mouse events on touch device
    onSlideStart e.pageX, e.pageY
    window.addEventListener "mousemove", onDragMove, false
    window.addEventListener "mouseup", onDragEnd, false
    return
  onDragMove = (e) ->
    onSlide e.pageX, e.pageY
    return
  onDragEnd = (e) ->
    e.currentTarget.removeEventListener "mousemove", onDragMove
    e.currentTarget.removeEventListener "mouseup", onDragEnd
    onSlideEnd e.pageX, e.pageY
    return
  onTouchStart = (e) ->
    touchDragging = false
    onSlideStart e.touches[0].clientX, e.touches[0].clientY
    e.currentTarget.addEventListener "touchmove", onTouchMove, false
    e.currentTarget.addEventListener "touchend", onTouchEnd, false
    return
  onTouchMove = (e) ->
    onSlide e.touches[0].clientX, e.touches[0].clientY
    if touchDragging or Math.abs(deltaX) >= Math.abs(deltaY)
      touchDragging = true
      e.preventDefault()
      return false
    else console.log "nothing"  if not touchDragging and Math.abs(deltaX) < 10 and Math.abs(deltaY) > 10
    onSlideScroll()  unless touchDragging
    return
  onTouchEnd = (e) ->
    e.currentTarget.removeEventListener "touchmove", onTouchMove
    e.currentTarget.removeEventListener "touchend", onTouchEnd
    onSlideEnd 0, 0
    return

  foregroundElem.addEventListener('mousedown', onDragStart, false);
  foregroundElem.addEventListener('touchstart', onTouchStart, false);

Ram.Item = React.createClass
  getInitialState: () -> {}
  componentDidMount: () ->
    @prepareItemComonent()
  prepareItemComonent: () ->
    addItemEventHandlers this.getDOMNode(),
      actions:
        left:
          primary:
            icon: "img/move_right.png"
            color: [0, 200, 250]
            callback: =>
              this.getDOMNode().dispatchEvent(new CustomEvent('itemMoveRightAction', { detail: this.props.item, bubbles: true }));
              return
          secondary:
            icon: "img/edit.png"
            color: [250, 200, 0]
            callback: =>
              this.getDOMNode().dispatchEvent(new CustomEvent('itemEditAction', { detail: this.props.item, bubbles: true }));
              return
        right:
          primary:
            icon: "img/move_left.png"
            color: [0, 200, 250]
            callback: =>
              this.getDOMNode().dispatchEvent(new CustomEvent('itemMoveLeftAction', { detail: this.props.item, bubbles: true }));
              return
          secondary:
            icon: "img/x.png"
            color: [200, 0, 10]
            callback: =>
              this.getDOMNode().dispatchEvent(new CustomEvent('itemDeleteAction', { detail: this.props.item, bubbles: true }));
              return
  onClick: (e) ->
    #console.log(item, e)
    this.props.onClick(e, this.refs.measurement)
  render: () ->
    editedClass = if this.props.edited then 'edited' else ''
    #padding = if this.props.level then 25 + 5 * this.props.level else 25
    #fontSize = 105 - this.props.level * 10
    #backgroundColor = 'rgba(255, 0, 0, ' + (40 - this.props.level*5)/100 +')'
    padding = 15
    React.DOM.li({ className: 'item', 'data-id': this.props.item._id },
      React.DOM.div({ ref: 'div', onClick: this.onClick, className: editedClass, style: { overflow: 'hidden', backgroundPosition: ( 0 ) + 'px 0px' } },
        React.DOM.span({
          ref: 'measurement'
          style: {
            display: 'inline-block'
            position: 'absolute'
            xmaxHeight: '1px'
            xfontSize: 1
            background: 'red'
            xtop: '50%'
            left: '0px'
            top: '100%'
          }
        }, this.props.item.text || ''),
        React.DOM.span({
            ref: 'span'
            className: 'text'
            contentEditable : this.props.edited
            onKeyDown: this.props.onKeyDown
            onKeyUp: this.props.onKeyUp
            onInput: this.props.onInput
            onPaste: this.props.onPaste
            style: {
              paddingLeft: padding + 'px',
              backgroundPosition: this.props.level * 5 + 'px 0px'
            }
          },
          this.props.item.text || ''
        ),
        React.DOM.span({
          className: 'detail'
        }, '>');
      )
    )