var App = require('./components/App');
var RamAppDispatcher = require('./dispatcher/RamAppDispatcher');
var UserActions = require('./actions/UserActions');
var ItemActions = require('./actions/ItemActions');
var ParentStackStore = require('./stores/ParentStackStore');
var ItemAPI = require('./apis/ItemAPI');
var React = require('react');
var Promise = require('bluebird');
var attachFastClick = require('fastclick');

var parentToJumpTo = null;

React.initializeTouchEvents(true);


Promise.onPossiblyUnhandledRejection(function(e) {
  console.log(e.stack);
  throw e;
});

ParentStackStore.addChangeListener(function() {
  var parentStack = ParentStackStore.getParentStack();

  if (parentToJumpTo) {
    ItemActions.showChildren(parentToJumpTo);
    parentToJumpTo = null;
  }
  else {
    if (parentStack.length > 0) {
      document.location.href = '#' + parentStack[0]._id;
    }
  }
});

window.onload = function() {
  React.renderComponent(App({}), document.getElementById('appContainer'));

  if (document.location.hash.length > 1) {
    var pid = document.location.hash.substr(1);
    parentToJumpTo = pid;
  }

  attachFastClick(document.body);
  //UserActions.logIn('user', 'password')
  //console.log('Loaded');
  //var db = new PouchDB('http://localhost:5984/ram_storage_vorg');
//
  //db.signup('mary', 'nachos', function (err, response) {
  //  if (err) {
  //    if (err.name === 'conflict') {
  //      // "batman" already exists, choose another username
  //      console.log('err', err);
  //    } else if (err.name === 'forbidden') {
  //      // invalid username
  //      console.log('err', err);
  //    } else {
  //      // HTTP error, cosmic rays, etc.
  //      console.log('err', err);
  //    }
  //  }
  //  else {
  //    console.log('ok', response);
  //  }
  //});

  //db.logout(function(err, response) {

  //});

  //db.login('vorg', 'kila19', function(err, response) {
  //  if (err) {
  //    console.log('err', err);
  //  }
  //  else {
  //    console.log('ok', response);
  //  }
  //})

  //db.getSession(function (err, response) {
  //  if (err) {
  //    console.log('err', err);
  //  } else if (!response.userCtx.name) {
  //    // nobody's logged in
  //    console.log('nobody logged in');
  //  } else{
  //    // response.userCtx.name is the current user
  //    console.log('ok', response.userCtx.name);
  //  }
  //});
}