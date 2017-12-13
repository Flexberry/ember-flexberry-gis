/**
  jQuery 'resize' method extensons.

  Add support for resize start/end detection.
  1) $(selector).resize({
       onResizeStart: function() {},
       onResize: function() {},
       onResizeEnd: function() {},
     });
*/
;(function($, window, undefined) {
  var originalResize = $.fn.resize;
  var originalRemoveResize = $.fn.removeResize;

  var userDefinedCallbacks = [];
  var innerCallbacks = [];

  // Override original 'resize' method.
  $.fn.resize = function(options) {
    options = options || {};
    var onResizeStart = options.onResizeStart || function() {};
    var onResize = options.onResize || function() {};
    var onResizeEnd = options.onResizeEnd || function() {};
    var $this = $(this);
    var storage = {
      oldWidth:  $this.width(),
      oldHeight: $this.height(),
      intervalId: null
    };

    var innerOnResize = function() {
      var newWidth = $this.width();
      var newHeight = $this.height();

      if (storage.oldWidth !== newWidth || storage.oldHeight !== newHeight) {
        storage.oldWidth = newWidth;
        storage.oldHeight = newHeight;

        if (storage.intervalId == null) {
          storage.intervalId = setInterval(function() {
            // If size is still the same, then resize is probably finished.
            if (storage.oldWidth === $this.width() && storage.oldHeight === $this.height()) {
              clearInterval(storage.intervalId);
              storage.intervalId = null;

              onResizeEnd.call($this);
            }
          }, 250);

          onResizeStart.call($this);
        }

        onResize.call($this);
      }
    };
    originalResize.call($this, innerOnResize);

    userDefinedCallbacks.push(options);
    innerCallbacks.push(innerOnResize);
  };

  // Override original 'removeResize' method.
  $.fn.removeResize = function(options) {
    options = options || {};

    // Find previously attached 'innerOnResize' callback related to the specified options, unbind it and remove.
    for (var i = 0, len = userDefinedCallbacks.length; i < len; i++) {
      if (options === userDefinedCallbacks[i]) {
        var innerOnResize = innerCallbacks[i];
        originalRemoveResize.call($(this), innerOnResize);

        userDefinedCallbacks.splice(i, 1);
        innerCallbacks.splice(i, 1);

        break;
      }
    }
  };
})(jQuery, this);
