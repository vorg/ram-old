cashflow.controller 'ItemsController', ($timeout, $rootScope, $scope, $q, dataSource) ->
  $scope.items = []
  $scope.futureItems = []
  $scope.loading = false
  $scope.accountid = null

  $rootScope.$on 'accountChanged', (event, id) ->
    console.log('itemsController: accountChanged')
    $scope.accountid = id
    $timeout () ->
      $scope.items = []
      $scope.loading = true
      dataSource.getItems(id).then (items) ->
        $scope.loading = false
        $scope.items = items
        $scope.sortItems()
        updateFutureItems()
    , 700 #let other animations finish

  $rootScope.$on 'itemChanged', (event, item) ->
    console.log('ItemsController.on.itemChanged', item)

    found = $scope.items.filter (it) -> it._id == item._id
    if found.length > 0
      idx = $scope.items.indexOf(found[0])
      if item._deleted
        $scope.items.splice(idx, 1)
      else
        item.cfNew = true
        $scope.items.splice(idx, 1, item)
        $scope.sortItems()
    else if item.accountid == $scope.accountid
      item.cfNew = true
      $scope.items.push(item)
      $scope.sortItems()

      updateFutureItems()

  $scope.sortItems = () ->
    $scope.items.sort (a, b) ->
      - (a.date.getTime() - b.date.getTime()) #reverse order

  kIconDelete = 0
  kIconInfo = 1
  kIconEdit = 2
  kIconPay = 3
  icons = ['img/x.png', 'img/info.png', 'img/edit.png', 'img/pay.png']

  actionThreshold = 100
  subActionTreshold = 1.5

  draggedItem = null
  draggedElement = null
  draggedElementBg = null
  touchDragStarted = false
  startX = -1
  deltaX = -1
  startY = -1
  deltaY = -1
  bgIcon = null

  $scope.formatValue = (value) ->
    s = '' + Math.floor(value*100)/100
    s = s + '.00' if (s.indexOf('.') == -1)
    s = s + '0' if (s.indexOf('.') == s.length-2)
    s

  $scope.onTouchDragStart = (e, item) ->
    if e.gesture.srcEvent.touches
      bgIcon = null
      draggedItem = item
      draggedElement = e.currentTarget
      draggedElementBg = e.currentTarget.querySelector('div')
      startX = e.gesture.srcEvent.touches[0].clientX
      startY = e.gesture.srcEvent.touches[0].clientY
      draggedElement.addEventListener('touchmove', onTouchMove)
      draggedElement.addEventListener('touchend', onTouchEnd)

  onTouchMove = (e) ->
    deltaX = e.touches[0].clientX - startX
    deltaY = e.touches[0].clientY - startY
    if Math.abs(deltaX) > 10 and Math.abs(deltaX) > Math.abs(deltaY) then touchDragStarted = true
    if touchDragStarted
      onDragMove(e)
      e.preventDefault()
      return false

  onTouchEnd = (e) ->
    onDragEnd(e)
    touchDragStarted = false
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)

  $scope.onDragStart = (e, item) ->
    bgIcon = null
    draggedItem = item
    draggedElement = e.currentTarget
    draggedElementBg = e.currentTarget.querySelector('div')
    startX = e.pageX
    startY = e.pageY
    window.addEventListener('mousemove', onDragMove)
    window.addEventListener('mouseup', onDragEnd)

  onDragMove = (e) ->
    if !e.touches
      deltaX = e.pageX - startX
      deltaY = e.pageY - startY
    if deltaX < 0 && startX > 0
      draggedElementBg.style.left = deltaX + 'px'
      k = (-deltaX/actionThreshold)
      draggedElement.style.backgroundColor = "rgba(255,0,0,#{k*0.25})"
      if k > subActionTreshold
        draggedElement.style.backgroundColor = "rgba(255,0,0,1)"
      if (bgIcon != kIconDelete)
        bgIcon = kIconDelete
        draggedElement.style.backgroundImage = 'url(' + icons[bgIcon] + ')'
        draggedElement.style.backgroundPosition = 'top right'
    else if deltaX > 0 && startX > 0
      draggedElementBg.style.left = deltaX + 'px'
      k = (deltaX/actionThreshold)
      alpha = 1
      if k < subActionTreshold
        alpha = k * 0.25

      if draggedItem.future
        draggedElement.style.backgroundColor = "rgba(0,200,255,#{alpha})"
        if bgIcon != kIconPay
          bgIcon = kIconPay
          draggedElement.style.backgroundImage = 'url(' + icons[bgIcon] + ')'
          draggedElement.style.backgroundPosition = 'top left'
      else
        draggedElement.style.backgroundColor = "rgba(255,200,0,#{alpha})"
        if bgIcon != kIconEdit
          bgIcon = kIconEdit
          draggedElement.style.backgroundImage = 'url(' + icons[bgIcon] + ')'
          draggedElement.style.backgroundPosition = 'top left'
    if (Math.abs(deltaX) > 30)
      e.preventDefault()
      return false

  onDragEnd = (e) ->
    draggedElementBg.style.left = 0 + 'px'
    if deltaX < -actionThreshold * subActionTreshold
      if draggedItem.future
        draggedItem.parentItem.recurring = '';
        dataSource.updateItem(draggedItem.parentItem)
        $rootScope.$apply () ->
          updateFutureItems()
      else
        dataSource.removeItem(draggedItem)
    else if deltaX > actionThreshold * subActionTreshold
      if draggedItem.future
        $rootScope.$apply () ->
          $rootScope.$broadcast('payItem', draggedItem)
      else
        $rootScope.$apply () ->
          $rootScope.$broadcast('editItem', draggedItem)
    startX = 0
    startY = 0
    draggedItem = null
    if e
      window.removeEventListener('mousemove', onDragMove)
      window.removeEventListener('mouseup', onDragEnd)

  updateFutureItems = () ->
    console.log('updateFutureItems')
    futureItems = []
    $scope.items.forEach (item) ->
      span = (new Date(Date.now() - item.date.getTime()))
      if item.recurring == 'm' and span.getYear() == 70 and span.getUTCMonth() < 4# < 60 days
        nextDate = new Date(item.date.getTime())
        nextDate.setMonth(item.date.getMonth() + 1) #TODO: support year flipping in December
        futureItems.push
          parentItem: item
          future: true
          accountid: item.accountid
          date: nextDate,
          operation: item.operation
          value: item.value
          category: item.category
          notes: item.notes
          recurring: item.recurring
    $scope.futureItems = futureItems

