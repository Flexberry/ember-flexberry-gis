import Ember from 'ember';
import FlexberryTreenodeActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-treenode-actions-handler';
import TreeNodeObject from 'ember-flexberry-gis/objects/tree-node';

export default Ember.Controller.extend(FlexberryTreenodeActionsHandlerMixin, {
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
    caption: 'Node 1 (with child nodes)',
    nodes: [{
      caption: 'Node 1.1 (leaf node)',
      nodes: null
    }, {
      caption: 'Node 1.2 (with child nodes)',
      nodes: [{
        caption: 'Node 1.2.1 (with child nodes)',
        nodes: [{
          caption: 'Node 1.2.1.1 (leaf node)',
          nodes: null
        }]
      }, {
        caption: 'Node 1.2.2 (leaf node)',
        nodes: null
      }]
    }]
  }, {
    caption: 'Node 2 (leaf node)',
    nodes: null
  }, {
    caption: 'Node 3 (with child nodes)',
    nodes: [{
      caption: 'Node 3.1 (leaf node)',
      nodes: null
    }]
  }],

  /**
    Component's template text.

    @property hbsTreeComponentTemplateText
    @type String
  */
  hbsTreeComponentTemplateText: new Ember.Handlebars.SafeString(
    '{{#flexberry-tree<br>' +
    '  class=hbsTreeClass<br>' +
    '  exclusive=hbsTreeExclusive<br>' +
    '  collapsible=hbsTreeCollapsible<br>' +
    '  animateChildren=hbsTreeAnimateChildren<br>' +
    '  duration=hbsTreeDuration<br>' +
    '}}<br>' +
    '  {{#flexberry-treenode<br>' +
    '    caption=hbsTreeNodes.0.caption<br>' +
    '    headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.0")<br>' +
    '  }}<br>' +
    '    {{#flexberry-tree}}<br>' +
    '      {{flexberry-treenode<br>' +
    '        caption=hbsTreeNodes.0.nodes.0.caption<br>' +
    '        headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.0.nodes.0")<br>' +
    '      }}<br>' +
    '      {{#flexberry-treenode<br>' +
    '        caption=hbsTreeNodes.0.nodes.1.caption<br>' +
    '        headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.0.nodes.1")<br>' +
    '      }}<br>' +
    '        {{#flexberry-tree}}<br>' +
    '          {{#flexberry-treenode<br>' +
    '            caption=hbsTreeNodes.0.nodes.1.nodes.0.caption<br>' +
    '            headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.0.nodes.1.nodes.0")<br>' +
    '          }}<br>' +
    '            {{#flexberry-tree}}<br>' +
    '              {{flexberry-treenode<br>' +
    '                caption=hbsTreeNodes.0.nodes.1.nodes.0.nodes.0.caption<br>' +
    '                headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.0.nodes.1.nodes.0.nodes.0")<br>' +
    '              }}<br>' +
    '            {{/flexberry-tree}}<br>' +
    '          {{/flexberry-treenode}}<br>' +
    '          {{flexberry-treenode<br>' +
    '            caption=hbsTreeNodes.0.nodes.1.nodes.1.caption<br>' +
    '            headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.0.nodes.1.nodes.1")<br>' +
    '          }}<br>' +
    '        {{/flexberry-tree}}<br>' +
    '      {{/flexberry-treenode}}<br>' +
    '    {{/flexberry-tree}}<br>' +
    '  {{/flexberry-treenode}}<br>' +
    '  {{flexberry-treenode<br>' +
    '    caption=hbsTreeNodes.1.caption<br>' +
    '    headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.1")<br>' +
    '  }}<br>' +
    '  {{#flexberry-treenode<br>' +
    '    caption=hbsTreeNodes.2.caption<br>' +
    '    headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.2")<br>' +
    '  }}<br>' +
    '    {{#flexberry-tree}}<br>' +
    '      {{flexberry-treenode<br>' +
    '        caption=hbsTreeNodes.2.nodes.0.caption<br>' +
    '        headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.2.nodes.0")<br>' +
    '      }}<br>' +
    '    {{/flexberry-tree}}<br>' +
    '  {{/flexberry-treenode}}<br>' +
    '{{/flexberry-tree}}'),

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
      settingName: 'caption',
      settingType: 'string',
      settingDefaultValue: null,
      bindedControllerPropertieName: hbsTreeLatestClickedNodePath + '.caption'
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

  /**
    Tree nodes hierarchy with nodes settings.

    @property jsonTreeNodes
    @type TreeNodeObject[]
  */
  jsonTreeNodes: Ember.A([
    TreeNodeObject.create({
      caption: 'Node 1 (with child nodes)',
      nodes: Ember.A([
        TreeNodeObject.create({
          caption: 'Node 1.1 (leaf node)',
          nodes: null
        }),
        TreeNodeObject.create({
          caption: 'Node 1.2 (with child nodes)',
          nodes: Ember.A([
            TreeNodeObject.create({
              caption: 'Node 1.2.1 (with child nodes)',
              nodes: Ember.A([
                TreeNodeObject.create({
                  caption: 'Node 1.2.1.1 (leaf node)',
                  nodes: null
                })
              ])
            }),
            TreeNodeObject.create({
              caption: 'Node 1.2.2 (leaf node)',
              nodes: null
            })
          ])
        }),
      ])
    }),
    TreeNodeObject.create({
      caption: 'Node 2 (leaf node)',
      nodes: null
    }),
    TreeNodeObject.create({
      caption: 'Node 3 (with child nodes)',
      nodes: Ember.A([
        TreeNodeObject.create({
          caption: 'Node 3.1 (leaf node)',
          nodes: null
        })
      ])
    })
  ]),

  /**
    Component's template text.

    @property jsonTreeComponentTemplateText
    @type String
  */
  jsonTreeComponentTemplateText: new Ember.Handlebars.SafeString(
    '{{flexberry-tree<br>' +
    '  class=jsonTreeClass<br>' +
    '  exclusive=jsonTreeExclusive<br>' +
    '  collapsible=jsonTreeCollapsible<br>' +
    '  animateChildren=jsonTreeAnimateChildren<br>' +
    '  duration=jsonTreeDuration<br>' +
    '  nodes=(get-with-dynamic-actions this "jsonTreeNodes"<br>' +
    '    hierarchyPropertyName="nodes"<br>' +
    '    dynamicActions=(array<br>' +
    '      (hash<br>' +
    '        on="headerClick"<br>' +
    '        actionName="onTreenodeHeaderClick"<br>' +
    '        actionArguments=(array "{% propertyPath %}")<br>' +
    '      )<br>' +
    '    )<br>' +
    '  )<br>' +
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
      settingName: 'nodes',
      settingType: 'object',
      settingDefaultValue: null,
      bindedControllerPropertieName: 'jsonTreeNodes'
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
      settingName: 'caption',
      settingType: 'string',
      settingDefaultValue: null,
      bindedControllerPropertieName: jsonTreeLatestClickedNodePath + '.caption'
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
    },

    onMyButtonClick() {
      window.alert('My button clicked');
    }
  }
});
