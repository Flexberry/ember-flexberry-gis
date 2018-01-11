/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseModeComponent from 'ember-flexberry-gis/components/layers-dialogs/edit-modes/base';
import layout from '../../../templates/components/layers-dialogs/edit-modes/metadata-mode';
import { createLayerFromMetadata } from 'ember-flexberry-gis/utils/create-layer-from-metadata';
import { Query } from 'ember-flexberry-data';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.
  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-edit-mode-metadata').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name (null, because component is tagless).
  @readonly
  @static
  @for MetadataModeComponent
*/
const flexberryClassNamesPrefix = 'flexberry-edit-mode-metadata';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null
};

/**
  @class MetadataModeComponent
  @extends BaseModeComponent
*/
let MetadataModeComponent = BaseModeComponent.extend({

  layout,
  /**
    Array of property names that will be bound from parentView.
    @property bindingProperties
    @type String[]
    @default ['leafletMap']
  */
  bindingProperties: ['leafletMap'],

  /**
    Leaflet map.
    @property leafletMap
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
  */
  leafletMap: null,

  store: Ember.inject.service(),
  _metadataRecords:[],
  _chosenRecordName:'',
  _errorMessage:'',
  _metadataIsLoaded:false,

  // Init Component
  init: function() {
    this._super();
    this._loadMetadataRecords();
  },

  // Load all existing metadata records and add it to array for dropdown list
  _loadMetadataRecords() {
    this.set('_errorMessage', '');
    this.set('_metadataIsLoaded', false);
    let store = this.get('store');
    let queryBuilder = new Query.Builder(store)
        .from('new-platform-flexberry-g-i-s-layer-metadata')
        .selectByProjection('LayerMetadataE');

    let recordsQuery = store.query('new-platform-flexberry-g-i-s-layer-metadata', queryBuilder.build());

    recordsQuery.then((result) => {
      let metadataArrayNames = [];
      let loadedMetadata = result.toArray();
      loadedMetadata.forEach((item, index) => {
        metadataArrayNames.push(item.get('name'));
      });

      Ember.set(this, '_metadataRecords', loadedMetadata);
      Ember.set(this, '_metadataRecordsNames', metadataArrayNames);
    }).catch((error) => {
      this.set('_errorMessage', error);
    }).finally((result) => {
      this.set('_metadataIsLoaded', true);
    });

  },

  actions: {

    // Create layer from selected metadata record
    createLayerFromMetadata() {
      let store = this.get('store');
      let layer = createLayerFromMetadata(
        this._metadataRecords[this._metadataRecordsNames.indexOf(this._chosenRecordName)],
        store
      );
      this.sendAction('editingFinished', layer);
    },

    // Action for button "Reload metadata"
    reloadMetadata() {
      this._loadMetadataRecords();
    }

  }

});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
MetadataModeComponent.reopenClass({
  flexberryClassNames,
  layout
});

export default MetadataModeComponent;
