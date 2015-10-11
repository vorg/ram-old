var React = require('react');

var AddButton = React.createClass({
  render: function() {
    return React.DOM.div({ className: 'button', onClick: this.props.onClick }, this.props.label || '+');
  }
});


module.exports = AddButton;