var React = require('react');
var Key = require('../constants/RamConstants').Key;

var TextBox = React.createClass({
  getInitialState: function() {
    return {
      editing: false
    };
  },
  componentDidMount: function() {
    if (this.props.editing) {
      setTimeout(function() {
        this.startEditing();
      }.bind(this), 100);
    }
    window.addEventListener('keydown', this.onWindowKeyDown);
  },
  componentWillUnmount: function() {
    if (this.state.editing) {
      this.stopEditing();
    }
    window.removeEventListener('keydown', this.onWindowKeyDown);
  },
  prepareEditing: function() {

  },
  startEditing: function() {
    var fontSizePx = 16;
    var lineHeight = 1.5;
    var lineHeightPx = fontSizePx * lineHeight;
    var padding = 23;
    var textElem = this.refs.text.getDOMNode();
    var text = textElem.textContent;
    var height = textElem.clientHeight;
    var numLines = (height - padding) / lineHeightPx;
    console.log('startEditing');
    this.setState({ editing: true, numLines: numLines, height: height });
    document.addEventListener('click', this.onDocumentClick, false);
    document.addEventListener('keydown', this.onDocumentKeyDown, false);
    document.addEventListener('keyup', this.onDocumentKeyUp, false);

    this.props.onStartEditing();
  },
  stopEditing: function() {
    console.log('stopEditing');
    if (this.isMounted() && this.state.editing) {
      this.setState({ editing: false });
    }
    document.removeEventListener('click', this.onDocumentClick, false);
    document.removeEventListener('keydown', this.onDocumentKeyDown, false);
    document.removeEventListener('keyup', this.onDocumentKeyUp, false);
  },
  onTextMouseDown: function(e) {
    //start editing after 200ms
    var editingTimeout = setTimeout(function() {
      this.setState({ editingTimeout: null });
      this.startEditing();
    }.bind(this), 200);
    this.setState({ editingTimeout: editingTimeout});
  },
  onTextClick: function(e) {
    if (this.state.editingTimeout) {
      clearTimeout(this.state.editingTimeout);
      this.setState({ editingTimeout: null});

      if (this.props.selected) {
        this.props.onDiggDown();
      }
      else {
        this.props.onStartEditing();
      }
    }
  },
  onDocumentKeyDown: function(e) {
    if (e.keyCode == 13) { //ENTER
      if (!e.shiftKey) {
        this.handleSubmit();
        e.preventDefault();
        e.stopPropagation();
      }
    }
    else if (e.keyCode == 27) { //ENTER
      this.stopEditing();
      e.preventDefault();
      e.stopPropagation();
    }
  },
  onDocumentKeyUp: function(e) {
    var textInput = this.refs.textInput.getDOMNode();
    var h = parseInt(textInput.style.height);
    if (h != textInput.scrollHeight) {
      //console.log('expanding from', textInput.style.height, 'to', textInput.scrollHeight);
      textInput.style.height = textInput.scrollHeight + 'px';
    }
  },
  onWindowKeyDown: function(e) {
    if (this.props.selected && e.keyCode == Key.F2) {
      this.startEditing();
    }
  },
  onDocumentClick: function(e) {
    console.log('onDocumentClick', e);
    if (this.refs.textInput) {
      if (e.target == this.refs.textInput.getDOMNode()) {
        return;
      }
    }

    this.stopEditing();
  },
  componentDidUpdate: function() {
    if (this.refs.textInput) {
      var node = this.refs.textInput.getDOMNode();
      node.focus();
      node.setSelectionRange(node.value.length, node.value.length);
    }
  },
  handleSubmit: function() {
    var val = this.refs.textInput.getDOMNode().value.trim();
    this.stopEditing();
    if (this.props.onChange) {
      this.props.onChange(val);
    }
  },
  render: function() {
    var className = 'textBox';
    if (this.state.editing) {
      className += ' editing';
    }

    var textElement;
    if (this.state.editing) {
      textElement = React.DOM.textarea({
        ref: 'textInput',
        type: 'text',
        className: className,
        defaultValue: this.props.value,
        onBlur: this.handleSubmit,
        style: { height: this.state.height }
      });
    }
    else {
      var lines = [];
      var tokens = this.props.value.split('\n');
      for(var i=0; i<tokens.length; i++) {
        lines.push(tokens[i]);
        if (i < tokens.length - 1) {
          lines.push(React.DOM.br());
        }
      }
      textElement = React.DOM.div( {
        ref: 'text',
        className: className,
        onMouseDown: this.onTextMouseDown,
        onClick: this.onTextClick,
      }, lines);
    }

    return textElement;
  }
});

module.exports = TextBox;