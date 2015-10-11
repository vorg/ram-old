cashflow.controller 'MenuController', ($rootScope, $scope, $q, dataSource) ->
  $scope.settingsVisible = false
  $scope.syncState = 'sync'
  $scope.lastUpdated = if localStorage['cashflow_lastUpdated'] then new Date(localStorage['cashflow_lastUpdated']) else 'never'

  $scope.toggleSettings = () ->
    $scope.settingsVisible = !$scope.settingsVisible

  $scope.toggleMonthlySummary = () ->
    $rootScope.$broadcast('toggleMonthlySummary')

  $scope.sync = () ->
    $scope.syncOut(true)
    $scope.syncIn(true)

  $scope.syncOut = (continuous) ->
    $scope.syncState = 'syncing... out'
    console.log('MenuController: replicating out')
    Pouch.replicate 'cashflow', 'http://node.variable.io:5984/cashflow',
      continuous: continuous
      onChange: (change) ->
        console.log('MenuController: change out', change)
      complete: (change) ->
        console.log('MenuController: change out complete', change)
      ,(err, changes) ->
        console.log('MenuController: replication out finished' , err, changes)
        if !continuous
          $scope.syncIn(false)

  $scope.syncIn = (continuous) ->
    if !continuous
      $rootScope.$apply () ->
        $scope.syncState = 'syncing... in'
    else
      $scope.syncState = 'syncing... in'
    console.log('MenuController: replicating in')
    Pouch.replicate 'http://node.variable.io:5984/cashflow', 'cashflow',
      continuous: continuous
      onChange: (change) ->
        console.log('MenuController: change in', change)
      complete: (change) ->
        console.log('MenuController: change in complete', change)
      ,(err, changes) ->
        console.log('MenuController: replication in finished', err, changes)
        if !continuous
          $rootScope.$apply () ->
            $scope.syncState = 'sync'
            localStorage['cashflow_lastUpdated'] = '' + new Date()
            $scope.lastUpdated = new Date(localStorage['cashflow_lastUpdated'])