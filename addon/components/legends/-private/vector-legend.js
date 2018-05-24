import Ember from 'ember';
import BaseLegendComponent from './base-legend';
import layout from '../../../templates/components/legends/-private/vector-legend';

/**
  Component representing map layer's legend for vector-layers.

  @class VectorLegendComponent
  @extends BaseLegendComponent
*/
export default BaseLegendComponent.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Legend component name related ty layer's style type.

    @property _styleSettingsRelatedComponentName
    @type string
    @private
    @readOnly
  */
  _styleSettingsRelatedComponentName: Ember.computed('layer.settingsAsObject.styleSettings.type', function() {
    return `legends/layers-styles/${this.get('layer.settingsAsObject.styleSettings.type')}`;
  })
});
