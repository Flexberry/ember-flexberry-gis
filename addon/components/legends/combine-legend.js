import BaseLegendComponent from './-private/base-legend';
import layout from '../../templates/components/legends/combine-legend';

/**
  Component representing map layer's legend for WMS-layers.

  @class CombineLegendComponent
  @extends BaseLegendComponent
*/
export default BaseLegendComponent.extend({
  /**
    Reference to component's template.
  */
  layout
});
