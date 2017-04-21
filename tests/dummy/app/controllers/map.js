/**
  @module ember-flexberry-gis-dummy
*/

import Ember from 'ember';
import EditMapController from 'ember-flexberry-gis/controllers/edit-map';
import EditFormControllerOperationsIndicationMixin from '../mixins/edit-form-controller-operations-indication';

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
    identifyLayersOption: '',

    /**
      Parameter contains current map identification tool option (arrow, square, polygon etc.)
      @property identifyToolOption
      @type String
      @default ''
     */
    identifyToolOption: '',

    /**
      Parameter contains default map identification layer option (all, visible, top etc.)
      @property _defaultIdentifyLayersOption
      @type String
      @default 'visible'
     */
    _defaultIdentifyLayersOption: 'visible',

    /**
      Parameter contains default map identification tool option (arrow, square, polygon etc.)
      @property _defaultIdentifyToolOption
      @type String
      @default 'rectangle'
     */
    _defaultIdentifyToolOption: 'rectangle',

    serviceLayer: null,

    availableCRS: Ember.computed(function () {
      let availableModes = Ember.A();
      let i18n = this.get('i18n');
      availableModes.push({
        crs: this.get('model.crs'),
        name: i18n.t('forms.crs.current.name').toString(),
        xCaption: i18n.t('forms.crs.current.xCaption').toString(),
        yCaption: i18n.t('forms.crs.current.yCaption').toString()
      });
      availableModes.push({
        crs: L.CRS.EPSG4326,
        name: i18n.t('forms.crs.latlng.name').toString(),
        xCaption: i18n.t('forms.crs.latlng.xCaption').toString(),
        yCaption: i18n.t('forms.crs.latlng.yCaption').toString()
      });

      return availableModes;
    }),

    actions: {
      toggleSidebar(sidebar, context) {
        Ember.$(sidebar)
          .sidebar({
            context: Ember.$(context),
            dimPage: false,
            closable: false
          })
          .sidebar('setting', 'transition', 'overlay')
          .sidebar('toggle');

        if (sidebar === '.ui.sidebar.identify') {
          if (Ember.isBlank(this.get('identifyLayersOption'))) {
            this.set('identifyLayersOption', this.get('_defaultIdentifyLayersOption'));
          }

          if (Ember.isBlank(this.get('identifyToolOption'))) {
            this.set('identifyToolOption', this.get('_defaultIdentifyToolOption'));
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
            return layerModel.get('canBeSearched') && layerModel.get('visibility');
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
      },

      /**
          Handles 'flexberry-maptoolbar:identificationFinished' event of leaflet map.

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

        this.set('identifyResults', e.results);

        if (!Ember.$('.ui.sidebar.identify').hasClass('visible')) {
          this.send('toggleSidebar', '.ui.sidebar.identify', '.mappanel');
        }
      }
    },

    /**
      Parent route.

      @property parentRoute
      @type String
      @default 'maps'
    */
    parentRoute: 'maps'

  });
