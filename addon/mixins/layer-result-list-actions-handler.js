/**
  @module ember-flexberry-gis
*/

import { get, set } from '@ember/object';

import { isArray } from '@ember/array';
import { isBlank } from '@ember/utils';
import Mixin from '@ember/object/mixin';

/**
  Mixin containing handlers for
  {{#crossLink "LayerResultListComponent"}}layer-result-list component's{{/crossLink}} actions.

  @class LayerResultListActionsHandlerMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Mixin.create({
  actions: {

    /**
      Action shows intersection panel.

      @method actions.onIntersectionPanel
    */
    onIntersectionPanel(feature) {
      this.set('feature', feature);
      this.set('showIntersectionPanel', true);
    },

    /**
      Close intersection panel.

      @method actions.findIntersection
    */
    closeIntersectionPanel() {
      this.set('showIntersectionPanel', false);
    },
    /**
      Handles {{#crossLink "FlexberryTreenodeComponent/sendingActions.featureSelected:method"}}
        layer-result-list component's 'featureSelected' action{{/crossLink}}.

      @method actions.onLayerFeatureSelected
      @param {Object} feature Describes inner FeatureResultItem's feature object or array of it.

      @example
      templates/my-form.hbs
      ```handlebars
        {{layer-result-list
          featureSelected=onLayerFeatureSelected
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import LayerResultListActionsHandlerMixin from 'ember-flexberry-gis/mixins/layer-result-list-actions-handler';

        export default Ember.Controller.extend(LayerResultListActionsHandlerMixin, {
        });
      ```
    */
    onLayerFeatureSelected(feature) {
      if (!isBlank(feature)) {
        let layerModel;

        // Features in array have the same layerModel, so it's enough to take the first one.
        if (isArray(feature)) {
          layerModel = get(feature, '0.layerModel');
        } else {
          layerModel = get(feature, 'layerModel');
        }

        if (!isBlank(layerModel)) {
          this._setLayerVisibility(layerModel);
        }
      }
    },
  },

  /**
    Changes layer's visibility with respect to it's hierarchy.

    @method setLayerVisibility
    @param {Object} layerModel Layer metadata.
    @private
  */
  _setLayerVisibility(layerModel) {
    set(layerModel, 'visibility', true);
    const parent = layerModel.get('parent');

    // Change it's parents visibility to if it's nested.
    if (!isBlank(parent)) {
      this._setLayerVisibility(parent);
    }
  },
});
