import Ember from 'ember';
import RequiredActionsMixin from 'ember-flexberry/mixins/required-actions';
import DynamicActionsMixin from 'ember-flexberry/mixins/dynamic-actions';
import DynamicPropertiesMixin from '../mixins/dynamic-properties';
import FlexberryBoundingboxMapLoaderMixin from '../mixins/flexberry-boundingbox-map-loader';
import VectorLayer from '../layers/-private/vector';
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
  DynamicPropertiesMixin,
  FlexberryBoundingboxMapLoaderMixin, {
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
      Dialog's 'type' dropdown caption.

      @property typeDropdownCaption
      @type String
      @default t('components.layers-dialogs.edit.type-dropdown.caption')
    */
    typeDropdownCaption: t('components.layers-dialogs.edit.type-dropdown.caption'),

    /**
      Dialog's 'name' textbox caption.

      @property nameTextboxCaption
      @type String
      @default t('components.layers-dialogs.edit.name-textbox.caption')
    */
    nameTextboxCaption: t('components.layers-dialogs.edit.name-textbox.caption'),

    /**
      Dialog's 'scale' textbox caption.

      @property scaleTextboxCaption
      @type String
      @default t('components.layers-dialogs.edit.name-textbox.caption')
    */
    scaleTextboxCaption: t('components.layers-dialogs.edit.scale-textbox.caption'),

    /**
      Dialog's 'description' textbox caption.

      @property descriptionTextboxCaption
      @type String
      @default t('components.layers-dialogs.edit.description-textbox.caption')
    */
    descriptionTextboxCaption: t('components.layers-dialogs.edit.description-textbox.caption'),

    /**
      Dialog's 'keyWords' textbox caption.

      @property keyWordsTextboxCaption
      @type String
      @default t('components.layers-dialogs.edit.keywords-textbox.caption')
    */
    keyWordsTextboxCaption: t('components.layers-dialogs.edit.keywords-textbox.caption'),

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
      Dialog's 'Bounds' segment's caption.

      @property boundsSegmentCaption
      @type String
      @default t('components.layers-dialogs.edit.bounds-segment.caption')
    */
    boundsSegmentCaption: t('components.layers-dialogs.edit.bounds-segment.caption'),

    /**
      Dialog's 'Bounds' segment's WGS84 option caption.

      @property wgs84bboxCaption
      @type String
      @default t('components.layers-dialogs.edit.bounds-segment.options.wgs84bbox.caption')
    */
    wgs84bboxCaption: t('components.layers-dialogs.edit.bounds-segment.options.wgs84bbox.caption'),

    /**
      Dialog's 'Bounds' segment's BBOX option caption.

      @property bboxCaption
      @type String
      @default t('components.layers-dialogs.edit.bounds-segment.options.bbox.caption')
    */
    bboxCaption: t('components.layers-dialogs.edit.bounds-segment.options.bbox.caption'),

    /**
      Dialog's 'Bounds' segment's mode.

      @property boundsMode
      @type String
      @default "wgs84bbox"
    */
    boundsMode: 'wgs84bbox',

    /**
      Map model fot bounding box component.

      @property boundingBoxComponentMap
      @type Object
      @default null
    */
    boundingBoxComponentMap: null,

    /**
      Indicates that boundingBox component's map is loading.

      @property _bboxMapIsLoading
      @type Boolean
      @default false
    */
    _bboxMapIsLoading: false,

    /**
      Flag: indicates whether to show bounds error message or not.

      @property _showBoundsErrorMessage
      @type Boolean
      @readOnly
    */
    _showBoundsErrorMessage: false,

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
      Selected mode.

      @property _selectedModeCaption
      @type String
      @default null
      @private
    */
    _selectedModeCaption: null,

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
      Array of posible scale values.

      @property scales
      @type Array
      @default [500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000, 2500000, 5000000, 10000000]
    */
    scales: Ember.A([500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000, 2500000, 5000000, 10000000]),

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

    _tess:false,

    /**
      Layer's links' parameters model projection.

      @property parametersModelProjection
      @type String
      @default ''
    */
    parametersModelProjection: '',

    /**
      Flag: indicates whether 'main-group' of settings is available for the selected layer type.

      @property _mainGroupIsAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _mainGroupIsAvailableForType: Ember.computed(
      '_mainSettingsAreAvailableForType',
      '_crsSettingsAreAvailableForType',
      '_layerSettingsAreAvailableForType',
      '_bboxSettingsAreAvailableForType',
      function () {
        // Group is available when at least one of it's tab is available.
        return this.get('_mainSettingsAreAvailableForType') ||
          this.get('_crsSettingsAreAvailableForType') ||
          this.get('_layerSettingsAreAvailableForType') ||
          this.get('_bboxSettingsAreAvailableForType');
      }
    ),

    /**
      Flag: indicates whether scale settings are available for the selected layer type.

      @property _scaleSettingsAreAvailableForType
      @type Boolean
      @private
      @readonly
    */
    _scaleSettingsAreAvailableForType: Ember.computed('_layer.type', function () {
      let className = this.get('_layer.type');

      return Ember.getOwner(this).isKnownNameForType('layer', className) && className !== 'group';
    }),

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
    _displayGroupIsAvailableForType: Ember.computed(
      '_displaySettingsAreAvailableForType',
      '_identifySettingsAreAvailableForType',
      '_searchSettingsAreAvailableForType',
      '_legendSettingsAreAvailableForType',
      '_filterSettingsAreAvailableForType',
      '_styleSettingsAreAvailableForType',
      function () {
        // Group is available when at least one of it's tab is available.
        return this.get('_displaySettingsAreAvailableForType') ||
          this.get('_identifySettingsAreAvailableForType') ||
          this.get('_searchSettingsAreAvailableForType') ||
          this.get('_legendSettingsAreAvailableForType') ||
          this.get('_filterSettingsAreAvailableForType') ||
          this.get('_styleSettingsAreAvailableForType');
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
      return !Ember.isNone(layerClass) && layerClass instanceof VectorLayer;
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
    _linksSettingsAreAvailableForType: Ember.computed('_layerSettingsAreAvailableForType', function() {
      return this.get('_layerSettingsAreAvailableForType');
    }),

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
      Available modes captions.

      @property _availableModesCaptions
      @type String[]
      @readonly
    */
    _availableModesCaptions: Ember.computed('_availableModes', 'i18n.locale', function () {
      let _availableModes = this.get('_availableModes');

      let modes = Ember.A();
      if (Ember.isArray(_availableModes) && _availableModes.length !== 0) {
        let i18n = this.get('i18n');

        modes.pushObject(i18n.t('components.layers-dialogs.edit-modes.new'));

        modes.pushObjects(_availableModes.map((editMode) => {
          return i18n.t('components.layers-dialogs.edit-modes.' + editMode.name);
        }));
      }

      return modes;
    }),

    /**
      Flag: indicates whether modes are available.

      @property _modesAreAvailable
      @type Boolean
      @readonly
    */
    _modesAreAvailable: Ember.computed('_availableModes', '_typeIsReadonly', function () {
      let newLayerIsExpectedToBeCreated = !this.get('_typeIsReadonly');
      let _availableModes = this.get('_availableModes');

      return newLayerIsExpectedToBeCreated && Ember.isArray(_availableModes) && !Ember.isBlank(_availableModes);
    }),

    /**
      Selected mode.

      @property _selectedMode
      @type Object
      @readonly
    */
    _selectedMode: Ember.computed('_selectedModeCaption', function () {
      let _availableModes = this.get('_availableModes');
      let _availableModesCaptions = this.get('_availableModesCaptions');
      let _selectedModeCaption = this.get('_selectedModeCaption');

      if (!Ember.isArray(_availableModes) || !Ember.isArray(_availableModesCaptions) || Ember.isBlank(_selectedModeCaption)) {
        return null;
      }

      let modeIndex = _availableModesCaptions.findIndex(item => item.string === _selectedModeCaption) - 1;

      return modeIndex > -1 ? _availableModes.objectAt(modeIndex) : null;
    }),

    actions: {

        /**
        Handles {{#crossLink "BaseEditModeComponent/sendingActions.editingFinished:method"}}'base-edit-mode' components 'editingFinished' action {{/crossLink}}.

        @method actions.onEditingFinished
        @param {Object} layer Prototype layer model.
      */
      onEditingFinished(layer) {
        this.set('layer', layer);
        this._createInnerLayer();
      },

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
        Handles clicks on tabs.

        @method actions.onTabClick
        @param {Object} e Click event object.
      */
      onTabClick(e) {
        e = Ember.$.event.fix(e);

        let $clickedTab = Ember.$(e.currentTarget);
        let clickedTabName = $clickedTab.attr('data-tab');

        let $relatedGroup = $clickedTab.closest('.tab.segment');
        let relatedGroupName = $relatedGroup.attr('data-tab');

        this.set(`_tabularMenuState.groups.${relatedGroupName}.activeTab`, clickedTabName);
        this.set('_tess',true);
      },

      /**
        Handler for bounds mode change.

        @method actions.onBoundsModeChange
        @param {String} newBoundsMode New bounds mode.
      */
      onBoundsModeChange(newBoundsMode) {
        this.set('boundsMode', newBoundsMode);
      },

      /**
        Handles coordinate input textboxes keyPress events.

        @method actions.coordsInputKeyPress
      */
      coordsInputKeyPress(e) {
        // Allow only numeric (with dot) and Delete, Insert, Print screen buttons.
        if (e.which !== 45 && e.which !== 44 && e.which !== 46 && (e.which < 48 || e.which > 57)) {
          return false;
        }
      },

      /**
        Handles scale input keyDown action.

        @method actions.scaleInputKeyDown
      */
      scaleInputKeyDown(e) {
        let key = e.which;

        // Allow only numbers, backspace, arrows, etc.
        return (key === 8 || key === 9 || key === 46 || (key >= 37 && key <= 40) ||
          (key >= 48 && key <= 57) || (key >= 96 && key <= 105));
      },

      /**
        Handles {{#crossLink "FlexberryLinksEditorComponent/sendingActions.updateLookupValue:method"}}'flexberry-links-editor' component's 'updateLookupValue' action{{/crossLink}}.

        @method actions.updateLookupValue
        @param {Object} updateData Lookup parameters to update data at model: { relationName, newRelationValue, modelToLookup }.
      */
      updateLookupValue(updateData) {
        this.sendAction('updateLookupValue', updateData);
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
        Handles bounding box changes.

        @method actions.onBoundingBoxChange
      */
      onBoundingBoxChange(e) {
        this.set('_layer.boundingBox', e.bboxGeoJSON);
      },
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
      });
    },

    /**
      Destroys inner hash containing layer copy.

      @method _destroyInnerLayer
      @private
    */
    _destroyInnerLayer() {
      this.set('_layer', null);
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

      let _this = this;
      this.set('_bboxMapIsLoading', true);

      this.getBoundingBoxComponentMapModel().then(result => {
        _this.set('boundingBoxComponentMap', result);
        _this.set('_bboxMapIsLoading', false);
      });

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
      let i18n = this.get('i18n');

      // Initialize available layers types for related dropdown.
      this.set('_availableTypes', owner.knownNamesForType('layer'));

      // Initialize available edit modes.
      let availableEditModes = Ember.A();
      let editModesNames = owner.knownNamesForType('edit-mode');
      editModesNames.forEach((modeName) => {
        let editModeFactory = owner.knownForType('edit-mode', modeName);
        let isAvailable = editModeFactory.componentCanBeInserted(this);
        if (isAvailable) {
          availableEditModes.pushObject(editModeFactory);
        }
      });
      this.set('_availableModes', availableEditModes);
      this.set('_selectedModeCaption', i18n.t('components.layers-dialogs.edit-modes.new'));

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

      if (Ember.get(settings, 'filter') instanceof Element) {
        Ember.set(settings, 'filter', L.XmlUtil.serializeXmlToString(Ember.get(settings, 'filter')));
      }

      settings = Ember.$.isEmptyObject(settings) ? null : JSON.stringify(settings);

      Ember.set(_layerHash, 'settings', settings);

      return _layerHash;
    },

    /**
      Component's action invoking init hook is finished.
      Provides binding for {{#crossLink "FlexberryEditLayerComponent/sendingActions.onInit:method"}}'flexberry-edit-layer' component's 'getLayerProperties' method{{/crossLink}}.

      @method sendingActions.onInit
    */

    /**
      Component's action invoking to update relation value at model.
      @method sendingActions.updateLookupValue
      @param {Object} updateData Lookup parameters to update data at model: { relationName, newRelationValue, modelToLookup }.
      {{#crossLink "FlexberryLinksEditorComponent/sendingActions.updateLookupValue:method"}}flexberry-links-editor 'updateLookupValue' action{{/crossLink}}.
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

    /**
      Component's action invoking when model's 'allowShow' state changed.

      @method sendingActions.allowShowLayerLinkCheckboxChange
      @param {Object} e Event object from
      {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.change:method"}}flexberry-ddau-checkbox 'change' action{{/crossLink}}.
    */
  });

Ember.Component.reopenClass({
  flexberryClassNames
});
