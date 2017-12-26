/**
  @module ember-flexberry-gis
*/
import Ember from 'ember';
import BaseModeComponent from 'ember-flexberry-gis/components/layers-dialogs/edit-modes/base';
import layout from '../../../templates/components/layers-dialogs/edit-modes/metadata-mode';
import { createLayerFromMetadata } from 'ember-flexberry-gis/utils/create-layer-from-metadata';
import { translationMacro as t } from 'ember-i18n';

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

  /**
    Dialog's dropdown caption.

    @property dropdownCaption
    @type String
    @default t('components.layers-dialogs.edit-modes.metadata-mode.metadata-records-dropdown.caption')
  */
  dropdownCaption: t('components.layers-dialogs.edit-modes.metadata-records-dropdown.caption'),

  store: Ember.inject.service(),
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

  actions: {

    createLayerFromMetadata() {
      let layer = createLayerFromMetadata(
        this._metadataRecords[this._metadataRecordsNames.indexOf(this._metadataRecordsName)]
      );
      this.sendAction('editingFinished', layer);
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
