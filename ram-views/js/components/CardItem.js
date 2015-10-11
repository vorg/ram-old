var React = require('react');
var TextBox = require('./TextBox');
var AttachmentPreview = require('./AttachmentPreview');
var TagList = require('./TagList');
var ItemActions = require('../actions/ItemActions');

var CardItem = React.createClass({
  onTextChange: function(text) {
    this.props.item.text = text;
    ItemActions.updateItem(this.props.item);
  },
  render: function() {
    var itemClass = 'item';
    var item = this.props.item;

    if (item.numChildren > 0) {
      itemClass += ' hasChildren';
    }

    return React.DOM.li({ ref: 'item', className: itemClass, key: this.props.key },
      AttachmentPreview({ attachments: item.attachments }),
      React.DOM.div({ },
        TextBox({ value: item.text, onChange: this.onTextChange, onDiggDown: this.props.onDiggDown }),
        item.note ? React.DOM.div( { className : 'note'}, item.note) : null,
        this.props.children
      ),
      TagList({ tags: item.tags })
    );
  }
});

module.exports = CardItem;