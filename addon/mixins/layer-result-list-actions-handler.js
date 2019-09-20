/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Mixin containing handlers for
  {{#crossLink "LayerResultListComponent"}}layer-result-list component's{{/crossLink}} actions.

  @class LayerResultListActionsHandlerMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
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
      Handles {{#crossLink "FlexberryTreenodeComponent/sendingActions.featureSelected:method"}}layer-result-list component's 'featureSelected' action{{/crossLink}}.

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
      if (!Ember.isBlank(feature)) {
        let layerModel;

        // Features in array have the same layerModel, so it's enough to take the first one.
        if (Ember.isArray(feature)) {
          layerModel = Ember.get(feature, '0.layerModel');
        } else {
          layerModel = Ember.get(feature, 'layerModel');
        }

        if (!Ember.isBlank(layerModel)) {
          this._setLayerVisibility(layerModel);
        }
      }
    }
  },

  /**
    Changes layer's visibility with respect to it's hierarchy.

    @method setLayerVisibility
    @param {Object} layerModel Layer metadata.
    @private
  */
  _setLayerVisibility(layerModel) {
    Ember.set(layerModel, 'visibility', true);
    let parent = layerModel.get('parent');

    // Change it's parents visibility to if it's nested.
    if (!Ember.isBlank(parent)) {
      this._setLayerVisibility(parent);
    }
  }
});
