/**
  @module ember-flexberry-gis
*/

import { scheduleOnce } from '@ember/runloop';

import $ from 'jquery';
import { observer } from '@ember/object';
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
    Observes changhes in application's current locale, and refreshes some GUI related to it.

    @method localeDidChange
    @private
  */
  _localeDidChange: observer('i18n.locale', function () {
    const i18n = this.get('i18n');
    const $historyControl = $(this.get('leafletMap._container')).find('.leaflet-control-container .history-control');
    const $historyBackButton = $historyControl.find('.history-back-button');
    const $historyForwardButton = $historyControl.find('.history-forward-button');

    $historyBackButton.attr('title', i18n.t('components.history-control.back-button.title'));
    $historyForwardButton.attr('title', i18n.t('components.history-control.forward-button.title'));
  }),

  /**
    Creates control instance, should be overridden in child classes.

    @method createControl
    @return {L.Control} Returns new created control
  */
  createControl() {
    scheduleOnce('afterRender', this, '_localeDidChange');

    return new L.HistoryControl(this.get('options'));
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    this.leafletOptions = this.leafletOptions || [
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
    ];
  },
});
