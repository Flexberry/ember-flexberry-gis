/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import RequiredActionsMixin from '../../mixins/required-actions';
import DynamicActionsMixin from '../../mixins/dynamic-actions';
import DynamicPropertiesMixin from '../../mixins/dynamic-properties';
import layout from '../../templates/components/layers-dialogs/edit';
import { translationMacro as t } from 'ember-i18n';

// Proj4 CRS code.
// Will be initialized in 'init' method.
let proj4CrsCode = null;

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
const flexberryClassNamesPrefix = 'flexberry-edit-layer-dialog';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null
};

/**
  Flexberry edit layer modal dialog with [Semantic UI modal](http://semantic-ui.com/modules/modal.html) style.

  @class FlexberryEditLayerDialogComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses RequiredActionsMixin
  @uses DynamicActionsMixin
  @uses DynamicPropertiesMixin
*/
let FlexberryEditLayerDialogComponent = Ember.Component.extend(
  RequiredActionsMixin,
  DynamicActionsMixin,
  DynamicPropertiesMixin, {
    /**
      Available modes.

      @property _availableModes
      @type String[]
      @default null
      @private
    */
    _availableModes: null,

    /**
      Selected mode.

      @property _selectedMode
      @type String
      @default null
      @private
    */
    _selectedMode: null,

    /**
      Flag: indicates whether modes are available.

      @property _modesAreAvailable
      @type Boolean
      @default false
      @private
    */
    _modesAreAvailable: false,

    /**
      Flag: indicates whether new layer mode is selected now.

      @property _newLayerModeIsSelected
      @type Boolean
      @readOnly
      @private
    */
    _newLayerModeIsSelected: Ember.computed('_selectedMode', 'i18n.locale', function() {
      let i18n = this.get('i18n');
      let newLayerMode = i18n.t('components.layers-dialogs.edit.mode-dropdown.modes.new-layer');
      let selectedMode = this.get('_selectedMode');

      return selectedMode.toString() === newLayerMode.toString();
    }),

    /**
      Flag: indicates whether new layer mode is selected now.

      @property _cswBasedLayerModeIsSelected
      @type Boolean
      @readOnly
      @private
    */
    _cswBasedLayerModeIsSelected: Ember.computed('_selectedMode', 'i18n.locale', function() {
      let i18n = this.get('i18n');
      let cswBasedLayerMode = i18n.t('components.layers-dialogs.edit.mode-dropdown.modes.csw-based-layer');
      let selectedMode = this.get('_selectedMode');

      return selectedMode.toString() === cswBasedLayerMode.toString();
    }),

    /**
      Flag: indicates whether new layer mode is selected now.

      @property _metadataBasedLayerModeIsSelected
      @type Boolean
      @readOnly
      @private
    */
    _metadataBasedLayerModeIsSelected: Ember.computed('_selectedMode', 'i18n.locale', function() {
      let i18n = this.get('i18n');
      let metadataBasedLayerMode = i18n.t('components.layers-dialogs.edit.mode-dropdown.modes.metadata-based-layer');
      let selectedMode = this.get('_selectedMode');

      return selectedMode.toString() === metadataBasedLayerMode.toString();
    }),

    /**
      Array containing available layers types.

      @property _availableTypes
      @type String[]
      @default null
      @private
    */
    _availableTypes: null,

    /**
      Flag: indicates whether CRS is available for the selected layer type.

      @property _crsSettingsAreAvailableForType
      @type Boolean
      @private
      @readOnly
    */
    _crsSettingsAreAvailableForType: Ember.computed('_layer.type', function() {
      let className = this.get('_layer.type');

      let available = Ember.getOwner(this).isKnownNameForType('layer', className) && className !== 'group';
      if (!available && this.get('_tabularMenuActiveTab') === 'crs') {
        this.set('_tabularMenuActiveTab', 'main');
      }

      // Reset tabular menu after tab has been added or removed.
      Ember.run.scheduleOnce('afterRender', this, '_resetTabularMenu');

      return available;
    }),

    /**
      Flag: indicates whether type-related settings are available for the selected layer type.

      @property _layerSettingsAreAvailableForType
      @type Boolean
      @private
      @readOnly
    */
    _layerSettingsAreAvailableForType: Ember.computed('_layer.type', function() {
      let className = this.get('_layer.type');

      let available = Ember.getOwner(this).isKnownNameForType('layer', className) && className !== 'group';
      if (!available && this.get('_tabularMenuActiveTab') === 'settings') {
        this.set('_tabularMenuActiveTab', 'main');
      }

      // Reset tabular menu after tab has been added or removed.
      Ember.run.scheduleOnce('afterRender', this, '_resetTabularMenu');

      return available;
    }),

    /**
      Flag: indicates whether 'identify' operation settings are available for the selected layer type.

      @property _identifySettingsAreAvailableForType
      @type Boolean
      @private
      @readOnly
    */
    _identifySettingsAreAvailableForType: Ember.computed('_layer.type', function() {
      let className = this.get('_layer.type');
      let layerClass = Ember.getOwner(this).knownForType('layer', className);

      let available = !Ember.isNone(layerClass) && Ember.A(Ember.get(layerClass, 'operations') || []).contains('identify');
      if (!available && this.get('_tabularMenuActiveTab') === 'identifySettings') {
        this.set('_tabularMenuActiveTab', 'main');
      }

      // Reset tabular menu after tab has been added or removed.
      Ember.run.scheduleOnce('afterRender', this, '_resetTabularMenu');

      return available;
    }),

    /**
      Flag: indicates whether 'search' operation settings are available for the selected layer type.

      @property _searchSettingsAreAvailableForType
      @type Boolean
      @private
      @readOnly
    */
    _searchSettingsAreAvailableForType: Ember.computed('_layer.type', function() {
      let className = this.get('_layer.type');
      let layerClass = Ember.getOwner(this).knownForType('layer', className);

      let available = !Ember.isNone(layerClass) && Ember.A(Ember.get(layerClass, 'operations') || []).contains('search');
      if (!available && this.get('_tabularMenuActiveTab') === 'searchSettings') {
        this.set('_tabularMenuActiveTab', 'main');
      }

      // Reset tabular menu after tab has been added or removed.
      Ember.run.scheduleOnce('afterRender', this, '_resetTabularMenu');

      return available;
    }),

    /**
      Flag: indicates whether 'legend' operation settings are available for the selected layer type.

      @property _legendSettingaAreAvailableForType
      @type Boolean
      @private
      @readOnly
    */
    _legendSettingaAreAvailableForType: Ember.computed('_layer.type', function() {
      let className = this.get('_layer.type');
      let layerClass = Ember.getOwner(this).knownForType('layer', className);

      let available = !Ember.isNone(layerClass) && Ember.A(Ember.get(layerClass, 'operations') || []).contains('legend');
      if (!available && this.get('_tabularMenuActiveTab') === 'legendSettings') {
        this.set('_tabularMenuActiveTab', 'main');
      }

      // Reset tabular menu after tab has been added or removed.
      Ember.run.scheduleOnce('afterRender', this, '_resetTabularMenu');

      return available;
    }),

    /**
      Flag: indicates whether layer type is in readonly mode.

      @property _typeIsReadonly
      @type Boolean
      @default true
      @private
    */
    _typeIsReadonly: true,

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
      User friendly coordinate reference system (CRS) code.
      For example 'ESPG:4326'.

      @property _coordinateReferenceSystemCode
      @type String
      @default null
      @private
    */
    _coordinateReferenceSystemCode: null,

    /**
      Array containing user friendly coordinate reference systems (CRS) codes.
      For example ['ESPG:4326', 'PROJ4'].

      @property _availableCoordinateReferenceSystemsCodes
      @type String[]
      @default null
      @private
    */
    _availableCoordinateReferenceSystemsCodes: null,

    /**
      Flag: indicates whether coordinate reference system (CRS) edit fields must be shown.

      @property _availableCoordinateReferenceSystemsCodes
      @type Boolean
      @default false
      @private
    */
    _showCoordinateReferenceSystemFields: Ember.computed('_coordinateReferenceSystemCode', function() {
      return this.get('_coordinateReferenceSystemCode') === proj4CrsCode;
    }),

    /**
      Tabular menu containing tabs items.

      @property _$tabularMenu
      @type Object
      @default null
      @private
    */
    _$tabularMenu: null,

    /**
      Tabular menu active tab name.

      @property _tabularMenuActiveTab
      @type String
      @private
    */
    _tabularMenuActiveTab: 'main',

    /**
      Reference to component's template.
    */
    layout,

    /**
      Reference to component's CSS-classes names.
      Must be also a component's instance property to be available from component's .hbs template.
    */
    flexberryClassNames,

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
      Component's caption.

      @property class
      @type String
      @default t('components.layers-dialogs.edit.caption')
    */
    caption: t('components.layers-dialogs.edit.caption'),

    /**
      Dialog's 'approve' button caption.

      @property approveButtonCaption
      @type String
      @default t('components.layers-dialogs.edit.approve-button.caption')
    */
    approveButtonCaption: t('components.layers-dialogs.edit.approve-button.caption'),

    /**
      Dialog's 'deny' button caption.

      @property denyButtonCaption
      @type String
      @default t('components.layers-dialogs.edit.deny-button.caption')
    */
    denyButtonCaption: t('components.layers-dialogs.edit.deny-button.caption'),

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
      Dialog's 'CRS' segment caption.

      @property crsCaption
      @type String
      @default t('components.layers-dialogs.edit.crs.caption')
    */
    crsCaption: t('components.layers-dialogs.edit.crs.caption'),

    /**
      Dialog's 'CRS' segment's name textbox caption.

      @property crsNameTextboxCaption
      @type String
      @default t('components.layers-dialogs.edit.crs.name-textbox.caption')
    */
    crsNameTextboxCaption: t('components.layers-dialogs.edit.crs.name-textbox.caption'),

    /**
      Dialog's 'CRS' segment's code textbox caption.

      @property crsCodeTextboxCaption
      @type String
      @default t('components.layers-dialogs.edit.crs.code-textbox.caption')
    */
    crsCodeTextboxCaption: t('components.layers-dialogs.edit.crs.code-textbox.caption'),

    /**
      Dialog's 'CRS' segment's definition textarea caption.

      @property crsDefinitionTextareaCaption
      @type String
      @default t('components.layers-dialogs.edit.crs.definition-textarea.caption')
    */
    crsDefinitionTextareaCaption: t('components.layers-dialogs.edit.crs.definition-textarea.caption'),

    /**
      Flag: indicates whether dialog is visible or not.
      If true, then dialog will be shown, otherwise dialog will be closed.

      @property visible
      @type Boolean
      @default false
    */
    visible: false,

    /**
      Hash containing editing layer.

      @property layer
      @type Object
      @default null
    */
    layer: null,

    /**
      Leaflet map.

      @property leafletMap
      @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
      @default null
    */
    leafletMap: null,

    actions: {
      /**
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryRemoveLayerDialogComponent/sendingActions.approve:method"}}'approve' action{{/crossLink}}.

        @method actions.onApprove
      */
      onApprove() {
        let layer = this.get('_layer');

        let coordinateReferenceSystem = Ember.get(layer, 'coordinateReferenceSystem');
        coordinateReferenceSystem = Ember.$.isEmptyObject(coordinateReferenceSystem) ? null : JSON.stringify(coordinateReferenceSystem);
        Ember.set(layer, 'coordinateReferenceSystem', coordinateReferenceSystem);

        let settings = Ember.get(layer, 'settings');
        settings = Ember.$.isEmptyObject(settings) ? null : JSON.stringify(settings);
        Ember.set(layer, 'settings', settings);

        this.sendAction('approve', {
          layerProperties: layer
        });
      },

      /**
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.deny:method"}}'flexberry-dialog' component's 'deny' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.deny:method"}}'deny' action{{/crossLink}}.

        @method actions.onDeny
      */
      onDeny() {
        this.sendAction('deny');
      },

      /**
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.beforeShow:method"}}'flexberry-dialog' component's 'beforeShow' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.beforeShow:method"}}'beforeShow' action{{/crossLink}}.

        @method actions.onBeforeShow
      */
      onBeforeShow() {
        this.sendAction('beforeShow');
      },

      /**
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.beforeHide:method"}}'flexberry-dialog' component's 'beforeHide' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.beforeHide:method"}}'beforeHide' action{{/crossLink}}.

        @method actions.onBeforeHide
      */
      onBeforeHide() {
        this.sendAction('beforeHide');
      },

      /**
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.show:method"}}'flexberry-dialog' component's 'show' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.show:method"}}'show' action{{/crossLink}}.

        @method actions.onShow
      */
      onShow() {
        this.sendAction('show');
      },

      /**
        Handles {{#crossLink "FlexberryDialogComponent/sendingActions.hide:method"}}'flexberry-dialog' component's 'hide' action{{/crossLink}}.
        Invokes {{#crossLink "FlexberryEditLayerDialogComponent/sendingActions.hide:method"}}'hide' action{{/crossLink}}.

        @method actions.onHide
      */
      onHide() {
        this.sendAction('hide');
      },

      /**
        Handles {{#crossLink "FlexberryCswComponent/sendingActions.recordSelected:method"}}'flexberry-csw' component's 'recordSelectd' action{{/crossLink}}.

        @method actions.onCswRecordSelected
        @param {Object} record Selected record
      */
      onCswRecordSelected(record) {
        let layerClass = Ember.getOwner(this).knownForType('layer', Ember.get(record, 'type'));
        let settings = layerClass.createSetingsFromCsw(record);

        this.set('_layer.type', Ember.get(record, 'type'));
        this.set('_layer.name', Ember.get(record, 'title'));
        this.set('_layer.settings', settings);

        this.set('_coordinateReferenceSystemCode', Ember.get(record, 'crs'));
        this.set('_layer.coordinateReferenceSystem.code', Ember.get(record, 'crs'));
        this.set('_layer.coordinateReferenceSystem.definition', null);
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
        this.set('_tabularMenuActiveTab', clickedTabName);
      },
    },

    /**
      Creates inner hash containing layer CRS settings for different CRS codes.

      @method _createInnerCoordinateReferenceSystems
      @private
    */
    _createInnerCoordinateReferenceSystems() {
      let coordinateReferenceSystems = {};
      Ember.A(this.get('_availableCoordinateReferenceSystemsCodes') || []).forEach((code) => {
        coordinateReferenceSystems[code] = {
          code: code === proj4CrsCode ? null : code,
          definition: null
        };
      });

      this.set('_coordinateReferenceSystems', coordinateReferenceSystems);
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

      let crs = this.get('layer.coordinateReferenceSystem');
      crs = Ember.isNone(crs) ? {} : JSON.parse(crs);

      let crsCode = Ember.get(crs, 'code');
      if (!Ember.isBlank(crsCode) && !this.get('_availableCoordinateReferenceSystemsCodes').contains(crsCode)) {
        // Unknown CRS code means that proj4 is used.
        crsCode = proj4CrsCode;
      }

      this.set('_coordinateReferenceSystemCode', crsCode);

      this._createInnerCoordinateReferenceSystems();
      this.set(`_coordinateReferenceSystems.${crsCode}`, crs);

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
        coordinateReferenceSystem: crs,
        settings: settings,
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
      Resets tabuler menu.

      @method _resetTabularMenu
      @private
    */
    _resetTabularMenu() {
      let $tabularMenu = this.get('_$tabularMenu');
      if (!Ember.isNone($tabularMenu)) {
        Ember.$('.tab.item', $tabularMenu).tab();
      }
    },

    /**
      Observes visibility changes & creates/destroys inner hash containing layer copy.

      @method _visibleDidChange
      @private
    */
    _visibleDidChange: Ember.on('init', Ember.observer('visible', function() {
      if (this.get('visible')) {
        this._createInnerLayer();
      } else {
        this._destroyInnerLayer();
      }
    })),

    /**
      Observes type changes & changes link to object containing type-related settings.

      @method _innerLayerTypeDidChange
      @private
    */
    _innerLayerTypeDidChange: Ember.observer('_layer.type', function() {
      if (Ember.isNone(this.get('_layer'))) {
        return;
      }

      let type = this.get('_layer.type');
      this.set('_layer.settings', this.get(`_settings.${type}`));
    }),

    /**
      Observes _coordinateReferenceSystemCode changes & changes link to object containing code-related CRS settings.

      @method _coordinateReferenceSystemCodeDidChange
      @private
    */
    _coordinateReferenceSystemCodeDidChange: Ember.observer('_coordinateReferenceSystemCode', function() {
      if (Ember.isNone(this.get('_layer'))) {
        return;
      }

      let code = this.get('_coordinateReferenceSystemCode');
      this.set('_layer.coordinateReferenceSystem', this.get(`_coordinateReferenceSystems.${code}`));
    }),

    /**
      Observes changes in current locale.
      Changes available modes.

      @method _localeDidChange
      @private
    */
    _localeDidChange: Ember.on('init', Ember.observer('i18n.locale', function() {
      let i18n = this.get('i18n');
      this.set('_availableModes', Ember.A([
        i18n.t('components.layers-dialogs.edit.mode-dropdown.modes.new-layer'),
        i18n.t('components.layers-dialogs.edit.mode-dropdown.modes.csw-based-layer')/*,
        i18n.t('components.layers-dialogs.edit.mode-dropdown.modes.metadata-based-layer'),*/
      ]));
      this.set('_selectedMode', i18n.t('components.layers-dialogs.edit.mode-dropdown.modes.new-layer'));
    })),

    /**
      Initializes component.
    */
    init() {
      this._super(...arguments);

      // Retrieve & remember constant (proj4 CRS code).
      let proj4CrsFactory = Ember.getOwner(this).knownForType('coordinate-reference-system', 'proj4');
      proj4CrsCode = Ember.get(proj4CrsFactory, 'code');

      // Available layers types for related dropdown.
      let owner = Ember.getOwner(this);
      this.set('_availableTypes', owner.knownNamesForType('layer'));

      // Available CRS codes for related dropdown.
      let crsFactories = owner.knownForType('coordinate-reference-system');
      let crsFactoriesNames = owner.knownNamesForType('coordinate-reference-system');
      this.set('_availableCoordinateReferenceSystemsCodes', Ember.A(crsFactoriesNames.map((crsFactoryName) => {
        let crsFactory = Ember.get(crsFactories, crsFactoryName);
        return Ember.get(crsFactory, 'code');
      })));
    },

    /**
      Initializes component's DOM-related properties.
    */
    didInsertElement() {
      this._super(...arguments);

      let $tabularMenu = this.get('childViews')[0].$('.tabular.menu');
      this.set('_$tabularMenu', $tabularMenu);
    },

    /**
      Deinitializes component's DOM-related properties.
    */
    willDestroyElement() {
      this._super(...arguments);

      let $tabularMenu = this.get('_$tabularMenu');
      if (!Ember.isNone($tabularMenu)) {
        Ember.$('.tab.item', $tabularMenu).tab('destroy');
        this.set('_$tabularMenu', null);
      }
    }

    /**
      Component's action invoking when dialog starts to show.

      @method sendingActions.beforeShow
    */

    /**
      Component's action invoking when dialog starts to hide.

      @method sendingActions.beforeHide
    */

    /**
      Component's action invoking when dialog is shown.

      @method sendingActions.show
    */

    /**
      Component's action invoking when dialog is hidden.

      @method sendingActions.hide
    */

    /**
      Component's action invoking when dialog is approved.

      @method sendingActions.approve
    */

    /**
      Component's action invoking when dialog is denied.

      @method sendingActions.deny
    */
  }
);

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryEditLayerDialogComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryEditLayerDialogComponent;
