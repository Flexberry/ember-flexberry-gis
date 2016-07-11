import Ember from 'ember';

export default Ember.Controller.extend({
  /**
    Component's wrapper CSS classes.
    @property class
    @type String
  */
  class: '',

  /**
    Flag: indicates whether only one tree node can be expanded at the same time.
    If true, all expanded tree nodes will be automatically collapsed, on some other node expand.

    @property exclusive
    @type Boolean
    @default false
  */
  exclusive: false,

  /**
    Flag: indicates whether it is allowed for already expanded tree nodes to collapse.

    @property collapsible
    @type Boolean
    @default true
  */
  collapsible: true,

  /**
    Flag: indicates whether nested child nodes content opacity should be animated
    (if true, it may cause performance issues with many nested child nodes).

    @property animateChildren
    @type Boolean
    @default false
  */
  animateChildren: false,

  /**
    Tree nodes expand/collapse animation duration in milliseconds.

    @property animationDuration
    @type Number
    @default 350
  */
  duration: 350,

  /**
    Template text for 'flexberry-ddau-treenode' component.

    @property componentTemplateText
    @type String
  */
  componentTemplateText: new Ember.Handlebars.SafeString(
    '{{#flexberry-tree<br>' +
    '  class=class<br>' +
    '  exclusive=exclusive<br>' +
    '  collapsible=collapsible<br>' +
    '  animateChildren=animateChildren<br>' +
    '  duration=duration<br>' +
    '}}<br>' +
    '  ...<br>' +
    '{{/flexberry-tree}}'),

  /**
    Component settings metadata.
    @property componentSettingsMetadata
    @type Object[]
  */
  componentSettingsMetadata: Ember.computed('i18n.locale', function() {
    let componentSettingsMetadata = Ember.A();

    componentSettingsMetadata.pushObject({
      settingName: 'class',
      settingType: 'css',
      settingDefaultValue: '',
      settingAvailableItems: ['styled', 'fluid'],
      bindedControllerPropertieName: 'class'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'exclusive',
      settingType: 'boolean',
      settingDefaultValue: false,
      bindedControllerPropertieName: 'exclusive'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'collapsible',
      settingType: 'boolean',
      settingDefaultValue: true,
      bindedControllerPropertieName: 'collapsible'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'animateChildren',
      settingType: 'boolean',
      settingDefaultValue: false,
      bindedControllerPropertieName: 'animateChildren'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'duration',
      settingType: 'number',
      settingDefaultValue: 350,
      bindedControllerPropertieName: 'duration'
    });

    return componentSettingsMetadata;
  }),

  actions: {
    onCheckboxChange(e) {
      console.log('onCheckboxChange', e);
    },

    onCheckboxCheck(e) {
      console.log('onCheckboxCheck', e);
    },

    onCheckboxUncheck(e) {
      console.log('onCheckboxUncheck', e);
    },

    onBeforeExpand(e) {
      console.log('onBeforeExpand', e);
    },

    onBeforeCollapse(e) {
      console.log('onBeforeCollapse', e);
    }
  }
});
