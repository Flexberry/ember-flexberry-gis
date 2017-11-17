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
    Computed property that builds tab models collection from items.

    @property _tabModels
    @type Object[]
    @private
    @readonly
  */
  _tabModels: Ember.computed('items.[]', function () {
    let editedLayers = this.get('items');
    if (Ember.isPresent(editedLayers)) {
      if (editedLayers.length === 1) {
        this.set('_featureTabsOffset', 0);
        this.send('onTabMove', true);
      }

      return editedLayers.map((item) => {
        let name = Ember.get(item, 'name');
        let header = {};
        let featureLink = {};
        let propertyLink = {};
        let properties = Ember.A();
        let leafletObject = Ember.get(item, 'leafletObject');

        leafletObject.eachLayer((layer) => {
          let props = Ember.get(layer, 'feature.properties');
          let propId = Ember.guidFor(props);
          if (Ember.isNone(layer.feature.leafletLayer)) {
            Ember.set(layer.feature, 'leafletLayer', layer);
          }

          // the hash containing guid of properties object and link to feature layer
          featureLink[propId] = layer;

          // the hash containing guid of properties object and link to that object
          propertyLink[propId] = props;
          properties.pushObject(props);
        });

        for (let p in Ember.get(leafletObject, 'readFormat.featureType.fields')) {
          header[p] = p;
        }

        let tabModel = Ember.Object.extend({
          _top: 5,
          _skip: 0,
          _selectedRows: {},
          _selectedRowsCount: Ember.computed('_selectedRows', function () {
            let selectedRows = Ember.get(this, '_selectedRows');
            return Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item)).length;
          }),
          selectAll: false,

          // paging implementation
          propertiesToShow: Ember.computed('properties.[]', '_top', '_skip', function () {
            let properties = this.get('properties');
            let top = this.get('_top');
            let skip = this.get('_skip');
            return properties.slice(skip, skip + top);
          })
        });
        return tabModel.create({
          name: name,
          leafletObject: leafletObject,
          featureLink: featureLink,
          propertyLink: propertyLink,
          header: header,
          properties: properties
        });
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
      let selectedFeatureKeys = Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item));
      selectedFeatureKeys.forEach((key) => {
        tabModel.leafletObject.removeLayer(tabModel.featureLink[key]);
        delete selectedRows[key];
        tabModel.properties.removeObject(tabModel.propertyLink[key]);
      });
      Ember.set(tabModel, '_selectedRows', selectedRows);
      tabModel.notifyPropertyChange('_selectedRows');
    },

    /**
      Performs row editing.

      @method actions.onRowEdit
      @param {Object} tabModel Related tab.
      @param {Object} rowId Editing row identifier.
    */
    onRowEdit(tabModel, rowId) {
      let editedProperty = tabModel.propertyLink[rowId];
      this.set('_editRowFieldNames', Ember.get(tabModel, 'header'));
      this.set('_editRowFieldTypes', Ember.get(tabModel, 'leafletObject.readFormat.featureType.fieldTypes'));
      this.set('_editRowFieldParsers', Ember.get(tabModel, 'leafletObject.readFormat.featureType.fields'));
      this.set('_editRowFieldValidators', Ember.get(tabModel, 'leafletObject.readFormat.featureType.fieldValidators'));
      this.set('_editRowData', editedProperty);
      this.set('_editRowDataCopy', Ember.copy(editedProperty, false));

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
          }
        }
      }
    }
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
  }
});
