/**
  @module ember-flexberry-gis
 */

import BaseControl from 'ember-flexberry-gis/components/base-control';

/**
  Simple history component for leaflet map
  @class HistoryControlComponent
  @extends BaseControlComponent
*/
export default BaseControl.extend({
  /**
    The class used for the back button image
  */
  backImage: 'angle left icon',

  /**
    The class used for the forward button image
  */
  forwardImage: 'angle right icon',

  /**
    - position - sets which corner of the map to place your controls.
    possible values are 'topleft' | 'topright'(default) | 'bottomleft' | 'bottomright'
    - maxMovesToSave - the number of moves in the history to save before clearing out the oldest.
    default value is 10, use 0 or a negative number to make unlimited.
    - backImage, forwardImage - the class used for the button images. defaults are 'fa fa-caret-left' and 'fa fa-caret-right', respectively.
    - no image will be displayed if set to empty string.
    - backText, forwardText - the text in the buttons. defaults are '' (empty).
    - backTooltip, forwardTooltip - tooltip contents. defaults are 'Go to Previous Extent' and 'Go to Next Extent', respectively.
    - backImageBeforeText, forwardImageBeforeText - when both text and image are present
    - orientation - 'vertical' | 'horizontal'(default) - whether to position the buttons on top of one another or side-by-side.
    - useExternalControls - true | false(default) - set to true to hide these controls on the map and instead use your own controls.
    See the Events and API for more details on this.
    - shouldSaveMoveInHistory - function(zoomCenter) { return true; } a callback you can provide that gets called with every move.
    return false to not save a move.
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
    'shouldSaveMoveInHistory'],

  createControl() {
    return new L.HistoryControl(this.get('options')).addTo(this.get('map'));
  }
});
