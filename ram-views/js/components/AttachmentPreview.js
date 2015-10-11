var React = require('react');

var AttachmentPreview  = React.createClass({
  render: function() {
    if (!this.props.attachments || !this.props.attachments.length) {
      return React.DOM.div({});
    }

    var url = this.props.attachments[0].thumbUrl.replace('localhost', document.location.host);
    if (url.indexOf('.gif') != -1) {
      url = 'http://' + document.location.host + ':3000/images/tumblr_n9ecu1HNTG1r20fq5o1_500_1409213932342_thumb.jpg';
    }
    return React.DOM.img({
      key: this.props.attachments[0].thumbUrl,
      src: url
    });
  }
});


module.exports = AttachmentPreview;