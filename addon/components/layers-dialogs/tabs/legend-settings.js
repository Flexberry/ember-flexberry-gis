import { getOwner } from '@ember/application';
import { isNone } from '@ember/utils';
import { computed } from '@ember/object';
import Component from '@ember/component';
import layout from '../../../templates/components/layers-dialogs/tabs/legend-settings';

/**
 Component for legend settings tab in layer settings.
 */
export default Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Current object with settings

    @property value
    @type Object
    @default undefined
  */
  value: undefined,

  /**
    Flag: indicates whether layer's type is wms.

    @property _isWmsType
    @type Boolean
    @default false
    @private
  */
  _isWmsType: computed('type', function () {
    let type = this.get('type');

    if (!isNone(type) && type.indexOf('wms') > -1) {
      return true;
    } else {
      return false;
    }
  }),

  /**
    Flag: indicates whether related layer is vector layer.

    @property _isVectorType
    @type Boolean
    @default false
    @private
  */
  _isVectorType: computed('type', function() {
    let className = this.get('type');
    let layerClass = isNone(className) ?
      null :
      getOwner(this).knownForType('layer', className);

    return !isNone(layerClass) && layerClass.isVectorType(this.get('layerModel'));
  })
});
