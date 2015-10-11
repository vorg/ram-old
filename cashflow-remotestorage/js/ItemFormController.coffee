cashflow.controller 'ItemFormController', ($timeout, $rootScope, $scope, $q, dataSource) ->
  $scope.mode = ''
  $scope.updating = ''

  $rootScope.$on 'accountChanged', (event, id) ->
    $scope.accountid = id

  $scope.onAddButtonClick = () ->
    if $scope.mode == ''
      $scope.date = dataSource.dateToIso(new Date())
      $scope.operation = '-'
      $scope.value = ''
      $scope.value2 = ''
      $scope.category = ''
      $scope.notes = ''
      $scope.recurring = ''
      $scope.mode = 'add'
    else if $scope.mode == 'add'
      $scope.updating = 'adding'
      $scope.mode = ''
      dataSource.addItem($scope.accountid, $scope.date, $scope.operation, $scope.value, $scope.value2, $scope.category, $scope.notes, $scope.recurring).then () ->
        $scope.updating = ''
    else if $scope.mode == 'pay'
      $scope.updating = 'adding'
      $scope.mode = ''
      $scope.editedItem.parentItem.recurring = ''
      dataSource.updateItem($scope.editedItem.parentItem)
      dataSource.addItem($scope.accountid, $scope.date, $scope.operation, $scope.value, $scope.value2, $scope.category, $scope.notes, $scope.recurring).then () ->
        $scope.updating = ''
    else if $scope.mode == 'edit'
      $scope.updating = 'editing'
      $scope.mode = ''
      dataSource.updateItem($scope.editedItem, $scope.accountid, $scope.date, $scope.operation, $scope.value, $scope.value2, $scope.category, $scope.notes, $scope.recurring).then () ->
        $scope.updating = ''

  $rootScope.$on 'editItem', (event, item) ->
    if $scope.mode == ''
      $scope.editedItem = item
      $scope.accountid = item.accountid
      $scope.date = dataSource.dateToIso(item.date)
      $scope.operation = item.operation
      $scope.value = Math.floor(item.value)
      $scope.value2 = Math.floor((item.value - Math.floor(item.value)) * 100)
      $scope.category = item.category
      $scope.notes = item.notes
      $scope.recurring = item.recurring
      $scope.mode = 'edit'

  $rootScope.$on 'payItem', (event, item) ->
    if $scope.mode == ''
      $scope.editedItem = item
      $scope.accountid = item.accountid
      $scope.date = dataSource.dateToIso(item.date)
      $scope.operation = item.operation
      $scope.value = Math.floor(item.value)
      $scope.value2 = Math.floor((item.value - Math.floor(item.value)) * 100)
      $scope.category = item.category
      $scope.notes = item.notes
      $scope.recurring = item.recurring
      $scope.mode = 'pay'

  $scope.onCancelButtonClick = () ->
    if $scope.mode != ''
      $scope.mode = ''