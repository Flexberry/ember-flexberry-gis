import $ from 'jquery';
import { isBlank, isNone } from '@ember/utils';
import { isArray, A } from '@ember/array';
import { getOwner } from '@ember/application';
import {
  computed, get, observer, set
} from '@ember/object';
import Component from '@ember/component';
import RequiredActionsMixin from 'ember-flexberry/mixins/required-actions';
import DynamicActionsMixin from 'ember-flexberry/mixins/dynamic-actions';
import { getBounds } from 'ember-flexberry-gis/utils/get-bounds-from-polygon';
import {
  translationMacro as t
} from 'ember-i18n';
import DynamicPropertiesMixin from '../mixins/dynamic-properties';
import layout from '../templates/components/flexberry-edit-layermap';

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
  wrapper: null,
};

export default Component.extend(
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
    _mainGroupIsAvailableForType: computed(
      '_mainSettingsAreAvailableForType',
      '_crsSettingsAreAvailableForType',
      '_layerSettingsAreAvailableForType',
      '_bboxSettingsAreAvailableForType',
      '_pmodesAreAvailableForType',
      '_loadFileAreAvailableForType',
      function () {
        // Group is available when at least one of it's tab is available.
        return this.get('_mainSettingsAreAvailableForType')
          || this.get('_crsSettingsAreAvailableForType')
          || this.get('_layerSettingsAreAvailableForType')
          || this.get('_bboxSettingsAreAvailableForType')
          || this.get('_pmodesAreAvailableForType')
          || this.get('_loadFileAreAvailableForType');
      }
    ),

    /**
      Flag: indicates whether scale settings are available for the selected layer type.

      @property _scaleSettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _mainSettingsAreAvailableForType: computed('_layer.type', function () {
      return true;
    }),
    /**
      Flag: indicates whether CRS is available for the selected layer type.

      @property _crsSettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _crsSettingsAreAvailableForType: computed('_layer.type', function () {
      const className = this.get('_layer.type');

      return getOwner(this).isKnownNameForType('layer', className) && className !== 'group';
    }),

    /**
      Flag: indicates whether type-related settings are available for the selected layer type.

      @property _layerSettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _layerSettingsAreAvailableForType: computed('_layer.type', function () {
      const className = this.get('_layer.type');

      return getOwner(this).isKnownNameForType('layer', className) && className !== 'group';
    }),

    /**
      Flag: indicates whether prototyping modes are available.

      @property _pmodesAreAvailableForType
      @type Boolean
      @readonly
    */
    _pmodesAreAvailableForType: computed('_availableModes', '_typeIsReadonly', function () {
      const newLayerIsExpectedToBeCreated = !this.get('_typeIsReadonly');
      const _availableModes = this.get('_availableModes');

      return newLayerIsExpectedToBeCreated && isArray(_availableModes) && !isBlank(_availableModes);
    }),

    /**
      Flag: indicates whether load file modes are available.

      @property _loadFileAreAvailableForType
      @type Boolean
      @readonly
    */
    _loadFileAreAvailableForType: computed('_layer.type', '_typeIsReadonly', function () {
      const className = this.get('_layer.type');
      const newLayerIsExpectedToBeCreated = !this.get('_typeIsReadonly');

      return getOwner(this).isKnownNameForType('layer', className) && className === 'wms' && newLayerIsExpectedToBeCreated;
    }),

    /**
      Flag: indicates whether bbox settings are available for the selected layer type.

      @property _bboxSettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _bboxSettingsAreAvailableForType: computed('_layer.type', function () {
      return true;
    }),

    /**
      Flag: indicates whether 'display-group' of settings is available for the selected layer type.

      @property _displayGroupIsAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _displayGroupIsAvailableForType: computed(
      '_displaySettingsAreAvailableForType',
      '_identifySettingsAreAvailableForType',
      '_searchSettingsAreAvailableForType',
      '_legendSettingsAreAvailableForType',
      '_filterSettingsAreAvailableForType',
      '_styleSettingsAreAvailableForType',
      '_labelsSettingsAreAvailableForType',
      function () {
        // Group is available when at least one of it's tab is available.
        return this.get('_displaySettingsAreAvailableForType')
          || this.get('_identifySettingsAreAvailableForType')
          || this.get('_searchSettingsAreAvailableForType')
          || this.get('_legendSettingsAreAvailableForType')
          || this.get('_filterSettingsAreAvailableForType')
          || this.get('_styleSettingsAreAvailableForType')
          || this.get('_labelsSettingsAreAvailableForType');
      }
    ),

    /**
      Flag: indicates whether 'display' operation settings are available for the selected layer type.

      @property _displaySettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _displaySettingsAreAvailableForType: computed('_layer.type', function () {
      const className = this.get('_layer.type');

      return getOwner(this).isKnownNameForType('layer', className) && className !== 'group';
    }),

    /**
      Flag: indicates whether 'identify' operation settings are available for the selected layer type.

      @property _identifySettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _identifySettingsAreAvailableForType: computed('_layer.type', function () {
      const className = this.get('_layer.type');
      const layerClass = isNone(className)
        ? null
        : getOwner(this).knownForType('layer', className);

      return !isNone(layerClass) && A(get(layerClass, 'operations') || []).includes('identify');
    }),

    /**
      Flag: indicates whether 'search' operation settings are available for the selected layer type.

      @property _searchSettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _searchSettingsAreAvailableForType: computed('_layer.type', function () {
      const className = this.get('_layer.type');
      const layerClass = isNone(className)
        ? null
        : getOwner(this).knownForType('layer', className);

      return !isNone(layerClass) && A(get(layerClass, 'operations') || []).includes('search');
    }),

    /**
      Flag: indicates whether 'legend' operation settings are available for the selected layer type.

      @property _legendSettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _legendSettingsAreAvailableForType: computed('_layer.type', function () {
      const className = this.get('_layer.type');
      const layerClass = isNone(className)
        ? null
        : getOwner(this).knownForType('layer', className);

      return !isNone(layerClass) && A(get(layerClass, 'operations') || []).includes('legend');
    }),

    /**
      Flag: indicates whether 'filter' operation settings are available for the selected layer type. TODO!

      @property _filterSettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _filterSettingsAreAvailableForType: computed('_layer.type', function () {
      const className = this.get('_layer.type');
      const layerClass = isNone(className)
        ? null
        : getOwner(this).knownForType('layer', className);

      return !isNone(layerClass) && A(get(layerClass, 'operations') || []).includes('filter');
    }),

    /**
      Flag: indicates whether 'style' settings are available for the selected layer type.

      @property _styleSettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _styleSettingsAreAvailableForType: computed('_layer.type', function () {
      const className = this.get('_layer.type');
      const layerClass = isNone(className)
        ? null
        : getOwner(this).knownForType('layer', className);

      // Style settings are available only for vector layers.
      return !isNone(layerClass) && layerClass.isVectorType(this.get('layer'));
    }),

    /**
      Flag: indicates whether 'display labels' operation settings are available for the selected layer type.

      @property _labelsSettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _labelsSettingsAreAvailableForType: computed('_layer.type', function () {
      const className = this.get('_layer.type');

      return getOwner(this).isKnownNameForType('layer', className) && className !== 'group';
    }),

    /**
      Flag: indicates whether 'links-group' of settings is available for the selected layer type.

      @property _linksGroupIsAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _linksGroupIsAvailableForType: computed(
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
    _linksSettingsAreAvailableForType: computed('_layer.type', function () {
      const className = this.get('_layer.type');

      return getOwner(this).isKnownNameForType('layer', className) && className !== 'group';
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
        e = $.event.fix(e);

        const $clickedGroup = $(e.currentTarget);
        const clickedGroupName = $clickedGroup.attr('data-tab');
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
        Handles {{#crossLink "FlexberryLinksEditorComponent/sendingActions.changeVisibility:method"}}'flexberry-links-editor'
        component's 'changeVisibility' action{{/crossLink}}.

        @method actions.allowShowCheckboxChange
        @param {Object} e eventObject Event object from
        {{#crossLink "FlexberryLinksEditorComponent/sendingActions.changeVisibility:method"}}'flexberry-links-editor'
        component's 'changeVisibility' action{{/crossLink}}.
      */
      allowShowCheckboxChange(...args) {
        this.sendAction('allowShowLayerLinkCheckboxChange', ...args);
      },

      /**
        Handles {{#crossLink "BaseEditModeComponent/sendingActions.editingFinished:method"}}'base-layers-prototyping-mode'
        components 'editingFinished' action {{/crossLink}}.

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
      },
    },

    /**
      Creates inner hash containing layer settings for different layer types.

      @method _createInnerSettings
      @private
    */
    _createInnerSettings() {
      const settings = {};
      A(this.get('_availableTypes') || []).forEach((type) => {
        const layerClassFactory = getOwner(this).knownForType('layer', type);
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
      const type = this.get('layer.type');
      const name = this.get('layer.name');
      const scale = this.get('layer.scale');
      const description = this.get('layer.description');
      const keyWords = this.get('layer.keyWords');
      const boundingBox = this.get('layer.boundingBox');
      const leafletObjectGetter = this.get('layer.leafletObjectGetter');
      const bounds = getBounds(boundingBox);

      let crs = this.get('layer.coordinateReferenceSystem');
      crs = isNone(crs) ? {} : JSON.parse(crs);

      let settings = this.get('layer.settings');
      const defaultSettings = isNone(type) ? {} : getOwner(this).knownForType('layer', type).createSettings();
      if (!isNone(settings)) {
        settings = $.extend(true, defaultSettings, JSON.parse(settings));
      } else if (!isNone(type)) {
        settings = defaultSettings;
      }

      this._createInnerSettings();
      if (!isNone(settings)) {
        this.set(`_settings.${type}`, settings);
      }

      this.set('_layer', {
        type,
        name,
        scale,
        description,
        keyWords,
        coordinateReferenceSystem: crs,
        settings,
        boundingBox,
        bboxCoords: {
          minLat: bounds.minLat,
          minLng: bounds.minLng,
          maxLat: bounds.maxLat,
          maxLng: bounds.maxLng,
        },
        leafletObjectGetter,
      });
    },

    /**
      Destroys inner hash containing layer copy.

      @method _destroyInnerLayer
      @private
    */
    _destroyInnerLayer() {
      this.set('_layer', null);
      const i18n = this.get('i18n');
      this.set('_selectedModeCaption', i18n.t('components.layers-dialogs.layers-prototyping-modes.new'));
      this._destroyInnerSettings();
    },

    /**
      Observes visibility changes & creates/destroys inner hash containing layer copy.

      @method _visibleDidChange
      @private
    */
    _visibleDidChange: observer('visible', function () {
      if (this.get('visible') || this.get('visible') === undefined) {
        this.set('_hideBbox', false);
        this._createInnerLayer();
      } else {
        this.set('_hideBbox', true);
        this._destroyInnerLayer();
      }
    }),

    /**
      Observes type changes & changes link to object containing type-related settings.

      @method _innerLayerTypeDidChange
      @private
    */
    _innerLayerTypeDidChange: observer('_layer.type', function () {
      if (isNone(this.get('_layer'))) {
        return;
      }

      const type = this.get('_layer.type');
      this.set('_layer.settings', this.get(`_settings.${type}`));
    }),

    /**
      Initializes component.
    */
    init() {
      this._super(...arguments);

      this._visibleDidChange();

      if (isNone(this.get('links'))) {
        this.set('links', A());
      }

      this.set('_tabularMenuState', {
        activeGroup: 'main-group',
        groups: {
          'main-group': {
            activeTab: 'main-tab',
          },
          'display-group': {
            activeTab: 'display-tab',
          },
          'links-group': {
            activeTab: 'links-tab',
          },
        },
      });

      const owner = getOwner(this);

      // Initialize available layers types for related dropdown.
      this.set('_availableTypes', owner.knownNamesForType('layer'));

      // Initialize available edit modes.
      const availableEditModes = A();
      const editModesNames = owner.knownNamesForType('layers-prototyping-mode');
      editModesNames.forEach((modeName) => {
        const editMode = owner.knownForType('layers-prototyping-mode', modeName).create();
        const isAvailable = editMode.componentCanBeInserted(this);
        if (isAvailable) {
          availableEditModes.pushObject(editMode);
        }
      });
      this.set('_availableModes', availableEditModes);

      const i18n = this.get('i18n');
      this.set('_selectedModeCaption', i18n.t('components.layers-dialogs.layers-prototyping-modes.new'));

      this.sendAction('onInit', this.getLayerProperties.bind(this));
    },

    /**
      Applies data from controls to layer hash.

      @method getLayerProperties
    */
    getLayerProperties() {
      // Inner layer hash.
      const layer = this.get('_layer');

      // Layer hash to send.
      const _layerHash = $.extend(true, {}, layer);

      let coordinateReferenceSystem = get(_layerHash, 'coordinateReferenceSystem');
      coordinateReferenceSystem = $.isEmptyObject(coordinateReferenceSystem) ? null : JSON.stringify(coordinateReferenceSystem);
      set(_layerHash, 'coordinateReferenceSystem', coordinateReferenceSystem);

      let settings = get(_layerHash, 'settings');

      if (get(settings, 'filter') instanceof Element) {
        set(settings, 'filter', L.XmlUtil.serializeXmlToString(get(settings, 'filter')));
      }

      settings = $.isEmptyObject(settings) ? null : JSON.stringify(settings);

      set(_layerHash, 'settings', settings);

      return _layerHash;
    },

    /**
      Component's action invoking init hook is finished.
      Provides binding for {{#crossLink "FlexberryEditLayerComponent/sendingActions.onInit:method"}}'flexberry-edit-layer'
      component's 'getLayerProperties' method{{/crossLink}}.

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
  }
);

Component.reopenClass({
  flexberryClassNames,
});
