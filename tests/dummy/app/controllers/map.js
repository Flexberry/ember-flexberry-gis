/**
  @module ember-flexberry-gis-dummy
*/

import Ember from 'ember';
import EditMapController from 'ember-flexberry-gis/controllers/edit-map';
import EditFormControllerOperationsIndicationMixin from 'ember-flexberry/mixins/edit-form-controller-operations-indication';

/**
  Map controller.

  @class MapController
  @extends EditMapController
  @uses EditFormControllerOperationsIndicationMixin
*/
export default EditMapController.extend(
  EditFormControllerOperationsIndicationMixin, {
    /**
      Parameter contains current map identification layer option (all, visible, top etc.)
      @property identifyLayersOption
      @type String
      @default ''
     */
    identifyLayersOption: 'visible',

    /**
      Parameter contains current map identification tool option (arrow, square, polygon etc.)
      @property identifyToolOption
      @type String
      @default ''
     */
    identifyToolOption: 'rectangle',

    serviceLayer: null,

    polygonLayer: null,

    /**
      Parent route.

      @property parentRoute
      @type String
      @default 'maps'
    */
    parentRoute: 'maps',

    identifyServiceLayer: null,

    _showTree: false,

    _showTable: false,

    _showAttr: false,

    _scales: [500, 1000, 2000, 5000, 10000, 15000, 25000, 50000, 75000, 100000, 150000, 200000],

    sidebar: Ember.A([{
        selector: 'treeview',
        captionPath: 'forms.map.treeviewbuttontooltip',
        iconClass: 'list icon'
      },
      {
        selector: 'search',
        captionPath: 'forms.map.searchbuttontooltip',
        iconClass: 'search icon'
      },
      {
        selector: 'identify',
        captionPath: 'forms.map.identifybuttontooltip',
        iconClass: 'info circle icon',
        class: 'identify'
      },
      {
        selector: 'bookmarks',
        captionPath: 'forms.map.bookmarksbuttontooltip',
        iconClass: 'bookmark icon'
      }
    ]),

    /**
     * items
     */
    sidebarItems: Ember.computed('sidebar.[]', 'sidebar.@each.active', 'i18n', function () {
      let i18n = this.get('i18n');
      let sidebar = this.get('sidebar');

      let result = Ember.A(sidebar);
      result.forEach((item) => {
        let caption = Ember.get(item, 'caption');
        let captionPath = Ember.get(item, 'captionPath');

        if (!caption && captionPath) {
          Ember.set(item, 'caption', i18n.t(captionPath));
        }
      });

      return result;
    }),

    /**
     * bottompanel items
     */
    bottompanelItems: Ember.computed('bottompanel.[]', 'bottompanel.@each.active', 'i18n', function () {
      let result = Ember.A([{
          selector: 'attr',
          captionPath: 'forms.map.bottompanelbuttontooltip',
          iconClass: 'browser icon'
        }]);

      return result;
    }),

    _editedLayers: null,

    _editedLayersFeatures: Ember.computed('_editedLayers.[]', function() {
      let editedLayers = this.get('_editedLayers');
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

          featureLink[propId] = l; // make the hash containing guid of properties object and link to feature layer
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
          _selectedRows: {},
          _selectedRowsCount: Ember.computed('_selectedRows', function() {
            let selectedRows = Ember.get(this, '_selectedRows');
            return Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item)).length;
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
    }),

    availableCRS: Ember.computed('i18n.locale', function () {
      let availableModes = Ember.A();
      let i18n = this.get('i18n');
      availableModes.push({
        crs: this.get('model.crs'),
        name: i18n.t('forms.crs.current.name').toString(),
        xCaption: i18n.t('forms.crs.current.xCaption').toString(),
        yCaption: i18n.t('forms.crs.current.yCaption').toString(),
        latlng: false
      });
      availableModes.push({
        crs: L.CRS.EPSG4326,
        name: i18n.t('forms.crs.latlng.name').toString(),
        xCaption: i18n.t('forms.crs.latlng.xCaption').toString(),
        yCaption: i18n.t('forms.crs.latlng.yCaption').toString(),
        isLatlng: true
      });

      return availableModes;
    }),

    // code from layer-result-list
    /**
      Set selected feature and add its layer to serviceLayer on map.
      @method _selectFeature
      @param {Object} feature Describes inner FeatureResultItem's feature object or array of it.
      @private
    */
    _selectFeature(feature) {
      let serviceLayer = this.get('serviceLayer');
      if (!Ember.isNone(feature)) {
        serviceLayer.addLayer(feature.leafletLayer);
      }
    },

    actions: {
      toggleSidebar(e) {
        if (!e.changed) {
          let sidebarOpened = !this.get('sidebarOpened');
          this.set('sidebarOpened', sidebarOpened);

          // push left map controls to right for sidebar width
          if (sidebarOpened) {
            Ember.$('.sidebar-wrapper').addClass('visible');
          } else {
            Ember.$('.sidebar-wrapper').removeClass('visible');
          }
        }

        if (e.tabName === 'identify') {
          let leafletMap = this.get('leafletMap');
          if (Ember.isNone(leafletMap)) {
            return;
          }

          let layer = this.get('identifyLayersOption');
          let tool = this.get('identifyToolOption');

          let mapToolName = 'identify-' + layer + '-' + tool;
          leafletMap.fire('flexberry-map:identificationOptionChanged', {
            mapToolName
          });
        }

        if (e.tabName === 'treeview') {
          if (!this.get('_showTree')) {
            Ember.run.later(() => {
              this.set('_showTree', true);
            }, 500);
          }
        }
      },

      toggleBottompanel(e) {
        if (!e.changed) {
          let bottompanelOpened = !this.get('bottompanelOpened');
          this.set('bottompanelOpened', bottompanelOpened);

          // push left map controls to right for sidebar width
          if (bottompanelOpened) {
            Ember.$('.bottompanel-wrapper').addClass('visible');
          } else {
            Ember.$('.bottompanel-wrapper').removeClass('visible');
          }
        }

        Ember.run.later(() => {
          this.set('_showTable', true);
        }, 500);
      },

      getAttributes(object) {
        let editedLayers = this.get('_editedLayers') || Ember.A();
        editedLayers.push(object);
        this.set('_editedLayers', editedLayers);

        this.set('_showAttr', true);
      },

      onFeatureRowSelect(tabModel, rowId, options) {
        let selectedRows = Ember.get(tabModel, '_selectedRows');
        Ember.set(selectedRows, rowId, options.checked);
        Ember.set(tabModel, '_selectedRows', selectedRows);
        tabModel.notifyPropertyChange('_selectedRows');
      },

      onFindFeatureClick(tabModel) {
        let selectedRows = Ember.get(tabModel, '_selectedRows');
        let selectedFeatures = Object.keys(selectedRows).filter((item) => Ember.get(selectedRows, item))
          .map((key) => {
            return tabModel.featureLink[key].feature;
          });
        this.send('zoomTo', selectedFeatures);
      },

      ///////////// code from layer-result-list
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
      },

      ///////////// code from layer-result-list

      onDeleteFeatureClick(tabModel) {
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

      querySearch(queryString) {
        let leafletMap = this.get('leafletMap');
        let e = {
          latlng: leafletMap.getCenter(),
          searchOptions: {
            queryString,
            maxResultsCount: 10
          },
          filter(layerModel) {
            return layerModel.get('canBeContextSearched') && layerModel.get('visibility');
          },
          results: Ember.A()
        };

        leafletMap.fire('flexberry-map:search', e);

        this.set('searchResults', e.results);
      },

      clearSearch() {
        this.set('searchResults', null);
      },

      clearIdentification() {
        this.set('identifyResults', null);

        let serviceLayer = this.get('serviceLayer');
        if (serviceLayer) {
          serviceLayer.clearLayers();
        }

        let polygonLayer = this.get('polygonLayer');
        if (polygonLayer) {
          polygonLayer.disableEdit();
          polygonLayer.remove();
        }
      },

      /**
          Handles 'flexberry-identify-panel:identificationFinished' event of leaflet map.

          @method identificationFinished
          @param {Object} e Event object.
          @param {Object} results Hash containing search results.
          @param {Object[]} results.features Array containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
          or a promise returning such array.
      */
      onIdentificationFinished(e) {
        let serviceLayer = this.get('serviceLayer');
        if (!serviceLayer) {
          let leafletMap = this.get('leafletMap');
          this.set('serviceLayer', L.featureGroup().addTo(leafletMap));
        } else {
          serviceLayer.clearLayers();
        }

        this.set('polygonLayer', e.polygonLayer);
        this.set('identifyResults', e.results);

        // below is kind of madness, but if you want sidebar to move on identification finish - do that
        if (this.get('sidebar.2.active') !== true) {
          this.set('sidebar.2.active', true);
        }

        if (!this.get('sidebarOpened')) {
          this.send('toggleSidebar', {
            changed: false,
            tabName: 'identify'
          });
        }
      }
    }
  });
