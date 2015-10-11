var React = require('react');
var UserStore = require('../stores/UserStore');
var LayoutStore = require('../stores/LayoutStore');
var UserActions = require('../actions/UserActions');
var LayoutActions = require('../actions/LayoutActions');

var StatusBar = React.createClass({
  getInitialState: function() {
    return {
      user: UserStore.getUser(),
      layouts: LayoutStore.getLayouts()
    }
  },
  componentDidMount: function() {
    UserStore.addChangeListener(this.onUserChange);
    LayoutStore.addChangeListener(this.onLayoutChange);
  },
  componentWillUnmount: function() {
    UserStore.removeChangeListener(this.onUserChange);
    LayoutStore.removeChangeListener(this.onLayoutChange);
  },
  onLogInClick: function() {
    UserActions.logIn('user', 'password')
  },
  onUserChange: function() {
    this.setState({ user: UserStore.getUser() });
  },
  onLayoutChange: function() {
    this.setState({ layouts: LayoutStore.getLayouts() });
  },
  render: function() {
    var items = [];
    items.push(React.DOM.div({ key: 'hello', className: 'title' }, 'RAM / guest'));
    //items.push(React.DOM.div({ key: 'loggedIn' }, 'logged in:' + this.state.user.loggedIn));
    //if (!this.state.user.loggedIn) {
    //  items.push(React.DOM.div({ key: 'logIn' }, React.DOM.input({ type: 'button', value: 'Log in', onClick: this.onLogInClick })));
    //}
    var viewsButtons = this.state.layouts.map(function(layout, layoutIndex) {
      return React.DOM.div({
        key: 'layout' + layoutIndex,
        className: 'layoutBtn ' + (layout.selected ? 'selected' : ''),
        onClick: function() {
          LayoutActions.setLayout(layout.id);
        }
      }, layout.label);
    });
    items.push(React.DOM.div({ key: 'views', className: 'viewsMenuBar'}, viewsButtons))

    return React.DOM.div({ className: 'statusBar'}, items);
  }
});

module.exports = StatusBar;