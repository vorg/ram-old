var DB_NAME = 'cashflow';
var REMOTE_SERVER = 'http://node.variable.io:5984';
//var REMOTE_SERVER = 'http://localhost:5984';
var REMOTE_DB = REMOTE_SERVER + '/' + DB_NAME;
var AUTORELOAD = true;

var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

console.time('App.boot');
console.time('App.untilDBStartsInit');

var fn = {
  groupBy: function(list, propertyName) {
    var map = {};
    list.forEach(function(item) {
      var propertyValue = item[propertyName];
      if (!map[propertyValue]) map[propertyValue] = [];
      map[propertyValue].push(item);
    })
    return map;
  },
  keys: function(obj) {
    var keys = [];
    for(var i in obj) {
      keys.push(i);
    }
    return keys;
  }
}

var settingsView = new Ractive({
  el: '#settings',
  template: '#settingsTemplate',
  data: { loggedIn : false, needsRefresh: false, online: false, name: '', password: '', server: REMOTE_SERVER, next: document.location.href }
});

settingsView.on({
  showLoginForm: function() {
    settingsView.set('formClass', 'show');
    settingsView.nodes.loginFormName.focus();
  },
  logout: function() {
    settingsCtrl.logout();
  },
  submit: function(e) {
    e.original.preventDefault();
    settingsCtrl.login();
    return false;
  }
})

var settingsCtrl = EventDispatcher.extend({
  checkLoginStatus: function() {
    settingsView.set('online', navigator.onLine);
    console.time('Settings.checkLoginStatus');
    getJson(REMOTE_SERVER + '/_session', function(response) {
      console.log('Settings.checkLoginStatus', JSON.stringify(response));
      //if (response && response.ok && response.userCtx && response.userCtx.name && response.userCtx.roles.length > 0) {
      if (!settingsView.get('online') || (response && response.ok)) {
        settingsView.set('loggedIn', true);
      }
      else {
        settingsView.set('loggedIn', false);
        this.showLoginForm();
      }
      console.timeEnd('Settings.checkLoginStatus');
    }.bind(this));
  },
  checkDatabaseStatus: function() {
    console.log('Settings.checkDatabaseStatus');
    console.timeEnd('App.untilDBStartsInit');
    DataSource.init(this.onDataSourceInit);
    //getJson(REMOTE_DB, function(response) {
    //  console.log('Settings.checkDatabaseStatus', JSON.stringify(response));
    //}.bind(this));
  },
  needsRefresh: function() {
    settingsView.set('needsRefresh', true);
    prepareRefreshElement(document.getElementById('refreshItem'));
    if (AUTORELOAD) window.location.reload();
  },
  login: function() {
    console.log('Settings.login');
    var data = {
      name: settingsView.get('name'),
      password: settingsView.get('password')
    };
    postToUrl(REMOTE_SERVER + '/_session', data, function(response){
      console.log('Settings.login', response, response.ok);
      if (response && response.ok) {
        settingsView.set('loggedIn', true);
        this.hideLoginForm();
      }
    }.bind(this));
  },
  logout: function() {
    console.log('Settings.logout');
    postDeleteToUrl(REMOTE_SERVER + '/_session', {}, function(response) {
      console.log('Settings.logout', JSON.stringify(response));
      settingsView.set('loggedIn', false);
    });
  },
  showLoginForm: function() {
    console.log('Settings.showLoginForm');
  },
  hideLoginForm: function() {
    console.log('Settings.hideLoginForm');
    settingsView.set('formClass', 'hide');
  },
  onDataSourceInit: function() {
    console.log('Settings.onDataSourceInit');
    accountsController.onDataSourceInit();
  },
  sync: function() {
    var syncItem = document.querySelector('#syncItem div');
    syncItem.className = 'progress noTransition';
    syncItem.style.backgroundPosition = '0%';
    setTimeout(function() {
      syncItem.className = 'progress';
      syncItem.style.backgroundPosition = '-5%';
    }, 100);
    DataSource.sync(
      function(e) {
        syncItem.style.backgroundPosition = -(5 + e.progress*195) + '%';
      },
      function(e) {
        setTimeout(function() {
          syncItem.style.backgroundPosition = '-200%';
        }, 1000);
      }
    );
  }
});

var addFormView = new Ractive({
  el: '#addForm',
  template: '#addFormTemplate',
  data: {
    open: false,
    operation: '-',
    value: '00.00',
    category: 'category',
    notes: 'notes',
    recurring: false,
    date: new Date(),
    prevDates: [],
    formatDate: function(d) {
      return d.getDate() + ' ' + monthNames[d.getMonth()];
    },
    formatDateDay: function(d) {
      return d.getDate();
    },
    formatDateWeekDay: function(d) {
      return dayNames[d.getDay()];
    },
    formatDateMonth: function(d) {
      return monthNames[d.getMonth()];
    },
    isCurrent: function(d) {
      return (d.clearTime().compareTo(this.get('date').clearTime()) == 0);
    }
  }
});

addFormView.on({
  changeOperation: function(event) {
    addFormView.set('operation', event.node.getAttribute('data-op'));
    event.node.classList.remove('tapped');
    event.node.offsetWidth = event.node.offsetWidth;
    event.node.classList.add('tapped');
    event.original.preventDefault();
  },
  keyPressed: function(event) {
    var key = event.node.getAttribute('data-key');
    event.node.classList.remove('tapped');
    event.node.offsetWidth = event.node.offsetWidth;
    event.node.classList.add('tapped');
    value = ('' + addFormView.get('value')).replace('.', '');
    if (key == '<') {
      if (value.length > 0) {
       value = value.substr(0, value.length-1);
      }
    }
    else {
      value = value + key;
    }
    addFormView.set('value', addFormController.formatValue(value));
    event.original.preventDefault();
  },
  onInputKeyDown: function(event) {
    if (event.original.keyCode == 13) { //ENTER
      event.original.preventDefault();
      return false;
    }
  },
  onInputKeyUp: function(event) {
    if (event.node.dataset.placeholder) {
      addFormView.set(event.node.dataset.placeholder, event.node.textContent);
    }
  },
  editInfo: function(event) {
    event.node.contentEditable = 'true';
    addFormView.set('editingInfoInput', event.node);
    if (event.node.textContent == event.node.dataset.placeholder) {
      event.node.textContent = '';
    }
    addFormController.closeCalendar();
  },
  finishEditingInfo: function(event) {
    console.log('finishEditingInfo');
    event.node.contentEditable = 'false';
    addFormView.set('editingInfoInput', null);
    if (event.node.textContent == '') {
      event.node.textContent = event.node.dataset.placeholder;
    }
    addFormView.set(event.node.dataset.placeholder, event.node.textContent);
  },
  close: function() {
    addFormView.set('open', false);
  },
  submit: function() {
    addFormController.submit();
  },
  openCalendar: function(event) {
    event.original.preventDefault();
    addFormController.openCalendar();
    return false;
  },
  selectPrevDate: function(event, args) {
    event.original.preventDefault();
    var date = event.context.date;
    addFormView.set('date', date);
    addFormView.set('prevDates', [{date:date.clone().add(-3).days()}, {date:date.clone().add(-2).days()}, {date:date.clone().add(-1).days()}]);
    return false;
  },
  closeCalendar: function(event) {
    if (addFormView.get('editingInfoInput')) {
      addFormView.fire('finishEditingInfo', { node: addFormView.get('editingInfoInput') });
    }
    event.original.preventDefault();
    addFormController.closeCalendar();
    window.blur();
    return false;
  },
  selectDate: function(event) {
    event.original.preventDefault();
    var date = event.context.fullDate;
    addFormView.set('date', date);
    addFormView.update('calendar');
    addFormView.set('prevDates', [{date:date.clone().add(-3).days()}, {date:date.clone().add(-2).days()}, {date:date.clone().add(-1).days()}]);
    addFormView.fire('closeCalendar', event);
    return false;
  },
  prevMonth: function(event) {
    event.original.preventDefault();
    addFormController.prevMonth();
    return false;
  },
  nextMonth: function(event) {
    event.original.preventDefault();
    addFormController.nextMonth();
    return false;
  }
})

var addFormButtonsView = new Ractive({
  el: '#addFormButtonWrapper',
  template: '#addFormButtonsTemplate',
  data: { }
});

addFormButtonsView.on({
  addItemClick: function() {
    addFormController.addItem();
  }
});

var addFormController = EventDispatcher.extend({
  action: null,
  item: null,
  formatValue: function(value) {
    while (value[0] == '0' && value.length > 0) {
      value = value.substr(1);
    }
    if (value.length == 0) return '00.00';
    if (value.length == 1) return '00.0' + value;
    if (value.length == 2) return '00.' + value;
    if (value.length == 3) return '0' + value[0] + '.' + value[1] + value[2];
    if (value.length >= 4) return  value.substr(0, value.length-2) + '.' + value.substr(value.length-2, value.length-1)
  },
  addItem: function() {
    this.clear();
    addFormView.set('open', true);
    this.action = 'add';
  },
  editItem: function(item) {
    this.editedItem = item;
    //this.clear();
    //blocks setting values in dom??
    this.action = 'edit';
    addFormView.set('operation', item.operation);
    addFormView.set('value', item.value);
    addFormView.set('category', item.category);
    addFormView.set('notes', item.notes);
    addFormView.set('date', item.date);
    addFormView.set('prevDates', [{date:item.date.clone().add(-3).days()}, {date:item.date.clone().add(-2).days()}, {date:item.date.clone().add(-1).days()}]);
    addFormView.set('open', true);
    addFormView.update();
  },
  clear: function() {
    var categoryField = document.getElementById('addFormCategory');
    var notesField = document.getElementById('addFormNotes');
    categoryField.contentEditable = 'false';
    notesField.contentEditable = 'false';
    categoryField.textContent = 'category';
    notesField.textContent = 'notes';
    addFormController.closeCalendar();
    addFormView.set('operation', '-');
    addFormView.set('value', '00.00');
    addFormView.set('category', 'category');
    addFormView.set('notes', 'notes');
    var date = new Date();
    addFormView.set('date', date);
    addFormView.set('prevDates', [{date:date.clone().add(-3).days()}, {date:date.clone().add(-2).days()}, {date:date.clone().add(-1).days()}]);
  },
  submit: function() {
    var account = accountsController.getSelectedAccount();
    var categoryField = document.getElementById('addFormCategory');
    var notesField = document.getElementById('addFormNotes');
    if (!account) {
      alert('no active account selected!');
      return;
    }
    var item = {
      type: 'item',
      accountid: account._id,
      date: '' + addFormView.get('date'),
      operation: addFormView.get('operation'),
      value: Number(addFormView.get('value')),
      category: addFormView.get('category'),
      notes: addFormView.get('notes'),
      recurring: addFormView.get('recurring'),
      future: addFormView.get('date') > (new Date())
    };
    if (item.category == categoryField.dataset.placeholder) {
      item.category = '';
    }
    if (item.notes == notesField.dataset.placeholder) {
      item.notes = '';
    }
    if (this.action == 'add') {
      DataSource.addItem(item);
    }
    else if (this.action == 'edit') {
      this.editedItem.date = item.date;
      this.editedItem.operation = item.operation;
      this.editedItem.value = item.value;
      this.editedItem.category = item.category;
      this.editedItem.notes = item.notes;
      this.editedItem.recurring = item.recurring;
      this.editedItem.future = item.future;
      DataSource.updateItem(this.editedItem);
    }
    addFormView.set('open', false);
    this.action = null;
    this.item = null;
  },
  enumMonthDays: function(m, y) {
    console.log('enumMonthDays', m, y);
    y = y || Date.today().getFullYear();

    var firstMonday = Date.today();
    firstMonday.setDate(1);
    firstMonday.setMonth(m);
    firstMonday.setYear(y);
    if (firstMonday.getDay() != 1) {
      firstMonday = firstMonday.moveToDayOfWeek(1, -1);
    }

    var d = firstMonday;
    var weeks = [];
    for(var i=0; i<5; i++) {
      var days = [];
      for(var j=0; j<7; j++) {
        var today = (d.clearTime().compareTo(Date.today()) == 0);
        var out = d.getMonth() != m;
        days.push({fullDate: d.clone(), date: d.getDate(), today: today, out: out});
        d = d.next().day();
      }
      weeks.push({days:days});
    }
    return weeks;
  },
  prevMonth: function() {
    var cal = addFormView.get('calendar');
    var d = new Date();
    d.setDate(1);
    d.setMonth(Date.getMonthNumberFromName(cal.month));
    d.setYear(cal.year);
    d = d.prev().month();
    this.showCalendar(d);
  },
  nextMonth: function() {
    var cal = addFormView.get('calendar');
    var d = new Date();
    d.setDate(1);
    d.setMonth(Date.getMonthNumberFromName(cal.month));
    d.setYear(cal.year);
    d = d.next().month();
    this.showCalendar(d);
  },
  openCalendar: function() {
    var date = addFormView.get('date');
    this.showCalendar(date);
  },
  showCalendar: function(date) {
    var year = date.getFullYear();
    var month = date.getMonth();
    addFormView.set('calendar', {
      year: year,
      month: date.toString('MMM'),
      weeks: this.enumMonthDays(month, year)
    });
  },
  closeCalendar: function() {
    addFormView.set('calendar', null);
  }
});

var accountsView = new Ractive({
  el: '#accounts',
  template: '#accountsTemplate',
  data: { accounts : [], collapsed: true }
});

accountsView.on({
  selectAccount: function(e, index) {
    if (accountsView.get('accounts[' + index + '].selected') && accountsView.get('collapsed')) {
      accountsView.set('collapsed', false);
    }
    else {
      for(var i=0; i<accountsView.data.accounts.length; i++) {
        accountsView.set('accounts[' + i + '].selected', i == index);
      }
      accountsView.set('collapsed', true);
      localStorage['cashflow_selectedAccountId'] = accountsView.data.accounts[index]._id;
      accountsController.fire('change', accountsController);
    }
  }
});

var accountsController = EventDispatcher.extend({
  accounts: [],
  onDataSourceInit: function() {
    console.log('Accounts.onDataSourceInit');
    DataSource.getAccounts(this.onDataBaseGetAccounts.bind(this));
  },
  onDataBaseGetAccounts: function(accounts) {
    console.log('Accounts.onDataBaseGetAccounts', accounts);
    this.accounts = accounts;

    var selectedAccountId = localStorage['cashflow_selectedAccountId'];
    var account = this.getAccountById(selectedAccountId);
    if (account) {
      account.selected = true;
    }
    else {
      localStorage['cashflow_selectedAccountId'] = '';
      accountsView.set('collapsed', false);
    }

    accountsView.set('accounts', accounts);
    prepareAccountsElements();
    prepareItemElements();
    prepareSyncElement(document.getElementById('syncItem'));
    prepareRefreshElement(document.getElementById('refreshItem'));
    this.fire('change', this);
  },
  getSelectedAccount: function() {
    for(var i=0; i<this.accounts.length; i++) {
      if (this.accounts[i].selected) return this.accounts[i];
    }
    return null;
  },
  getAccountById: function(id) {
    var results = this.accounts.filter(function(account) { return account._id == id});
    if (results.length > 0) return results[0];
    else return null;
  }
});

var statsView = new Ractive({
  el: '#stats',
  template: '#statsTemplate',
  data: {
    items: [],
    left: 0,
    collapsed: true,
    formatPrice: function(price) {
      return price.toFixed(2)
    },
    formatMonth: function(month) {
      return monthNames[month];
    },
  }
})

statsView.on({
  prevMonth: function(event) {
    var year = (statsView.get('year'));
    var month = (statsView.get('month'));
    console.log(year, month)
    if (month == 0) {
      month = 11;
      year--;
    }
    else {
      month--;
    }
    statsController.showMonthlyStats(year, month);
  },
  nextMonth: function(event) {
    var year = statsView.get('year');
    var month = statsView.get('month');
    if (month == 11) {
      month = 0;
      year++;
    }
    else {
      month++;
    }
    statsController.showMonthlyStats(year, month);
  }
});


var statsController = EventDispatcher.extend({
  init: function() {
  },
  showMonthlyStats: function(year, month) {
    var monthItemsByCategory = itemsController.getMonthlyStats(year, month);
    statsView.set('year', year)
    statsView.set('month', month)
    statsView.set('items', monthItemsByCategory)
    prepareStatsElements()
    itemsController.showFilteredItems(year, month);
  },
  toggleOpen: function() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();

    if (statsView.get('collapsed')) {
      statsController.showMonthlyStats(year, month)
      statsView.set('collapsed', false);
    }
    else {
      statsView.set('collapsed', true);
      statsView.set('items', [])
      itemsController.loadMoreItems();
    }
  }
});

var itemsView = new Ractive({
  el: '#items',
  template: '#itemsTemplate',
  data: {
    items: [],
    left: 0,
    formatPrice: function(price) {
      return price.toFixed(2)
    },
    formatDate: function(date) {
      var tokens = date.toString().split(' ');
      return tokens[2] + '<br/>' + tokens[1];
    }
  }
})

itemsView.on({
  loadMoreItems: function() {
    itemsController.loadMoreItems();
  },
})

var itemsController = EventDispatcher.extend({
  itemsPerPage: 30,
  items: [],
  newestItems: [],
  init: function() {
    accountsController.on('change', this.onAccountChange.bind(this));
    DataSource.on('itemChanged', this.onItemChanged.bind(this));
  },
  getItemById: function(id) {
    var results = this.items.filter(function(item) { return item._id == id; })
    if (results.length > 0) {
      return results[0];
    }
    return null;
  },
  onAccountChange: function() {
    var account = accountsController.getSelectedAccount();

    console.log('Items.onAccountChange 22', account);
    if (!account) {
      itemsView.set('items', []);
      return;
    }
    function formatDate() {

    }
    DataSource.getItems(account._id, function(items) {
      items = items.slice(1800, 2000);
      var s = account._id + '\n';
      items.forEach(function(item, itemIndex) {
        //s += '\t' + item.operation + item.value + ' ' + item.category.join(',') + '\n';
        s += '\t' + ' ' + item.operation + '' + item.value + ' ' + item.category + ' ' + '@date(' + new Date(item.date).toISOString().substr(0, 10) +')\n';
        if (item.category.indexOf('flight') > -1) {
          console.log('tags', item)
        }
      })
      console.log(s);
      var entries = items.map(function(item, itemIndex) {
        //if (itemIndex % 100 == 0) console.log(itemIndex)
        return {
          _id: item._id,
          tags: item.category ? item.category.split(' ') : [],
          price: item.operation + item.value,
          date: item.date,
          text: item.notes
        };
      });
      //console.log('bl a', JSON.stringify(entries));
      items.forEach(function(item) {
        item.date = new Date(item.date);
      })
      items.sort(function(a, b) {
        if (a.future && b.future) return 0;
        if (a.future) return -1;
        if (b.future) return 1;
        if (a.date > b.date) return -1;
        if (a.date < b.date) return 1;
        return 0;
      })
      this.items = items;
      this.newestItems = [];
      this.loadMoreItems();
      console.timeEnd('App.boot');
    }.bind(this));
  },
  loadMoreItems: function() {
    itemsView.set('showMore', true);
    this.newestItems = this.items.slice(0, this.newestItems.length + this.itemsPerPage);
    itemsView.set('items', this.newestItems);
    itemsView.set('left', this.items.length - this.newestItems.length);
    prepareItemElements();
  },
  showFilteredItems: function(year, month, category) {
    this.newestItems = this.items.filter(function(item) {
      if (item.date.getFullYear() != year) return false;
      if (item.date.getMonth() != month) return false;
      if (category && item.category.indexOf(category) == -1) return false;
      else return true;
    });
    itemsView.set('items', this.newestItems);
    itemsView.set('showMore', false);
    prepareItemElements();
  },
  onItemChanged: function(item) {
    itemsView.set('showMore', true);
    if (!item || !this.items.length || !this.newestItems.length) return;
    console.log('ItemsController.onItemChanged', item);
    var found = this.items.filter(function(it) { return it._id == item._id; });
    if (found.length > 0) {
      var idx = this.items.indexOf(found[0]);
      if (item._deleted) {
        this.items.splice(idx, 1);
        this.newestItems = this.items.slice(0, this.newestItems.length + this.itemsPerPage);
        itemsView.set('items', this.newestItems);
        itemsView.set('left', this.items.length - this.newestItems.length);
      }
      else {
        //item.cfNew = true
        this.items.splice(idx, 1, item);
        this.newestItems = this.items.slice(0, this.newestItems.length + this.itemsPerPage);
        itemsView.set('items', this.newestItems);
        itemsView.set('left', this.items.length - this.newestItems.length);
        //$scope.sortItems()
      }
      //if (item.accountid == $scope.accountid) {
    }
    else {
     
      //item.cfNew = true
      this.items.unshift(item);
      this.newestItems = this.items.slice(0, this.newestItems.length + this.itemsPerPage);
      itemsView.set('items', this.newestItems);
      itemsView.set('left', this.items.length - this.newestItems.length);
      //$scope.sortItems()
      //updateFutureItems()
    }
  },
  getMonthlyStats: function(year, month) {
    var monthItems = this.items.filter(function(item) {
      return item.date.getFullYear() == year && item.date.getMonth() == month;
    });
    monthItems.forEach(function(item) {
      if (item.category == 'food groceries') item.category = 'groceries';
      if (item.category == 'food coffee') item.category = 'coffee';
    })
    monthItems.forEach(function(item) {
      var categoryTokens = item.category.split(' ');
      item.primaryCategory = categoryTokens[0] || 'Other';
      item.secondaryCategory = categoryTokens[1] || '';
    })

    var monthItemsByCategory = fn.groupBy(monthItems, 'primaryCategory');
    var categories = fn.keys(monthItemsByCategory);
    var allCategoriesTotalSpend = 0;
    var categoriesTotals = categories.map(function(category) {
      var total = monthItemsByCategory[category].reduce(function(sum, item) {
        if (item.operation == '-') return sum -= item.value;
        if (item.operation == '+') return sum += item.value;
        return sum;
      }, 0);
      if (total < 0) {
        allCategoriesTotalSpend += total;
      }
      return { category: category, total: total, count: monthItemsByCategory[category].length }
    })

    categoriesTotals.unshift( { category: 'all', total: allCategoriesTotalSpend, count: monthItems.length })

    console.log(year, month+1, 'items', monthItems.length + '/' + this.items.length);
    categoriesTotals.sort(function(a, b) { return a.total - b.total})
    categoriesTotals.forEach(function(item) { console.log(item.category, item.total)})

    var msg = [[year, '/', month]]
      .concat(
        categoriesTotals
          .slice(0, 8)
          .map(function(item) { return [item.category, ':', Math.floor(item.total)]})
      )
      .map(function(tokens) { return tokens.join(' ')})
      .join('\n');
    return categoriesTotals;
  }
});

var actionThreshold = 0.3;
var subActionThreshold = 0.6;

var toList = function(a) { return Array.prototype.concat.apply([], a); }

var prepareSyncElement = function(syncElement) {
  addItemEventHandlers(syncElement, {
    actions: {
      left: {
        primary : { icon : 'img/sync.png', color : [50,200,0], callback: function() { settingsCtrl.sync() }}
      }
    }
  });
}

var prepareRefreshElement = function(refreshElement) {
  addItemEventHandlers(refreshElement, {
    actions: {
      left: {
        primary : { icon : 'img/reload.png', color : [50,200,0], callback: function() { document.location.reload(); }}
      }
    }
  });
}

var prepareAccountElement = function(accountElement) {
  addItemEventHandlers(accountElement, {
    actions: {
      left: {
        primary : { icon : 'img/stats.png', color : [0,200,200], callback: function() {
          statsController.toggleOpen();
        }},
        secondary : { icon : 'img/edit.png', color : [250,200,0], callback: function() { console.log('edit!'); }},
      },
      right: {
        primary: { icon : 'img/x.png', color : [200,0,10], callback: function() { console.log('delete!'); }}
      }
    }
  });
}

var prepareAccountsElements = function() {
  var accountsElements = toList(document.querySelectorAll('#accounts .list li'));
  accountsElements.forEach(prepareAccountElement);
}

var prepareStatsElement = function(statsElement) {
  addItemEventHandlers(statsElement, {
    actions: {
      left: {
        primary : { icon : 'img/list.png', color : [0,200,200], callback: function() {
          itemsController.showFilteredItems(statsView.get('year'), statsView.get('month'), statsElement.dataset['category'])
        }}
      },
      right: {
      }
    }
  });
}

var prepareStatsElements = function() {
  var statsElements = toList(document.querySelectorAll('#stats .list li'));
  statsElements.forEach(prepareStatsElement);
}

var prepareItemElement = function(itemElement) {
  var isFuture = itemElement.className.indexOf('future') != -1;
  var primary;
  if (isFuture) {
    primary = { icon : 'img/pay.png', color : [0,200,255], callback: function() { console.log('pay!'); }};
  }
  else {
    primary = { icon : 'img/edit.png', color : [250,200,0], callback: function() {
      addFormController.editItem(itemsController.getItemById(itemElement.id));
    }};
  }
  var rightPrimary = { icon : 'img/x.png', color : [200,0,10], callback: function() {
    DataSource.removeItemById(itemElement.id)
  }};
  addItemEventHandlers(itemElement, {
    actions: {
      left: {
        primary : primary
      },
      right: {
        primary : rightPrimary
      }
    }
  });
}

var prepareItemElements = function() {
  var itemElements = toList(document.querySelectorAll('#items .list li'));
  itemElements.forEach(prepareItemElement);
}

var addItemEventHandlers = function(itemElem, item) {
  if (!item || !item.actions) return;

  var backgroundElem = itemElem;
  var foregroundElem = itemElem.querySelector('div');
  var startX, startY, deltaX, deltaY;
  var bgIcon;
  var touchDragging;
  var activeAction = null;

  function onSlideStart(x, y) {
    startX = x;
    startY = y;
    bgIcon = null;
    foregroundElem.className += ' dragged';
  }

  function onSlide(x, y) {
    deltaX = x - startX;
    deltaY = y - startY;

    if (deltaX > 0 && startX > 0 && item.actions.left && item.actions.left.primary) {
      foregroundElem.style.left = deltaX + 'px';
      k = deltaX / itemElem.clientWidth;
      alpha = 1;
      if (k < actionThreshold) {
        alpha = k / actionThreshold * 0.6;
        activeAction = null;
      }
      else if (k > actionThreshold) {
        activeAction = item.actions.left.primary;
      }

      var color = item.actions.left.primary.color;
      var icon = item.actions.left.primary.icon;

       if (k > subActionThreshold && item.actions.left.secondary) {
        color = item.actions.left.secondary.color;
        icon = item.actions.left.secondary.icon;
        activeAction = item.actions.left.secondary;
      }

      backgroundElem.style.backgroundColor = 'rgba(' + color.join(',') + ',' + alpha + ')';
      if (bgIcon != icon) {
        bgIcon = icon;
        backgroundElem.style.backgroundImage = 'url(' + icon + ')';
        backgroundElem.style.backgroundPosition = 'center left';
      }
    }
    else if (deltaX < 0 && startX > 0 && item.actions.right && item.actions.right.primary) {
      foregroundElem.style.left = deltaX + 'px';
      k = -deltaX / itemElem.clientWidth;
      alpha = 1;
      if (k < actionThreshold) {
        alpha = k / actionThreshold * 0.6;
        activeAction = null;
      }
      else if (k > actionThreshold) {
        activeAction = item.actions.right.primary;
      }

      var color = item.actions.right.primary.color;
      var icon = item.actions.right.primary.icon;
      if (k > subActionThreshold && item.actions.right.secondary) {
        color = item.actions.right.secondary.color;
        icon = item.actions.right.secondary.icon;
        activeAction = item.actions.right.secondary;
      }

      backgroundElem.style.backgroundColor = 'rgba(' + color.join(',') + ',' + alpha + ')';
      if (bgIcon != icon) {
        bgIcon = icon;
        backgroundElem.style.backgroundImage = 'url(' + icon + ')';
        backgroundElem.style.backgroundPosition = 'center right';
      }
    }
  }

  function onSlideScroll(x, y) {
    foregroundElem.style.left = 0 + 'px';
  }

  function onSlideEnd(x, y) {
    if (activeAction && activeAction.callback) {
      activeAction.callback();
    }
    foregroundElem.className = foregroundElem.className.replace('dragged', '');
    foregroundElem.style.left = '0px';
  }

  function onDragStart(e) {
    if (e.touches) return; //ignore duplicated mouse events on touch device
    onSlideStart(e.pageX, e.pageY);
    window.addEventListener('mousemove', onDragMove, false);
    window.addEventListener('mouseup', onDragEnd, false);
  }

  function onDragMove(e) {
    onSlide(e.pageX, e.pageY);
  }

  function onDragEnd(e) {
    onSlideEnd(e.pageX, e.pageY);
    e.currentTarget.removeEventListener('mousemove', onDragMove);
    e.currentTarget.removeEventListener('mouseup', onDragEnd);
  }

  function onTouchStart(e) {
    touchDragging = false;
    onSlideStart(e.touches[0].clientX, e.touches[0].clientY);
    e.currentTarget.addEventListener('touchmove', onTouchMove, false);
    e.currentTarget.addEventListener('touchend', onTouchEnd, false);
  }

  function onTouchMove(e) {
    onSlide(e.touches[0].clientX, e.touches[0].clientY);
    if (touchDragging || Math.abs(deltaX) >= Math.abs(deltaY)) {
      touchDragging = true;
      e.preventDefault();
      return false;
    }
    else if (!touchDragging && Math.abs(deltaX) < 10 && Math.abs(deltaY) > 10) {
    }
    if (!touchDragging) {
      onSlideScroll();
    }
  }

  function onTouchEnd(e) {
    onSlideEnd(0, 0);
    e.currentTarget.removeEventListener('touchmove', onTouchMove);
    e.currentTarget.removeEventListener('touchend', onTouchEnd);
  }

  foregroundElem.addEventListener('mousedown', onDragStart, false);
  foregroundElem.addEventListener('touchstart', onTouchStart, false);
}

//Just adds event handlers
itemsController.init();

//Checks if we are logged in and shows login form if not
settingsCtrl.checkLoginStatus();

//Calls DataSource.init
settingsCtrl.checkDatabaseStatus();

window.addEventListener('scroll', function(e) {
  if (addFormView.get('open') == true) {
    e.preventDefault();
    window.scrollTo(0, 0);
  }
})