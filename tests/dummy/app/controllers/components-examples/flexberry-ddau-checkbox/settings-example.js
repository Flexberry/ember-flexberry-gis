import Ember from 'ember';

export default Ember.Controller.extend({
  /**
    Flag: indicates whether 'flexberry-ddau-checkbox' component is in 'readonly' mode or not.
    @property readonly
    @type Boolean
   */
  readonly: false,

  /**
    Component's wrapper CSS classes.
    @property class
    @type String
  */
  class: '',

  /**
    Template text for 'flexberry-ddau-checkbox' component.
    @property componentTemplateText
    @type String
   */
  componentTemplateText: new Ember.Handlebars.SafeString(
    '{{flexberry-ddau-checkbox<br>' +
    '  value=model.flag<br>' +
    '  readonly=readonly<br>' +
    '  class=class<br>' +
    '}}'),

  /**
    Component settings metadata.
    @property componentSettingsMetadata
    @type Object[]
   */
  componentSettingsMetadata: Ember.computed('i18n.locale', function() {
    var componentSettingsMetadata = Ember.A();
    componentSettingsMetadata.pushObject({
      settingName: 'value',
      settingType: 'boolean',
      settingDefaultValue: undefined,
      bindedControllerPropertieName: 'model.flag'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'readonly',
      settingType: 'boolean',
      settingDefaultValue: false,
      bindedControllerPropertieName: 'readonly'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'class',
      settingType: 'css',
      settingDefaultValue: '',
      settingAvailableItems: ['radio', 'slider', 'toggle'],
      bindedControllerPropertieName: 'class'
    });

    return componentSettingsMetadata;
  }),

  actions: {
  }
});
