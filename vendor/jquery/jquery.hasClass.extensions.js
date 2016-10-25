/**
  jQuery 'hasClass' method extensons.

  Add support for following use cases:
  1) $(selector).hasClass({
       withPrefix: 'css-class-prefix'
     });
*/
;(function($, window, undefined) {
  var originalHasClass = $.fn.hasClass;

  $.fn.hasClass = function(options){
    if (typeof options !== 'object') {
      return originalHasClass.call($(this), options);
    }

    if (typeof options.withPrefix === 'string') {
      var classNamePrefix = options.withPrefix;
      var classNames = $.map($(this).attr('class').split(' '), function(className) {
        return $.trim(className);
      });

      var hasClassNameWithPrefix = false;
      $.each(classNames, function(index, className) {
        if (className.indexOf(classNamePrefix) == 0) {
          hasClassNameWithPrefix = true;
          return false;
        }
      });

      return hasClassNameWithPrefix;
    }

    return false;
  };
})(jQuery, this);
