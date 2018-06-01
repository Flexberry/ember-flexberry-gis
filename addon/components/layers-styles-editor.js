/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/layers-styles-editor';

/**
  Component containing GUI for layers-styles editor.

  @class LayersStylesEditorComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Method returning related leaflet layer.

    @property leafletLayer
    @type Function
    @default null
  */
  getLeafletLayer: null,

  /**
    Flag: indicates whether leaflet layer is loading now.

    @property _leafletLayerIsLoading
    @type Boolean
    @default false
    @private
  */
  _leafletLayerIsLoading: false,

  /**
    Flag: indicates leaflet layer loading error.

    @property _leafletLayerLoadingIsError
    @type Boolean
    @default false
    @private
  */
  _leafletLayerLoadingIsError: false,

  /**
    Flag: indicates that style-editor is checked on flexberry-edit-layermap
    and leaflet layer must be load.

    @property layerLoaderIsReady
    @type Boolean
    @default false
    @private
  */
  layerLoaderIsReady: false,

  /**
    Related leaflet layer.

    @property _leafletLayer
    @type <a href="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>
    @default null
    @private
  */
  _leafletLayer: null,

  /**
    Component's wrapping <div> CSS-classes names.

    @property classNames
    @type String[]
    @default ['layers-styles-editor']
  */
  classNames: ['layers-styles-editor'],

  /**
    Hash containing style settings.

    @property styleSettings
    @type Object
    @default null
  */
  styleSettings: null,

  /**
    Hash containing layer display settings.

    @property displaySettings
    @type Object
    @default null
  */
  displaySettings: null,

  /**
    Related layer's type.

    @property layerType
    @type String
    @default null
  */
  layerType: null,

  _layerLoader: Ember.on('init', Ember.observer('layerLoaderIsReady', function () {
    Ember.run.once(this, '_loadLeafletLayer');
  })),

  _loadLeafletLayer() {
    this.set('_leafletLayerLoadingIsError', false);
    if (this.get('layerLoaderIsReady')) {
      this._getLeafletLayer().then((leafletLayer) => {
        this.set('_leafletLayer', leafletLayer);
      });
    }
  },

  /**
    Method returning promise which will be then resolved with leaflet layer (just loaded or already cached).

    @method _getLeafletLayer
    @private
    @return {<a href="https://emberjs.com/api/ember/2.4/classes/RSVP.Promise">Ember.RSVP.Promise</a>}
    Promise which will be then resolved with leaflet layer (just loaded or already cached).
  */
  _getLeafletLayer() {
    return new Ember.RSVP.Promise((resolve, reject) => {
      let leafletLayer = this.get('_leafletLayer');
      if (!Ember.isNone(leafletLayer)) {
        resolve(leafletLayer);
        return;
      }

      let getLeafletLayer = this.get('getLeafletLayer');
      if (typeof getLeafletLayer !== 'function') {
        reject('Property \'getLeafletLayer\' isn\'t a function');
        return;
      }

      this.set('_leafletLayerIsLoading', true);
      getLeafletLayer().then((leafletLayer) => {
        this.set('_leafletLayer', leafletLayer);
        resolve(leafletLayer);
      }).catch((e) => {
        this.set('_leafletLayerLoadingIsError', true);
        this.set('_leafletLayerIsLoading', false);
        reject(e);
      }).finally(() => {
        this.set('_leafletLayerIsLoading', false);
      });
    });
  },

  /**
    Reference to 'layers-styles-renderer' service.

    @property _layersStylesRenderer
    @type LayersStylesRendererService
    @private
  */
  _layersStylesRenderer: Ember.inject.service('layers-styles-renderer'),

  /**
    Available layer styles.
    Initializes in component's 'init' method.

    @property _availableLayerStyles
    @type Object[]
    @default null
    @private
  */
  _availableLayerStyles: null,

  /**
    Available layer styles captions.

    @property _availableLayerStylesCaptions
    @type String[]
    @readonly
  */
  _availableLayerStylesCaptions: Ember.computed('_availableLayerStyles', 'i18n.locale', function() {
    let availableLayerStyles = this.get('_availableLayerStyles');

    let layerStylesCaptions = Ember.A();
    if (Ember.isArray(availableLayerStyles) && availableLayerStyles.length > 0) {
      let i18n = this.get('i18n');
      layerStylesCaptions.pushObjects(availableLayerStyles.map((layerStyle) => {
        return i18n.t(`layers-styles.${layerStyle}.caption`);
      }));
    }

    return layerStylesCaptions;
  }),

  /**
    Selected layer style caption.

    @property _selectedLayerStyleCaption
    @type String
    @default null
    @private
  */
  _selectedLayerStyleCaption: null,

  /**
    Observes changes in '_availableLayerStylesCaptions' or '_layer.settings.styleSettings.type' and computes '_selectedLayerStyleCaption'.

    @method _availableLayerStylesCaptionsOrSelectedLayerStyleDidChange
    @private
  */
  _availableLayerStylesCaptionsOrSelectedLayerStyleDidChange: Ember.observer(
    '_availableLayerStylesCaptions.[]',
    'styleSettings.type',
    function() {
      let availableLayerStyles = this.get('_availableLayerStyles');
      let selectedLayerStyle = this.get('styleSettings.type');
      let selectedLayerStyleIndex = availableLayerStyles.findIndex((layerStyle) => {
        return selectedLayerStyle === layerStyle;
      });

      if (selectedLayerStyleIndex >= 0) {
        let layerStylesCaptions = this.get('_availableLayerStylesCaptions');
        this.set('_selectedLayerStyleCaption', layerStylesCaptions.objectAt(selectedLayerStyleIndex));
      }
    }
  ),

  /**
    Observes changes in '_selectedLayerStyleCaption' property and changes style type in related layer settings hash.

    @method _selectedLayerStyleCaptionDidChange
    @private
  */
  _selectedLayerStyleCaptionDidChange: Ember.observer('_selectedLayerStyleCaption', function () {
    Ember.run.once(this, '_setSelectedLayerStyle');
  }),

  /**
    Sets selected layer style by its i18n-ed caption.

    @method _setSelectedLayerStyle
    @private
  */
  _setSelectedLayerStyle() {
    let availableLayerStyles = this.get('_availableLayerStyles');
    let availableLayerStylesCaptions = this.get('_availableLayerStylesCaptions');
    let selectedLayerStyleCaption = this.get('_selectedLayerStyleCaption');

    if (!Ember.isArray(availableLayerStyles) || !Ember.isArray(availableLayerStylesCaptions) || Ember.isBlank(selectedLayerStyleCaption)) {
      return null;
    }

    let selectedLayerStyleIndex = availableLayerStylesCaptions.findIndex((layerStylesCaption) => {
      return layerStylesCaption.toString() === selectedLayerStyleCaption.toString();
    });

    let selectedLayerStyle = selectedLayerStyleIndex > -1 ?
      availableLayerStyles.objectAt(selectedLayerStyleIndex) :
      null;

    this.set('styleSettings.type', selectedLayerStyle);
  },

  /**
    Observes changes in '_layer.settings.styleSettings.type' and computes default style setings.

    @method _selectedLayerStyleDidChange
    @private
  */
  _selectedLayerStyleDidChange: Ember.observer('styleSettings.type', function() {
    Ember.run.once(this, '_setSelectedLayerStyleDefaultSettings');
  }),

  /**
    Previosly selected layer style.

    @property _previouslySelectedLayerStyle
    @type string
    @private
  */
  _previouslySelectedLayerStyle: null,

  /**
    Sets default style settings withrespect to '_layer.settings.styleSettings.type'.

    @method _setSelectedLayerStyleDefaultSettings
    @private
  */
  _setSelectedLayerStyleDefaultSettings() {
    let previouslySelectedLayerStyle = this.get('_previouslySelectedLayerStyle');
    let selectedLayerStyle = this.get('styleSettings.type');
    if (Ember.isBlank(selectedLayerStyle) || previouslySelectedLayerStyle === selectedLayerStyle) {
      return;
    }

    this.set('styleSettings', this.get('_layersStylesRenderer').getDefaultStyleSettings(selectedLayerStyle));
    this.set('_previouslySelectedLayerStyle', selectedLayerStyle);
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    // Initialize available layers-styles and related properties.
    this.set('_previouslySelectedLayerStyle', this.get('styleSettings.type'));
    this.set('_availableLayerStyles', this.get('_layersStylesRenderer').getAvailableLayerStylesTypes());
    this._availableLayerStylesCaptionsOrSelectedLayerStyleDidChange();
  },

  /**
    Deinitializes component's DOM-related properties.
  */
  willDestroyElement() {
    this.set('_leafletLayer', null);

    this._super(...arguments);
  }
});
