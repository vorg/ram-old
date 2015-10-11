AccountsController = ($rootScope, $scope, $q, dataSource) ->
  $scope.accounts = [{id:'tes', name:'test', value:0}]
  $scope.collapsed = true
  $scope.selectedAccountId = localStorage['cashflow_selectedAccountId']

  $scope.selectAccount = (id) ->
    $scope.collapsed = true
    $scope.refreshTotal()
    if $scope.selectedAccountId != id
      $scope.selectedAccountId = id
      localStorage['cashflow_selectedAccountId'] = $scope.selectedAccountId
      $rootScope.$broadcast('accountChanged', id)
      $scope.refreshTotal()

  $scope.onAccountClick = (id) ->
    if $scope.collapsed
      $scope.collapsed = false
    else
      $scope.selectAccount(id)

  $scope.refreshAccounts = () ->
    dataSource.getAccounts().then (accounts) ->
      $scope.accounts = accounts

      foundSelected = false
      for account in accounts
        if account._id == $scope.selectedAccountId
          $rootScope.$broadcast('accountChanged', $scope.selectedAccountId)
          foundSelected = true

      if !foundSelected and accounts.length > 0
        $scope.selectedAccountId = accounts[accounts.length-1]._id
        localStorage['cashflow_selectedAccountId'] = $scope.selectedAccountId
        $rootScope.$broadcast('accountChanged', $scope.selectedAccountId)

      $scope.refreshTotal()

  $rootScope.$on 'accountChanged', (event, id) ->
    $scope.accounts.forEach (account) ->
      account.selected = (account._id == id)

  $rootScope.$on 'dataSourceReady', (event, id) ->
    $scope.refreshAccounts()

  $scope.refreshTotal = () ->
    dataSource.getItems($scope.selectedAccountId).then (items) ->
      items.sort (a, b) ->
        (a.date.getTime() - b.date.getTime())
      sum = 0
      items.forEach (item) ->
        sum = item.value if item.operation == '='
        sum -= item.value if item.operation == '-'
        sum += item.value if item.operation == '+'
        sum -= item.value if item.operation == '<'
        sum += item.value if item.operation == '>'
      sum = '' + Math.floor(sum*100)/100
      sum = sum + '.00' if (sum.indexOf('.') == -1)
      sum = sum + '0' if (sum.indexOf('.') == sum.length-2)
      for account in $scope.accounts
        if account._id == $scope.selectedAccountId
          account.value = sum + ' / ' + items.length


  $rootScope.$on 'itemChanged', (event, item) ->
    $scope.refreshTotal()