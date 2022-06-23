/**
  @module ember-flexberry-gis
 */
import { set } from '@ember/object';
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
  leafletOptions: null,

  /**
    Creates control instance, should be overridden in child classes.

    @method createControl
    @return {L.Control} Returns new created control
  */
  createControl() {
    return new L.Control.SwitchScaleControl(this.get('options'));
  },

  afterCreateControl() {
    const leafletMap = this.get('leafletMap');
    const control = this.get('control');
    control._restore = this.get('_restore').bind(this);
    set(leafletMap, `switchScaleControl${control.options.className}`, control);
  },

  _restore() {
    const leafletMap = this.get('leafletMap');
    const control = this.get('control');
    control.onRemove(leafletMap);
    const { options, } = control;
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
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    this.leafletOptions = this.leafletOptions || [
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
    ];
  },
});
