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
    hasCheckbox: true,
    checkboxValue: false,
    iconClass: 'marker icon',
    nodes: [{
      caption: 'Node 1.1 (leaf node)',
      hasCheckbox: true,
      checkboxValue: false,
      iconClass: 'compass icon',
      nodes: null
    }, {
      caption: 'Node 1.2 (with child nodes)',
      hasCheckbox: true,
      checkboxValue: false,
      iconClass: 'location arrow icon',
      nodes: [{
        caption: 'Node 1.2.1 (with child nodes)',
        hasCheckbox: true,
        checkboxValue: false,
        iconClass: 'area chart icon',
        nodes: [{
          caption: 'Node 1.2.1.1 (leaf node)',
          hasCheckbox: true,
          checkboxValue: false,
          iconClass: 'envira gallery icon',
          nodes: null
        }]
      }, {
        caption: 'Node 1.2.2 (leaf node)',
        hasCheckbox: true,
        checkboxValue: false,
        iconClass: 'marker icon',
        nodes: null
      }]
    }]
  }, {
    caption: 'Node 2 (leaf node)',
    hasCheckbox: true,
    checkboxValue: false,
    iconClass: 'compass icon',
    nodes: null
  }, {
    caption: 'Node 3 (with child nodes)',
    hasCheckbox: true,
    checkboxValue: false,
    iconClass: 'location arrow icon',
    nodes: [{
      caption: 'Node 3.1 (leaf node)',
      hasCheckbox: true,
      checkboxValue: false,
      iconClass: 'area chart icon',
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
    '    hasCheckbox=hbsTreeNodes.0.hasCheckbox<br>' +
    '    checkboxValue=hbsTreeNodes.0.checkboxValue<br>' +
    '    iconClass=hbsTreeNodes.0.iconClass<br>' +
    '    headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.0")<br>' +
    '    checkboxChange=(action "onTreenodeCheckboxChange" "hbsTreeNodes.0.checkboxValue")<br>' +
    '  }}<br>' +
    '    {{#flexberry-tree}}<br>' +
    '      {{flexberry-treenode<br>' +
    '        caption=hbsTreeNodes.0.nodes.0.caption<br>' +
    '        hasCheckbox=hbsTreeNodes.0.nodes.0.hasCheckbox<br>' +
    '        checkboxValue=hbsTreeNodes.0.nodes.0.checkboxValue<br>' +
    '        iconClass=hbsTreeNodes.0.nodes.0.iconClass<br>' +
    '        headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.0.nodes.0")<br>' +
    '        checkboxChange=(action "onTreenodeCheckboxChange" "hbsTreeNodes.0.nodes.0.checkboxValue")<br>' +
    '      }}<br>' +
    '      {{#flexberry-treenode<br>' +
    '        caption=hbsTreeNodes.0.nodes.1.caption<br>' +
    '        hasCheckbox=hbsTreeNodes.0.nodes.1.hasCheckbox<br>' +
    '        checkboxValue=hbsTreeNodes.0.nodes.1.checkboxValue<br>' +
    '        iconClass=hbsTreeNodes.0.nodes.1.iconClass<br>' +
    '        headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.0.nodes.1")<br>' +
    '        checkboxChange=(action "onTreenodeCheckboxChange" "hbsTreeNodes.0.nodes.1.checkboxValue")<br>' +
    '      }}<br>' +
    '        {{#flexberry-tree}}<br>' +
    '          {{#flexberry-treenode<br>' +
    '            caption=hbsTreeNodes.0.nodes.1.nodes.0.caption<br>' +
    '            hasCheckbox=hbsTreeNodes.0.nodes.1.nodes.0.hasCheckbox<br>' +
    '            checkboxValue=hbsTreeNodes.0.nodes.1.nodes.0.checkboxValue<br>' +
    '            iconClass=hbsTreeNodes.0.nodes.1.nodes.0.iconClass<br>' +
    '            headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.0.nodes.1.nodes.0")<br>' +
    '            checkboxChange=(action "onTreenodeCheckboxChange" "hbsTreeNodes.0.nodes.1.nodes.0.checkboxValue")<br>' +
    '          }}<br>' +
    '            {{#flexberry-tree}}<br>' +
    '              {{flexberry-treenode<br>' +
    '                caption=hbsTreeNodes.0.nodes.1.nodes.0.nodes.0.caption<br>' +
    '                hasCheckbox=hbsTreeNodes.0.nodes.1.nodes.0.nodes.0.hasCheckbox<br>' +
    '                checkboxValue=hbsTreeNodes.0.nodes.1.nodes.0.nodes.0.checkboxValue<br>' +
    '                iconClass=hbsTreeNodes.0.nodes.1.nodes.0.nodes.0.iconClass<br>' +
    '                headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.0.nodes.1.nodes.0.nodes.0")<br>' +
    '                checkboxChange=(action "onTreenodeCheckboxChange" "hbsTreeNodes.0.nodes.1.nodes.0.nodes.0.checkboxValue")<br>' +
    '              }}<br>' +
    '            {{/flexberry-tree}}<br>' +
    '          {{/flexberry-treenode}}<br>' +
    '          {{flexberry-treenode<br>' +
    '            caption=hbsTreeNodes.0.nodes.1.nodes.1.caption<br>' +
    '            hasCheckbox=hbsTreeNodes.0.nodes.1.nodes.1.hasCheckbox<br>' +
    '            checkboxValue=hbsTreeNodes.0.nodes.1.nodes.1.checkboxValue<br>' +
    '            iconClass=hbsTreeNodes.0.nodes.1.nodes.1.iconClass<br>' +
    '            headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.0.nodes.1.nodes.1")<br>' +
    '            checkboxChange=(action "onTreenodeCheckboxChange" "hbsTreeNodes.0.nodes.1.nodes.1.checkboxValue")<br>' +
    '          }}<br>' +
    '        {{/flexberry-tree}}<br>' +
    '      {{/flexberry-treenode}}<br>' +
    '    {{/flexberry-tree}}<br>' +
    '  {{/flexberry-treenode}}<br>' +
    '  {{flexberry-treenode<br>' +
    '    caption=hbsTreeNodes.1.caption<br>' +
    '    hasCheckbox=hbsTreeNodes.1.hasCheckbox<br>' +
    '    checkboxValue=hbsTreeNodes.1.checkboxValue<br>' +
    '    iconClass=hbsTreeNodes.1.iconClass<br>' +
    '    headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.1")<br>' +
    '    checkboxChange=(action "onTreenodeCheckboxChange" "hbsTreeNodes.1.checkboxValue")<br>' +
    '  }}<br>' +
    '  {{#flexberry-treenode<br>' +
    '    caption=hbsTreeNodes.2.caption<br>' +
    '    hasCheckbox=hbsTreeNodes.2.hasCheckbox<br>' +
    '    checkboxValue=hbsTreeNodes.2.checkboxValue<br>' +
    '    iconClass=hbsTreeNodes.2.iconClass<br>' +
    '    headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.2")<br>' +
    '    checkboxChange=(action "onTreenodeCheckboxChange" "hbsTreeNodes.2.checkboxValue")<br>' +
    '  }}<br>' +
    '    {{#flexberry-tree}}<br>' +
    '      {{flexberry-treenode<br>' +
    '        caption=hbsTreeNodes.2.nodes.0.caption<br>' +
    '        hasCheckbox=hbsTreeNodes.2.nodes.0.hasCheckbox<br>' +
    '        checkboxValue=hbsTreeNodes.2.nodes.0.checkboxValue<br>' +
    '        iconClass=hbsTreeNodes.2.nodes.0.iconClass<br>' +
    '        headerClick=(action "onTreenodeHeaderClick" "hbsTreeNodes.2.nodes.0")<br>' +
    '        checkboxChange=(action "onTreenodeCheckboxChange" "hbsTreeNodes.2.nodes.0.checkboxValue")<br>' +
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
    componentSettingsMetadata.pushObject({
      settingName: 'hasCheckbox',
      settingType: 'boolean',
      settingDefaultValue: false,
      bindedControllerPropertieName: hbsTreeLatestClickedNodePath + '.hasCheckbox'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'checkboxValue',
      settingType: 'boolean',
      settingDefaultValue: false,
      bindedControllerPropertieName: hbsTreeLatestClickedNodePath + '.checkboxValue'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'iconClass',
      settingType: 'enumeration',
      settingAvailableItems: [
        'marker icon',
        'compass icon',
        'location arrow icon',
        'area chart icon',
        'envira gallery icon',
        'small marker icon',
        'small compass icon',
        'small location arrow icon',
        'small area chart icon',
        'small envira gallery icon',
        'big marker icon',
        'big compass icon',
        'big location arrow icon',
        'big area chart icon',
        'big envira gallery icon'
      ],
      settingDefaultValue: '',
      bindedControllerPropertieName: hbsTreeLatestClickedNodePath + '.iconClass'
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
      hasCheckbox: true,
      checkboxValue: false,
      iconClass: 'marker icon',
      nodes: Ember.A([
        TreeNodeObject.create({
          caption: 'Node 1.1 (leaf node)',
          hasCheckbox: true,
          checkboxValue: false,
          iconClass: 'compass icon',
          nodes: null
        }),
        TreeNodeObject.create({
          caption: 'Node 1.2 (with child nodes)',
          hasCheckbox: true,
          checkboxValue: false,
          iconClass: 'location arrow icon',
          nodes: Ember.A([
            TreeNodeObject.create({
              caption: 'Node 1.2.1 (with child nodes)',
              hasCheckbox: true,
              checkboxValue: false,
              iconClass: 'area chart icon',
              nodes: Ember.A([
                TreeNodeObject.create({
                  caption: 'Node 1.2.1.1 (leaf node)',
                  hasCheckbox: true,
                  checkboxValue: false,
                  iconClass: 'envira gallery icon',
                  nodes: null
                })
              ])
            }),
            TreeNodeObject.create({
              caption: 'Node 1.2.2 (leaf node)',
              hasCheckbox: true,
              checkboxValue: false,
              iconClass: 'marker icon',
              nodes: null
            })
          ])
        }),
      ])
    }),
    TreeNodeObject.create({
      caption: 'Node 2 (leaf node)',
      hasCheckbox: true,
      checkboxValue: false,
      iconClass: 'compass icon',
      nodes: null
    }),
    TreeNodeObject.create({
      caption: 'Node 3 (with child nodes)',
      hasCheckbox: true,
      checkboxValue: false,
      iconClass: 'location arrow icon',
      nodes: Ember.A([
        TreeNodeObject.create({
          caption: 'Node 3.1 (leaf node)',
          hasCheckbox: true,
          checkboxValue: false,
          iconClass: 'area chart icon',
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
    '        on="checkboxChange"<br>' +
    '        actionName="onTreenodeCheckboxChange"<br>' +
    '        actionArguments=(array "{% propertyPath %}.checkboxValue")<br>' +
    '      )<br>' +
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
    componentSettingsMetadata.pushObject({
      settingName: 'hasCheckbox',
      settingType: 'boolean',
      settingDefaultValue: false,
      bindedControllerPropertieName: jsonTreeLatestClickedNodePath + '.hasCheckbox'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'checkboxValue',
      settingType: 'boolean',
      settingDefaultValue: false,
      bindedControllerPropertieName: jsonTreeLatestClickedNodePath + '.checkboxValue'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'iconClass',
      settingType: 'enumeration',
      settingAvailableItems: [
        'marker icon',
        'compass icon',
        'location arrow icon',
        'area chart icon',
        'envira gallery icon',
        'small marker icon',
        'small compass icon',
        'small location arrow icon',
        'small area chart icon',
        'small envira gallery icon',
        'big marker icon',
        'big compass icon',
        'big location arrow icon',
        'big area chart icon',
        'big envira gallery icon'
      ],
      settingDefaultValue: '',
      bindedControllerPropertieName: jsonTreeLatestClickedNodePath + '.iconClass'
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
