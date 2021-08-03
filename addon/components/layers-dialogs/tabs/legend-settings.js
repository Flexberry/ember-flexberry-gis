import Ember from 'ember';
import layout from '../../../templates/components/layers-dialogs/tabs/legend-settings';

/**
 Component for legend settings tab in layer settings.
 */
export default Ember.Component.extend({
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
  _isWmsType: Ember.computed('type', function () {
    let type = this.get('type');

    if (!Ember.isNone(type) && type.indexOf('wms') > -1) {
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
  _isVectorType: Ember.computed('type', function() {
    let className = this.get('type');
    let layerClass = Ember.isNone(className) ?
      null :
      Ember.getOwner(this).knownForType('layer', className);

    return !Ember.isNone(layerClass) && layerClass.isVectorType(this.get('layerModel'));
  })
});
