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
      toggleSidebar(sidebar, context, e) {
        if (!e.changed) {
          Ember.$(sidebar)
            .sidebar({
              context: Ember.$(context),
              dimPage: false,
              closable: false
            })
            .sidebar('setting', 'transition', 'overlay')
            .sidebar('toggle');
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
      }
    },

    /**
      Parent route.

      @property parentRoute
      @type String
      @default 'maps'
    */
    parentRoute: 'maps',

    /**
     * items
     */
    sidebarItems: Ember.computed(function () {
      let i18n = this.get('i18n');

      return [{
          selector: 'treeview',
          caption: i18n.t('forms.map.treeviewbuttontooltip').toString(),
          iconClass: 'list icon'
        },
        {
          selector: 'search',
          caption: i18n.t('forms.map.searchbuttontooltip').toString(),
          iconClass: 'search icon'
        },
        {
          selector: 'bookmarks',
          caption: i18n.t('forms.map.bookmarksbuttontooltip').toString(),
          iconClass: 'bookmark icon'
        }
      ];
    })
  });
