/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseControl from 'ember-flexberry-gis/components/base-control';

/**
  Simple history component for leaflet map.

  @class HistoryControlComponent
  @extends BaseControlComponent
*/
export default BaseControl.extend({
  /**
    The class used for the back button image.

    @property backImage
    @default 'angle left icon'
  */
  backImage: 'angle left icon',

  /**
    The class used for the forward button image.

    @property forwardImage
    @default 'angle right icon'
  */
  forwardImage: 'angle right icon',

  /**
    Array containing component's properties which are also leaflet layer options.
    - position - sets which corner of the map to place your controls, possible values are 'topleft' | 'topright'(default) | 'bottomleft' | 'bottomright'.
    - maxMovesToSave - the number of moves in the history to save before clearing out the oldest,
      default value is 10, use 0 or a negative number to make unlimited.
    - backImage, forwardImage - the class used for the button images. defaults are 'fa fa-caret-left' and 'fa fa-caret-right', respectively.
    - no image will be displayed if set to empty string.
    - backText, forwardText - the text in the buttons. defaults are '' (empty).
    - backTooltip, forwardTooltip - tooltip contents. defaults are 'Go to Previous Extent' and 'Go to Next Extent', respectively.
    - backImageBeforeText, forwardImageBeforeText - when both text and image are present
    - orientation - 'vertical' | 'horizontal'(default) - whether to position the buttons on top of one another or side-by-side.
    - useExternalControls - true | false(default) - set to true to hide these controls on the map and instead use your own controls.
    - shouldSaveMoveInHistory - a callback you can provide that gets called with every move (return false to not save a move).

    @property leafletOptions
    @type Stirng[]
  */
  leafletOptions: [
    'position',
    'maxMovesToSave',
    'backImage',
    'forwardImage',
    'backText',
    'forwardText',
    'backTooltip',
    'forwardTooltip',
    'backImageBeforeText',
    'forwardImageBeforeText',
    'orientation',
    'useExternalControls',
    'shouldSaveMoveInHistory'
  ],

  /**
    Observes changhes in application's current locale, and refreshes some GUI related to it.

    @method localeDidChange
    @private
  */
  _localeDidChange: Ember.observer('i18n.locale', function() {
    let i18n = this.get('i18n');
    let $historyControl = Ember.$(this.get('leafletMap._container')).find('.leaflet-control-container .history-control');
    let $historyBackButton = $historyControl.find('.history-back-button');
    let $historyForwardButton = $historyControl.find('.history-forward-button');

    $historyBackButton.attr('title', i18n.t('components.history-control.back-button.title'));
    $historyForwardButton.attr('title', i18n.t('components.history-control.forward-button.title'));
  }),

  /**
    Creates control instance, should be overridden in child classes.

    @method createControl
    @return {L.Control} Returns new created control
  */
  createControl() {
    Ember.run.scheduleOnce('afterRender', this, '_localeDidChange');

    return new L.HistoryControl(this.get('options'));
  }
});
