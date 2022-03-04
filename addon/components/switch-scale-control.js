/**
  @module ember-flexberry-gis
 */
import Ember from 'ember';
import BaseControl from 'ember-flexberry-gis/components/base-control';

/**
  Switch scale component for leaflet map.

  @class SwitchScaleControlComponent
  @extends BaseControlComponent
*/
export default BaseControl.extend({
  /**
    Array containing component's properties which are also leaflet layer options.

    @property leafletOptions
    @type Stirng[]
  */
  leafletOptions: [
    'position',
    'dropdownDirection',
    'className',
    'ratio',
    'updateWhenIdle',
    'ratioPrefix',
    'ratioCustomItemText',
    'ratioMenu',
    'pixelsInMeterWidth',
    'getMapWidthForLanInMeters',
    'customScaleTitle',
    'recalcOnPositionChange',
    'recalcOnZoomChange',
    'scales',
    'roundScales',
    'adjustScales'
  ],

  /**
    Creates control instance, should be overridden in child classes.

    @method createControl
    @return {L.Control} Returns new created control
  */
  createControl() {
    return new L.Control.SwitchScaleControl(this.get('options'));
  },

  afterCreateControl() {
    let leafletMap = this.get('leafletMap');
    let control = this.get('control');
    control._restore = this.get('_restore').bind(this);
    Ember.set(leafletMap, 'switchScaleControl' + control.options.className, control);
  },

  _restore() {
    let leafletMap = this.get('leafletMap');
    let control = this.get('control');
    control.onRemove(leafletMap);
    let options = control.options;
    if (options.recalcOnZoomChange) {
      if (control.options.recalcOnPositionChange) {
        leafletMap.on(options.updateWhenIdle ? 'moveend' : 'move', control._update, control);
      } else {
        leafletMap.on(options.updateWhenIdle ? 'zoomend' : 'zoom', control._update, control);
      }

      control._update();
    } else {
      leafletMap.on(options.updateWhenIdle ? 'zoomend' : 'zoom', control._updateRound, control);
      control._updateRound();
    }
  }
});
