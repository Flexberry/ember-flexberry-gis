import Ember from 'ember';
import FlexberryLayersTreenodeActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-layerstreenode-actions-handler';

export default Ember.Controller.extend(FlexberryLayersTreenodeActionsHandlerMixin, {
  /**
    Ember data store.

    @property _store
    @type DS.Store
    @private
  */
  _store: Ember.inject.service('store'),

  /**
    Component's wrapper CSS classes.

    @property hbsTreeClass
    @type String
  */
  hbsTreeClass: '',

  /**
    Flag: indicates whether only one tree node can be expanded at the same time.
    If true, all expanded tree nodes will be automatically collapsed, on some other node expand.

    @property hbsTreeExclusive
    @type Boolean
    @default false
  */
  hbsTreeExclusive: false,

  /**
    Flag: indicates whether it is allowed for already expanded tree nodes to collapse.

    @property hbsTreeCollapsible
    @type Boolean
    @default true
  */
  hbsTreeCollapsible: true,

  /**
    Flag: indicates whether nested child nodes content opacity should be animated
    (if true, it may cause performance issues with many nested child nodes).

    @property hbsTreeAnimateChildren
    @type Boolean
    @default false
  */
  hbsTreeAnimateChildren: false,

  /**
    Tree nodes expand/collapse animation duration in milliseconds.

    @property hbsTreeDuration
    @type Number
    @default 350
  */
  hbsTreeDuration: 350,

  /**
    Settings related to tree nodes hierarchy.

    @property hbsTreeNodes
    @type Object[]
  */
  hbsTreeNodes: [{
    name: 'hbsLayer1',
    type: 'wms',
    visibility: true,
    settings: '{"url":"http://172.17.1.15:8080/geoserver/ows", ' +
              '"layers":"osm_perm_region:perm_water_line", ' +
              '"format":"image/png", ' +
              '"transparent":"true", ' +
              '"version":"1.3.0"}',
    coordinateReferenceSystem: null,
    layers: [{
      name: 'hbsLayer1.1',
      type: 'tile',
      visibility: true,
      settings: '{"url": "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}',
      coordinateReferenceSystem: null,
      layers: [{
        name: 'hbsLayer1.1.1',
        type: 'wms',
        visibility: true,
        settings: '{"url":"http://172.17.1.15:8080/geoserver/ows",' +
                  '"layers":"osm_perm_region:perm_points_of_interest",' +
                  '"format":"image/png",' +
                  '"transparent":"true",' +
                  '"version":"1.3.0"}',
        coordinateReferenceSystem: null,
        layers: null
      }]
      }, {
        name: 'hbsLayer1.2',
        type: 'wms',
        visibility: false,
        settings: '{"url":"http://172.17.1.15:8080/geoserver/ows",' +
                  '"layers":"osm_perm_region:water_polygon_all",' +
                  '"format":"image/png",' +
                  '"transparent":"true",' +
                  '"version":"1.3.0"}',
        coordinateReferenceSystem: null,
        layers: null
      }
    ]
  }],

  /**
    Component's template text.

    @property hbsTreeComponentTemplateText
    @type String
  */
  hbsTreeComponentTemplateText: new Ember.Handlebars.SafeString(
    '{{#flexberry-layerstree<br>' +
    ' class=hbsTreeClass<br>' +
    ' exclusive=hbsTreeExclusive<br>' +
    ' collapsible=hbsTreeCollapsible<br>' +
    ' animateChildren=hbsTreeAnimateChildren<br>' +
    ' duration=hbsTreeDuration<br>' +
    '}}<br>' +
    ' {{#flexberry-layerstreenode<br>' +
    '   name=hbsTreeNodes.0.name<br>' +
    '   type=hbsTreeNodes.0.type<br>' +
    '   visibility=hbsTreeNodes.0.visibility<br>' +
    '   settings=hbsTreeNodes.0.settings<br>' +
    '   coordinateReferenceSystem=hbsTreeNodes.0.coordinateReferenceSystem<br>' +
    '   headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.0")<br>' +
    '   visibilityChange=(action "onTreenodeVisibilityChange" "hbsTreeNodes.0.visibility")<br>' +
    ' }}<br>' +
    '   {{#flexberry-layerstree}}<br>' +
    '     {{#flexberry-layerstreenode<br>' +
    '       name=hbsTreeNodes.0.layers.0.name<br>' +
    '       type=hbsTreeNodes.0.layers.0.type<br>' +
    '       visibility=hbsTreeNodes.0.layers.0.visibility<br>' +
    '       settings=hbsTreeNodes.0.layers.0.settings<br>' +
    '       coordinateReferenceSystem=hbsTreeNodes.0.layers.0.coordinateReferenceSystem<br>' +
    '       headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.0.layers.0")<br>' +
    '       visibilityChange=(action "onTreenodeVisibilityChange" "hbsTreeNodes.0.layers.0.visibility")<br>' +
    '     }}<br>' +
    '       {{#flexberry-layerstree}}<br>' +
    '         {{flexberry-layerstreenode<br>' +
    '           name=hbsTreeNodes.0.layers.0.layers.0.name<br>' +
    '           type=hbsTreeNodes.0.layers.0.layers.0.type<br>' +
    '           visibility=hbsTreeNodes.0.layers.0.layers.0.visibility<br>' +
    '           settings=hbsTreeNodes.0.layers.0.layers.0.settings<br>' +
    '           coordinateReferenceSystem=hbsTreeNodes.0.layers.0.layers.0.coordinateReferenceSystem<br>' +
    '           headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.0.layers.0.layers.0")<br>' +
    '           visibilityChange=(action "onTreenodeVisibilityChange" "hbsTreeNodes.0.layers.0.layers.0.visibility")<br>' +
    '         }}<br>' +
    '       {{/flexberry-layerstree}}<br>' +
    '     {{/flexberry-layerstreenode}}<br>' +
    '     {{flexberry-layerstreenode<br>' +
    '       name=hbsTreeNodes.0.layers.1.name<br>' +
    '       type=hbsTreeNodes.0.layers.1.type<br>' +
    '       visibility=hbsTreeNodes.0.layers.1.visibility<br>' +
    '       settings=hbsTreeNodes.0.layers.1.settings<br>' +
    '       coordinateReferenceSystem=hbsTreeNodes.0.layers.1.coordinateReferenceSystem<br>' +
    '       headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.0.layers.1")<br>' +
    '       visibilityChange=(action "onTreenodeVisibilityChange" "hbsTreeNodes.0.layers.1.visibility")<br>' +
    '     }}<br>' +
    '   {{/flexberry-layerstree}}<br>' +
    ' {{/flexberry-layerstreenode}}<br>' +
    '{{/flexberry-layerstree}}'),

  /**
    Component settings metadata.
    @property hbsTreeComponentSettingsMetadata
    @type Object[]
  */
  hbsTreeComponentSettingsMetadata: Ember.computed(function() {
    let componentSettingsMetadata = Ember.A();

    componentSettingsMetadata.pushObject({
      settingName: 'class',
      settingType: 'css',
      settingDefaultValue: '',
      settingAvailableItems: ['styled', 'fluid'],
      bindedControllerPropertieName: 'hbsTreeClass'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'exclusive',
      settingType: 'boolean',
      settingDefaultValue: false,
      bindedControllerPropertieName: 'hbsTreeExclusive'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'collapsible',
      settingType: 'boolean',
      settingDefaultValue: true,
      bindedControllerPropertieName: 'hbsTreeCollapsible'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'animateChildren',
      settingType: 'boolean',
      settingDefaultValue: false,
      bindedControllerPropertieName: 'hbsTreeAnimateChildren'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'duration',
      settingType: 'number',
      settingDefaultValue: 350,
      bindedControllerPropertieName: 'hbsTreeDuration'
    });

    return componentSettingsMetadata;
  }),

  /**
    Path to controller's property representing latest clicked tree node.

    @property hbsTreeLatestClickedNodePath
    @type String
    @default null
  */
  hbsTreeLatestClickedNodePath: null,

  /**
    Component settings metadata for latest clicked tree node.

    @property hbsTreeComponentSettingsMetadata
    @type Object[]
  */
  hbsTreeLatestClickedNodeComponentSettingsMetadata: Ember.computed('hbsTreeLatestClickedNodePath', function() {
    let hbsTreeLatestClickedNodePath = this.get('hbsTreeLatestClickedNodePath');
    let componentSettingsMetadata = Ember.A();

    if (Ember.isBlank(hbsTreeLatestClickedNodePath)) {
      return componentSettingsMetadata;
    }

    componentSettingsMetadata.pushObject({
      settingName: 'name',
      settingType: 'string',
      settingDefaultValue: undefined,
      bindedControllerPropertieName: hbsTreeLatestClickedNodePath + '.name'
    });

    componentSettingsMetadata.pushObject({
      settingName: 'type',
      settingType: 'string',
      settingDefaultValue: undefined,
      bindedControllerPropertieName: hbsTreeLatestClickedNodePath + '.type'
    });

    componentSettingsMetadata.pushObject({
      settingName: 'visibility',
      settingType: 'boolean',
      settingDefaultValue: undefined,
      bindedControllerPropertieName: hbsTreeLatestClickedNodePath + '.visibility'
    });

    componentSettingsMetadata.pushObject({
      settingName: 'settings',
      settingType: 'string',
      settingDefaultValue: undefined,
      bindedControllerPropertieName: hbsTreeLatestClickedNodePath + '.settings'
    });

    componentSettingsMetadata.pushObject({
      settingName: 'coordinateReferenceSystem',
      settingType: 'string',
      settingDefaultValue: undefined,
      bindedControllerPropertieName: hbsTreeLatestClickedNodePath + '.coordinateReferenceSystem'
    });

    return componentSettingsMetadata;
  }),

  /**
    Component's wrapper CSS classes.

    @property jsonTreeClass
    @type String
  */
  jsonTreeClass: '',

  /**
    Flag: indicates whether only one tree node can be expanded at the same time.
    If true, all expanded tree nodes will be automatically collapsed, on some other node expand.

    @property jsonTreeExclusive
    @type Boolean
    @default false
  */
  jsonTreeExclusive: false,

  /**
    Flag: indicates whether it is allowed for already expanded tree nodes to collapse.

    @property jsonTreeCollapsible
    @type Boolean
    @default true
  */
  jsonTreeCollapsible: true,

  /**
    Flag: indicates whether nested child nodes content opacity should be animated
    (if true, it may cause performance issues with many nested child nodes).

    @property jsonTreeAnimateChildren
    @type Boolean
    @default false
  */
  jsonTreeAnimateChildren: false,

  /**
    Tree nodes expand/collapse animation duration in milliseconds.

    @property jsonTreeDuration
    @type Number
    @default 350
  */
  jsonTreeDuration: 350,

  init() {
    let store = this.get('_store');
    Ember.assert('Store is not defined.', store);
    let modelType = 'new-platform-flexberry-g-i-s-map-layer';
    let resultArray = Ember.A([
      store.createRecord(modelType, {
        name: 'jsonLayer1',
        type: 'wms',
        visibility: 'true',
        settings: '{"url":"http://172.17.1.15:8080/geoserver/ows", ' +
                  '"layers":"osm_perm_region:perm_water_line", ' +
                  '"format":"image/png", ' +
                  '"transparent":"true", ' +
                  '"version":"1.3.0"}',
        coordinateReferenceSystem: null,
        layers: Ember.A([
          store.createRecord(modelType, {
            name: 'jsonLayer1.1',
            type: 'tile',
            visibility: true,
            settings: '{"url": "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}',
            coordinateReferenceSystem: null,
            layers: Ember.A([
              store.createRecord(modelType, {
                name: 'jsonLayer1.1.1',
                type: 'wms',
                visibility: true,
                settings: '{"url":"http://172.17.1.15:8080/geoserver/ows",' +
                          '"layers":"osm_perm_region:perm_points_of_interest",' +
                          '"format":"image/png",' +
                          '"transparent":"true",' +
                          '"version":"1.3.0"}',
                coordinateReferenceSystem: null,
                layers: null
              })
            ])
          }),
          store.createRecord(modelType, {
            name: 'jsonLayer1.2',
            type: 'wms',
            visibility: false,
            settings: '{"url":"http://172.17.1.15:8080/geoserver/ows",' +
                      '"layers":"osm_perm_region:water_polygon_all",' +
                      '"format":"image/png",' +
                      '"transparent":"true",' +
                      '"version":"1.3.0"}',
            coordinateReferenceSystem: null,
            layers: null
          })
        ])
      })
    ]);

    this.set('jsonLayersTreeNodes', resultArray);
  },

  /**
    Tree nodes hierarchy with nodes settings.

    @property jsonTreeNodes
    @type TreeNodeObject[]
  */
  jsonLayersTreeNodes: null,

  /**
    Component's template text.

    @property jsonTreeComponentTemplateText
    @type String
  */
  jsonTreeComponentTemplateText: new Ember.Handlebars.SafeString(
    '{{flexberry-layerstree<br>' +
    ' class=jsonTreeClass<br>' +
    ' exclusive=jsonTreeExclusive<br>' +
    ' collapsible=jsonTreeCollapsible<br>' +
    ' animateChildren=jsonTreeAnimateChildren<br>' +
    ' duration=jsonTreeDuration<br>' +
    ' layers=(get-with-dynamic-actions this "jsonLayersTreeNodes"<br>' +
    '   hierarchyPropertyName="layers"<br>' +
    '   dynamicActions=(array<br>' +
    '     (hash<br>' +
    '       on="visibilityChange"<br>' +
    '       actionName="onTreenodeVisibilityChange"<br>' +
    '       actionArguments=(array "{% propertyPath %}.visibility")<br>' +
    '     )<br>' +
    '     (hash<br>' +
    '       on="headerClick"<br>' +
    '       actionName="onTreenodeHeaderClick"<br>' +
    '       actionArguments=(array "{% propertyPath %}")<br>' +
    '     )<br>' +
    '   )<br>' +
    ' )<br>' +
    '}}'),

  /**
    Component settings metadata.
    @property jsonTreeComponentSettingsMetadata
    @type Object[]
  */
  jsonTreeComponentSettingsMetadata: Ember.computed(function() {
    let componentSettingsMetadata = Ember.A();

    componentSettingsMetadata.pushObject({
      settingName: 'class',
      settingType: 'css',
      settingDefaultValue: '',
      settingAvailableItems: ['styled', 'fluid'],
      bindedControllerPropertieName: 'jsonTreeClass'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'exclusive',
      settingType: 'boolean',
      settingDefaultValue: false,
      bindedControllerPropertieName: 'jsonTreeExclusive'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'collapsible',
      settingType: 'boolean',
      settingDefaultValue: true,
      bindedControllerPropertieName: 'jsonTreeCollapsible'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'animateChildren',
      settingType: 'boolean',
      settingDefaultValue: false,
      bindedControllerPropertieName: 'jsonTreeAnimateChildren'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'duration',
      settingType: 'number',
      settingDefaultValue: 350,
      bindedControllerPropertieName: 'jsonTreeDuration'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'layers',
      settingType: 'object',
      settingDefaultValue: null,
      bindedControllerPropertieName: 'jsonLayersTreeNodes'
    });

    return componentSettingsMetadata;
  }),

  /**
    Path to controller's property representing latest clicked tree node.

    @property jsonTreeLatestClickedNodePath
    @type String
    @default null
  */
  jsonTreeLatestClickedNodePath: null,

  /**
    Component settings metadata for latest clicked tree node.

    @property jsonTreeLatestClickedNodeComponentSettingsMetadata
    @type Object[]
  */
  jsonTreeLatestClickedNodeComponentSettingsMetadata: Ember.computed('jsonTreeLatestClickedNodePath', function() {
    let jsonTreeLatestClickedNodePath = this.get('jsonTreeLatestClickedNodePath');
    let componentSettingsMetadata = Ember.A();

    if (Ember.isBlank(jsonTreeLatestClickedNodePath)) {
      return componentSettingsMetadata;
    }

    componentSettingsMetadata.pushObject({
      settingName: 'name',
      settingType: 'string',
      settingDefaultValue: undefined,
      bindedControllerPropertieName: jsonTreeLatestClickedNodePath + '.name'
    });

    componentSettingsMetadata.pushObject({
      settingName: 'type',
      settingType: 'string',
      settingDefaultValue: undefined,
      bindedControllerPropertieName: jsonTreeLatestClickedNodePath + '.type'
    });

    componentSettingsMetadata.pushObject({
      settingName: 'visibility',
      settingType: 'boolean',
      settingDefaultValue: undefined,
      bindedControllerPropertieName: jsonTreeLatestClickedNodePath + '.visibility'
    });

    componentSettingsMetadata.pushObject({
      settingName: 'settings',
      settingType: 'string',
      settingDefaultValue: undefined,
      bindedControllerPropertieName: jsonTreeLatestClickedNodePath + '.settings'
    });

    componentSettingsMetadata.pushObject({
      settingName: 'coordinateReferenceSystem',
      settingType: 'string',
      settingDefaultValue: undefined,
      bindedControllerPropertieName: jsonTreeLatestClickedNodePath + '.coordinateReferenceSystem'
    });

    return componentSettingsMetadata;
  }),

  actions: {
    /**
      Handles tree nodes 'headerClick' action.

      @method actions.onTreenodeHeaderClick
      @param {String} clickedNodePropertiesPath Path to controller's property representing clicked tree node.
      @param {Object} e Action's event object
      @param {Object} e.originalEvent [jQuery event object](http://api.jquery.com/category/events/event-object/)
      which describes event that triggers this action.
    */
    onTreenodeHeaderClick(...args) {
      let actionEventObject = args[args.length - 1];
      let clickedNodePropertiesPath = args[0];
      let clickedNodeSettingsPrefix = Ember.$(actionEventObject.originalEvent.currentTarget)
        .closest('.tab.segment')
        .attr('data-tab');

      // Remember latest clicked node path to a tree-related controller's property.
      this.set(clickedNodeSettingsPrefix + 'LatestClickedNodePath', clickedNodePropertiesPath);
    }
  }
});
