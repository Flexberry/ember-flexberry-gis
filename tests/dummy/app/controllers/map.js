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
export default EditMapController.extend(EditFormControllerOperationsIndicationMixin, {
  /**
    Parent route.

    @property parentRoute
    @type String
    @default 'maps'
  */
  parentRoute: 'maps',

  /**
    Leaflet layer group for temporal layers.

    @property serviceLayer
    @type <a href="http://leafletjs.com/reference-1.2.0.html#layergroup">L.LayerGroup</a>
    @default null
  */
  serviceLayer: null,

  /**
    Flag: indicates whether to show layer tree or not.

    @property showTree
    @type Boolean
    @default false
  */
  showTree: false,

  /**
    Set of scales for map's switch scale control.

    @property switchScaleControlScales
    @type Number[]
  */
  switchScaleControlScales: [500, 1000, 2000, 5000, 10000, 15000, 25000, 50000, 75000, 100000, 150000, 200000],

  /**
    Sidebar tabs metadata.

    @property sidebar
    @type Object[]
  */
  sidebar: Ember.A([{
    selector: 'treeview',
    captionPath: 'forms.map.treeviewbuttontooltip',
    iconClass: 'list icon'
  }, {
    selector: 'search',
    captionPath: 'forms.map.searchbuttontooltip',
    iconClass: 'search icon'
  }, {
    selector: 'identify',
    captionPath: 'forms.map.identifybuttontooltip',
    iconClass: 'info circle icon',
    class: 'identify'
  }, {
    selector: 'bookmarks',
    captionPath: 'forms.map.bookmarksbuttontooltip',
    iconClass: 'bookmark icon'
  }]),

  /**
    Sidebar items metadata.

    @property sidebarItems
    @type Object[]
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
    Set of laeflet layers opened at 'flexberry-layers-attributes-panel'.

    @property editedLayers
    @type Object[]
    @default null
  */
  editedLayers: null,

  /**
    Index of currently selected tab at 'flexberry-layers-attributes-panel'.

    @property editedLayersSelectedTabIndex
    @type Object[]
    @default 0
  */
  editedLayersSelectedTabIndex: 0,

  /**
    Flag indicates whether 'flexberry-layers-attributes-panel' is folded or not.

    @property editedLayersPanelFolded
    @type Boolean
    @default true
  */
  editedLayersPanelFolded: true,

  /**
    Flag indicates whether 'flexberry-layers-attributes-panel' is loading or not.

    @property editedLayersPanelLoading
    @type Boolean
    @default false
  */
  editedLayersPanelLoading: false,

  /**
    Hash containing settiings for 'flexberry-layers-attributes-panel'.

    @property editedLayersPanelSettings
    @type Object
    @default null
  */
  editedLayersPanelSettings: null,

  /**
    Initializes 'flexberry-layers-attributes-panel'.

    @method initializeEditPanel
  */
  initializeEditPanel() {
    this.setProperties({
      editedLayers: Ember.A(),
      editedLayersSelectedTabIndex: 0,
      editedLayersPanelFolded: true,
      editedLayersPanelSettings: {
        withToolbar: false,
        sidebarOpened: false
      }
    });
  },

  /**
    Deinitializes 'flexberry-layers-attributes-panel'.

    @method destroyEditPanel
  */
  destroyEditPanel() {
    this.setProperties({
      editedLayers: null,
      editedLayersSelectedTabIndex: 0,
      editedLayersPanelFolded: true,
      editedLayersPanelSettings: {
        withToolbar: false,
        sidebarOpened: false
      }
    });
  },

  /**
    Observes changes in sidebar state and performs some changes in related 'flexberry-layers-attributes-panel'.

    @method sideBarStateDidChange
  */
  sideBarStateDidChange: Ember.observer('sidebarOpened', function() {
    if (this.get('sidebarOpened')) {
      this.set('editedLayersPanelSettings.sidebarOpened', true);
    } else {
      this.set('editedLayersPanelSettings.sidebarOpened', false);
    }
  }),

  /**
    Handles leaflet map's container resize and performs some changes in related 'flexberry-layers-attributes-panel'.

    @method onLeafletMapContainerResizeStart
  */
  onLeafletMapContainerResizeStart() {
    let panelHeight = Ember.$('.mappanel').innerHeight();
    if (panelHeight < 630) {
      this.set('editedLayersPanelSettings.withToolbar', true);
    } else {
      this.set('editedLayersPanelSettings.withToolbar', false);
    }
  },

  actions: {
    /**
      Handles leaflet map initialization.

      @method  actions.onMapLeafletInit
    */
    onMapLeafletInit() {
      this._super(...arguments);

      this.initializeEditPanel();

      let leafletMap = this.get('leafletMap');
      if (!Ember.isNone(leafletMap)) {
        leafletMap.on('containerResizeStart', this.onLeafletMapContainerResizeStart, this);
      }
    },

    /**
      Handles leaflet map deinitialization.

      @method  actions.onMapLeafletDestroy
    */
    onMapLeafletDestroy() {
      let leafletMap = this.get('leafletMap');
      if (!Ember.isNone(leafletMap)) {
        leafletMap.off('containerResizeStart', this.onLeafletMapContainerResizeStart, this);
      }

      this.destroyEditPanel();

      this._super(...arguments);
    },

    /**
      Toggles sidebar.

      @method actions.toggleSidebar
    */
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
        if (!this.get('showTree')) {
          Ember.run.later(() => {
            this.set('showTree', true);
          }, 500);
        }
      }
    },

    /**
      Performs search.

      @method actions.querySearch
    */
    querySearch(queryString) {
      let leafletMap = this.get('leafletMap');
      let e = {
        context: true,
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

    /**
      Clears search results.

      @method actions.clearSearch
    */
    clearSearch() {
      this.set('searchResults', null);
    }
  }
});
