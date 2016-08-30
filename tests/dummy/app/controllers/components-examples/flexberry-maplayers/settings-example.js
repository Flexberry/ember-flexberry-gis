import Ember from 'ember';
import FlexberryMaplayerActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-maplayer-actions-handler';
import { availableLayerTypes } from 'ember-flexberry-gis/utils/layers';

export default Ember.Controller.extend(FlexberryMaplayerActionsHandlerMixin, {
  /**
    Component's wrapper CSS classes.

    @property jsonLayersClass
    @type String
  */
  jsonLayersClass: '',

  /**
    Flag: indicates whether only one tree node can be expanded at the same time.
    If true, all expanded tree nodes will be automatically collapsed, on some other node expand.

    @property jsonLayersExclusive
    @type Boolean
    @default false
  */
  jsonLayersExclusive: false,

  /**
    Flag: indicates whether it is allowed for already expanded tree nodes to collapse.

    @property jsonLayersCollapsible
    @type Boolean
    @default true
  */
  jsonLayersCollapsible: true,

  /**
    Flag: indicates whether nested child nodes content opacity should be animated
    (if true, it may cause performance issues with many nested child nodes).

    @property jsonLayersAnimateChildren
    @type Boolean
    @default false
  */
  jsonLayersAnimateChildren: false,

  /**
    Layers nodes expand/collapse animation duration in milliseconds.

    @property jsonLayersDuration
    @type Number
    @default 350
  */
  jsonLayersDuration: 350,

  /**
    Flag: indicates whether layers tree is in readonly mode or not.

    @property jsonLayersReadonly
    @type Boolean
    @default false
  */
  jsonLayersReadonly: false,

  /**
    Layers hierarchy with their settings.

    @property hbsTreeNodes
    @type Object[]
  */
  jsonLayers: Ember.A([{
    name: 'Perm water (group layer)',
    type: 'group',
    visibility: true,
    layers: Ember.A([{
      name: 'Perm water lines (wms layer)',
      type: 'wms',
      visibility: true,
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
      settings: '{"url":"http://172.17.1.15:8080/geoserver/ows",' +
                '"layers":"osm_perm_region:water_polygon_all",' +
                '"format":"image/png",' +
                '"transparent":"true",' +
                '"version":"1.3.0"}',
      coordinateReferenceSystem: null
    }])
  }, {
    name: 'Perm points of interest (group layer)',
    type: 'group',
    visibility: true,
    layers: Ember.A([{
      name: 'Perm points of interest (group layer)',
      type: 'wms',
      visibility: true,
      settings: '{"url":"http://172.17.1.15:8080/geoserver/ows",' +
                '"layers":"osm_perm_region:perm_points_of_interest",' +
                '"format":"image/png",' +
                '"transparent":"true",' +
                '"version":"1.3.0"}',
      coordinateReferenceSystem: null
    }])
  }, {
    name: 'Open Street Map (tile layer)',
    type: 'tile',
    visibility: true,
    settings: '{"url": "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}',
    coordinateReferenceSystem: null
  }]),

  /**
    Component's template text.

    @property jsonLayersComponentTemplateText
    @type String
  */
  jsonLayersComponentTemplateText: new Ember.Handlebars.SafeString(
    '{{flexberry-maplayers<br>' +
    '  class=jsonLayersClass<br>' +
    '  exclusive=jsonLayersExclusive<br>' +
    '  collapsible=jsonLayersCollapsible<br>' +
    '  animateChildren=jsonLayersAnimateChildren<br>' +
    '  duration=jsonLayersDuration<br>' +
    '  readonly=jsonLayersReadonly<br>' +
    '  layers=(get-with-dynamic-actions this "jsonLayers"<br>' +
    '    hierarchyPropertyName="layers"<br>' +
    '    pathKeyword="layerPath"<br>' +
    '    dynamicActions=(array<br>' +
    '      (hash<br>' +
    '        on="headerClick"<br>' +
    '        actionName="onMapLayerHeaderClick"<br>' +
    '        actionArguments=(array "{% layerPath %}")<br>' +
    '      )<br>' +
    '      (hash<br>' +
    '        on="addChild"<br>' +
    '        actionName="onMapLayerAddChild"<br>' +
    '        actionArguments=(array "{% layerPath %}")<br>' +
    '      )<br>' +
    '      (hash<br>' +
    '        on="edit"<br>' +
    '        actionName="onMapLayerEdit"<br>' +
    '        actionArguments=(array "{% layerPath %}")<br>' +
    '      )<br>' +
    '      (hash<br>' +
    '        on="remove"<br>' +
    '        actionName="onMapLayerRemove"<br>' +
    '        actionArguments=(array "{% layerPath %}")<br>' +
    '      )<br>' +
    '      (hash<br>' +
    '        on="changeVisibility"<br>' +
    '        actionName="onMapLayerChangeVisibility"<br>' +
    '        actionArguments=(array "{% layerPath %}.visibility")<br>' +
    '      )<br>' +
    '    )<br>' +
    '  )<br>' +
    '  addChild=(action "onMapLayerAddChild" "jsonLayers")<br>' +
    '}}'),

  /**
    Component settings metadata.

    @property jsonLayersComponentSettingsMetadata
    @type Object[]
  */
  jsonLayersComponentSettingsMetadata: Ember.computed(function() {
    let componentSettingsMetadata = Ember.A();

    componentSettingsMetadata.pushObject({
      settingName: 'class',
      settingType: 'css',
      settingDefaultValue: '',
      settingAvailableItems: ['styled', 'fluid'],
      bindedControllerPropertieName: 'jsonLayersClass'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'exclusive',
      settingType: 'boolean',
      settingDefaultValue: false,
      bindedControllerPropertieName: 'jsonLayersExclusive'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'collapsible',
      settingType: 'boolean',
      settingDefaultValue: true,
      bindedControllerPropertieName: 'jsonLayersCollapsible'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'animateChildren',
      settingType: 'boolean',
      settingDefaultValue: false,
      bindedControllerPropertieName: 'jsonLayersAnimateChildren'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'duration',
      settingType: 'number',
      settingDefaultValue: 350,
      bindedControllerPropertieName: 'jsonLayersDuration'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'readonly',
      settingType: 'boolean',
      settingDefaultValue: false,
      bindedControllerPropertieName: 'jsonLayersReadonly'
    });

    return componentSettingsMetadata;
  }),

  /**
    Path to controller's property representing latest clicked layer node.

    @property jsonLayersLatestClickedLayerPath
    @type String
    @default null
  */
  jsonLayersLatestClickedLayerPath: null,

  /**
    Component settings metadata for latest clicked tree node.

    @property hbsTreeComponentSettingsMetadata
    @type Object[]
  */
  jsonLayersLatestClickedLayerComponentSettingsMetadata: Ember.computed('jsonLayersLatestClickedLayerPath', function() {
    let jsonLayersLatestClickedLayerPath = this.get('jsonLayersLatestClickedLayerPath');
    let componentSettingsMetadata = Ember.A();

    if (Ember.isBlank(jsonLayersLatestClickedLayerPath)) {
      return componentSettingsMetadata;
    }

    componentSettingsMetadata.pushObject({
      settingName: 'name',
      settingType: 'string',
      settingDefaultValue: null,
      bindedControllerPropertieName: jsonLayersLatestClickedLayerPath + '.name'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'type',
      settingType: 'enumeration',
      settingAvailableItems: availableLayerTypes(),
      settingDefaultValue: null,
      bindedControllerPropertieName: jsonLayersLatestClickedLayerPath + '.type'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'visibility',
      settingType: 'boolean',
      settingDefaultValue: null,
      bindedControllerPropertieName: jsonLayersLatestClickedLayerPath + '.visibility'
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
  },
});
