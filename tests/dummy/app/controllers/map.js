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
