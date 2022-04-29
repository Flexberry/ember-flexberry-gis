/**
  @module ember-flexberry-gis
*/

import { isArray } from '@ember/array';

import { inject as service } from '@ember/service';
import BaseModeComponent from 'ember-flexberry-gis/components/layers-dialogs/layers-prototyping-modes/base';
import { createLayerFromMetadata } from 'ember-flexberry-gis/utils/create-layer-from-metadata';
import QueryBuilder from 'ember-flexberry-data/query/builder';
import layout from '../../../templates/components/layers-dialogs/layers-prototyping-modes/metadata-mode';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.
  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-edit-mode-metadata').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-edit-mode-metadata').
  @readonly
  @static
  @for MetadataModeComponent
*/
const flexberryClassNamesPrefix = 'flexberry-edit-mode-metadata';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
};

/**
  @class MetadataModeComponent
  @extends BaseModeComponent
*/
const MetadataModeComponent = BaseModeComponent.extend({
  /**
    Loaded metadata records.

    @property _metadataRecords
    @type NewPlatformFlexberryGISLayerMetadataModel[]
    @default null
    @private
  */
  _metadataRecords: null,

  /**
    Loaded metadata records names.

    @property _metadataRecordsNames
    @type String[]
    @default null
    @private
  */
  _metadataRecordsNames: null,

  /**
    Selected metadata record name.

    @property _selectedMetadataRecord
    @type String
    @default null
    @private
  */
  _selectedMetadataRecordName: null,

  /**
    Metadata loading error message.

    @property _errorMessage
    @type String
    @default ''
    @private
  */
  _errorMessage: '',

  /**
    Flag indicating whether metadata is loading yet or not.

    @property _metadataIsLoading
    @type Boolean
    @default false
    @private
  */
  _metadataIsLoading: false,

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
    Array of property names that will be bound from parentView.

    @property bindingProperties
    @type String[]
    @default []
  */
  bindingProperties: Object.freeze([]),

  /**
    Reference to 'store' service.

    @property store
    @type <a href="https://emberjs.com/api/ember-data/2.4/classes/DS.Store">DS.Store</a>
    @private
  */
  store: service('store'),

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    this._loadMetadataRecords();
  },

  /**
    Loads exisiting metadata records.

    @method _loadMetadataRecords
    @private
  */
  _loadMetadataRecords() {
    this.set('_errorMessage', '');
    this.set('_metadataIsLoading', true);

    const store = this.get('store');
    const queryBuilder = new QueryBuilder(store)
      .from('new-platform-flexberry-g-i-s-layer-metadata')
      .selectByProjection('LayerMetadataE');

    store.query('new-platform-flexberry-g-i-s-layer-metadata', queryBuilder.build()).then((result) => {
      const metadataRecords = result.toArray();
      const metadataRecordsNames = metadataRecords.map((item) => item.get('name'));

      this.set('_metadataRecords', metadataRecords);
      this.set('_metadataRecordsNames', metadataRecordsNames);
    }).catch((error) => {
      this.set('_errorMessage', error);
    }).finally(() => {
      this.set('_metadataIsLoading', false);
    });
  },

  actions: {
    /**
      Handles changing of the selected matedata record and creates new layer form it.

      @method actions.onSelectedMetadataRecordChanged
    */
    onSelectedMetadataRecordChanged() {
      const metadataRecords = this.get('_metadataRecords');
      if (!isArray(metadataRecords)) {
        return;
      }

      const store = this.get('store');
      const metadataRecordsNames = this.get('_metadataRecordsNames');
      const selectedMetadataRecordName = this.get('_selectedMetadataRecordName');
      const selectedMetadataRecord = metadataRecords[metadataRecordsNames.indexOf(selectedMetadataRecordName)];

      const layer = createLayerFromMetadata(selectedMetadataRecord, store);
      this.sendAction('editingFinished', layer);
    },

    /**
      Handles clicks on "Reload metadata" button and reloads metadata records.

      @method actions.reloadMetadata
    */
    reloadMetadata() {
      this._loadMetadataRecords();
    },
  },
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
MetadataModeComponent.reopenClass({
  flexberryClassNames,
});

export default MetadataModeComponent;
