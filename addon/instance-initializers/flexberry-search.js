/**
  @module ember-flexberry-gis
*/

import $ from 'jquery';

/**
  Registers i18n-ed messages for flexberry-search component.

  @for ApplicationInstanceInitializer
  @method flexberrySearch.initialize
  @param {<a href="http://emberjs.com/api/classes/Ember.ApplicationInstance.html">Ember.ApplicationInstance</a>} applicationInstance Ember application instance.
*/
export function initialize(applicationInstance) {
  let i18n = applicationInstance.lookup('service:i18n');

  // Use i18n service with Semantic UI 'search' module.
  let getOriginalMessageHtml = $.fn.search.settings.templates.message;
  $.fn.search.settings.templates.message = function(message, type) {
    let originalMessageHtml = getOriginalMessageHtml.call(this, message, type);

    if (type !== 'empty') {
      return originalMessageHtml;
    }

    let $originalMessage = $(originalMessageHtml);
    $('.header', $originalMessage).text(i18n.t('components.flexberry-search.no-results.caption'));
    $('.description', $originalMessage).text(i18n.t('components.flexberry-search.no-results.description'));

    // Return i18n-ed element's outer html.
    return $originalMessage.wrapAll('<div>').parent().html();
  };
}

export default {
  after: 'i18n',
  name: 'flexberry-search',
  initialize
};
