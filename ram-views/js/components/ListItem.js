var React = require('react');
var TextBox = require('./TextBox');
var AttachmentList = require('./AttachmentList');
var TagList = require('./TagList');
var ItemActions = require('../actions/ItemActions');
var ItemSelectionStore = require('../stores/ItemSelectionStore');

var ListItem = React.createClass({
  onTextChange: function(text) {
    this.props.item.text = text;
    ItemActions.updateItem(this.props.item);
  },
  onOrderChange: function(order) {
    this.props.item.order = order;
    ItemActions.updateItem(this.props.item);
    console.log('onOrderChange');
  },
  onTextStartEditing: function() {
    ItemActions.selectItem(this.props.item);
  },
  render: function() {
    var itemClass = 'item';
    var item = this.props.item;
    var level = item.level ? item.level : 0;
    var indent = (1.5 * level) + 'em';

    if (item.numChildren > 0) {
      itemClass += ' hasChildren';
    }

    var isSelected = item == ItemSelectionStore.getSelectedItem();

    if (isSelected) {
      itemClass += ' selected';
    }

    return React.DOM.li({ ref: 'item', className: itemClass, key: this.props.key, style: { paddingLeft: indent } },
      React.DOM.div({ },
        TextBox({
          value: item.text,
          selected: isSelected,
          onChange: this.onTextChange,
          onDiggDown: this.props.onDiggDown,
          onStartEditing: this.onTextStartEditing
        }),
        TextBox({
          value: item.order || '9999',
          selected: isSelected,
          onChange: this.onOrderChange,
          onDiggDown: this.props.onDiggDown,
          onStartEditing: this.onTextStartEditing
        }),
        this.props.children,
        TagList({ tags: item.tags }),
        AttachmentList({ attachments: item.attachments })
      )
    );
  }
});

module.exports = ListItem;