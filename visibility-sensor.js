'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

var containmentPropType = React.PropTypes.any;

if (typeof window !== 'undefined') {
  containmentPropType = React.PropTypes.instanceOf(Element);
}

module.exports = React.createClass({
  displayName: 'VisibilitySensor',

  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    active: React.PropTypes.bool,
    partialVisibility: React.PropTypes.bool,
    delay: React.PropTypes.number,
    containment: containmentPropType,
    children: React.PropTypes.element,
	name: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      active: true,
      partialVisibility: false,
      delay: 1000,
      containment: null,
      children: React.createElement('span')
    };
  },

  getInitialState: function () {
    return {
      isVisible: null,
      visibilityRect: {}
    };
  },

  componentDidMount: function () {
	window.addEventListener('scroll', this.check);
  },

  componentWillUnmount: function () {
	window.removeEventListener('scroll', this.check);
  },

  componentWillReceiveProps: function (nextProps) {
    if (nextProps.active) {
      this.setState(this.getInitialState());
    } else {
      window.removeEventListener('scroll', this.check);
    }
  },

  /**
   * Check if the element is within the visible viewport
   */
  check: function () {
	// For some reason ReactDOM.findDOMNode(this) is 
	// returning the child span rather than the parent DOM.
    var el = ReactDOM.findDOMNode(this).parentNode;
    var rect = el.getBoundingClientRect();
    var containmentRect;
	
    if (this.props.containment) {
      containmentRect = this.props.containment.getBoundingClientRect();
    } else {
      containmentRect = {
        top: 0,
        left: 0,
        bottom: window.innerHeight || document.documentElement.clientHeight,
        right: window.innerWidth || document.documentElement.clientWidth
      };
    }
	
    var visibilityRect = {
      top: rect.top >= containmentRect.top,
      left: rect.left >= containmentRect.left,
      bottom: rect.bottom <= containmentRect.bottom,
      right: rect.right <= containmentRect.right
    };
	
    var fullVisible = (
        visibilityRect.top &&
        visibilityRect.left &&
        visibilityRect.bottom &&
        visibilityRect.right
    );

    var partialVertical =
        (rect.top >= containmentRect.top && rect.top <= containmentRect.bottom)
     || (rect.bottom >= containmentRect.top && rect.bottom <= containmentRect.bottom);

    var partialHorizontal =
        (rect.left >= containmentRect.left && rect.left <= containmentRect.right)
     || (rect.right >= containmentRect.left && rect.right <= containmentRect.right);

    var partialVisible = partialVertical && partialHorizontal;

    var isVisible = this.props.partialVisibility
      ? partialVisible
      : fullVisible;

    // notify the parent when the value changes
    if (this.state.isVisible !== isVisible) {
      this.setState({
        isVisible: isVisible,
        visibilityRect: visibilityRect
      });
      this.props.onChange(isVisible, visibilityRect);
    }
    return this.state;
  },

  render: function () {
    return React.Children.only(this.props.children);
  }
});
