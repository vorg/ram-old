remoteStorage.defineModule('money', function(privateClient, publicClient) {
  // Define a common data type using JSON Schema
  privateClient.declareType('item', {
    'description': 'an item',
    'type': 'object',
    'properties': {
      'id': {
        'type': 'string',
        'format': 'id'
      },
      'date': {
        'type': 'date'
      },
      'type': {
        'type': 'string'
      },
      'value': {
        'type': 'number'
      },
      'category': {
        'type': 'string'
      },
      'notes': {
        'type': 'string'
      },
      'recurring': {
        'type': 'string'
      }
    }
  });

  privateClient.declareType('account', 'account', {
    'description': 'an account',
    'type': 'object',
    'properties': {
      'id': {
        'type': 'string',
        'format': 'id'
      },
      'name': {
        'type': 'string'
      },
      'currency': {
        'type': 'string'
      }
    }
  });

  return {
    exports: {
      client: privateClient,
      init: function() {
        publicClient.release('');
      },
      addAccount: function(accountid, name, currency) {
        return privateClient.storeObject('account', 'accounts/' + accountid, {
          id : accountid,
          name: name,
          currency: currency
        });
      },
      // Add functions for retrieving and manipulating data using
      // methods provided by BaseClient
      addItem: function (accountid, id, date, type, value, category, notes, recurring) {
        return privateClient.storeObject('item', 'items/' + accountid + '/' + id, {
          id: id,
          accountid: accountid,
          date: date,
          type: type,
          value: value,
          category: category,
          notes: notes,
          recurring: recurring
        });
      },
      updateItem: function(accountid, id, item) {
        return privateClient.storeObject('item', 'items/' + accountid + '/' + id, item);
      },
      removeItem: function(accountid, id) {
        return privateClient.remove('items/' + accountid + '/' + id);
      },
      getAccounts: function() {
        return privateClient.getAll('accounts/');
      },
      getItems: function(accountid) {
        return privateClient.getAll('items/' + accountid + '/');
      },
      getItem: function(accountid, id) {
        return privateClient.getObject('items/' + accountid + '/' + id);
      }
    }
  };
});
