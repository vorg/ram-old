angular.module('cashflow.service', []).
  factory 'dataSource', ($rootScope, $q) ->
    DB_NAME = 'cashflow'
    REMOTE_DB = 'http://node.variable.io:5984/cashflow'

    local = null
    changes = null

    DataSourceService =

      init: () ->
        console.log('DataSourceService.init')
        self = this
        Pouch DB_NAME, (err, db) =>
          console.log('DataSourceService.init createdDataBase', DB_NAME)
          if !err
            local = db

            db.changes
              complete: (err, response) =>
                console.log('DataSourceService.init listenting to changes since', response.last_seq)

                $rootScope.$broadcast('dataSourceReady')

                changes = db.changes
                  since: response.last_seq
                  continuous: true
                  include_docs: true
                  onChange: (change) ->
                    console.log('DataSourceService.onChange', change)
                    $rootScope.$apply () ->
                      self.onChange(change)
          else
            console.log(err)

      onChange: (change) ->
        if change.doc
          if change.doc.type == 'item'
            item = this.prepareItem(change.doc)
            $rootScope.$broadcast('itemChanged', item)

          if change.doc._deleted
            $rootScope.$broadcast('itemChanged', { _id:change.doc._id, _deleted:true })

      getAccounts: () ->
        console.log('DataSourceService.getAccounts')

        mapAccounts = """
          function(doc) {
            if (doc.type == 'account') {
              emit(null, doc)
            }
          }
        """

        deferred = $q.defer()
        local.query {'map':mapAccounts}, {}, (error, result) ->
          accounts = result.rows.map (row) -> row.value
          $rootScope.$apply () ->
            deferred.resolve accounts
        return deferred.promise

      prepareItem: (item) ->
        item.date = new Date(item.date)
        item

      getItems: (accountid) ->
        console.log('DataSourceService.getItems')

        mapItems = """
          function(doc) {
            if (doc.type == 'item' && doc.accountid == '#{accountid}') {
              emit(null, doc)
            }
          }
        """

        deferred = $q.defer()
        local.query {'map':mapItems}, {}, (error, result) =>
          items = result.rows.map (row) =>
            this.prepareItem(row.value)
          $rootScope.$apply () ->
            deferred.resolve items
        return deferred.promise

      dateToIso: (date) ->
        year = date.getFullYear()
        month = date.getMonth() + 1
        month = '0' + month if month < 10
        day = date.getDate()
        day = '0' + day if day < 10
        "#{year}-#{month}-#{day}"

      addItem: (accountid, date, operation='-', valueInt, valueFrac, category='', notes='', recurring='', itemToUpdate=null) ->
        console.log('DataSourceService.addItem')
        date = new Date(date)
        date = new Date() if isNaN(date.getTime())
        now = new Date()
        date.setHours(now.getHours())
        date.setMinutes(now.getMinutes())
        date.setSeconds(now.getSeconds())
        valueInt = Number(valueInt)
        valueInt = 0 if isNaN(valueInt)
        valueFrac = Number(valueFrac)
        valueFrac = 0 if isNaN(valueFrac)
        value = valueInt + valueFrac/100

        deferred = $q.defer()

        item =
          type: 'item'
          accountid: accountid
          date: '' + date
          operation: operation
          value: value
          category: category
          notes: notes
          recurring: recurring

        if !itemToUpdate
          local.post item, (err, response) ->
            $rootScope.$apply () ->
              deferred.resolve()
        else
          item._id = itemToUpdate._id
          item._rev = itemToUpdate._rev
          console.log('About to update item', itemToUpdate);
          local.put item, (err, response) ->
            if err
              console.log(err)
            $rootScope.$apply () ->
              deferred.resolve()

        return deferred.promise

      updateItem: (item, accountid, date, operation, valueInt, valueFrac, category, notes, recurring) ->
        accountid ?= item.accountid
        date ?= item.date
        operation ?= item.operation
        valueInt ?= Math.floor(item.value)
        valueFrac ?= 100 * (item.value - Math.floor(item.value))
        category ?= item.category
        notes ?= item.notes
        recurring ?= item.recurring

        return @addItem(accountid, date, operation, valueInt, valueFrac, category, notes, recurring, item)

      removeItem: (item) ->
        console.log('DataSourceService.removeItem', item)
        local.remove item, (err, response) ->
          if err
            console.log('DataSourceService.removeItem error', err)
          else
            console.log('DataSourceService.removeItem log', response)
            local.get item._id, (err, response) ->
              console.log('DataSourceService.removeItem status', err, response)

    DataSourceService.init()

    DataSourceService