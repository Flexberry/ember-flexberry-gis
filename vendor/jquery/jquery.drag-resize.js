/**
  jQuery 'dragOrResize' method extensons.
*/
; (function ($, window, undefined) {

  var postStartEvents = {
    mousedown: ['mousemove', 'mouseup'],
    touchstart: ['touchmove', 'touchend', 'touchcancel'],
    pointerdown: ['pointermove', 'pointerup', 'pointercancel'],
  };

  var measurements = [
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    'paddingBottom',
    'marginLeft',
    'marginRight',
    'marginTop',
    'marginBottom',
    'borderLeftWidth',
    'borderRightWidth',
    'borderTopWidth',
    'borderBottomWidth'
  ];

  var _getZeroSize = function () {
    var size = {
      width: 0,
      height: 0,
      innerWidth: 0,
      innerHeight: 0,
      outerWidth: 0,
      outerHeight: 0
    };
    for (var i = 0; i < measurements.length; i++) {
      var measurement = measurements[i];
      size[measurement] = 0;
    }
    return size;
  };

  var _getStyleSize = function (value) {
    var num = parseFloat(value);
    var isValid = value.indexOf('%') == -1 && !isNaN(num);

    return isValid && num;
  };

  var _getSize = function (elem) {
    // use querySeletor if elem is string
    if (typeof elem == 'string') {
      elem = document.querySelector(elem);
    }

    // do not proceed on non-objects
    if (!elem || typeof elem != 'object' || !elem.nodeType) {
      return;
    }

    var style = getComputedStyle(elem);
    if (!style) {
      return;
    }

    // if hidden, everything is 0
    if (style.display == 'none') {
      return _getZeroSize();
    }

    var size = {};
    size.width = elem.offsetWidth;
    size.height = elem.offsetHeight;

    var isBorderBox = size.isBorderBox = style.boxSizing == 'border-box';

    // get all measurements
    for (var i = 0; i < measurements.length; i++) {
      var measurement = measurements[i];
      var value = style[measurement];
      var num = parseFloat(value);
      // any 'auto', 'medium' value will be 0
      size[measurement] = !isNaN(num) ? num : 0;
    }

    var paddingWidth = size.paddingLeft + size.paddingRight;
    var paddingHeight = size.paddingTop + size.paddingBottom;
    var marginWidth = size.marginLeft + size.marginRight;
    var marginHeight = size.marginTop + size.marginBottom;
    var borderWidth = size.borderLeftWidth + size.borderRightWidth;
    var borderHeight = size.borderTopWidth + size.borderBottomWidth;

    var isBorderBoxSizeOuter = isBorderBox;

    // overwrite width and height if we can get it from style
    var styleWidth = _getStyleSize(style.width);
    if (styleWidth !== false) {
      size.width = styleWidth +
        // add padding and border unless it's already including it
        (isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth);
    }

    var styleHeight = _getStyleSize(style.height);
    if (styleHeight !== false) {
      size.height = styleHeight +
        // add padding and border unless it's already including it
        (isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight);
    }

    size.innerWidth = size.width - (paddingWidth + borderWidth);
    size.innerHeight = size.height - (paddingHeight + borderHeight);

    size.outerWidth = size.width + marginWidth;
    size.outerHeight = size.height + marginHeight;

    return size;
  }

  $.dragOrResize = function (element) {
    var defaults = {
      axis: '',
      containment: '',
      minWidth: null,
      maxWidth: null,
      minHeight: null,
      maxHeight: null,
      mode: 'drag', //drag|resize
      resize: null
    }

    var plugin = this;
    plugin.settings = {}
    plugin.isPointerDown = false;
    plugin.pointerIdentifier = null;
    plugin.pointerDownPointer = null;
    plugin.position = null;
    plugin.startPosition = {};
    plugin.relativeStartPosition = null;
    plugin.containSize = null;

    var $element = $(element), element = element;

    plugin.init = function (options) {
      plugin.settings = $.extend({}, defaults, options);
      if (plugin.settings.mode === 'drag') {
        $(window).on('resize', window_resize);
      } else if (plugin.settings.mode === 'resize') {
        $element.append('<div class="ui-resizable-handle ui-resizable-e"></div>');
      }

      // touch-action: none to override browser touch gestures
      if (window.PointerEvent) {
        element.style.touchAction = 'none';
      }

      _bindStartEvent(true);
    };

    plugin.destroy = function () {
      _bindStartEvent(false);
      _unbindPostStartEvents();

      if (plugin.settings.mode === 'drag') {
        $(window).off('resize', window_resize);
      } else if (plugin.settings.mode === 'resize') {
        $('.ui-resizable-handle', $element).remove();
      }

      // touch-action: none to override browser touch gestures
      if (window.PointerEvent) {
        element.style.touchAction = '';
      }
    };

    var _bindStartEvent = function (bind) {
      var startEvent = 'mousedown';

      if (window.PointerEvent) {
        startEvent = 'pointerdown';
      } else if ('ontouchstart' in window) {
        startEvent = 'touchstart';
      }

      var eventElement = $element;
      if (plugin.settings.mode === 'resize') {
        eventElement = $('.ui-resizable-handle', $element);
      }

      if (bind) {
        eventElement.on(startEvent, _onDragStart);
      } else {
        eventElement.off(startEvent, _onDragStart);
      }
    };

    var _onDragStart = function (event) {
      if (!event) {
        return;
      }

      if ((event.button && (event.button !== 0 && event.button !== 1)) || plugin.isPointerDown) {
        return;
      }

      var pointer = event.type === 'touchstart' ? event.changedTouches[0] : event;
      plugin.isPointerDown = true;
      plugin.pointerIdentifier = pointer.pointerId !== undefined ? pointer.pointerId : pointer.identifier;

      plugin.pointerDownPointer = {
        pageX: pointer.pageX,
        pageY: pointer.pageY,
      };

      plugin.position = _getPosition();
      plugin.startPosition = {
        x: plugin.position.x,
        y: plugin.position.y,
      };

      _measureContainment();

      var events = postStartEvents[event.type];

      events.forEach(function (eventName) {
        $(window).on(eventName, eventCallbacks['on' + eventName]);
      });

      plugin._boundPointerEvents = events;
    };

    var _unbindPostStartEvents = function () {
      if (!plugin._boundPointerEvents) {
        return;
      }

      plugin._boundPointerEvents.forEach(function (eventName) {
        $(window).off(eventName, eventCallbacks['on' + eventName]);
      });

      delete plugin._boundPointerEvents;
    };

    var _pointerMove = function (event, pointer) {
      var moveVector = {
        x: pointer.pageX - plugin.pointerDownPointer.pageX,
        y: pointer.pageY - plugin.pointerDownPointer.pageY
      };

      if (plugin.settings.mode === 'drag') {
        var dragX = moveVector.x;
        var dragY = moveVector.y;

        dragX = _containDrag('x', dragX);
        dragY = _containDrag('y', dragY);

        // constrain to axis
        dragX = plugin.settings.axis == 'y' ? 0 : dragX;
        dragY = plugin.settings.axis == 'x' ? 0 : dragY;

        plugin.position.x = plugin.startPosition.x + dragX;
        plugin.position.y = plugin.startPosition.y + dragY;

        $element.css('transform', 'translate3d( ' + dragX + 'px, ' + dragY + 'px, 0)');
      } else {
        var elemSize = _getSize(element);
        var elemRect = element.getBoundingClientRect();

        var width = elemSize.width;
        if (!plugin.settings.axis || plugin.settings.axis === 'x') {
          width = pointer.pageX - elemRect.left;
          if (plugin.settings.minWidth && width < plugin.settings.minWidth) {
            width = plugin.settings.minWidth;
          }

          if (plugin.settings.maxWidth && width > plugin.settings.maxWidth) {
            width = plugin.settings.maxWidth;
          }

          $element.css('width', width + 'px');
        }

        var height = elemSize.height;
        if (!plugin.settings.axis || plugin.settings.axis === 'y') {
          height = pointer.pageY - elemRect.top;
          if (plugin.settings.minHeight && height < plugin.settings.minHeight) {
            height = plugin.settings.minHeight;
          }

          if (plugin.settings.maxHeight && height > plugin.settings.maxHeight) {
            height = plugin.settings.maxHeight;
          }

          $element.css('height', height + 'px');
        }

        if (plugin.settings.resize && typeof plugin.settings.resize === 'function') {
          plugin.settings.resize({ width: width, height: height });
        }
      }
    };

    var _pointerUp = function (event, pointer) {
      plugin.isPointerDown = false;
      delete plugin.pointerIdentifier;

      _setPosition();
      $element.css('transform', '');

      _unbindPostStartEvents();
    };

    var _pointerCancel = function (event, pointer) {
      plugin.isPointerDown = false;
      delete plugin.pointerIdentifier;

      _setPosition();
      $element.css('transform', '');

      _unbindPostStartEvents();
    };

    var window_resize = function () {
      var container = _getContainer();
      if (!container) {
        container = document;
      }

      if (!$element.is(':visible')) {
        return;
      }

      var elemSize = _getSize(element);
      var containerSize = _getSize(container);
      var elemRect = element.getBoundingClientRect();
      var containerRect = container.getBoundingClientRect();

      if (!plugin.position) {
        plugin.position = _getPosition();
      }

      var left = plugin.position.x;
      var offset = elemRect.left + elemSize.width - (containerRect.left + containerSize.borderLeftWidth + containerRect.width);
      if (offset > 0) {
        left = left - offset;
        if (left < -1 * elemSize.marginLeft) left = -1 * elemSize.marginLeft;
      }

      var top = plugin.position.y;
      offset = elemRect.top + elemSize.height - (containerRect.top + containerSize.borderTopWidth + containerRect.height);
      if (offset > 0) {
        top = top - offset;
        if (top < -1 * elemSize.marginTop) top = -1 * elemSize.marginTop;
      }

      if (!plugin.position) plugin.position = {};

      plugin.position.x = left;
      plugin.position.y = top;

      _setPosition();
    };

    var eventCallbacks = {
      onmousemove: function (event) {
        _pointerMove(event, event);
      },

      onpointermove: function (event) {
        if (event.pointerId == plugin.pointerIdentifier) {
          _pointerMove(event, event);
        }
      },

      ontouchmove: function (event) {
        var touch = _getTouch(event.changedTouches);
        if (touch) {
          _pointerMove(event, touch);
        }
      },

      onmouseup: function (event) {
        _pointerUp(event, event);
      },

      onpointerup: function (event) {
        if (event.pointerId == plugin.pointerIdentifier) {
          _pointerUp(event, event);
        }
      },

      ontouchend: function (event) {
        var touch = _getTouch(event.changedTouches);
        if (touch) {
          _pointerUp(event, touch);
        }
      },

      onpointercancel: function (event) {
        if (event.pointerId == plugin.pointerIdentifier) {
          _pointerCancel(event, event);
        }
      },

      ontouchcancel: function (event) {
        var touch = _getTouch(event.changedTouches);
        if (touch) {
          _pointerCancel(event, touch);
        }
      }
    };

    var _setPosition = function () {
      if (plugin.settings.mode === 'drag') {
        $element.css('left', plugin.position.x + 'px');
        $element.css('top', plugin.position.y + 'px');
        $element.css('bottom', '');
        $element.css('right', '');
      }
    };

    var _getPosition = function () {
      var style = getComputedStyle(element);

      var x = _getPositionCoord(style.left, 'width');
      var y = _getPositionCoord(style.top, 'height');

      x = isNaN(x) ? 0 : x;
      y = isNaN(y) ? 0 : y;

      return {
        x: x,
        y: y
      };
    };

    var _measureContainment = function () {
      var container = _getContainer();
      if (!container) {
        return;
      }

      var elemSize = _getSize(element);
      var containerSize = _getSize(container);
      var elemRect = element.getBoundingClientRect();
      var containerRect = container.getBoundingClientRect();

      var borderSizeX = containerSize.borderLeftWidth + containerSize.borderRightWidth;
      var borderSizeY = containerSize.borderTopWidth + containerSize.borderBottomWidth;

      var position = plugin.relativeStartPosition = {
        x: elemRect.left - (containerRect.left + containerSize.borderLeftWidth),
        y: elemRect.top - (containerRect.top + containerSize.borderTopWidth),
      };

      plugin.containSize = {
        width: (containerSize.width - borderSizeX) - position.x - elemSize.width,
        height: (containerSize.height - borderSizeY) - position.y - elemSize.height,
      };
    };

    var _getContainer = function () {
      var containment = plugin.settings.containment;
      if (!containment) {
        return;
      }
      var isElement = containment instanceof HTMLElement;
      // use as element
      if (isElement) {
        return containment;
      }
      // querySelector if string
      if (typeof containment == 'string') {
        return document.querySelector(containment);
      }
      // fallback to parent element
      return element.parentNode;
    };

    var _getPositionCoord = function (styleSide, measure) {
      if (styleSide.indexOf('%') != -1) {
        // convert percent into pixel for Safari, #75
        var parentSize = _getSize(element.parentNode);
        // prevent not-in-DOM element throwing bug, #131
        return !parentSize ? 0 :
          (parseFloat(styleSide) / 100) * parentSize[measure];
      }
      return parseInt(styleSide, 10);
    };

    var _getTouch = function (touches) {
      for (var i = 0; i < touches.length; i++) {
        var touch = touches[i];
        if (touch.identifier == plugin.pointerIdentifier) {
          return touch;
        }
      }
    };

    var _containDrag = function (axis, drag) {
      if (!plugin.settings.containment) {
        return drag;
      }

      var measure = axis == 'x' ? 'width' : 'height';

      var min = -1 * plugin.relativeStartPosition[axis];
      var max = plugin.containSize[measure];
      return Math.max(min, Math.min(max, drag));
    };
  };

  $.fn.dragOrResize = function (method) {
    var args = arguments;

    return this.each(function () {
      var plugin = $(this).data('dragOrResize');
      if (typeof method === 'object' || !method) {
        // init
        if (!plugin) {
          plugin = new $.dragOrResize(this);
          $(this).data('dragOrResize', plugin);
        }

        plugin['init'].apply(this, args);

      } else if (typeof method === 'string') {
        if (!plugin) {
          $.error('Плагин не инициализирован');
        } else {
          if (plugin[method]) {
            plugin[method].apply(this, Array.prototype.slice.call(args, 1));
          } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.dragOrResize');
          }
        }
      }
    });
  };

})(jQuery, this);
