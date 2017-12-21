/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseModeComponent from 'ember-flexberry-gis/components/layers-dialogs/edit-modes/base';
import layout from '../../../templates/components/layers-dialogs/edit-modes/test-mode';
import { Query } from 'ember-flexberry-data';
/*import {
  translationMacro as t
} from 'ember-i18n';
*/
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
  _metadataRecordsName:'',

  init: function() {
    this._super();
    let metadataArray=[];
    let metadataArrayNames=[];
    /*
    for (var i = 0; i < this.metadataTestRecordCount; i++) {
      let metadata = this.createTestMetadata(i);
      metadataArray.push(metadata);
      metadataArrayNames.push(metadata.get('name'));
    }
    */
    let store = this.get('store');
    let loadedMetadata = store.peekAll('new-platform-flexberry-g-i-s-layer-metadata');
    loadedMetadata.forEach((item, index) => {
      metadataArray.push(item);
      metadataArrayNames.push(item.get('name'));
    });
    Ember.set(this, '_metadataRecords',metadataArray);
    Ember.set(this, '_metadataRecordsNames',metadataArrayNames);
    console.log(this._metadataRecordsNames);
   },

  createTestMetadata(number){
    let store = this.get('store');
    let testMapLayer = store.createRecord('new-platform-flexberry-g-i-s-layer-metadata', {
      syncDownTime: undefined,
      readOnly: undefined,
      createTime: undefined,
      creator: undefined,
      editTime: undefined,
      editor: undefined,
      name: 'TestName - '+ number,
      description: 'Descr Test',
      keyWords: 'Keyword Test',
      anyText: 'Anytext test',
      type: 'wms-wfs',
      settings:'{"opacity":1,"bounds": [["43","39"],["44","41"]],"wgs84bbox":[["43","39"],["44","41"]],"bbox":[[null,null],[null,null]],"searchSettings":{"canBeSearched":false,"canBeContextSearched":false,"contextSearchFields":null,"searchFields":null}}',
      scale:0,
      coordinateReferenceSystem:'{"code":"EPSG:3857","definition":null}',
      boundingBox:null
    });
    testMapLayer.get('linkMetadata').pushObject(this.createTestLinkMetadata(number));
    console.log('Metadata Create');
    return testMapLayer;
  },

  createTestLinkMetadata(number){
    let store = this.get('store');
    let testLinkLayer = store.createRecord('new-platform-flexberry-g-i-s-link-metadata', {
      allowShow: true,
      mapObjectSetting: undefined,
    });
    testLinkLayer.get('parameters').pushObject(this.createTestParametersMetadata(number));
    console.log('LinkMetadata Create');
    return testLinkLayer;
  },

  createTestParametersMetadata(number){
    let store = this.get('store');
    let testParamLayer = store.createRecord('new-platform-flexberry-g-i-s-parameter-metadata', {
      objectField: undefined,
      layerField: undefined,
      expression: 'test params - '+number,
      queryKey: undefined,
      linkField: undefined
    });
    console.log('Param Create');
    return testParamLayer;
  },

  loadTestMetadata(){
    console.log('Record loaded');
    return this.get('store').peekRecord('new-platform-flexberry-g-i-s-layer-metadata',9384);
  },


  getLayerFromMetadata(metadata){
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
          parameters:[{name:'test'}]

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

    createMetadataRecords(){
      let metadataArray=[{}];
      let metadataArrayNames=[];
      for (var i = 0; i < this.metadataTestRecordCount; i++) {
        let metadata = this.createTestMetadata(i);
        metadataArray.push(metadata);
        metadataArrayNames.push(metadata.get('name'));
      }
      Ember.set(this, '_metadataRecords',metadataArray);
      Ember.set(this, '_metadataRecordsNames',metadataArrayNames);

    },

    metadataSelect(){
      Ember.set(this, '_selectedRecordNumber',this._metadataRecordsNames.indexOf(this._metadataRecordsName));
    },

    createLayerFromMetadata(){
    //  let layer = this.getLayerFromMetadata(this._metadataRecords[this._selectedRecordNumber]);
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
