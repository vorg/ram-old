var React = require('react');

var TagList  = React.createClass({
  render: function() {
    if (!this.props.tags || !this.props.tags.length) {
      return React.DOM.div({});
    }

    var tagLinks = this.props.tags.map(function(tag) {
      return React.DOM.a({ href: '#', key: tag }, tag);
    })

    return React.DOM.ul({ className: 'tags' }, tagLinks);
  }
});


module.exports = TagList;