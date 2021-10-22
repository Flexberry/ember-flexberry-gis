/**
  @module ember-flexberry-gis-dummy
*/

import { later } from '@ember/runloop';

import $ from 'jquery';
import { A } from '@ember/array';
import { isBlank, isNone } from '@ember/utils';
import {
  computed, observer, get, set
} from '@ember/object';
import EditMapController from 'ember-flexberry-gis/controllers/edit-map';
import EditFormControllerOperationsIndicationMixin from 'ember-flexberry/mixins/edit-form-controller-operations-indication';
import sideBySide from 'npm:leaflet-side-by-side';

/**
  Map controller.

  @class MapController
  @extends EditMapController
  @uses EditFormControllerOperationsIndicationMixin
*/
export default EditMapController.extend(EditFormControllerOperationsIndicationMixin, {
  /**
    Property contatining sideBySide component.
    @property sideBySide
    @type L.control.sideBySide
    @default null
  */
  sideBySide: L.control.sideBySide(),

  /**
    Parent route.

    @property parentRoute
    @type String
    @default 'maps'
  */
  parentRoute: 'maps',

  /**
    Idenify tool layers mode (which layers to identify).

    @property identifyToolLayerMode
    @default 'visible'
    @type String
  */
  identifyToolLayerMode: 'visible',

  /**
    Identify tool mode (in which type of area to identify).

    @property identifyToolToolMode
    @default 'marker'
    @type String
  */
  identifyToolToolMode: 'marker',

  /**
    Flag: indicates whether idenify tool's buffer if active or not.

    @property identifyToolBufferActive
    @type Boolean
    @default false
  */
  identifyToolBufferActive: false,

  /**
    Idenify tool buffer raduus units.

    @property identifyToolBufferUnits
    @type String
    @default 'kilometers'
  */
  identifyToolBufferUnits: 'kilometers',

  /**
    Idenify tool buffer radius in selected units.

    @property identifyToolBufferRadius
    @type Number
    @default 0
  */
  identifyToolBufferRadius: 0,

  /**
    Placeholder or default text (will be displayed if there is no selected item).

    @property placeholderSearch
    @type String
    @default null
  */
  placeholderSearch: null,

  /**
    Identify tool name computed by the specified tool settings.

    @property identifyToolName
    @type String
    @readOnly
  */
  identifyToolName: computed('identifyToolLayerMode', 'identifyToolToolMode', function () {
    let identifyToolName = 'identify';
    const layerMode = this.get('identifyToolLayerMode');
    const toolMode = this.get('identifyToolToolMode');

    if (!(isBlank(layerMode) || isBlank(toolMode))) {
      identifyToolName = `identify-${layerMode}-${toolMode}`;
    }

    return identifyToolName;
  }),

  /**
    Polygon layer representing identification area (icluding buffer, if buffer enabled).

    @property identifyToolPolygonLayer
    @type <a href="http://leafletjs.com/reference-1.2.0.html#layergroup">L.LayerGroup</a>
    @default null
  */
  identifyToolPolygonLayer: null,

  /**
    Polygon layer around which the buffer is drawn.

    @property bufferedMainPolygonLayer
    @type <a href="http://leafletjs.com/reference.html#polygon">L.Polygon</a>
    @default null
  */
  identifyToolBufferedMainPolygonLayer: null,

  /**
    Identification results.

    @property identifyToolResults
    @type Object[]
  */
  identifyToolResults: null,

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

  _leafletMapDidChange: observer('leafletMap', function () {
    const leafletMap = this.get('leafletMap');
    if (leafletMap) {
      leafletMap.on('flexberry-map:toggleSidebar', this.onToggleSidebar, this);
    }
  }),

  /**
   Flat indicates that map should fire create object on first load
  */
  createObject: null,

  /**
    Sidebar tabs metadata.

    @property sidebar
    @type Object[]
  */
  sidebar: A([{
    selector: 'treeview',
    captionPath: 'forms.map.treeviewbuttontooltip',
    iconClass: 'list icon',
  }, {
    selector: 'search',
    captionPath: 'forms.map.searchbuttontooltip',
    iconClass: 'search icon',
  }, {
    selector: 'identify',
    captionPath: 'forms.map.identifybuttontooltip',
    iconClass: 'info circle icon',
    class: 'identify',
  }, {
    selector: 'bookmarks',
    captionPath: 'forms.map.bookmarksbuttontooltip',
    iconClass: 'bookmark icon',
  }, {
    selector: 'favorites',
    captionPath: 'forms.map.favoritesbuttontooltip',
    iconClass: 'favorites icon',
    class: 'favorite',
  }, {
    selector: 'createObject',
    captionPath: 'forms.map.createobjectbuttontooltip',
    iconClass: 'createObject icon',
  }, {
    selector: 'createOrEditObject',
    captionPath: 'forms.map.createoreditobjectbuttontooltip',
    iconClass: 'createOrEditObject icon',
    class: 'createOrEditObject',
  }, {
    selector: 'compare',
    captionPath: 'forms.map.comparebuttontooltip',
    iconClass: 'compare icon',
    class: 'compare',
  }, {
    selector: 'compareObjects',
    caption: 'Сравнение объектов',
    iconClass: 'compareObjects icon',
    class: 'compareObjects',
  }, {
    selector: 'intersectionObjects',
    caption: 'Сравнение объектов',
    iconClass: 'intersectionObjects icon',
    class: 'intersectionObjects',
  }]),

  _showFavorites: false,

  _sidebarFiltered: computed('sidebar', 'createObject', 'createOrEditObject', 'compareObjects', 'showIntersectionPanel', function () {
    const result = A();
    const sidebar = this.get('sidebar');
    sidebar.forEach((item) => {
      if ((item.selector !== 'createObject' || this.get('createObject'))
        && (item.selector !== 'createOrEditObject' || this.get('createOrEditObject'))
        && (item.selector !== 'intersectionObjects' || this.get('showIntersectionPanel'))
        && (item.selector !== 'compareObjects' || this.get('compareObjects')))/* &&
        (item.selector !== 'compare' || this.get('compare'))) */{
        result.push(item);
      }
    });

    return result;
  }),

  /**
    Sidebar items metadata.

    @property sidebarItems
    @type Object[]
  */
  sidebarItems: computed('sidebar.[]', 'sidebar.@each.active', 'i18n', function () {
    const i18n = this.get('i18n');
    const sidebar = this.get('sidebar');

    const result = A(sidebar);
    result.forEach((item) => {
      const caption = get(item, 'caption');
      const captionPath = get(item, 'captionPath');

      if (!caption && captionPath) {
        set(item, 'caption', i18n.t(captionPath));
      }
    });

    return result;
  }),

  /**
    СRS metadata.

    @property sidebar
    @type Object[]
   */
  availableCRS: computed(function () {
    return [{
      crs: L.CRS.EPSG3395,
      name: 'EPSG:3395',
      xCaption: 'forms.map.xCaption',
      yCaption: 'forms.map.yCaption',
    },
    {
      crs: L.CRS.EPSG4326,
      name: 'EPSG:4326',
      xCaption: 'forms.map.xCaption',
      yCaption: 'forms.map.yCaption',
    },
    {
      crs: L.CRS.EPSG3857,
      name: 'EPSG:3857',
      xCaption: 'forms.map.xCaption',
      yCaption: 'forms.map.yCaption',
    }
    ];
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
      editedLayers: A(),
      editedLayersSelectedTabIndex: 0,
      editedLayersPanelFolded: true,
      editedLayersPanelSettings: {
        withToolbar: true,
        sidebarOpened: false,
      },
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
        sidebarOpened: false,
      },
    });
  },

  onToggleSidebar() {
    let tab;
    if (this.get('sidebarOpened')) {
      $('.sidebar-wrapper .main-map-tab-bar > .item.tab.active').removeClass('active');
    } else {
      // поищем поcледнюю активную. у самих data-tab класс не сбрасывается
      const activeTab = $('.sidebar-wrapper .sidebar.tabbar > .ui.tab.active');
      if (activeTab.length > 0) {
        const dataTab = activeTab.attr('data-tab');
        $(`.sidebar-wrapper .main-map-tab-bar > .item.tab[data-tab=${dataTab}]`).addClass('active');
        tab = dataTab;
      } else {
        this.set('sidebar.0.active', true);
        tab = 'treeview';
      }
    }

    this.send('toggleSidebar', {
      changed: false,
      tabName: tab,
    });
  },

  /**
    Observes changes in sidebar state and performs some changes in related 'flexberry-layers-attributes-panel'.

    @method sideBarStateDidChange
  */
  sideBarStateDidChange: observer('sidebarOpened', function () {
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
    const panelHeight = $('.mappanel').innerHeight();
    if (panelHeight < 630) {
      this.set('editedLayersPanelSettings.withToolbar', true);
    } else {
      this.set('editedLayersPanelSettings.withToolbar', false);
    }
  },

  actions: {
    OnCompareTwoGeometries() {
      this.set('compareObjects', true);
      later(() => {
        let tab;
        const activeTab = $('.sidebar-wrapper .sidebar.tabbar > .ui.tab.active');
        if (activeTab.length > 0) {
          tab = activeTab.attr('data-tab');
        }

        $('.sidebar-wrapper .main-map-tab-bar > .item.tab.active').removeClass('active');

        this.set('sidebar.8.active', true);

        this.send('toggleSidebar', {
          changed: this.get('sidebarOpened'),
          tabName: 'compareObjects',
          prevTab: tab,
        });
      });
    },

    onCompareTwoGeometriesEnd() {
      this.set('compareObjects', false);

      this.set('sidebar.8.class', 'compareObjects');
      this.set('sidebar.8.active', false);

      this.set('sidebar.3.active', true);
      this.send('toggleSidebar', {
        changed: true,
        tabName: 'bookmarks',
      });
    },

    /**
      Handles create object.

      @method  actions.onCreateObject
    */
    onCreateObject(createItems) {
      this.set('createItems', createItems);
      this.set('createObject', true);

      if (this.get('createObject')) {
        later(() => {
          if (this.get('sidebar.5.active') !== true) {
            this.set('sidebar.5.active', true);
          }

          if (!this.get('sidebarOpened')) {
            this.send('toggleSidebar', {
              changed: false,
              tabName: 'createObject',
            });
          }
        });
      }
    },

    /**
      Handles create/edit feature.

      @method  actions.onCreateOrEditFeature
    */
    onCreateOrEditFeature(e) {
      this.set('createOrEditedFeature', e);
      this.set('createOrEditObject', true);

      if (this.get('createOrEditObject')) {
        later(() => {
          if (this.get('sidebar.6.class').indexOf('active') === -1 && this.get('sidebarOpened')) {
            $('.sidebar-wrapper .item.active').removeClass('active');
          }

          this.set('sidebar.6.active', true);

          if (!this.get('sidebarOpened')) {
            this.send('toggleSidebar', {
              changed: false,
              tabName: 'createOrEditObject',
            });
          }
        });
      }
    },

    onCreateOrEditFeatureEnd() {
      this.set('createOrEditedFeature', null);
      this.set('createOrEditObject', false);

      this.set('sidebar.6.class', 'createOrEditObject');
      this.set('sidebar.6.active', false);

      this.set('sidebar.0.active', true);
    },

    attrSearch(queryString) {
      if (this.get('sidebar.1.active') !== true) {
        this.set('sidebar.1.active', true);
      }

      this.set('attrVisible', true);
      this.set('queryString', queryString);

      if (!this.get('sidebarOpened')) {
        this.send('toggleSidebar', {
          changed: false,
          tabName: 'search',
        });
      }
    },

    showCompareSideBar() {
      if (sideBySide) {
        if (!this.get('compareLayersEnabled')) {
          this.set('sidebar.7.active', true);
        } else {
          this.set('sidebar.0.active', true);
        }

        if (!this.get('sidebarOpened')) {
          this.send('toggleSidebar', {
            changed: false,
            tabName: 'compare',
          });
        }

        setTimeout(() => {
          this.toggleProperty('compareLayersEnabled');
        }, 500);
      }
    },

    onQueryFinished(e) {
      if (this.get('createObject')) {
        later(() => {
          if (this.get('sidebar.5.active') !== true) {
            this.set('sidebar.5.active', true);
          }

          if (!this.get('sidebarOpened')) {
            this.send('toggleSidebar', {
              changed: false,
              tabName: 'createObject',
            });
          }
        });
      } else {
        this._identificationFinished(e);
      }
    },

    /**
      Handles leaflet map initialization.

      @method  actions.onMapLeafletInit
    */
    onMapLeafletInit() {
      this._super(...arguments);

      this.initializeEditPanel();
    },

    /**
      Handles leaflet map deinitialization.

      @method  actions.onMapLeafletDestroy
    */
    onMapLeafletDestroy() {
      this.destroyEditPanel();
      this.set('sidebarOpened', false);
      this.set('showTree', false);
      const leafletMap = this.get('leafletMap');
      if (leafletMap) {
        leafletMap.off('flexberry-map:toggleSidebar', this.onToggleSidebar, this);
      }

      this._super(...arguments);
    },

    /**
      Toggles sidebar.

      @method actions.toggleSidebar
    */
    toggleSidebar(e) {
      if (!e.changed) {
        const sidebarOpened = !this.get('sidebarOpened');
        this.set('sidebarOpened', sidebarOpened);

        // push left map controls to right for sidebar width
        if (sidebarOpened) {
          $('.sidebar-wrapper').addClass('visible');
        } else {
          $('.sidebar-wrapper').removeClass('visible');
          this.set('attrVisible', false);
        }
      }

      if (e.tabName !== 'search') {
        this.set('attrVisible', false);
      }

      if (e.tabName !== 'compare' && this.get('compareLayersEnabled')) {
        this.set('compareLayersEnabled', false);
      }

      if (e.tabName === 'identify') {
        const leafletMap = this.get('leafletMap');
        if (isNone(leafletMap)) {
          return;
        }

        // Enable identify tool when 'identify' tab is clicked.
        const identifyToolName = this.get('identifyToolName');
        const identifyToolProperties = {
          bufferActive: this.get('identifyToolBufferActive'),
          bufferUnits: this.get('identifyToolBufferUnits'),
          bufferRadius: this.get('identifyToolBufferRadius'),
          layerMode: this.get('identifyToolLayerMode'),
          toolMode: this.get('identifyToolToolMode'),
          layers: this.get('model.hierarchy'),
        };

        leafletMap.flexberryMap.tools.enable(identifyToolName, identifyToolProperties);
      }

      if (e.tabName === 'treeview') {
        if (!this.get('showTree')) {
          later(() => {
            this.set('showTree', true);
          }, 500);
        }
      }

      if (e.prevTab === 'createOrEditObject') {
        if (e.changed) {
          this.set('createOrEditObject', false);
          this.set('createOrEditedFeature', null);
        }

        this.set('sidebar.6.class', 'createOrEditObject');
        this.set('sidebar.6.active', false);
      }

      if (e.prevTab === 'intersectionObjects') {
        if (e.changed) {
          this.set('showIntersectionPanel', false);
          this.set('feature', null);
        }

        this.set('sidebar.9.class', 'intersectionObjects');
        this.set('sidebar.9.active', false);
      }

      if (e.prevTab === 'compareObjects') {
        if (e.changed) {
          this.set('compareObjects', null);
        }

        this.set('sidebar.8.class', 'compareObjects');
        this.set('sidebar.8.active', false);
      }
    },

    /**
      Performs search.

      @method actions.querySearch
    */
    querySearch(e) {
      const leafletMap = this.get('leafletMap');

      leafletMap.fire('flexberry-map:search', e);

      this.set('searchResults', e.results);

      if (this.get('sidebar.1.active') !== true) {
        this.set('sidebar.1.active', true);
        if (!this.get('sidebarOpened')) {
          this.send('toggleSidebar', {
            changed: false,
            tabName: 'search',
          });
        }
      }
    },

    /**
      Clears search results.

      @method actions.clearSearch
    */
    clearSearch() {
      this.set('searchResults', null);
    },

    /**
      Action shows intersection panel.

      @method actions.onIntersectionPanel
    */
    onIntersectionPanel(feature) {
      this.set('feature', feature);
      this.set('showIntersectionPanel', true);
      later(() => {
        let tab;
        const activeTab = $('.rgis-sidebar-wrapper .sidebar.tabbar > .ui.tab.active');
        if (activeTab.length > 0) {
          tab = activeTab.attr('data-tab');
        }

        $('.rgis-sidebar-wrapper .main-map-tab-bar > .item.tab.active').removeClass('active');

        this.set('sidebar.9.active', true);

        this.send('toggleSidebar', {
          changed: this.get('sidebarOpened'),
          tabName: 'intersectionObjects',
          prevTab: tab,
        });
      });
    },

    /**
      Close intersection panel.

      @method actions.findIntersection
    */
    closeIntersectionPanel() {
      this.set('intersection', false);
      this.set('showIntersectionPanel', false);

      this.set('feature', null);

      this.set('sidebar.9.class', 'createOrEditObject');
      this.set('sidebar.9.active', false);

      this.set('sidebar.0.active', true);
      this.send('toggleSidebar', {
        changed: true,
        tabName: 'treeview',
      });
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
      const serviceLayer = this.get('serviceLayer');
      serviceLayer.clearLayers();

      this.set('identifyToolPolygonLayer', e.polygonLayer);
      this.set('identifyToolBufferedMainPolygonLayer', e.bufferedMainPolygonLayer);
      this.set('identifyToolResults', e.results);

      // Below is kind of madness, but if you want sidebar to move on identification finish - do that.
      if (this.get('sidebar.2.active') !== true) {
        this.set('sidebar.2.active', true);
      }

      if (!this.get('sidebarOpened')) {
        this.send('toggleSidebar', {
          changed: false,
          tabName: 'identify',
        });
      }
    },

    /**
      Clears identification results.

      @method actions.onIdentificationClear
    */
    onIdentificationClear() {
      this.set('identifyToolResults', null);

      const serviceLayer = this.get('serviceLayer');
      if (serviceLayer) {
        serviceLayer.clearLayers();
      }

      const identifyToolPolygonLayer = this.get('identifyToolPolygonLayer');
      if (identifyToolPolygonLayer) {
        identifyToolPolygonLayer.disableEdit();
        identifyToolPolygonLayer.remove();
      }

      const identifyToolBufferedMainPolygonLayer = this.get('identifyToolBufferedMainPolygonLayer');
      if (identifyToolBufferedMainPolygonLayer) {
        identifyToolBufferedMainPolygonLayer.remove();
      }
    },
  },
});
