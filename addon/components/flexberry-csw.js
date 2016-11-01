/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-csw';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-csw').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-csw').
  @property {String} flexberryClassNames.tabularMenu Component's tabular menu CSS-class name ('flexberry-csw-tabular-menu').
  @readonly
  @static

  @for FlexberryIconComponent
*/
const flexberryClassNamesPrefix = 'flexberry-csw';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  tabularMenu: flexberryClassNamesPrefix + '-tabular-menu'
};

const maxRecordsOnPage = 10;

/**
  Flexberry CSW component.

  @class FlexberryCswComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
let FlexberryCswComponent = Ember.Component.extend({
  /**
    Flag: indicates whether to show error message or not.

    @property _showErrorMessage
    @type Boolean
    @default false
    @private
  */
  _showErrorMessage: false,

  /**
    Error message.

    @property _errorMessage
    @type String
    @default null
    @private
  */
  _errorMessage: null,

  /**
    Flag: indicates whether "GetRecords" request is in progress now.

    @property _findRecordsIsInProgress
    @type Boolean
    @default false
    @private
  */
  _getRecordsIsInProgress: false,

  /**
    Records.

    @property _records
    @type Object
    @default null
    @private
  */
  _records: null,

  /**
    Records pages metadata.

    @property _recordsPages
    @type Object[]
    @default null
    @private
  */
  _recordsPages: null,

  /**
    Records cache.

    @property _recordsCache
    @type Object
    @default null
    @private
  */
  _recordsCache: null,

  /**
    Flag: indicates whether some connection is selected or not.

    @property _hasSelectedConnection
    @type Boolean
    @readOnly
    @private
  */
  _hasSelectedConnection: Ember.computed('selectedConnection', function() {
    return !Ember.isNone(this.get('selectedConnection'));
  }),

  /**
    Available connections.

    @property _availableConnections
    @type Object[]
    @readOnly
    @private
  */
  _availableConnections: Ember.computed('connections.[]', 'connections.@each.isDeleted', function() {
    let connections = this.get('connections');
    if (!Ember.isArray(connections)) {
      return Ember.A();
    }

    let availableConnections = Ember.A(connections.filter((connection, i) => {
      return Ember.get(connection, 'isDeleted') !== true;
    }));

    let selectedConnection = this.get('selectedConnection');
    if (!Ember.isNone(selectedConnection) && !availableConnections.contains(selectedConnection)) {
      // Selected connection isn't available anymore.
      this.set('selectedConnection', null);
    }

    return availableConnections;
  }),

  /**
    Unique connections names.

    @property _availableConnectionsNames
    @type String[]
    @readOnly
    @private
  */
  _availableConnectionsNames: Ember.computed('_availableConnections.[]', '_availableConnections.@each.name', function() {
    let availableConnectionsNames = Ember.A();

    let availableConnections = this.get('_availableConnections');
    if (Ember.isArray(availableConnections)) {
      availableConnections.forEach((connection, i) => {
        availableConnectionsNames.pushObject(`${i + 1} - ${Ember.get(connection, 'name')}`);
      });
    }

    return availableConnectionsNames;
  }),

  /**
    Selected connection name.

    @property _selectedConnectionName
    @type String
    @readOnly
    @private
  */
  _selectedConnectionName: Ember.computed('_availableConnectionsNames.[]', 'selectedConnection', function() {
    let availableConnections = this.get('_availableConnections');
    let selectedConnection = this.get('selectedConnection');
    if (!Ember.isArray(availableConnections) || Ember.isNone(selectedConnection)) {
      return null;
    }

    let selectedConnectionName = null;
    availableConnections.forEach((connection, i) => {
      if (connection === selectedConnection) {
        selectedConnectionName = this.get(`_availableConnectionsNames.${i}`);
        return false;
      }
    });

    return selectedConnectionName;
  }),

  /**
    CSW for the selected connection.

    @property _selectedConnectionCsw
    @type Object
    @default null
    @private
  */
  _selectedConnectionCsw: Ember.computed('selectedConnection.url', function() {
    let selectedConnection = this.get('selectedConnection');
    if (Ember.isNone(selectedConnection)) {
      return null;
    }

    return this._createCsw(Ember.get(selectedConnection, 'url'));
  }),

  /**
    Unique records names.

    @property _availableRecordsNames
    @type String[]
    @readOnly
    @private
  */
  _availableRecordsNames: Ember.computed('_records.records.[]', function() {
    let availableRecordsNames = Ember.A();
    if (!this.get('dropdownMode')) {
      return availableRecordsNames;
    }

    let records = this.get('_records.records');
    let pages = this.get('_recordsPages');

    if (!Ember.isArray(records)) {
      return availableRecordsNames;
    }

    let currentPageNumber = 1;
    pages.forEach((page) => {
      if (Ember.get(page, 'isCurrent')) {
        currentPageNumber = Ember.get(page, 'number');
        return false;
      }
    });

    records.forEach((record, i) => {
      availableRecordsNames.pushObject(`${(currentPageNumber - 1) * maxRecordsOnPage + i + 1} - ${record.title} (${record.type})`);
    });

    return availableRecordsNames;
  }),

  /**
    Selected record name.

    @property _selectedRecordName
    @type String
    @readOnly
    @private
  */
  _selectedRecordName: Ember.computed('_availableRecordsNames.[]', '_selectedRecord', function() {
    if (!this.get('dropdownMode')) {
      return null;
    }

    let records = this.get('_records.records');
    let selectedRecord = this.get('_selectedRecord');
    if (!Ember.isArray(records) || Ember.isNone(selectedRecord)) {
      return null;
    }

    let selectedRecordName = null;
    records.forEach((record, i) => {
      if (record === selectedRecord) {
        selectedRecordName = this.get(`_availableRecordsNames.${i}`);
        return false;
      }
    });

    return selectedRecordName;
  }),

  /**
    Selected record.

    @property _selectedRecord
    @type Object
    @default null
    @private
  */
  _selectedRecord: null,

  /**
    Search settings.

    @property _searchSettings
    @type Object
    @default null
    @private
  */
  _searchSettings: null,

  /**
    Available bounding box modes.

    @property _availableBoundingBoxModes
    @type String[]
    @default null
    @private
  */
  _availableBoundingBoxModes: null,

  /**
    Flag: indicates whether 'no-bounding-box' search mode is selected.

    @property _noBoundingBox
    @type Boolean
    @default true
    @private
  */
  _noBoundingBox: true,

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
    Component's wrapping <div> CSS-classes names.
    Any other CSS-classes can be added through component's 'class' property.

    @property classNames
    @type String[]
    @default ['flexberry-csw', 'ui', 'segments']
  */
  classNames: [flexberryClassNames.wrapper, 'ui', 'segments'],

  /**
    Flag: indicates whether component is in readonly mode or not.

    @property readonly
    @type Boolean
    @default false
  */
  readonly: false,

  /**
    Flag: indicates whether dropdown mode is enabled or not.

    @property dropdownMode
    @type Boolean
    @default false
  */
  dropdownMode: false,

  /**
    Available CSW connections.

    @property connections
    @type Object[]
    @default null
  */
  connections: null,

  /**
    Selected connection.

    @property selectedConnection
    @type Object
    @default null
  */
  selectedConnection: null,

  /**
    Leaflet map.

    @property leafletMap
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
  */
  leafletMap: null,

  actions: {
    onErrorMessageHide() {
      this.set('_showErrorMessage', false);
      this.set('_errorMessage', null);
    },

    onConnectionsDropdownChange(selectedConnectionName) {
      let connection = null;
      this.get('_availableConnectionsNames').forEach((connectionName, i) => {
        if (selectedConnectionName === connectionName) {
          // Retrieve connection by name & remember as selected.
          connection = this.get(`_availableConnections.${i}`);
          return false;
        }
      });

      this.set('selectedConnection', connection);
      this.set('_records', null);
      this.set('_selectedRecord', null);
    },

    onRecordsDropdownChange(selectedRecordName) {
      let record = null;
      this.get('_availableRecordsNames').forEach((recordName, i) => {
        if (selectedRecordName === recordName) {
          // Retrieve record by name & remember as selected.
          record = this.get(`_records.records.${i}`);
          return false;
        }
      });

      if (!Ember.isNone(record)) {
        this.send('onRecordCheckedStateChange', record, { checked: true });
      }

      let previouslySelectedRecord = this.get('_selectedRecord');
      if (!Ember.isNone(previouslySelectedRecord)) {
        this.send('onRecordCheckedStateChange', previouslySelectedRecord, { checked: false });
      }

      this.set('_selectedRecord', record);
    },

    onGetRecordsButtonClick(start, overrwritePreviousResults, e) {
      start = Ember.typeOf(start) === 'number' ? start : 1;
      let count = maxRecordsOnPage;

      if (this.get('_getRecordsIsInProgress')) {
        return;
      }

      let selectedConnection = this.get('selectedConnection');
      if (Ember.isNone(selectedConnection)) {
        return;
      }

      if (overrwritePreviousResults) {
        this.set('_recordsCache', {});
      }

      let recordsCache = this.get('_recordsCache');
      let currentPageCache = Ember.get(recordsCache, '' + start);
      if (!Ember.isNone(currentPageCache)) {
        this.set('_records', Ember.get(currentPageCache, 'records'));
        this.set('_recordsPages', Ember.get(currentPageCache, 'recordsPages'));

        let previouslySelectedRecord = this.get('_selectedRecord');
        if (!Ember.isNone(previouslySelectedRecord)) {
          this.send('onRecordCheckedStateChange', previouslySelectedRecord, { checked: false });
        }

        let selectedRecord = Ember.get(currentPageCache, 'records.records.0');
        this.set('_selectedRecord', selectedRecord);
        if (!Ember.isNone(selectedRecord)) {
          this.send('onRecordCheckedStateChange', selectedRecord, { checked: true });
        }

        return;
      } else {
        currentPageCache = {};
      }

      this.set('_getRecordsIsInProgress', true);

      let keywordsFilter;

      let keywords = this.get('_searchSettings.keywords');
      if (!Ember.isBlank(keywords)) {
        keywordsFilter = new window.Ows4js.Filter().PropertyName('dc:subject').isLike('%' + keywords + '%');
      }

      let bboxFilter;
      let noBoundingBox = this.get('_noBoundingBox');
      if (!noBoundingBox) {
        let crsCode = this.get('leafletMap.options.crs.code');
        let minX = this.get('_searchSettings.boundingBoxMinX');
        let minY = this.get('_searchSettings.boundingBoxMinY');
        let maxX = this.get('_searchSettings.boundingBoxMaxX');
        let maxY = this.get('_searchSettings.boundingBoxMaxY');
        bboxFilter = new window.Ows4js.Filter().BBOX(minX, minY, maxX, maxY, crsCode);
      }

      let filter;
      if (!Ember.isNone(keywordsFilter) && !Ember.isNone(bboxFilter)) {
        filter = keywordsFilter.and(bboxFilter);
      } else {
        filter = keywordsFilter || bboxFilter;
      }

      this.get('_selectedConnectionCsw').GetRecords(start, count, filter).then((records) => {
        let parsedRecords = this._parseRecords(records);
        let pagesCount = Math.ceil(parsedRecords.matchedRecordsCount / count);
        let pages = Ember.A();
        for (let i = 0; i < pagesCount; i++) {
          let page = {
            number: i + 1,
            start: i * count + 1,
            count: count,
            isCurrent: false
          };

          if (start === page.start) {
            page.isCurrent = true;
            pages.currentPageStart = page.start;

            if (i > 0) {
              pages.hasPreviousPage = true;
              pages.previousPageStart = (i - 1) * count + 1;
            }

            if (i + 1 < pagesCount) {
              pages.hasNextPage = true;
              pages.nextPageStart = (i + 1) * count + 1;
            }
          }

          pages.pushObject(page);
        }

        Ember.set(currentPageCache, 'records', parsedRecords);
        Ember.set(currentPageCache, 'recordsPages', pages);
        Ember.set(recordsCache, '' + start, currentPageCache);

        this.set('_records', parsedRecords);
        this.set('_recordsPages', pages);

        let previouslySelectedRecord = this.get('_selectedRecord');
        if (!Ember.isNone(previouslySelectedRecord)) {
          this.send('onRecordCheckedStateChange', previouslySelectedRecord, { checked: false });
        }

        let selectedRecord = Ember.get(parsedRecords, 'records.0');
        this.set('_selectedRecord', selectedRecord);
        if (!Ember.isNone(selectedRecord)) {
          this.send('onRecordCheckedStateChange', selectedRecord, { checked: true });
        }
      }).catch((reason) => {
        this.set('_showErrorMessage', true);
        this.set('_errorMessage', reason);

        this.set('_records', null);
        this.set('_recordsPages', null);

        let previouslySelectedRecord = this.get('_selectedRecord');
        if (!Ember.isNone(previouslySelectedRecord)) {
          this.send('onRecordCheckedStateChange', previouslySelectedRecord, { checked: false });
        }

        this.set('_selectedRecord', null);
      }).finally(() => {
        this.set('_getRecordsIsInProgress', false);
      });
    },

    onRecordCheckedStateChange(record, e) {
      if (e.checked) {
        this.sendAction('recordSelected', record);
      } else {
        this.sendAction('recordUnselected', record);
      }
    },

    onBoundingBoxModeChange(boundingBoxMode) {
      let i18n = this.get('i18n');
      let mapBoundingBoxMode = i18n.t('components.flexberry-csw.search-settings.bounding-box.modes.map-bounding-box.caption');
      if (mapBoundingBoxMode.toString() === boundingBoxMode.toString()) {
        let leafletMap = this.get('leafletMap');
        let mapBounds = leafletMap.getBounds();
        let crs = leafletMap.options.crs;

        let sw = crs.project(mapBounds.getSouthWest());
        let ne = crs.project(mapBounds.getNorthEast());

        this.set('_searchSettings.boundingBoxMinX', sw.x);
        this.set('_searchSettings.boundingBoxMaxX', ne.x);
        this.set('_searchSettings.boundingBoxMinY', sw.y);
        this.set('_searchSettings.boundingBoxMaxY', ne.y);

        this.set('_noBoundingBox', false);
      } else {
        this.set('_searchSettings.boundingBoxMinX', null);
        this.set('_searchSettings.boundingBoxMaxX', null);
        this.set('_searchSettings.boundingBoxMinY', null);
        this.set('_searchSettings.boundingBoxMaxY', null);

        this.set('_noBoundingBox', true);
      }
    }
  },

  /**
    Creates CSW for connection with the specified URL.

    @method _createCsw
    @private
    @param {String} url Specified URL.
    @return {Object} Created CSW.
  */
  _createCsw(url) {
    let cswConfig = [[
        window.OWS_1_0_0,
        window.DC_1_1,
        window.DCT,
        window.XLink_1_0,
        window.SMIL_2_0,
        window.SMIL_2_0_Language,
        window.GML_3_1_1,
        window.Filter_1_1_0,
        window.CSW_2_0_2,
        window.GML_3_2_0,
        window.ISO19139_GCO_20060504,
        window.ISO19139_GMD_20060504,
        window.ISO19139_GMX_20060504,
        window.ISO19139_GSS_20060504,
        window.ISO19139_GTS_20060504,
        window.ISO19139_GSR_20060504,
        window.ISO19139_SRV_20060504
      ], {
        namespacePrefixes: {
          'http://www.opengis.net/cat/csw/2.0.2': 'csw',
          'http://www.opengis.net/ogc': 'ogc',
          'http://www.opengis.net/gml': 'gml',
          'http://purl.org/dc/elements/1.1/': 'dc',
          'http://purl.org/dc/terms/': 'dct',
          'http://www.isotc211.org/2005/gmd': 'gmd',
          'http://www.isotc211.org/2005/gco': 'gco'
        },
        mappingStyle: 'simplified'
      }
    ];

    return new window.Ows4js.Csw(url, cswConfig);
  },

  /**
    Returns parsed records.

    @method _parseRecords
    @param {Object} records Received records.
    @return {Object} Parsed records.
    @private
  */
  _parseRecords(records) {
    if (Ember.isNone(records)) {
      return null;
    }

    records = Ember.get(records, 'csw:GetRecordsResponse');
    let parsedRecords = {
      matchedRecordsCount: Ember.get(records, 'searchResults.numberOfRecordsMatched'),
      returnedRecordsCount: Ember.get(records, 'searchResults.numberOfRecordsReturned'),
      nextRecord: Ember.get(records, 'searchResults.nextRecord'),
      records: Ember.A()
    };

    records = Ember.A(Ember.get(records, 'searchResults.abstractRecord') || []);
    records.forEach((record) => {
      record = Ember.get(record, 'csw:Record');

      let parsedRecord = {};
      let recordDcElements = Ember.A(Ember.get(record, 'dcElement') || []);
      recordDcElements.forEach((recordDcElement) => {
        let keys = Ember.A(Object.keys(recordDcElement));
        if (keys.contains('dc:identifier')) {
          parsedRecord.id = Ember.get(recordDcElement, 'dc:identifier.content.0');
        } else if (keys.contains('dct:references')) {
          let type = Ember.get(recordDcElement, 'dct:references.scheme').toLowerCase();
          switch (type) {
            case 'ogc:wms':
              type = 'wms';
              break;
            case 'ogc:wfs':
              type = 'wfs';
              break;
          }

          parsedRecord.type = type;
          parsedRecord.url = Ember.get(recordDcElement, 'dct:references.content.0');
        } else if (keys.contains('dc:title')) {
          parsedRecord.title = Ember.get(recordDcElement, 'dc:title.content.0');
        } else if (keys.contains('dc:description')) {
          parsedRecord.description = Ember.get(recordDcElement, 'dc:description.content.0');
        }
      });

      // Transform name 'urn:x-ogc:def:crs:EPSG:6.11:4326' into code 'EPSG:4326'
      let crsName = Ember.get((Ember.get(record, 'boundingBox') || [])[0], 'ows:BoundingBox.crs');
      let crsCodeParts = crsName.split('crs:')[1].split(':');
      let crsCode = crsCodeParts[0] + ':' + crsCodeParts[2];
      parsedRecord.crs = crsCode;

      parsedRecords.records.pushObject(parsedRecord);
    });

    return parsedRecords;
  },

  /**
    Observes changes in current locale.
    Changes available modes.

    @method _localeDidChange
    @private
  */
  _localeDidChange: Ember.on('init', Ember.observer('i18n.locale', function() {
    let i18n = this.get('i18n');
    this.set('_availableBoundingBoxModes', Ember.A([
      i18n.t('components.flexberry-csw.search-settings.bounding-box.modes.no-bounding-box.caption'),
      i18n.t('components.flexberry-csw.search-settings.bounding-box.modes.map-bounding-box.caption'),
    ]));
    this.set('_searchSettings.boundingBoxMode', i18n.t('components.flexberry-csw.search-settings.bounding-box.modes.no-bounding-box.caption'));
  })),

  /**
    initializes component.
  */
  init() {
    this._super(...arguments);

    let connections = this.get('_availableConnections');
    let selectedConnection = this.get('selectedConnection');
    if (Ember.isArray(connections) && Ember.get(connections, 'length') > 0 && Ember.isNone(selectedConnection)) {
      selectedConnection = connections[0];
      this.set('selectedConnection', selectedConnection);
    }

    this.set('_recordsCache', {});
    this.set('_searchSettings', {});
  }
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryCswComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryCswComponent;
