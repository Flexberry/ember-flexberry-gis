import Ember from 'ember';
import RequiredActionsMixin from 'ember-flexberry/mixins/required-actions';
import DynamicActionsMixin from 'ember-flexberry/mixins/dynamic-actions';
import DynamicPropertiesMixin from '../mixins/dynamic-properties';
import layout from '../templates/components/flexberry-edit-layermap';
import { getBounds } from 'ember-flexberry-gis/utils/get-bounds-from-polygon';
import {
  translationMacro as t
} from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-edit-layer-dialog').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name (null, because component is tagless).
  @readonly
  @static

  @for FlexberryEditLayerDialogComponent
*/
const flexberryClassNamesPrefix = 'flexberry-edit-layermap';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null
};

export default Ember.Component.extend(
  RequiredActionsMixin,
  DynamicActionsMixin,
  DynamicPropertiesMixin, {
    /**
      Reference to component's CSS-classes names.
      Must be also a component's instance property to be available from component's .hbs template.
    */
    flexberryClassNames,

    /**
      Reference to component's template.
    */
    layout,

    /**
      Overridden ['tagName'](http://emberjs.com/api/classes/Ember.Component.html#property_tagName)
      is empty to disable component's wrapping <div>.

      @property tagName
      @type String
      @default ''
    */
    tagName: '',

    /**
      Component's additional CSS-class names.

      @property class
      @type String
      @default null
    */
    class: null,

    /**
      Flag: indicates whether layer type is in readonly mode.

      @property _typeIsReadonly
      @type Boolean
      @default true
      @private
    */
    _typeIsReadonly: false,

    /**
      Hash containing editing layer.

      @property layer
      @type Object
      @default null
    */
    layer: null,

    /**
      Flag: indicates whether dialog is visible or not.
      If true, then dialog will be shown, otherwise dialog will be closed.

      @property visible
      @type Boolean
      @default false
    */
    visible: true,

    /**
      Array containing available layers types.

      @property _availableTypes
      @type String[]
      @default null
      @private
    */
    _availableTypes: null,

    /**
      Inner hash containing editing layer.

      @property layer
      @type Object
      @default null
    */
    _layer: null,

    /**
      Inner hash containing type-related settings mapped by available layer types.

      @property _settings
      @type Object
      @default null
      @private
    */
    _settings: null,

    /**
      Inner hash containing coordinate reference systems settings mapped by available codes.

      @property _coordinateReferenceSystems
      @type Object
      @default null
      @private
    */
    _coordinateReferenceSystems: null,

    /**
      Tabular menu state.

      @property _tabularMenuState
      @type Object
      @private
    */
    _tabularMenuState: null,

    /**
      Leaflet layer related to layer model.

      @property _leafletObject
      @type <a href="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>
      @private
    */
    _leafletObject: null,

    /**
      Leaflet map.

      @property leafletMap
      @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
      @default null
    */
    leafletMap: null,

    /**
      Layer's links.

      @property links
      @type Array
      @default null
    */
    links: null,

    /**
      Layer's links property path.

      @property linksPropertyPath
      @type String
      @default ''
    */
    linksPropertyPath: '',

    /**
      Dialog's 'Links' segment caption.

      @property linksCaption
      @type String
      @default t('components.layers-dialogs.edit.links.caption')
    */
    linksCaption: t('components.layers-dialogs.edit.links.caption'),

    /**
      Layer's links' parameters model name.

      @property parametersModelName
      @type String
      @default ''
    */
    parametersModelName: '',

    /**
      Layer's links' parameters model projection.

      @property parametersModelProjection
      @type String
      @default ''
    */
    parametersModelProjection: '',

    /**
      Available modes.
      Initializes in component's 'init' method.

      @property _availableModes
      @type Object[]
      @default null
      @private
    */
    _availableModes: null,

    /**
      Flag: indicates whether 'main-group' of settings is available for the selected layer type.

      @property mainGroupIsAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _mainGroupIsAvailableForType: Ember.computed(
      '_mainSettingsAreAvailableForType',
      '_crsSettingsAreAvailableForType',
      '_layerSettingsAreAvailableForType',
      '_bboxSettingsAreAvailableForType',
      '_pmodesAreAvailableForType',
      '_loadFileAreAvailableForType',
      function () {
        // Group is available when at least one of it's tab is available.
        return this.get('_mainSettingsAreAvailableForType') ||
          this.get('_crsSettingsAreAvailableForType') ||
          this.get('_layerSettingsAreAvailableForType') ||
          this.get('_bboxSettingsAreAvailableForType') ||
          this.get('_pmodesAreAvailableForType') ||
          this.get('_loadFileAreAvailableForType');
      }
    ),

    /**
      Flag: indicates whether scale settings are available for the selected layer type.

      @property _scaleSettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _mainSettingsAreAvailableForType: Ember.computed('_layer.type', function () {
      return true;
    }),
    /**
      Flag: indicates whether CRS is available for the selected layer type.

      @property _crsSettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _crsSettingsAreAvailableForType: Ember.computed('_layer.type', function () {
      let className = this.get('_layer.type');

      return Ember.getOwner(this).isKnownNameForType('layer', className) && className !== 'group';
    }),

    /**
      Flag: indicates whether type-related settings are available for the selected layer type.

      @property _layerSettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _layerSettingsAreAvailableForType: Ember.computed('_layer.type', function () {
      let className = this.get('_layer.type');

      return Ember.getOwner(this).isKnownNameForType('layer', className) && className !== 'group';
    }),

    /**
      Flag: indicates whether prototyping modes are available.

      @property _pmodesAreAvailableForType
      @type Boolean
      @readonly
    */
    _pmodesAreAvailableForType: Ember.computed('_availableModes', '_typeIsReadonly', function () {
      let newLayerIsExpectedToBeCreated = !this.get('_typeIsReadonly');
      let _availableModes = this.get('_availableModes');

      return newLayerIsExpectedToBeCreated && Ember.isArray(_availableModes) && !Ember.isBlank(_availableModes);
    }),

    /**
      Flag: indicates whether load file modes are available.

      @property _loadFileAreAvailableForType
      @type Boolean
      @readonly
    */
    _loadFileAreAvailableForType: Ember.computed('_layer.type', '_typeIsReadonly', function () {
      let className = this.get('_layer.type');
      let newLayerIsExpectedToBeCreated = !this.get('_typeIsReadonly');

      return Ember.getOwner(this).isKnownNameForType('layer', className) && className === 'wms' && newLayerIsExpectedToBeCreated;
    }),

    /**
      Flag: indicates whether bbox settings are available for the selected layer type.

      @property _bboxSettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _bboxSettingsAreAvailableForType: Ember.computed('_layer.type', function () {
      return true;
    }),

    /**
      Flag: indicates whether 'display-group' of settings is available for the selected layer type.

      @property _displayGroupIsAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _displayGroupIsAvailableForType:Ember.computed(
      '_displaySettingsAreAvailableForType',
      '_identifySettingsAreAvailableForType',
      '_searchSettingsAreAvailableForType',
      '_legendSettingsAreAvailableForType',
      '_filterSettingsAreAvailableForType',
      '_styleSettingsAreAvailableForType',
      '_labelsSettingsAreAvailableForType',
      function () {
        // Group is available when at least one of it's tab is available.
        return this.get('_displaySettingsAreAvailableForType') ||
          this.get('_identifySettingsAreAvailableForType') ||
          this.get('_searchSettingsAreAvailableForType') ||
          this.get('_legendSettingsAreAvailableForType') ||
          this.get('_filterSettingsAreAvailableForType') ||
          this.get('_styleSettingsAreAvailableForType') ||
          this.get('_labelsSettingsAreAvailableForType');
      }
    ),

    /**
      Flag: indicates whether 'display' operation settings are available for the selected layer type.

      @property _displaySettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _displaySettingsAreAvailableForType: Ember.computed('_layer.type', function () {
      let className = this.get('_layer.type');

      return Ember.getOwner(this).isKnownNameForType('layer', className) && className !== 'group';
    }),

    /**
      Flag: indicates whether 'identify' operation settings are available for the selected layer type.

      @property _identifySettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _identifySettingsAreAvailableForType: Ember.computed('_layer.type', function () {
      let className = this.get('_layer.type');
      let layerClass = Ember.isNone(className) ?
        null :
        Ember.getOwner(this).knownForType('layer', className);

      return !Ember.isNone(layerClass) && Ember.A(Ember.get(layerClass, 'operations') || []).contains('identify');
    }),

    /**
      Flag: indicates whether 'search' operation settings are available for the selected layer type.

      @property _searchSettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _searchSettingsAreAvailableForType: Ember.computed('_layer.type', function () {
      let className = this.get('_layer.type');
      let layerClass = Ember.isNone(className) ?
        null :
        Ember.getOwner(this).knownForType('layer', className);

      return !Ember.isNone(layerClass) && Ember.A(Ember.get(layerClass, 'operations') || []).contains('search');
    }),

    /**
      Flag: indicates whether 'legend' operation settings are available for the selected layer type.

      @property _legendSettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _legendSettingsAreAvailableForType: Ember.computed('_layer.type', function () {
      let className = this.get('_layer.type');
      let layerClass = Ember.isNone(className) ?
        null :
        Ember.getOwner(this).knownForType('layer', className);

      return !Ember.isNone(layerClass) && Ember.A(Ember.get(layerClass, 'operations') || []).contains('legend');
    }),

    /**
      Flag: indicates whether 'filter' operation settings are available for the selected layer type. TODO!

      @property _filterSettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _filterSettingsAreAvailableForType: Ember.computed('_layer.type', function () {
      let className = this.get('_layer.type');
      let layerClass = Ember.isNone(className) ?
        null :
        Ember.getOwner(this).knownForType('layer', className);

      return !Ember.isNone(layerClass) && Ember.A(Ember.get(layerClass, 'operations') || []).contains('filter');
    }),

    /**
      Flag: indicates whether 'style' settings are available for the selected layer type.

      @property _styleSettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _styleSettingsAreAvailableForType: Ember.computed('_layer.type', function () {
      let className = this.get('_layer.type');
      let layerClass = Ember.isNone(className) ?
        null :
        Ember.getOwner(this).knownForType('layer', className);

      // Style settings are available only for vector layers.
      return !Ember.isNone(layerClass) && layerClass.isVectorType(this.get('layer'));
    }),

    /**
      Flag: indicates whether 'display labels' operation settings are available for the selected layer type.

      @property _labelsSettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _labelsSettingsAreAvailableForType: Ember.computed('_layer.type', function () {
      let className = this.get('_layer.type');

      return Ember.getOwner(this).isKnownNameForType('layer', className) && className !== 'group';
    }),

    /**
      Flag: indicates whether 'links-group' of settings is available for the selected layer type.

      @property _linksGroupIsAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _linksGroupIsAvailableForType: Ember.computed(
      '_linksSettingsAreAvailableForType',
      function () {
        // Group is available when at least one of it's tab is available.
        return this.get('_linksSettingsAreAvailableForType');
      }
    ),

    /**
      Flag: indicates whether layer links settings are available for the selected layer type.

      @property _linksSettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _linksSettingsAreAvailableForType: Ember.computed('_layer.type', function () {
      let className = this.get('_layer.type');

      return Ember.getOwner(this).isKnownNameForType('layer', className) && className !== 'group';
    }),

    /**
      Selected mode.

      @property _selectedModeCaption
      @type String
      @default null
      @private
    */
    _selectedModeCaption: null,

    actions: {

      /**
        Handles clicks on groups.

        @method actions.onGroupClick
        @param {Object} e Click event object.
      */
      onGroupClick(e) {
        e = Ember.$.event.fix(e);

        let $clickedGroup = Ember.$(e.currentTarget);
        let clickedGroupName = $clickedGroup.attr('data-tab');
        this.set('_tabularMenuState.activeGroup', clickedGroupName);
      },

      /**
        Handles {{#crossLink "FlexberryLinksEditorComponent/sendingActions.remove:method"}}'flexberry-links-editor' component's 'remove' action{{/crossLink}}.

        @method actions.removeLayerLink
        @param {Object} model Ember Model to be removed.
      */
      removeLayerLink(model) {
        this.sendAction('removeLayerLink', model);
      },

      /**
        Add new layer link model to relation.

        @method actions.addLayerLink
      */
      addLayerLink() {
        this.sendAction('addLayerLink');
      },

      /**
        Handles {{#crossLink "FlexberryLinksEditorComponent/sendingActions.changeVisibility:method"}}'flexberry-links-editor' component's 'changeVisibility' action{{/crossLink}}.

        @method actions.allowShowCheckboxChange
        @param {Object} e eventObject Event object from {{#crossLink "FlexberryLinksEditorComponent/sendingActions.changeVisibility:method"}}'flexberry-links-editor' component's 'changeVisibility' action{{/crossLink}}.
      */
      allowShowCheckboxChange(...args) {
        this.sendAction('allowShowLayerLinkCheckboxChange', ...args);
      },

      /**
        Handles {{#crossLink "BaseEditModeComponent/sendingActions.editingFinished:method"}}'base-layers-prototyping-mode' components 'editingFinished' action {{/crossLink}}.

        @method actions.onEditingFinished
        @param {Object} layer Prototype layer model.
      */
      onEditingFinished(layer) {
        this.set('layer', layer);
        this._createInnerLayer();
      },

      /**
        Handles onUploadFile.

        @method actions.onUploadFile
      */
      onUploadFile(file) {
        this.sendAction('onUploadFile', file);
      }
    },

    /**
      Creates inner hash containing layer settings for different layer types.

      @method _createInnerSettings
      @private
    */
    _createInnerSettings() {
      let settings = {};
      Ember.A(this.get('_availableTypes') || []).forEach((type) => {
        let layerClassFactory = Ember.getOwner(this).knownForType('layer', type);
        settings[type] = layerClassFactory.createSettings();
      });

      this.set('_settings', settings);
    },

    /**
      Destroys inner hash containing layer settings.

      @method _destroyInnerSettings
      @private
    */
    _destroyInnerSettings() {
      this.set('_settings', null);
    },

    /**
      Creates inner hash containing layer copy.

      @method _createInnerLayer
      @private
    */
    _createInnerLayer() {
      let type = this.get('layer.type');
      let name = this.get('layer.name');
      let scale = this.get('layer.scale');
      let description = this.get('layer.description');
      let keyWords = this.get('layer.keyWords');
      let boundingBox = this.get('layer.boundingBox');
      let leafletObjectGetter = this.get('layer.leafletObjectGetter');
      let bounds = getBounds(boundingBox);

      let crs = this.get('layer.coordinateReferenceSystem');
      crs = Ember.isNone(crs) ? {} : JSON.parse(crs);

      let settings = this.get('layer.settings');
      let defaultSettings = Ember.isNone(type) ? {} : Ember.getOwner(this).knownForType('layer', type).createSettings();
      if (!Ember.isNone(settings)) {
        settings = Ember.$.extend(true, defaultSettings, JSON.parse(settings));
      } else if (!Ember.isNone(type)) {
        settings = defaultSettings;
      }

      this._createInnerSettings();
      if (!Ember.isNone(settings)) {
        this.set(`_settings.${type}`, settings);
      }

      this.set('_layer', {
        type: type,
        name: name,
        scale: scale,
        description: description,
        keyWords: keyWords,
        coordinateReferenceSystem: crs,
        settings: settings,
        boundingBox: boundingBox,
        bboxCoords: {
          minLat: bounds.minLat,
          minLng: bounds.minLng,
          maxLat: bounds.maxLat,
          maxLng: bounds.maxLng,
        },
        leafletObjectGetter: leafletObjectGetter
      });
    },

    /**
      Destroys inner hash containing layer copy.

      @method _destroyInnerLayer
      @private
    */
    _destroyInnerLayer() {
      this.set('_layer', null);
      let i18n = this.get('i18n');
      this.set('_selectedModeCaption', i18n.t('components.layers-dialogs.layers-prototyping-modes.new'));
      this._destroyInnerSettings();
    },

    /**
      Observes visibility changes & creates/destroys inner hash containing layer copy.

      @method _visibleDidChange
      @private
    */
    _visibleDidChange: Ember.on('init', Ember.observer('visible', function () {
      if (this.get('visible') || this.get('visible') === undefined) {
        this.set('_hideBbox', false);
        this._createInnerLayer();
      } else {
        this.set('_hideBbox', true);
        this.set('_tabularMenuState.activeGroup', 'main-group');
        this.set('_tabularMenuState.groups.main-group.activeTab', 'main-tab');
        this._destroyInnerLayer();
      }
    })),

    /**
      Observes type changes & changes link to object containing type-related settings.

      @method _innerLayerTypeDidChange
      @private
    */
    _innerLayerTypeDidChange: Ember.observer('_layer.type', function () {
      if (Ember.isNone(this.get('_layer'))) {
        return;
      }

      let type = this.get('_layer.type');
      this.set('_layer.settings', this.get(`_settings.${type}`));
    }),

    /**
      Initializes component.
    */
    init() {
      this._super(...arguments);

      if (Ember.isNone(this.get('links'))) {
        this.set('links', Ember.A());
      }

      this.set('_tabularMenuState', {
        activeGroup: 'main-group',
        groups: {
          'main-group': {
            activeTab: 'main-tab'
          },
          'display-group': {
            activeTab: 'display-tab'
          },
          'links-group': {
            activeTab: 'links-tab'
          }
        }
      });

      let owner = Ember.getOwner(this);

      // Initialize available layers types for related dropdown.
      this.set('_availableTypes', owner.knownNamesForType('layer'));

      // Initialize available edit modes.
      let availableEditModes = Ember.A();
      let editModesNames = owner.knownNamesForType('layers-prototyping-mode');
      editModesNames.forEach((modeName) => {
        let editMode = owner.knownForType('layers-prototyping-mode', modeName).create();
        let isAvailable = editMode.componentCanBeInserted(this);
        if (isAvailable) {
          availableEditModes.pushObject(editMode);
        }
      });
      this.set('_availableModes', availableEditModes);

      let i18n = this.get('i18n');
      this.set('_selectedModeCaption', i18n.t('components.layers-dialogs.layers-prototyping-modes.new'));

      this.sendAction('onInit', this.getLayerProperties.bind(this));
    },

    /**
      Applies data from controls to layer hash.

      @method getLayerProperties
    */
    getLayerProperties() {
      // Inner layer hash.
      let layer = this.get('_layer');

      // Layer hash to send.
      let _layerHash = Ember.$.extend(true, {}, layer);

      let coordinateReferenceSystem = Ember.get(_layerHash, 'coordinateReferenceSystem');
      coordinateReferenceSystem = Ember.$.isEmptyObject(coordinateReferenceSystem) ? null : JSON.stringify(coordinateReferenceSystem);
      Ember.set(_layerHash, 'coordinateReferenceSystem', coordinateReferenceSystem);

      let settings = Ember.get(_layerHash, 'settings');

      Object.keys(settings).map(function(key) {
        if (key === 'minZoom' || key  === 'maxZoom') {
          let value = Ember.get(settings, key);
          let parsedValue = parseInt(value);
          if (!isNaN(parsedValue)) {
            Ember.set(settings, key, parsedValue);
          }
        }
      });

      if (Ember.get(settings, 'filter') instanceof Element) {
        Ember.set(settings, 'filter', L.XmlUtil.serializeXmlToString(Ember.get(settings, 'filter')));
      }

      settings = Ember.$.isEmptyObject(settings) ? null : JSON.stringify(settings);

      Ember.set(_layerHash, 'settings', settings);

      return _layerHash;
    }

    /**
      Component's action invoking init hook is finished.
      Provides binding for {{#crossLink "FlexberryEditLayerComponent/sendingActions.onInit:method"}}'flexberry-edit-layer' component's 'getLayerProperties' method{{/crossLink}}.

      @method sendingActions.onInit
    */

    /**
      Component's action invoking to remove model from store.

      @method sendingActions.removeLayerLink
      @param {Object} model Ember Model to be removed.
      {{#crossLink "FlexberryLinksEditorComponent/sendingActions.remove:method"}}flexberry-links-editor 'remove' action{{/crossLink}}.
    */

    /**
      Component's action invoking to add model to store.

      @method sendingActions.addLayerLink
    */
  });

Ember.Component.reopenClass({
  flexberryClassNames
});
