var React = require('react');
var StatusBar = require('./StatusBar');
var OptionsBar = require('./OptionsBar');
var ItemList = require('./ItemList');
var CardItemList = require('./CardItemList');
var ItemAPI = require('../apis/ItemAPI');
var ItemActions = require('../actions/ItemActions');
var LayoutStore = require('../stores/LayoutStore');
var ParentStackStore = require('../stores/ParentStackStore');
var ParentStack = require('./ParentStack');
var R = require('ramda');

var App = React.createClass({
  getInitialState: function() {
    return {
      layout: LayoutStore.getCurrentLayout()
    }
  },
  componentDidMount: function() {
    ItemAPI.initItems().then(function(items) {
      console.log('ItemAPI.initItems done', items)
      ItemActions.showChildren('-1');
    })

    LayoutStore.addChangeListener(this.onLayoutChange);
  },
  componentWillUnmount: function() {
    LayoutStore.removeChangeListener(this.onLayoutChange);
  },
  onLayoutChange: function() {
    var currentParent = R.last(ParentStackStore.getParentStack());

    var currentLayout = LayoutStore.getCurrentLayout();
    this.setState({ layout: currentLayout });

    ItemActions.showChildren(currentParent._id, currentLayout.childrenDepth);
  },
  render: function() {
    var className = this.state.layout.className;
    var itemList;
    if (this.state.layout.id == 'cards') {
      itemList = CardItemList({ });
    }
    else itemList = ItemList({ });

    return React.DOM.div({ },
      OptionsBar({}),
      StatusBar({}),
      React.DOM.div({ className: className },
        ParentStack({}),
        itemList
      )
    );
  }
});

module.exports = App;