/**
  @module ember-flexberry-gis
*/
import Ember from 'ember';
import BaseModeComponent from 'ember-flexberry-gis/components/layers-dialogs/edit-modes/base';
import layout from '../../../templates/components/layers-dialogs/edit-modes/test-mode';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.
  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-edit-mode-csw').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name (null, because component is tagless).
  @readonly
  @static
  @for CswModeComponent
*/
const flexberryClassNamesPrefix = 'flexberry-edit-mode-csw';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null
};

/**
  @class CswModeComponent
  @extends BaseModeComponent
*/
let CswModeComponent = BaseModeComponent.extend({

  layout,
  /**
    Array of property names that will be bound from parentView.
    @property bindingProperties
    @type String[]
    @default ['cswConnections', 'leafletMap']
  */
  bindingProperties: ['cswConnections', 'leafletMap'],

  /**
    Loaded CSW connections.
    @property cswConnections
    @type Object[]
    @default null
  */
  cswConnections: null,

  /**
    Leaflet map.
    @property leafletMap
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
  */
  leafletMap: null,

  store: Ember.inject.service(),
  metadataTestRecordCount:5,
  _metadataRecords:[],
  _metadataRecordsName:[],

  init: function() {
    this._super();
    let metadataArray = [];
    let metadataArrayNames = [];
    let store = this.get('store');
    let loadedMetadata = store.peekAll('new-platform-flexberry-g-i-s-layer-metadata');
    loadedMetadata.forEach((item, index) => {
      metadataArray.push(item);
      metadataArrayNames.push(item.get('name'));
    });
    Ember.set(this, '_metadataRecords', metadataArray);
    Ember.set(this, '_metadataRecordsNames', metadataArrayNames);
  },

  getLayerFromMetadata(metadata) {
    let mapLayer = {
      name: metadata.get('name'),
      description: metadata.get('description'),
      keyWords: metadata.get('keyWords'),
      type: metadata.get('type'),
      settings: metadata.get('settings'),
      scale:metadata.get('scale'),
      coordinateReferenceSystem:metadata.get('coordinateReferenceSystem'),
      boundingBox:metadata.get('boundingBox'),
      layerLink: []
    };
    this.addLinkMetadata(mapLayer, metadata.get('linkMetadata'));
    console.log('Metadata Convert');
    return mapLayer;
  },

  addLinkMetadata(layerModel, linkMetadata) {
    console.log('addLinkMetadata start');
    linkMetadata.forEach((item) => {
      let newLayerLink = {
        allowShow: item.get('allowShow'),
        mapObjectSetting: item.get('mapObjectSetting'),
        parameters:[{ name: 'test' }]
      };
      this.addLinkParametersMetadata(newLayerLink, item.get('parameters'));
      layerModel.layerLink.push(newLayerLink);
    });
  },

  addLinkParametersMetadata(layerLinkModel, parameters) {
    console.log('addParameters start');
    parameters.forEach((item) => {
      let newLinkParameter = {
        objectField: item.get('objectField'),
        layerField: item.get('layerField'),
        expression: item.get('expression'),
        queryKey: item.get('queryKey'),
        linkField: item.get('linkField')
      };
      layerLinkModel.parameters.push(newLinkParameter);
    });
  },

  actions: {

    createLayerFromMetadata() {
      let layer = this.getLayerFromMetadata(
        this._metadataRecords[this._metadataRecordsNames.indexOf(this._metadataRecordsName)]
      );
      this.sendAction('editingFinished', layer);
    }
  }

});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
CswModeComponent.reopenClass({
  flexberryClassNames,
  layout
});

export default CswModeComponent;
