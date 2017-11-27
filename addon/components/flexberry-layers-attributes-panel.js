/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-layers-attributes-panel';
import LeafletZoomToFeatureMixin from '../mixins/leaflet-zoom-to-feature';

/**
  The component for editing layers attributes.

  @class FlexberryLayersAttributesPanelComponent
  @uses LeafletZoomToFeatureMixin
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
 */
export default Ember.Component.extend(LeafletZoomToFeatureMixin, {
  /**
    Leaflet.Editable drawing tools instance.

    @property _editTools
    @type <a href="http://leaflet.github.io/Leaflet.Editable/doc/api.html">L.Ediatble</a>
    @default null
    @private
  */
  _editTools: null,

  _activeTabs: {},

  /**
    Computed property that builds tab models collection from items.

    @property _tabModels
    @type Object[]
    @private
    @readonly
  */
  _tabModels: Ember.computed('items.[]', 'i18n.locale', function () {
    let editedLayers = this.get('items');
    if (Ember.isPresent(editedLayers)) {
      if (editedLayers.length === 1) {
        this.set('_featureTabsOffset', 0);
        this.send('onTabMove', true);
      }

      return editedLayers.map((item) => {
        let name = Ember.get(item, 'name');
        let featureLink = {};
        let propertyLink = {};
        let properties = Ember.A();

        let leafletObject = Ember.get(item, 'leafletObject');
        let readonly = Ember.get(item, 'settings.readonly') || false;

        let getHeader = () => {
          let result = {};
          let locale = this.get('i18n.locale');
          let localizedProperties = Ember.get(item, `settings.localizedProperties.${locale}`) || {};
          let excludedProperties = Ember.get(item, `settings.excludedProperties`);
          excludedProperties = Ember.isArray(excludedProperties) ? Ember.A(excludedProperties) : Ember.A();

          for (let propertyName in Ember.get(leafletObject, 'readFormat.featureType.fields')) {
            if (excludedProperties.contains(propertyName)) {
              continue;
            }

            let propertyCaption = Ember.get(localizedProperties, propertyName);

            result[propertyName] = !Ember.isBlank(propertyCaption) ? propertyCaption : propertyName;
          }

          return result;
        };

        let availableDrawTools = null;
        if (!readonly) {
          availableDrawTools = this._getAvailableDrawTools(Ember.get(leafletObject, 'readFormat.featureType.geometryFields'));
        }

        leafletObject.eachLayer((layer) => {
          if (Ember.isNone(Ember.get(layer, 'feature'))) {
            Ember.set(layer, 'feature', {});
          }

          let props = Ember.get(layer, 'feature.properties');
          let propId = Ember.guidFor(props);
          if (Ember.isNone(Ember.get(layer, 'feature.leafletLayer'))) {
            Ember.set(layer.feature, 'leafletLayer', layer);
          }

          // the hash containing guid of properties object and link to feature layer
          featureLink[propId] = layer;

          // the hash containing guid of properties object and link to that object
          propertyLink[propId] = props;
          properties.pushObject(props);
        });

        let tabModel = Ember.Object.extend({
          _top: 5,
          _skip: 0,
          _selectedRows: {},
          _editedRows: {},
          _selectedRowsCount: Ember.computed('_selectedRows', function () {
            let selectedRows = Ember.get(this, '_selectedRows');
            return Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item)).length;
          }),

          _selectedRowsProperties: Ember.computed('_selectedRows', 'featureLink', function () {
            let selectedRows = Ember.get(this, '_selectedRows');
            let featureLink = Ember.get(this, 'featureLink');
            let result = Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item))
              .map((key) => {
                return featureLink[key].feature.properties;
              });

            return result.length > 0 ? result : Ember.get(this, 'properties');
          }),

          selectAll: false,

          // paging implementation
          propertiesToShow: Ember.computed('properties.[]', '_top', '_skip', function () {
            let properties = this.get('properties');
            let top = this.get('_top');
            let skip = this.get('_skip');
            return properties.slice(skip, skip + top);
          }),

          i18n: Ember.inject.service('i18n'),

          header: Ember.computed('i18n.locale', getHeader),

          init() {
            this.get('i18n.locale');
          }
        });
        return tabModel.create(
          Ember.getOwner(this).ownerInjection(),
          {
            name,
            allowEdit: !readonly,
            leafletObject,
            featureLink,
            propertyLink,
            properties,
            availableDrawTools
          }
        );
      });
    }
  }),

  /**
    Offset of tab panel in pixels.

    @property _featureTabsOffset
    @type Number
    @default 0
    @private
    @readonly
  */
  _featureTabsOffset: 0,

  /**
    Flag indicates whether attributes edit dialog has been already requested by user or not.

    @property _editRowDialogHasBeenRequested
    @type Boolean
    @default false
    @private
  */
  _editRowDialogHasBeenRequested: false,

  /**
    Flag indicates whether to show edit row dialog.

    @property _onEditRowDialogIsVisible
    @type Boolean
    @default false
    @private
  */
  _onEditRowDialogIsVisible: false,

  /**
    Hash with edited row data.

    @property _editRowData
    @type Object
    @default null
    @private
  */
  _editRowData: null,

  /**
    Hash with edited row data copy.

    @property _editRowDataCopy
    @type Object
    @default null
    @private
  */
  _editRowDataCopy: null,

  /**
    Reference to component's template.
  */
  layout,

  /**
    Selected tab index.

    @property selectedTabIndex
    @type Number
    @default 0
  */
  selectedTabIndex: 0,

  /**
    Flag indicates that the panel is folded or not.

    @property folded
    @type Boolean
    @default false
  */
  folded: false,

  /**
    Collection of tab items.

    @property items
    @type Object[]
    @default null
  */
  items: null,

  /**
    Integration with the layer tree

    @property settings
    @type Boolean
    @default null
  */
  settings: null,

  /**
    Available modes to add geometry.

    @property availableGeometryAddModes
    @type Array
    @default ['draw', 'manual', 'geoprovider']
  */
  availableGeometryAddModes: ['draw', 'manual', 'geoprovider'],

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    let settings = this.get('settings');
    if (Ember.isNone(settings)) {
      settings = {
        withToolbar: false,
        sidebarOpened: false,
      };

      this.set('settings', settings);
    }
  },

  actions: {
    /**
      Handles click on a tab.

      @method actions.onTabSelect
      @param {Number} index Selected tab index.
    */
    onTabSelect(index) {
      if (index === this.get('selectedTabIndex')) {
        this.set('folded', !this.get('folded'));

        // While executing transition vertical scroll will always appear, it is unnecessary and looks very strange,
        // so we can hide scroll untill transition end.
        let $tabs = this.$('.bottompanel-tab-data-panel');
        $tabs.css('overflow', 'hidden');
        this.$('.ui.bottom.bottompanel').one('webkitTransitionEnd mozTransitionEnd oTransitionEnd otransitionend transitionend', () => {
          $tabs.css('overflow', 'auto');
        });
      } else {
        this.set('selectedTabIndex', index);
        if (this.get('folded')) {
          this.set('folded', false);
        }
      }
    },

    /**
      Handles click on tab close icon.

      @method actions.closeTab
      @param {Number} index closed tab index.
    */
    closeTab(index) {
      let editedLayers = this.get('items');
      let selectedTabIndex = this.get('selectedTabIndex');
      editedLayers.removeAt(index);
      if (selectedTabIndex >= index && selectedTabIndex - 1 >= 0) {
        this.set('selectedTabIndex', selectedTabIndex - 1);
      }
    },

    onTabClick(tabModelName, e) {
      e = Ember.$.event.fix(e);
      let clickedTabName = Ember.$(e.currentTarget).attr('data-tab');

      Ember.set(this, `_activeTabs.${tabModelName}`, clickedTabName);
    },

    /**
      Handles attributes row selection.

      @method actions.onRowSelect
      @param {Object} tabModel Related tab.
      @param {String} rowId Selected row identifier.
      @param {Object} options Selection options.
    */
    onRowSelect(tabModel, rowId, options) {
      let selectedRows = Ember.get(tabModel, '_selectedRows');
      Ember.set(selectedRows, rowId, options.checked);
      Ember.set(tabModel, '_selectedRows', selectedRows);
      tabModel.notifyPropertyChange('_selectedRows');
    },

    /**
      Handles 'Find an item on the map' button click.

      @method actions.onFindItemClick
      @param {Object} tabModel Related tab.
    */
    onFindItemClick(tabModel) {
      let selectedRows = Ember.get(tabModel, '_selectedRows');
      let selectedFeatures = Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item))
        .map((key) => {
          return tabModel.featureLink[key].feature;
        });
      this.send('zoomTo', selectedFeatures);
    },

    /**
      Handles 'Clear found items' button click.

      @method actions.onClearFoundItemClick
    */
    onClearFoundItemClick() {
      let serviceLayer = this.get('serviceLayer');
      serviceLayer.clearLayers();
    },

    /**
      Handles 'Select all' checkbox click.

      @method actions.onSelectAllClick
      @param {Object} tabModel Related tab.
    */
    onSelectAllClick(tabModel) {
      let selectAll = Ember.get(tabModel, 'selectAll');
      if (!selectAll) {
        Ember.set(tabModel, '_selectedRows', {});
      } else {
        let selectedRows = Object.assign(...Object.keys(Ember.get(tabModel, 'propertyLink')).map(k => ({
          [k]: true
        })));
        Ember.set(tabModel, '_selectedRows', selectedRows);
      }

      tabModel.notifyPropertyChange('_selectedRows');
    },

    /**
      Handles 'getData' action from flexberry-table.

      @method actions.onTabGetData
      @param {Object} tabModel
      @param {Object} options
    */
    onTabGetData(tabModel, options) {
      Ember.set(tabModel, '_skip', options.skip);
      Ember.set(tabModel, '_top', options.top);
    },

    /**
      Handles tab panel moving.

      @method actions.onTabMove
      @param {Boolean} left Flag: indicates whether move direction is left or not.
    */
    onTabMove(left) {
      // move tabs bar on the left or on the right
      let offset = this.get('_featureTabsOffset');
      if (left) {
        if (offset > 0) {
          offset -= Math.min(25, offset);
        }
      } else {
        let panelWidth = Ember.$('.bottompanel-tab-nav-panel-tabs').innerWidth();
        let itemsWidth = 0;
        const navButtonWidth = 25;
        Ember.$('.bottompanel-tab-nav-panel-tabs').children().each((index, item) => {
          itemsWidth += Ember.$(item).outerWidth();
        });
        let offsetDelta = Math.min(25, (panelWidth >= itemsWidth ? 0 :
          (offset >= itemsWidth - panelWidth + navButtonWidth ? 0 :
            itemsWidth - panelWidth + navButtonWidth - offset)));
        offset += offsetDelta;
      }

      this.set('_featureTabsOffset', offset);
      Ember.$('.bottompanel-tab-nav-panel-tabs').css('left', `-${offset}px`);
    },

    /**
      Handles 'Delete selected items' button click.

      @method actions.onDeleteItemClick
      @param {Object} tabModel Related tab.
    */
    onDeleteItemClick(tabModel) {
      let selectedRows = Ember.get(tabModel, '_selectedRows');
      let editedRows = Ember.get(tabModel, '_editedRows');
      let editedRowsChange = false;
      let selectedFeatureKeys = Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item));
      selectedFeatureKeys.forEach((key) => {
        let layer = tabModel.featureLink[key];
        tabModel.leafletObject.removeLayer(layer);
        tabModel.properties.removeObject(tabModel.propertyLink[key]);
        delete selectedRows[key];
        delete tabModel.featureLink[key];
        delete tabModel.propertyLink[key];

        if (Ember.get(editedRows, key) || false) {
          delete editedRows[key];
          editedRowsChange = true;
          layer.disableEdit();
          this.get('leafletMap').off('editable:editing', this._triggerChanged, [tabModel, layer, true]);
        }

        this._triggerChanged.call([tabModel, layer, false], { layer });
      });
      Ember.set(tabModel, '_selectedRows', selectedRows);
      tabModel.notifyPropertyChange('_selectedRows');
      if (editedRowsChange) {
        Ember.set(tabModel, '_editedRows', editedRows);
        tabModel.notifyPropertyChange('_editedRows');
      }
    },

    /**
      Performs row editing.

      @method actions.onRowEdit
      @param {Object} tabModel Related tab.
      @param {Object} rowId Editing row identifier.
    */
    onRowEdit(tabModel, rowId) {
      let editedProperty = tabModel.propertyLink[rowId];

      this.set('_editRowData', editedProperty);
      this.set('_editRowDataCopy', Ember.copy(editedProperty, false));
      this.set('_editRowTabModel', tabModel);
      this.set('_editRowLayer', tabModel.featureLink[rowId]);

      // Include dialog to markup.
      this.set('_editRowDialogHasBeenRequested', true);

      // Show dialog.
      this.set('_onEditRowDialogIsVisible', true);
    },

    /**
      Handles row edit dialog's 'approve' action.

      @method actions.onEditRowDialogApprove
      @param {Object} data Hash cantaining edited data.
    */
    onEditRowDialogApprove(data) {
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          var element = data[key];
          if (!Ember.isEqual(element, this.get(`_editRowData.${key}`))) {
            this.set(`_editRowData.${key}`, element);
            let tabModel = this.get('_editRowTabModel');
            let layer = this.get('_editRowLayer');
            this._triggerChanged.call([tabModel, layer, true], { layer });
          }
        }
      }
    },

    /**
      Handles flexberry-table 'rowEdited' action.

      @param {Object} tabModel Related tab.
      @param {String} rowId Editing row identifier.
    */
    onTableRowEdited(tabModel, rowId) {
      let layer = tabModel.featureLink[rowId];
      this._triggerChanged.call([tabModel, layer, true], { layer });
    },

    /**
      Handles row's geometry editing.

      @param {Object} tabModel Related tab.
      @param {String} rowId Editing row identifier.
    */
    onRowGeometryEdit(tabModel, rowId) {
      // Toggle row geometry editing
      let editedRows = Ember.get(tabModel, '_editedRows');
      let edit = Ember.get(editedRows, rowId) || false;
      edit = !edit;
      Ember.set(editedRows, rowId, edit);
      Ember.set(tabModel, '_editedRows', editedRows);
      tabModel.notifyPropertyChange('_editedRows');

      // Enable feature editing
      let layer = Ember.get(tabModel, `featureLink.${rowId}`);
      let leafletMap = this.get('leafletMap');

      let editTools = this._getEditTools();
      Ember.set(leafletMap, 'editTools', editTools);

      if (edit) {
        // If the layer is not on the map - add it
        if (!leafletMap.hasLayer(layer)) {
          let addedLayers = Ember.get(tabModel, '_addedLayers') || {};
          addedLayers[Ember.guidFor(layer)] = layer;
          leafletMap.addLayer(layer);
          Ember.set(tabModel, '_addedLayers', addedLayers);
        }

        this._zoomToLayer(layer);
        layer.enableEdit(leafletMap);
        leafletMap.on('editable:editing', this._triggerChanged, [tabModel, layer, true]);

      } else {
        layer.disableEdit();
        leafletMap.off('editable:editing', this._triggerChanged, [tabModel, layer, true]);
        let addedLayers = Ember.get(tabModel, '_addedLayers') || {};
        if (!Ember.isNone(addedLayers[Ember.guidFor(layer)])) {
          leafletMap.removeLayer(layer);
          delete addedLayers[Ember.guidFor(layer)];
          Ember.set(tabModel, '_addedLayers', addedLayers);
        }
      }
    },

    /**
      Handles click on 'Save changes' button.

      @param {Object} tabModel Related tab model.
    */
    onSaveChangesClick(tabModel) {
      let leafletObject = tabModel.leafletObject;
      let saveFailed = (data) => {
        this.set('error', data);
        leafletObject.off('save:success', saveSuccess);
      };

      let saveSuccess = (data) => {
        Ember.set(tabModel, 'leafletObject._wasChanged', false);
        leafletObject.off('save:failed', saveFailed);
      };

      leafletObject.once('save:failed', saveFailed);
      leafletObject.once('save:success', saveSuccess);
      leafletObject.save();
    },

    /**
      Handles new row attributes dialog's 'approve' action.

      @param {Object} data A hash containing added feature properties.
    */
    onNewRowDialogApprove(data) {
      let tabModel = this.get('_newRowTabModel');
      let layer = this.get('_newRowLayer');

      Ember.set(layer, 'feature', { type: 'Feature' });
      Ember.set(layer.feature, 'properties', data);
      Ember.set(layer.feature, 'leafletLayer', layer);
      if (typeof (layer.setStyle) === 'function') {
        layer.setStyle(Ember.get(tabModel, 'leafletObject.options.style'));
      }

      tabModel.leafletObject.addLayer(layer);
      layer.disableEdit();

      let propId = Ember.guidFor(data);

      // the hash containing guid of properties object and link to feature layer
      Ember.set(tabModel, `featureLink.${propId}`, layer);

      // the hash containing guid of properties object and link to that object
      Ember.set(tabModel, `propertyLink.${propId}`, data);
      tabModel.properties.pushObject(data);

      this._triggerChanged.call([tabModel, layer, false], { layer });

      if (this.get('_newRowPanToObject')) {
        this._zoomToLayer(layer);
        this.set('_newRowPanToObject', null);
      }
    },

    /**
      Handles new row attributes dialog's 'deny' action.
    */
    onNewRowDialogDeny() {
      let layer = this.get('_newRowLayer');
      this.get('leafletMap').removeLayer(layer);

      this.set('_newRowTabModel', null);
      this.set('_newRowLayer', null);
      this.set('_newRowPanToObject', null);
    },

    /**
      Handles a new geometry adding completion.

      @param {Object} tabModel Related tab model.
      @param {Object} addedLayer Added layer.
    */
    onGeometryAddComplete(tabModel, addedLayer, options) {
      if (!Ember.isNone(options) && Ember.get(options, 'panToAddedObject')) {
        this.set('_newRowPanToObject', true);
      }

      this._showNewRowDialog(tabModel, addedLayer);
    }
  },

  /**
    Returns Leaflet.Editable instance.
  */
  _getEditTools() {
    let leafletMap = this.get('leafletMap');

    let editTools = this.get('_editTools');
    if (Ember.isNone(editTools)) {
      editTools = new L.Editable(leafletMap);
      this.set('_editTools', editTools);
    }

    return editTools;
  },

  /**
    Overrides {{#crosslink "LeafletZoomToFeatureMixin/_prepareLayer:method"}} to make a copy of passed layer
    and apply a style to the layer to make it more visible.

    @method _prepareLayer
    @param {Object} layer
    @return {<a href="http://leafletjs.com/reference-1.2.0.html#layer">L.Layer</a>} Prepared layer.
    @private
  */
  _prepareLayer(layer) {
    return L.geoJson(layer.toGeoJSON()).setStyle({
      color: 'salmon',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.3
    });
  },

  /**
    Shows a dialog for entering the attributes of the newly added layer.

    @param {Object} tabModel Related tab model.
    @param {Object} addedLayer Newly added layer.
  */
  _showNewRowDialog(tabModel, addedLayer) {
    if (Ember.isNone(addedLayer)) {
      return;
    }

    let fields = Ember.get(tabModel, 'leafletObject.readFormat.featureType.fields');
    let data = Object.keys(fields).reduce((result, item) => {
      result[item] = null;
      return result;
    }, {});
    this.set('_newRowTabModel', tabModel);
    this.set('_newRowLayer', addedLayer);
    this.set('_newRowData', data);

    // Include dialog to markup.
    this.set('_newRowDialogHasBeenRequested', true);

    // Show dialog.
    this.set('_newRowDialogIsVisible', true);
  },

  /**
    Returns the available drawing tools according to the type of layer geometry.

    @param {Object} geometryFields Hash with the layer geometry field names and their types.
  */
  _getAvailableDrawTools(geometryFields) {
    if (!Ember.isNone(geometryFields)) {
      let firstField = Object.keys(geometryFields)[0];
      switch (geometryFields[firstField]) {
        case 'PointPropertyType':
        case 'MultiPointPropertyType':
          return ['marker'];

        case 'LineStringPropertyType':
        case 'MultiLineStringPropertyType':
          return ['polyline'];

        case 'MultiSurfacePropertyType':
        case 'PolygonPropertyType':
        case 'MultiPolygonPropertyType':
          return ['rectangle', 'polygon'];
      }
    }

    return ['marker', 'circle', 'polyline', 'rectangle', 'polygon'];
  },

  /**
    Mark layer as changed.

    @param {Object} e Event object.
  */
  _triggerChanged(e) {
    let [tabModel, layer, setEdited] = this;
    if (Ember.isEqual(Ember.guidFor(e.layer), Ember.guidFor(layer))) {
      Ember.set(tabModel, 'leafletObject._wasChanged', true);
      tabModel.notifyPropertyChange('leafletObject._wasChanged');

      if (setEdited) {
        tabModel.leafletObject.editLayer(layer);
      }
    }
  },

  /**
    Zooms map to the specified layer.

    @param {Object} layer
  */
  _zoomToLayer(layer) {
    this.send('zoomTo', [layer.feature]);
    this.send('onClearFoundItemClick');
  }
});
