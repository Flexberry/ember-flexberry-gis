/**
  @module ember-flexberry-gis
*/

import { assert } from '@ember/debug';

import { A, isArray } from '@ember/array';
import { isNone, isEqual, typeOf } from '@ember/utils';
import EmberObject, { get, set } from '@ember/object';
import Mixin from '@ember/object/mixin';

import Ember from 'ember';
import FlexberryDdauCheckboxActionsHandlerMixin from 'ember-flexberry/mixins/flexberry-ddau-checkbox-actions-handler';
import FlexberryDdauSliderActionsHandlerMixin from 'ember-flexberry/mixins/flexberry-ddau-slider-actions-handler';
import {
  getRecord
} from 'ember-flexberry/utils/extended-get';
import {
  setIndexes
} from '../utils/change-index-on-map-layers';

/**
  Mixin containing handlers for
  {{#crossLink "FlexberryMaplayerComponent"}}flexberry-maplayer component's{{/crossLink}} actions.

  @class FlexberryMaplayerActionsHandlerMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Mixin.create({
  actions: {
    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.headerClick:method"}}flexberry-maplayers component's 'headerClick' action{{/crossLink}}.

      @method actions.onMapLayerHeaderClick
      @param {Object} e Action's event object.
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes event that triggers node's 'headerClick' action.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-maplayers
          name="Tree node"
          headerClick=(action "onMapLayerHeaderClick")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayers-actions-handler';

        export default Ember.Controller.extend(FlexberryMaplayerActionsHandlerMixin, {
        });
      ```
    */
    onMapLayerHeaderClick() { },

    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.beforeExpand:method"}}flexberry-maplayers component's 'beforeExpand' action{{/crossLink}}.

      @method actions.onMapLayerBeforeExpand
      @param {Object} e Action's event object.
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes event that triggers node's expanding.

      @example
      templates/my-form.hbs
      ```handlebars
        {{{flexberry-maplayers
          name="Tree node"
          beforeExpand=(action "onMapLayerBeforeExpand")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayers-actions-handler';

        export default Ember.Controller.extend(FlexberryMaplayerActionsHandlerMixin, {
        });
      ```
    */
    onMapLayerBeforeExpand() { },

    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.beforeExpand:method"}}
        flexberry-maplayers component's 'beforeCollapse' action{{/crossLink}}.

      @method actions.onMapLayerBeforeCollapse
      @param {Object} e Action's event object.
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes event that triggers node's collapsing.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-maplayers
          name="Tree node"
          beforeCollapse=(action "onMapLayerBeforeCollapse")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayers-actions-handler';

        export default Ember.Controller.extend(FlexberryMaplayerActionsHandlerMixin, {
        });
      ```
    */
    onMapLayerBeforeCollapse() { },

    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.visiblilityChange:method"}}
        flexberry-maplayers component's 'visiblilityChange' action{{/crossLink}}.
      It mutates value of property with given name to value of action's event object 'newValue' property.

      @method actions.onMapLayerVisibilityChange
      @param {String} mutablePropertyPath Path to a property, which value must be mutated on action.
      @param {Object} e Action's event object.
      @param {Object} e.newValue New value for a property, which value must be mutated on action.
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes checkbox input's 'change' event.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-maplayers
          name="Tree node with checkbox"
          visibility=layer.visibility
          changeVisiblility=(action "onMapLayerChangeVisibility" "layer.visibility")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayers-actions-handler';

        export default Ember.Controller.extend(FlexberryMaplayerActionsHandlerMixin, {
        });
      ```
    */
    onMapLayerChangeVisibility(...args) {
      const objectContainingActionHandler = EmberObject.extend(FlexberryDdauCheckboxActionsHandlerMixin).create();
      const actionHandler = objectContainingActionHandler.get('actions.onCheckboxChange');

      actionHandler.apply(this, args);

      // Save changes to local storage.
      const mutablePropertyPath = args[0];
      const e = args[args.length - 1];
      this.mutateStorage('visibility', mutablePropertyPath, e.newValue);
    },

    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.changeOpacity:method"}}
        flexberry-maplayers component's 'changeOpacity' action{{/crossLink}}.
      It mutates value of property with given name to value of action's event object 'newValue' property.

      @method actions.onMapLayerChangeOpacity
      @param {String} mutablePropertyPath Path to a property, which value must be mutated on action.
      @param {Object} e Action's event object.
      @param {Object} e.newValue New value for a property, which value must be mutated on action.
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes checkbox input's 'change' event.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-maplayers
          name="Tree node with slider"
          opacity=layer.options.opacity
          changeOpacity=(action "onMapLayerChangeOpacity" "layer.options.opacity")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayers-actions-handler';

        export default Ember.Controller.extend(FlexberryMaplayerActionsHandlerMixin, {
        });
      ```
    */
    onMapLayerChangeOpacity(...args) {
      const objectContainingActionHandler = EmberObject.extend(FlexberryDdauSliderActionsHandlerMixin).create();
      const actionHandler = objectContainingActionHandler.get('actions.onSliderChange');

      actionHandler.apply(this, args);

      // Save changes to local storage.
      const mutablePropertyPath = args[0];
      const e = args[args.length - 1];
      this.mutateStorage('opacity', mutablePropertyPath, e.newValue);
    },

    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.fitBounds:method"}}flexberry-maplayers component's 'fitBounds' action{{/crossLink}}.
      Fits leaflet map to bounds of selected maplayer.

      @method actions.onMapLayerFitBounds
      @param {String} boundsPropertyPath Path to a property, which value must be used within action.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-maplayers
          name="Tree node fit bounds button"
          opacity=layer.options.opacity
          fitBounds=(action "onMapLayerFitBounds" "layer.options.bounds")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayers-actions-handler';

        export default Ember.Controller.extend(FlexberryMaplayerActionsHandlerMixin, {
        });
      ```
    */
    onMapLayerFitBounds(boundsPropertyPath) {
      const leafletMap = this.get('leafletMap');

      if (leafletMap) {
        let bounds = getRecord(this, boundsPropertyPath);

        const earthBounds = L.latLngBounds([
          [-90, -180],
          [90, 180]
        ]);

        // Check if bounds are valid and are not 'full extent' (earth) bounds.
        if (!bounds.isValid() || bounds.equals(earthBounds)) {
          // Set it to map's bounds.
          bounds = leafletMap.maxBounds;
        }

        // Fit map to bounds.
        leafletMap.fitBounds(bounds && bounds.isValid() ? bounds : earthBounds);
      }
    },

    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.attributesEdit:method"}}
        flexberry-maplayers component's 'attributesEdit' action{{/crossLink}}.
      Opens {{#FlexberryLayersAttributesPanelComponent}}flexberry-layers-attributes-panel component to edit attributes of the selected layer.

      @method actions.onAttributesEdit
      @param {String} layerModelPath Path to a layer model, which value must be used within action.
      @param {Object} attributesPanelSettingsPathes Object containing pathes to properties containing 'flexberry-layers-attributes-panel' settings.
      @param {String} attributesPanelSettingsPathes.itemsPath path to property containing 'flexberry-layers-attributes-panel' items.
      @param {String} attributesPanelSettingsPathes.selectedTabIndexPath path to property containing 'flexberry-layers-attributes-panel' selected tab index.
      @param {String} attributesPanelSettingsPathes.foldedPath path to property containing flag indicating
        whether 'flexberry-layers-attributes-panel' is folded or not.
    */
    onAttributesEdit(layerPath, { itemsPath, selectedTabIndexPath, foldedPath, loadingPath }, readonly) {
      const layerModel = getRecord(this, layerPath);
      const name = get(layerModel, 'name');
      const getAttributesOptions = get(layerModel, '_attributesOptions');

      if (isNone(getAttributesOptions)) {
        return;
      }

      this.set(loadingPath, true);
      if (this.get(foldedPath)) {
        this.set(foldedPath, false);
      }

      getAttributesOptions().then(({ object, settings }) => {
        if (readonly) {
          // флаг readonly может задаваться самим слоем, в настройках слоя.
          // поэтому будем только добавлять запрет на редактирование, если это задано правами.
          // разрешать не будем
          set(settings, 'readonly', readonly);
        }

        const items = this.get(itemsPath) || A();
        const index = items.findIndex((item) => isEqual(item.name, name));
        if (index >= 0) {
          this.set(selectedTabIndexPath, index);
        } else {
          items.addObject({
            name, leafletObject: object, settings, layerModel,
          });
          this.set(itemsPath, items);
          this.set(selectedTabIndexPath, items.length - 1);
        }
      }).catch((errorMessage) => {
        Ember.Logger.error(errorMessage);
      }).finally(() => {
        this.set(loadingPath, false);
      });
    },

    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.onFeatureEdit:method"}}
        flexberry-maplayers component's 'onFeatureEdit' action{{/crossLink}}.
      Opens {{#FlexberryEditLayerFeatureComponent}}flexberry-edit-layer-feature component to edit attributes of the selected layer.

      @method actions.onFeatureEdit
      @param {String} layerModelPath Path to a layer model, which value must be used within action.
      @param {Object} attributesPanelSettingsPathes Object containing pathes to properties containing 'flexberry-layers-attributes-panel' settings.
      @param {String} attributesPanelSettingsPathes.itemsPath path to property containing 'flexberry-layers-attributes-panel' items.
      @param {String} attributesPanelSettingsPathes.selectedTabIndexPath path to property containing 'flexberry-layers-attributes-panel' selected tab index.
      @param {String} attributesPanelSettingsPathes.foldedPath path to property containing flag indicating
        whether 'flexberry-layers-attributes-panel' is folded or not.
    */
    onFeatureEdit(layerPath, { loadingPath, mapAction, }) {
      const layerModel = getRecord(this, layerPath);
      const name = get(layerModel, 'name');
      const getAttributesOptions = get(layerModel, '_attributesOptions');

      if (isNone(getAttributesOptions)) {
        return;
      }

      getAttributesOptions().then(({ object, settings, }) => {
        const fields = get(object, 'readFormat.featureType.fields');
        const data = Object.keys(fields).reduce((result, item) => {
          result[item] = null;
          return result;
        }, {});

        const dataItems = {
          mode: 'Create',
          items: [{
            data,
            layer: null,
          }],
        };

        this.set(loadingPath, true);

        this.send(mapAction, {
          dataItems,
          layerModel: {
            name, leafletObject: object, settings, layerModel,
          },
        });
      }).catch((errorMessage) => {
        Ember.Logger.error(errorMessage);
      }).finally(() => {
        this.set(loadingPath, false);
      });
    },

    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.add:method"}}flexberry-maplayers component's 'add' action{{/crossLink}}.
      It adds new child layer.

      @method actions.onMapLayerAdd
      @param {String} layerPath Path to a parent layers, to which new child layer must be added on action.
      @param {Object} e Action's event object.
      @param {Object} e.layerProperties Object containing properties of new child layer.
      @param {Object} [e.layer] Object containing already created layer model with specified layer properties.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-maplayer
          name="Tree node with checkbox"
          add=(action "onMapLayerAdd" "layers.0")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayers-actions-handler';

        export default Ember.Controller.extend(FlexberryMaplayerActionsHandlerMixin, {
        });
      ```
    */
    onMapLayerAdd(...args) {
      const rootPath = 'model.mapLayer';

      const primaryParentLayerPath = args[0];
      assert(
        `Wrong type of \`parentLayerPath\` argument: actual type is \`${typeOf(primaryParentLayerPath)}\`, `
        + 'but `string` is expected',
        typeOf(primaryParentLayerPath) === 'string'
      );

      const secondaryParentLayerPath = primaryParentLayerPath.indexOf('hierarchy') !== -1 ? 'model.otherLayers' : 'model.hierarchy';
      const backgroundLayerPath = 'model.backgroundLayers';

      const {
        layerProperties,
        layer,
      } = args[args.length - 1];
      assert(
        `Wrong type of \`layerProperties\` property: actual type is \`${typeOf(layerProperties)}\`, `
        + 'but `object` or  `instance` is expected',
        typeOf(layerProperties) === 'object' || typeOf(layerProperties) === 'instance'
      );

      const primaryParentLayer = getRecord(this, primaryParentLayerPath);
      assert(
        `Wrong type of \`parentLayer\` property: actual type is \`${typeOf(primaryParentLayer)}\`, `
        + 'but `array` or `object` or  `instance` is expected',
        isArray(primaryParentLayer) || typeOf(primaryParentLayer) === 'object' || typeOf(primaryParentLayer) === 'instance'
      );

      const secondaryParentLayer = getRecord(this, secondaryParentLayerPath);
      const backgroundLayer = getRecord(this, backgroundLayerPath);

      let primaryChildLayers = isArray(primaryParentLayer) ? primaryParentLayer : get(primaryParentLayer, 'layers');
      if (isNone(primaryChildLayers)) {
        primaryChildLayers = A();
        set(primaryParentLayer, 'layers', primaryChildLayers);
      }

      assert(
        `Wrong type of \`parentLayer.layers\` property: actual type is \`${typeOf(primaryChildLayers)}\`, `
        + 'but `Ember.NativeArray` is expected',
        isArray(primaryChildLayers) && typeOf(primaryChildLayers.pushObject) === 'function'
      );

      let childLayer;
      if (isNone(layer)) {
        childLayer = this.createLayer({ parentLayer: primaryParentLayer, layerProperties, });
      } else {
        layer.setProperties(layerProperties);
        childLayer = layer;
      }

      if (get(childLayer, 'type') === 'group' && !isArray(get(childLayer, 'layers'))) {
        set(childLayer, 'layers', A());
      }

      const canBeBackground = childLayer.get('settingsAsObject.backgroundSettings.canBeBackground');

      if (canBeBackground) {
        if (primaryParentLayerPath.indexOf('hierarchy') !== -1) {
          primaryChildLayers.pushObject(childLayer);
        } else {
          secondaryParentLayer.pushObject(childLayer);
        }

        if (!isNone(backgroundLayer)) {
          backgroundLayer.pushObject(childLayer);
        }
      } else {
        primaryChildLayers.pushObject(childLayer);
        if (!isNone(secondaryParentLayer)) {
          secondaryParentLayer.pushObject(childLayer);
        }
      }

      const rootArray = this.get(rootPath);
      rootArray.pushObject(childLayer);

      setIndexes(rootArray, this.get('model.hierarchy'));
    },

    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.copy:method"}}flexberry-maplayers component's 'copy' action{{/crossLink}}.
      It adds new child layer.

      @method actions.onMapLayerAdd
      @param {String} layerPath Path to a copied layer.
      @param {Object} e Action's event object.
      @param {Object} e.layerProperties Object containing properties of copied layer.
      @param {Object} e.layer Object containing copied layer model.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-maplayer
          name="Tree node with checkbox"
          add=(action "onMapLayerCopy" "layers.0")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayers-actions-handler';

        export default Ember.Controller.extend(FlexberryMaplayerActionsHandlerMixin, {
        });
      ```
    */
    onMapLayerCopy(...args) {
      this.send('onMapLayerAdd', ...args);
    },

    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.edit:method"}}flexberry-maplayers component's 'edit' action{{/crossLink}}.
      It edits existing layer.

      @method actions.onMapLayerEdit
      @param {String} layerPath Path to a layer, which must be edited on action.
      @param {Object} e Action's event object.
      @param {Object} e.layerProperties Object containing edited layer properties, which must be merged to layer on action.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-maplayer
          name="Tree node with checkbox"
          edit=(action "onMapLayerEdit" "layers.0")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayers-actions-handler';

        export default Ember.Controller.extend(FlexberryMaplayerActionsHandlerMixin, {
        });
      ```
    */
    onMapLayerEdit(...args) {
      const layerPath = args[0];
      assert(
        `Wrong type of \`layerPath\` argument: actual type is \`${typeOf(layerPath)}\`, `
        + 'but `string` is expected',
        typeOf(layerPath) === 'string'
      );

      const {
        layerProperties,
      } = args[args.length - 1];
      assert(
        `Wrong type of \`layerProperties\` property: actual type is \`${typeOf(layerProperties)}\`, `
        + 'but `object` or  `instance` is expected',
        typeOf(layerProperties) === 'object' || typeOf(layerProperties) === 'instance'
      );

      const layer = getRecord(this, layerPath);
      assert(
        `Wrong type of \`layer\` property: actual type is \`${typeOf(layer)}\`, `
        + 'but `object` or  `instance` is expected',
        typeOf(layer) === 'object' || typeOf(layer) === 'instance'
      );

      this.editLayer({
        layer,
        layerProperties,
      });
    },

    /**
      Handles {{#crossLink "FlexberryMaplayerComponent/sendingActions.remove:method"}}flexberry-maplayers component's 'remove' action{{/crossLink}}.
      It removes specified layer.

      @method actions.onMapLayerRemove
      @param {String} layerPath Path to a layer, which must be removed on action.
      @param {Object} e Action's event object.

      @example
      templates/my-form.hbs
      ```handlebars
        {{flexberry-maplayer
          name="Tree node with checkbox"
          remove=(action "onMapLayerRemove" "layers.0")
        }}
      ```

      controllers/my-form.js
      ```javascript
        import Ember from 'ember';
        import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayers-actions-handler';

        export default Ember.Controller.extend(FlexberryMaplayerActionsHandlerMixin, {
        });
      ```
    */
    onMapLayerRemove(...args) {
      const rootPath = 'model.mapLayer';
      const layerPath = args[0];
      assert(
        `Wrong type of \`layerPath\` argument: actual type is \`${typeOf(layerPath)}\`, `
        + 'but `string` is expected',
        typeOf(layerPath) === 'string'
      );

      const layer = getRecord(this, layerPath);
      assert(
        `Wrong type of \`layer\` property: actual type is \`${typeOf(layer)}\`, `
        + 'but `object` or  `instance` is expected',
        typeOf(layer) === 'object' || typeOf(layer) === 'instance'
      );

      this.removeLayer({
        layer,
      });

      const rootArray = this.get(rootPath);

      setIndexes(rootArray, this.get('model.hierarchy'));
    },
  },

  /**
    Creates new layer as specified layer's child.

    @method createLayer
    @param {Object} options Method options.
    @param {String} options.parentLayer Parent layer.
    @param {Object} options.layerProperties Object containing new layer properties.
    @returns {Object} Created layer.
    @private
  */
  createLayer(options) {
    options = options || {};
    const layerProperties = get(options, 'layerProperties');

    return layerProperties;
  },

  /**
    Updates specified layer in hierarchy with given properties.

    @method editLayer
    @param {Object} options Method options.
    @param {String} options.layer Editing layer.
    @param {Object} options.layerProperties Object containing edited layer properties.
    @returns {Object} Edited layer.
    @private
  */
  editLayer(options) {
    options = options || {};
    const layerProperties = get(options, 'layerProperties');
    const layer = get(options, 'layer');
    layer.setProperties(layerProperties);

    return layer;
  },

  /**
    Removes specified layer from layers hierarchy.

    @method removeLayer
    @param {Object} options Method options.
    @param {String} options.layer Removing layer itself.
    @returns {Object} Removed layer.
    @private
  */
  removeLayer(options) {
    options = options || {};
    const layer = get(options, 'layer');

    const childLayers = get(layer, 'layers');

    if (isArray(childLayers)) {
      childLayers.forEach((item) => {
        this.removeLayer({
          layer: item,
        });
      }, this);
    }

    set(layer, 'isDeleted', true);
    return layer;
  },
});
