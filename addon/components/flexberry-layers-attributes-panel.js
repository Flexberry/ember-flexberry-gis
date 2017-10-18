/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-layers-attributes-panel';

/**
  The component for editing layers attributes.

  @class FlexberryLayersAttributesPanelComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
 */
export default Ember.Component.extend({

  /**
    Computed property that builds tab models collection from items.
  */
  _tabModels: Ember.computed('items.[]', function () {
    let editedLayers = this.get('items');
    if (Ember.isPresent(editedLayers)) {
      return editedLayers.map((item) => {
        let name = Ember.get(item, 'name');
        let header = {};
        let featureLink = {};
        let propertyLink = {};
        let properties = Ember.A();
        let leafletObject = Ember.get(item, 'leafletObject');

        leafletObject.eachLayer((l) => {
          let props = Ember.get(l, 'feature.properties');
          let propId = Ember.guidFor(props);
          if (Ember.isNone(l.feature.leafletLayer)) {
            Ember.set(l.feature, 'leafletLayer', l);
          }

          // the hash containing guid of properties object and link to feature layer
          featureLink[propId] = l;

          // the hash containing guid of properties object and link to that object
          propertyLink[propId] = props;

          // collect the object keys for the header object
          Object.keys(props).forEach((p) => {
            if (!header.hasOwnProperty(p)) {
              header[p] = p;
            }
          });
          properties.pushObject(props);
        });
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
  */
  _featureTabsOffset: 0,

  // _offsetDelta: 0,

  /**
    Reference to component's template.
  */
  layout,

  /**
    Selected tab index.
  */
  selectedTabIndex: 0,

  /**
    Flag indicates that the panel is folded or not.
  */
  folded: false,

  /**
    Collection of tab items.

    @property items
    @type Object[]
    @default null
  */
  items: null,

  // from feature-result-list
  /**
    Set selected feature and add its layer to serviceLayer on map.
    @method _selectFeature
    @param {Object} feature Describes feature object or array of it.
    @private
  */
  _selectFeature(feature) {
    let serviceLayer = this.get('serviceLayer');
    if (!Ember.isNone(feature)) {
      // make a copy - to don't worry about removal
      serviceLayer.addLayer(L.geoJson(feature.leafletLayer.toGeoJSON()).setStyle({
        color: 'salmon',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.3
      }));
    }
  },

  actions: {
    /**
      Handles click on a tab.

      @param Number index
    */
    onTabSelect(index) {
      if (index === this.get('selectedTabIndex')) {
        this.set('folded', !this.get('folded'));
      } else {
        this.set('selectedTabIndex', index);
        if (this.get('folded')) {
          this.set('folded', true);
        }
      }
    },

    /**
      Handles click on tab close icon.

      @param Number index
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

      @param Object tabModel
      @param String rowId
      @param Object options
    */
    onRowSelect(tabModel, rowId, options) {
      let selectedRows = Ember.get(tabModel, '_selectedRows');
      Ember.set(selectedRows, rowId, options.checked);
      Ember.set(tabModel, '_selectedRows', selectedRows);
      tabModel.notifyPropertyChange('_selectedRows');
    },

    /**
      Handles 'Find an item on the map' button click.

      @param Object tabModel
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
    */
    onClearFoundItemClick() {
      let serviceLayer = this.get('serviceLayer');
      serviceLayer.clearLayers();
    },

    /**
      Handles 'Select all' checkbox click.
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
    */
    onTabGetData(tabModel, options) {
      Ember.set(tabModel, '_skip', options.skip);
      Ember.set(tabModel, '_top', options.top);
    },

    /**
      Handles tab panel moving.

      @param Boolean left
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

        // this.set('_offsetDelta', offsetDelta);
      }

      this.set('_featureTabsOffset', offset);
      Ember.$('.bottompanel-tab-nav-panel-tabs').css('left', `-${offset}px`);
    },

    /**
      Handles 'Delete selected items' button click.

      @param Object tabModel
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
      Handles inner FeatureResultItem's bubbled 'selectFeature' action.
      Invokes component's {{#crossLink "FeatureResultItem/sendingActions.selectFeature:method"}}'selectFeature'{{/crossLink}} action.

      @method actions.selectFeature
      @param {Object} feature Describes inner FeatureResultItem's feature object or array of it.
    */
    selectFeature(feature) {
      let selectedFeature = this.get('_selectedFeature');
      let serviceLayer = this.get('serviceLayer');

      if (selectedFeature !== feature) {
        if (!Ember.isNone(serviceLayer)) {
          serviceLayer.clearLayers();

          if (Ember.isArray(feature)) {
            feature.forEach((item) => this._selectFeature(item));
          } else {
            this._selectFeature(feature);
          }
        }

        this.set('_selectedFeature', feature);
      }

      // Send action despite of the fact feature changed or not. User can disable layer anytime.
      // this.sendAction('featureSelected', feature);
    },

    /**
      Select passed feature and zoom map to its layer bounds
      @method actions.zoomTo
      @param {Object} feature Describes inner FeatureResultItem's feature object or array of it.
    */
    zoomTo(feature) {
      let serviceLayer = this.get('serviceLayer');
      if (!serviceLayer) {
        let leafletMap = this.get('leafletMap');
        serviceLayer = L.featureGroup().addTo(leafletMap);
        this.set('serviceLayer', serviceLayer);
      } else {
        serviceLayer.clearLayers();
      }

      this.send('selectFeature', feature);

      let bounds;
      if (typeof (serviceLayer.getBounds) === 'function') {
        bounds = serviceLayer.getBounds();
      } else {
        let featureGroup = L.featureGroup(serviceLayer.getLayers());
        if (featureGroup) {
          bounds = featureGroup.getBounds();
        }
      }

      if (!Ember.isBlank(bounds)) {
        // 'bound.pad(1)' bounds with zoom decreased by 1 point (padding).
        //  That allows to make map's bounds slightly larger than serviceLayer's bounds to make better UI.
        this.get('leafletMap').fitBounds(bounds.pad(1));
      }
    }
  },

  // didRender() {
  //   this._super(...arguments);

  //   let panelWidth = Ember.$('.feature-tab-nav-panel-tabs').innerWidth();
  //   let itemsWidth = 0;
  //   Ember.$('.feature-tab-nav-panel-tabs').children().each((index, item) => {
  //     itemsWidth += Ember.$(item).outerWidth();
  //   });

  //   if (itemsWidth > panelWidth) {
  //     this.set('_offsetDelta', 1);
  //   }
  // }
});
