import Ember from 'ember';
import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayer-actions-handler';

export default Ember.Controller.extend(FlexberryMaplayerActionsHandlerMixin, {
  /**
    Component's wrapper CSS classes.

    @property hbsLayersClass
    @type String
  */
  hbsLayersClass: '',

  /**
    Flag: indicates whether only one tree node can be expanded at the same time.
    If true, all expanded tree nodes will be automatically collapsed, on some other node expand.

    @property hbsLayersExclusive
    @type Boolean
    @default false
  */
  hbsLayersExclusive: false,

  /**
    Flag: indicates whether it is allowed for already expanded tree nodes to collapse.

    @property hbsLayersCollapsible
    @type Boolean
    @default true
  */
  hbsLayersCollapsible: true,

  /**
    Flag: indicates whether nested child nodes content opacity should be animated
    (if true, it may cause performance issues with many nested child nodes).

    @property hbsLayersAnimateChildren
    @type Boolean
    @default false
  */
  hbsLayersAnimateChildren: false,

  /**
    Layers nodes expand/collapse animation duration in milliseconds.

    @property hbsLayersDuration
    @type Number
    @default 350
  */
  hbsLayersDuration: 350,

  /**
    Layers hierarchy with their settings.

    @property hbsTreeNodes
    @type Object[]
  */
  hbsLayers: [{
    name: 'Perm water (group layer)',
    type: 'group',
    visibility: true,
    readonly: false,
    layers: [{
      name: 'Perm water lines (wms layer)',
      type: 'wms',
      visibility: true,
      readonly: false,
      settings: '{"url":"http://172.17.1.15:8080/geoserver/ows", ' +
                '"layers":"osm_perm_region:perm_water_line", ' +
                '"format":"image/png", ' +
                '"transparent":"true", ' +
                '"version":"1.3.0"}',
      coordinateReferenceSystem: null
    }, {
      name: 'Perm water polygons (wms layer)',
      type: 'wms',
      visibility: false,
      readonly: false,
      settings: '{"url":"http://172.17.1.15:8080/geoserver/ows",' +
                '"layers":"osm_perm_region:water_polygon_all",' +
                '"format":"image/png",' +
                '"transparent":"true",' +
                '"version":"1.3.0"}',
      coordinateReferenceSystem: null
    }]
  }, {
    name: 'Perm points of interest (group layer)',
    type: 'group',
    visibility: true,
    readonly: false,
    layers: [{
      name: 'Perm points of interest (group layer)',
      type: 'wms',
      visibility: true,
      readonly: false,
      settings: '{"url":"http://172.17.1.15:8080/geoserver/ows",' +
                '"layers":"osm_perm_region:perm_points_of_interest",' +
                '"format":"image/png",' +
                '"transparent":"true",' +
                '"version":"1.3.0"}',
      coordinateReferenceSystem: null
    }]
  }, {
    name: 'Open Street Map (tile layer)',
    type: 'tile',
    visibility: true,
    readonly: false,
    settings: '{"url": "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}',
    coordinateReferenceSystem: null
  }],

  /**
    Component's template text.

    @property hbsLayersComponentTemplateText
    @type String
  */
  hbsLayersComponentTemplateText: new Ember.Handlebars.SafeString(
    '{{#flexberry-maplayers<br>' +
    '  class=hbsLayersClass<br>' +
    '  exclusive=hbsLayersExclusive<br>' +
    '  collapsible=hbsLayersCollapsible<br>' +
    '  animateChildren=hbsLayersAnimateChildren<br>' +
    '  duration=hbsLayersDuration<br>' +
    '}}<br>' +
    '  {{#flexberry-maplayer<br>' +
    '    name=hbsLayers.0.name<br>' +
    '    type=hbsLayers.0.type<br>' +
    '    visibility=hbsLayers.0.visibility<br>' +
    '    readonly=hbsLayers.0.readonly<br>' +
    '    headerClick=(action "onMapLayerHeaderClick" "hbsLayers.0")<br>' +
    '    visibilityChange=(action "onMapLayerVisibilityChange" "hbsLayers.0.visibility")<br>' +
    '  }}<br>' +
    '    {{#flexberry-maplayers}}<br>' +
    '      {{flexberry-maplayer<br>' +
    '        name=hbsLayers.0.layers.0.name<br>' +
    '        type=hbsLayers.0.layers.0.type<br>' +
    '        visibility=hbsLayers.0.layers.0.visibility<br>' +
    '        readonly=hbsLayers.0.layers.0.readonly<br>' +
    '        headerClick=(action "onMapLayerHeaderClick" "hbsLayers.0.layers.0")<br>' +
    '        visibilityChange=(action "onMapLayerVisibilityChange" "hbsLayers.0.layers.0.visibility")<br>' +
    '      }}<br>' +
    '      {{flexberry-maplayer<br>' +
    '        name=hbsLayers.0.layers.1.name<br>' +
    '        type=hbsLayers.0.layers.1.type<br>' +
    '        visibility=hbsLayers.0.layers.1.visibility<br>' +
    '        readonly=hbsLayers.0.layers.1.readonly<br>' +
    '        headerClick=(action "onMapLayerHeaderClick" "hbsLayers.0.layers.1")<br>' +
    '        visibilityChange=(action "onMapLayerVisibilityChange" "hbsLayers.0.layers.1.visibility")<br>' +
    '      }}<br>' +
    '    {{/flexberry-maplayers}}<br>' +
    '  {{/flexberry-maplayer}}<br>' +
    '  {{#flexberry-maplayer<br>' +
    '    name=hbsLayers.1.name<br>' +
    '    type=hbsLayers.1.type<br>' +
    '    visibility=hbsLayers.1.visibility<br>' +
    '    readonly=hbsLayers.1.readonly<br>' +
    '    headerClick=(action "onMapLayerHeaderClick" "hbsLayers.1")<br>' +
    '    visibilityChange=(action "onMapLayerVisibilityChange" "hbsLayers.1.visibility")<br>' +
    '  }}<br>' +
    '    {{#flexberry-maplayers}}<br>' +
    '      {{flexberry-maplayer<br>' +
    '        name=hbsLayers.1.layers.0.name<br>' +
    '        type=hbsLayers.1.layers.0.type<br>' +
    '        visibility=hbsLayers.1.layers.0.visibility<br>' +
    '        readonly=hbsLayers.1.layers.0.readonly<br>' +
    '        headerClick=(action "onMapLayerHeaderClick" "hbsLayers.1.layers.0")<br>' +
    '        visibilityChange=(action "onMapLayerVisibilityChange" "hbsLayers.1.layers.0.visibility")<br>' +
    '      }}<br>' +
    '    {{/flexberry-maplayers}}<br>' +
    '  {{/flexberry-maplayer}}<br>' +
    '  {{flexberry-maplayer<br>' +
    '    name=hbsLayers.2.name<br>' +
    '    type=hbsLayers.2.type<br>' +
    '    visibility=hbsLayers.2.visibility<br>' +
    '    readonly=hbsLayers.2.readonly<br>' +
    '    headerClick=(action "onMapLayerHeaderClick" "hbsLayers.2")<br>' +
    '    visibilityChange=(action "onMapLayerVisibilityChange" "hbsLayers.2.visibility")<br>' +
    '  }}<br>' +
    '{{/flexberry-maplayers}}'),

  /**
    Component settings metadata.

    @property hbsLayersComponentSettingsMetadata
    @type Object[]
  */
  hbsLayersComponentSettingsMetadata: Ember.computed(function() {
    let componentSettingsMetadata = Ember.A();

    componentSettingsMetadata.pushObject({
      settingName: 'class',
      settingType: 'css',
      settingDefaultValue: '',
      settingAvailableItems: ['styled', 'fluid'],
      bindedControllerPropertieName: 'hbsLayersClass'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'exclusive',
      settingType: 'boolean',
      settingDefaultValue: false,
      bindedControllerPropertieName: 'hbsLayersExclusive'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'collapsible',
      settingType: 'boolean',
      settingDefaultValue: true,
      bindedControllerPropertieName: 'hbsLayersCollapsible'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'animateChildren',
      settingType: 'boolean',
      settingDefaultValue: false,
      bindedControllerPropertieName: 'hbsLayersAnimateChildren'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'duration',
      settingType: 'number',
      settingDefaultValue: 350,
      bindedControllerPropertieName: 'hbsLayersDuration'
    });

    return componentSettingsMetadata;
  }),

  /**
    Path to controller's property representing latest clicked layer node.

    @property hbsLayersLatestClickedLayerPath
    @type String
    @default null
  */
  hbsLayersLatestClickedLayerPath: null,

  /**
    Component settings metadata for latest clicked tree node.

    @property hbsTreeComponentSettingsMetadata
    @type Object[]
  */
  hbsLayersLatestClickedLayerComponentSettingsMetadata: Ember.computed('hbsLayersLatestClickedLayerPath', function() {
    let hbsLayersLatestClickedLayerPath = this.get('hbsLayersLatestClickedLayerPath');
    let componentSettingsMetadata = Ember.A();

    if (Ember.isBlank(hbsLayersLatestClickedLayerPath)) {
      return componentSettingsMetadata;
    }

    componentSettingsMetadata.pushObject({
      settingName: 'name',
      settingType: 'string',
      settingDefaultValue: null,
      bindedControllerPropertieName: hbsLayersLatestClickedLayerPath + '.name'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'type',
      settingType: 'enumeration',
      settingAvailableItems: [
        'group',
        'wms',
        'tile'
      ],
      settingDefaultValue: null,
      bindedControllerPropertieName: hbsLayersLatestClickedLayerPath + '.type'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'visibility',
      settingType: 'boolean',
      settingDefaultValue: null,
      bindedControllerPropertieName: hbsLayersLatestClickedLayerPath + '.visibility'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'readonly',
      settingType: 'boolean',
      settingDefaultValue: false,
      bindedControllerPropertieName: hbsLayersLatestClickedLayerPath + '.readonly'
    });

    return componentSettingsMetadata;
  }),

  actions: {
    /**
      Handles map layer's 'headerClick' action.

      @method actions.onMapLayerHeaderClick
      @param {String} clickedLayerPropertiesPath Path to controller's property representing clicked layer.
      @param {Object} e Action's event object
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes event that triggers this action.
    */
    onMapLayerHeaderClick(...args) {
      let actionEventObject = args[args.length - 1];
      let clickedLayerPropertiesPath = args[0];
      let clickedLayerSettingsPrefix = Ember.$(actionEventObject.originalEvent.currentTarget)
        .closest('.tab.segment')
        .attr('data-tab');

      // Remember latest clicked layer path to a tree-related controller's property.
      this.set(clickedLayerSettingsPrefix + 'LatestClickedLayerPath', clickedLayerPropertiesPath);
    }
  }
});
