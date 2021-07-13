/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/geometry-add-modes/import';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-geometry-add-mode-manual').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-geometry-add-mode-manual').
  @property {String} flexberryClassNames.dialog Component's inner dialog CSS-class name ('flexberry-geometry-add-mode-manual').
  @property {String} flexberryClassNames.form Component's inner <form> CSS-class name ('flexberry-geometry-add-mode-manual').
  @readonly
  @static

  @for FlexberryGeometryAddModeManualComponent
*/
const flexberryClassNamesPrefix = 'flexberry-geometry-add-mode-import';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: undefined,
  dialog: flexberryClassNamesPrefix + '-dialog',
  form: flexberryClassNamesPrefix + '-form',
  result: flexberryClassNamesPrefix + '-result',
};

let FlexberryGeometryAddModeImportComponent = Ember.Component.extend({
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
    JSON with all objects from file.

    @property responseJson
    @type Object
    @default undefined
  */
  responseJSON: undefined,

  /**
    JSON with objects selected by user.

    @property selectedJSON
    @type Object
    @default undefined
  */
  selectedJSON: undefined,

  /**
    Table headers for import result dialog.

    @property headersTable
    @type Array
    @default undefined
  */
  headersTable: undefined,

  /**
    File control.

    @property fileControl
    @type Object
    @default undefined
  */
  fileControl: undefined,

  /**
    Flag indicates when all imported features was selected..

    @property importAllSelect
    @type Boolean
    @default false
  */
  importAllSelect: false,

  active: false,

  /**
    List of available CRS for import.

    @property availableCRS
    @type Array
  */
  availableCRS: Ember.computed(function () {
    return [{
      crs: L.CRS.EPSG4326,
      name: 'EPSG:4326'
    },
    {
      crs: L.CRS.EPSG3857,
      name: 'EPSG:3857'
    }
    ];
  }),

  /**
    Current selected CRS for import.

    @property selectedCRS
    @type Object
  */
  selectedCRS: Ember.computed('selectedCRSName', function () {
    return this.get('availableCRS').filter((crs) => crs.name === this.get('selectedCRSName'))[0].crs;
  }),

  /**
    Maximum latitude for imported objects.

    @property maxLat
    @type Number
    @default 90
  */
  maxLat: 90,

  /**
    Minimum latitude for imported objects.

    @property minLat
    @type Number
    @default -90
  */
  minLat: -90,

  /**
    Maximum longitude for imported objects.

    @property maxLng
    @type Number
    @default 180
  */
  maxLng: 180,

  /**
    Minimum longitude for imported objects.

    @property minLng
    @type Number
    @default -180
  */
  minLng: -180,

  /**
    Flag indicates whether import dialog has been already requested by user or not.

    @property _dialogHasBeenRequested
    @type Boolean
    @default false
    @private
  */
  _dialogHasBeenRequested: false,

  /**
    Flag indicates whether to show import dialog.

    @property _dialogVisible
    @type Boolean
    @default false
    @private
  */
  _dialogVisible: false,

  /**
    Flag indicates whether to show import result dialog.

    @property _resultDialogVisible
    @type Boolean
    @default false
    @private
  */
  _resultDialogVisible: false,

  /**
    Flag indicates whether import is in process or not.

    @property _importInProcess
    @type Boolean
    @default false
    @private
  */
  _importInProcess: false,

  /**
    Flag indicates whether to show error.

    @property _showError
    @type Boolean
    @default false
    @private
  */
  _showError: false,

  /**
    Current error caption.

    @property _errorCaption
    @type String
    @default undefined
    @private
  */
  _errorCaption: undefined,

  /**
    Current error message.

    @property _errorMessage
    @type String
    @default undefined
    @private
  */
  _errorMessage: undefined,

  /**
    Connection between imported and layer properties.

    @property _propertiesConnection
    @type Object
    @default undefined
    @private
  */
  _propertiesConnection: undefined,

  /**
    Layer properties, that isn't connected to any of imported properties.

    @property _notConnectedProperties
    @type Array
    @default undefined
    @private
  */
  _notConnectedProperties: undefined,

  menuButtonTooltip: t('components.geometry-add-modes.import.menu-button-tooltip'),

  dialogApproveButtonCaption: t('components.geometry-add-modes.import.dialog-approve-button-caption'),

  dialogDenyButtonCaption: t('components.geometry-add-modes.import.dialog-deny-button-caption'),

  crsFieldLabel: t('components.geometry-add-modes.import.crs-field-label'),

  geometryFieldLabel: t('components.geometry-add-modes.import.geometry-field-label'),

  coordinatesFieldLabel: t('components.geometry-add-modes.import.coordinates-field-label'),

  coordinatesFieldPlaceholder: t('components.geometry-add-modes.import.coordinates-field-placeholder'),

  loadButtonCaption: t('components.geometry-add-modes.import.load-button-caption'),

  checkAllTitle: t('components.geometry-add-modes.import.check-all-title'),

  uncheckAllTitle: t('components.geometry-add-modes.import.uncheck-all-title'),

  importError: t('components.geometry-add-modes.import.import-error'),

  coordsValidateErrorCaption: t('components.geometry-add-modes.import.coords-validate-error.caption'),

  coordsValidateErrorMessage: t('components.geometry-add-modes.import.coords-validate-error.message'),

  importErrorCaption: t('components.geometry-add-modes.import.import-error.caption'),

  importErrorMessage: t('components.geometry-add-modes.import.import-error.message'),

  emptyErrorCaption: t('components.geometry-add-modes.import.empty-error.caption'),

  emptyErrorMessage: t('components.geometry-add-modes.import.empty-error.message'),

  init() {
    this._super(...arguments);

    let factories = this.get('availableCRS');
    let availableCRSNames = [];
    factories.forEach((factory) => {
      availableCRSNames.push(factory.name);
    });

    let defaultCrsName = availableCRSNames[0];
    let defaultCrsCode = this.get('settings.layerCRS.code');

    let defaultCrs = factories.filter((crs) => crs.crs.code === defaultCrsCode);
    if (defaultCrs.length > 0) {
      defaultCrsName = Ember.get(defaultCrs, '0.name');
    }

    this.set('availableCRSNames', availableCRSNames);
    this.set('selectedCRSName', defaultCrsName);
  },

  /**
    Handles response from backend with features from file.

    @method handleImportResponse
    @param {Object} response Features from file.
  */
  handleImportResponse(response) {
    this.set('responseJSON', response);
    let importedProperties = Ember.get(response, 'features.0.properties');
    if (importedProperties) {
      this.set('headersTable', Object.keys(importedProperties));

      let layerProperties = Ember.A(Object.keys(this.get('settings.layerFields') || {}));
      let propertiesConnection = {};
      for (let property in importedProperties) {
        if (layerProperties.contains(property)) {
          propertiesConnection[property] = property;
          layerProperties.removeObject(property);
        }
      }

      this.set('_propertiesConnection', propertiesConnection);
      this.set('_notConnectedProperties', layerProperties);
    }

    this.set('_resultDialogVisible', true);
  },

  actions: {
    /**
      Handles uploadFile.

      @method actions.uploadFile
    */
    uploadFile(e) {
      this.set('_showError', false);
      this.set('responseJSON', undefined);
      this.set('_importInProcess', true);
      let file = e.target.files[0];
      this.set('fileControl', Ember.$(e.target));
      let _this = this;
      let config = Ember.getOwner(this).resolveRegistration('config:environment');
      let data = new FormData();
      data.append(file.name, file);

      Ember.$.ajax({
        url: `${config.APP.backendUrl}/controls/FileUploaderHandler.ashx?FileName=${file.name}`,
        type: 'POST',
        data: data,
        cache: false,
        contentType: false,
        processData: false
      }).done((response) => {
        if (response && response.features) {
          _this.handleImportResponse(response);
        } else {
          _this.set('_errorCaption', this.get('emptyErrorCaption'));
          _this.set('_errorMessage', this.get('emptyErrorMessage'));
          _this.set('_showError', true);
        }
      }).fail(() => {
        _this.set('_errorCaption', this.get('importErrorCaption'));
        _this.set('_errorMessage', this.get('importErrorMessage'));
        _this.set('_showError', true);
      }).always(() => {
        _this.set('_importInProcess', false);
      });
    },

    /**
      Handles button click.

      @method actions.onButtonClick
    */
    onButtonClick() {
      this.set('_dialogHasBeenRequested', true);
      this.set('_dialogVisible', true);
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
      Invokes {{#crossLink "FlexberryGeometryAddModeManualComponent/sendingActions.complete:method"}}'complete' action{{/crossLink}}.

      @method actions.onApprove
    */
    onApprove(e) {
      this.set('_showError', false);
      let selectedJSON = this.get('selectedJSON') || { features: [] };

      let coordsToLatLng = function(coords) {
        let selectedCRS = this.get('selectedCRS');
        return selectedCRS.unproject(L.point(coords));
      };

      let checkCoords = function(minLat, minLng, maxLat, maxLng) {
        if (maxLat > this.get('maxLat') || minLat < this.get('minLat') ||
        maxLng > this.get('maxLng') || minLng < this.get('minLng')) {
          this.set('_errorCaption', this.get('coordsValidateErrorCaption'));
          this.set('_errorMessage', this.get('coordsValidateErrorMessage'));
          this.set('_showError', true);
        }
      }.bind(this);

      let newLayers = Ember.A();

      selectedJSON.features.forEach((feature) => {
        if (!Ember.isNone(feature.geometry)) {
          let newLayer = L.geoJSON(feature, { coordsToLatLng: coordsToLatLng.bind(this) }).getLayers()[0];
          if (newLayer.getLatLng instanceof Function) {
            let coords = newLayer.getLatLng();
            checkCoords(coords.lat, coords.lng, coords.lat, coords.lng);
          }

          if (newLayer.getBounds instanceof Function) {
            let bounds = newLayer.getBounds();
            checkCoords(bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast());
          }

          newLayers.pushObject(newLayer);
        }
      }, this);

      if (this.get('_showError')) {
        e.closeDialog = false;

        return;
      }

      this.sendAction('importComplete', newLayers);
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.hide:method"}}'flexberry-dialog' component's 'hide' action{{/crossLink}}.

      @method actions.onHide
    */
    onHide() {
      this.set('selectedJSON', undefined);
      this.set('_showError', false);
      this.set('_importInProcess', false);
    },

    /**
       Handles {{#crossLink "FlexberryDialogComponent/sendingActions.approve:method"}}'flexberry-dialog' component's 'approve' action{{/crossLink}}.
       Invokes {{#crossLink "FlexberryGeometryAddModeManualComponent/sendingActions.complete:method"}}'complete' action{{/crossLink}}.

       @method actions.onApproveImportDialog
    */
    onApproveImportDialog(e) {
      let responseJSON = this.get('responseJSON') || { features: [] };

      if (responseJSON.features.length > 0) {
        this.set('selectedJSON', { type: 'FeatureCollection' });

        let propertiesConnection = this.get('_propertiesConnection') || {};
        let selectedFeatures = responseJSON.features.filter((feature) => feature.selected).map((feature) => {
          delete feature.selected;
          Object.keys(feature.properties).forEach((property) => {
            let connectedProperty = Ember.get(propertiesConnection, `${property}`);
            if (connectedProperty !== property) {
              if (connectedProperty) {
                Ember.set(feature, `properties.${connectedProperty}`, Ember.get(feature, `properties.${property}`));
              }

              delete feature.properties[property];
            }
          });

          return feature;
        });

        this.set('selectedJSON.features', selectedFeatures);
      } else {
        this.set('selectedJSON', undefined);
      }
    },

    /**
      Handles {{#crossLink "FlexberryDialogComponent/sendingActions.hide:method"}}'flexberry-dialog' component's 'hide' action{{/crossLink}}.

      @method actions.onHideImportDialog
    */
    onHideImportDialog(e) {
      this.set('_dialogHasBeenRequested', true);
      this.set('_dialogVisible', true);

      this.set('_resultDialogVisible', false);
      this.set('responseJSON', undefined);
      this.set('importAllSelect', false);
      this.set('_propertiesConnection', undefined);
      this.set('_notConnectedProperties', undefined);
      if (this.get('fileControl')) {
        this.get('fileControl').val('');
      }
    },

    /**
      Handles selectAll button click on import result dialog.

      @method actions.onImportAllSelect
    */
    onImportAllSelect() {
      let importedFeatures = this.get('responseJSON.features') || [];
      let importAllSelect = this.get('importAllSelect');

      importedFeatures.forEach((feature) => {
        Ember.set(feature, 'selected', !importAllSelect);
      });

      this.toggleProperty('importAllSelect');
    },

    /**
      Handles changing in properties connections.

      @method actions.onPropertyConnectionChange
      @param {String} property Imported property name.
      @param {String} newValue New value of connected property name.
    */
    onPropertyConnectionChange(property, component, newValue) {
      if (Ember.isBlank(newValue)) {
        newValue = undefined;
      }

      this.set(`_propertiesConnection.${property}`, newValue);
    }
  },

  /**
    Component's action invoking when new geometry was added.

    @method sendingActions.importComplete
    @param {Object} addedLayer Added layer.
  */
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryGeometryAddModeImportComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryGeometryAddModeImportComponent;
