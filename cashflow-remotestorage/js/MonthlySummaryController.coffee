cashflow.controller 'MonthlySummaryController', ($timeout, $rootScope, $scope, $q, dataSource) ->
  $scope.categories = []
  $scope.active = false
  $scope.month = null
  $scope.year = null
  $scope.date = new Date()
  $scope.accountid = null

  RNG = (seed) ->
    @m = 0x80000000;
    @a = 1103515245;
    @c = 12345;
    @state = seed ? seed : Math.floor(Math.random() * (@m-1));

  RNG::nextInt = () ->
    @state = (@a * @state + @c) % @m;

  RNG::nextFloat = () ->
    @nextInt() / (@m - 1)

  byValue = (a, b) -> a.value - b.value

  componentToHex = (c) ->
    hex = c.toString(16)
    if hex.length == 1 then "0" + hex else hex

  rgbToHex = (r, g, b) ->
    "#" + componentToHex(Math.floor(r)) + componentToHex(Math.floor(g)) + componentToHex(Math.floor(b))

  $scope.formatValue = (value) ->
    s = '' + Math.floor(value*100)/100
    s = s + '.00' if (s.indexOf('.') == -1)
    s = s + '0' if (s.indexOf('.') == s.length-2)
    s

  randomColor = (f) ->
    if !f then f = Math.random()
    c = chroma.lch(70, 50, 360 * f)
    color =
      bright: rgbToHex(c.rgb()[0], c.rgb()[1], c.rgb()[2])
      dark: rgbToHex(c.darken().rgb()[0], c.darken().rgb()[1], c.darken().rgb()[2])
    color

  hash = (s) ->
    sum = 0
    for i in [0..s.length-1]
      sum += s.charCodeAt(0) * i * s.charCodeAt(i)
    rnd = new RNG(sum + 3)
    rnd.nextFloat()
    rnd.nextFloat()
    rnd.nextFloat()
    return rnd.nextFloat()

  categoryColors =
    'total': '#333333'
    'food': '#F11238'
    'groceries': '#66AD33'
    'home': '#FD8330'
    'transport': '#F0A434'
    'bills': '#5B657C'
    'amusement': '#4D28F1'
    'gift': '#7111E1'
    'personal': '#326BC8'
    'clothes': '#BB300E'
    'travel': '#33B3F1'

  getCategoryColor = (cat) ->
    hex = categoryColors[cat]
    hex = "#999" if !hex
    c = chroma.hex(hex)
    color =
      bright: c.hex()
      dark: c.darken().hex()

  $rootScope.$on 'toggleMonthlySummary', (event, id) ->
    $scope.active = !$scope.active

  $scope.prev = () ->
    if $scope.month > 0
      $scope.month--
    else
      $scope.month = 11
      $scope.year--
    $scope.updateCategories()

  $scope.next = () ->
    if $scope.month < 11
      $scope.month++
    else
      $scope.month = 0
      $scope.year++
    $scope.updateCategories()

  $scope.updateCategories = () ->
    items = $scope.items
    return if items.length == 0

    if !$scope.year
      $scope.month = items[0].date.getMonth()
      $scope.year = items[0].date.getFullYear()

    color = getCategoryColor('total')
    totalCat = { name:'total',  subCategories: [], subCategoriesMap: {}, value: 0, collapsed: true, color: color.bright, subColor: color.dark }
    categoriesMap = {'total':'totalCat'}
    categories = [totalCat]

    items.forEach (item) ->
      itemCategories = item.category.split(' ')
      if item.category == 'food groceries'
        itemCategories = ['groceries', 'groceries']
      mainCategory = itemCategories[0]
      subCategory = itemCategories[1]
      return if item.date.getMonth() != $scope.month
      return if item.date.getFullYear() != $scope.year
      $scope.date = item.date
      if mainCategory
        cat = categoriesMap[mainCategory]
        if !cat
          color = getCategoryColor(mainCategory)
          cat = { name:mainCategory,  subCategories: [], subCategoriesMap: {}, value: 0, collapsed: true, color: color.bright, subColor: color.dark }
          categoriesMap[mainCategory] = cat
          categories.push(cat)
        cat.value -= item.value if item.operation == '-'
        cat.value += item.value if item.operation == '+'
        totalCat.value -= item.value if item.operation == '-'
        if !subCategory
          subCategory = 'other'
        subCat = cat.subCategoriesMap[subCategory]
        if !subCat
          subCat = { name: subCategory, value: 0, collapsed: true, items: [ ] }
          cat.subCategoriesMap[subCategory] = subCat
          cat.subCategories.push(subCat)
        subCat.items.unshift(item)
        subCat.value -= item.value if item.operation == '-'
        subCat.value += item.value if item.operation == '+'

    $scope.date.setMonth($scope.month)
    categories.sort byValue
    categories.forEach (cat) -> cat.subCategories.sort byValue

    $scope.categories = categories

  $rootScope.$on 'accountChanged', (event, id) ->
    $scope.month = null
    $scope.year = null
    $scope.accountid = id
    $timeout () ->
      $scope.items = []
      $scope.categories = []
      dataSource.getItems(id).then (items) ->
        $scope.items = items
        $scope.updateCategories()
    , 700 #let other animations finish

  $scope.fixPosition = () ->
    console.log()


  kIconDelete = 0
  kIconInfo = 1
  kIconEdit = 2
  icons = ['img/x.png', 'img/info.png', 'img/edit.png']

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
      draggedElement.style.backgroundColor = "rgba(0,200,0,#{k})"
      if k > subActionTreshold
        draggedElement.style.backgroundColor = "rgba(255,200,0,1)"
        if (bgIcon != kIconEdit)
          bgIcon = kIconEdit
          draggedElement.style.backgroundImage = 'url(' + icons[bgIcon] + ')'
          draggedElement.style.backgroundPosition = 'top left'
      else if bgIcon != kIconInfo
        bgIcon = kIconInfo
        draggedElement.style.backgroundImage = 'url(' + icons[bgIcon] + ')'
        draggedElement.style.backgroundPosition = 'top left'
    if (Math.abs(deltaX) > 30)
      e.preventDefault()
      return false

  onDragEnd = (e) ->
    draggedElementBg.style.left = 0 + 'px'
    if deltaX < -actionThreshold * subActionTreshold
      dataSource.removeItem(draggedItem)
    else if deltaX > actionThreshold * subActionTreshold
      $rootScope.$apply () ->
        $rootScope.$broadcast('editItem', draggedItem)
    startX = 0
    startY = 0
    draggedItem = null
    if e
      window.removeEventListener('mousemove', onDragMove)
      window.removeEventListener('mouseup', onDragEnd)