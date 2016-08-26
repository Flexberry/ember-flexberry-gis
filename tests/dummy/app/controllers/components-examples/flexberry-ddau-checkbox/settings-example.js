import Ember from 'ember';
import FlexberryDdauCheckboxActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-ddau-checkbox-actions-handler';

export default Ember.Controller.extend(FlexberryDdauCheckboxActionsHandlerMixin, {
  /**
    Component's wrapper CSS classes.
    @property class
    @type String
  */
  class: '',

  /**
    Text for 'flexberry-ddau-checkbox' 'caption' property.

    @property caption
    @type String
    @default null
  */
  label: null,

  /**
    Flag: indicates whether 'flexberry-ddau-checkbox' component is in 'readonly' mode or not.
    @property readonly
    @type Boolean
   */
  readonly: false,

  /**
    Template text for 'flexberry-ddau-checkbox' component.
    @property componentTemplateText
    @type String
   */
  componentTemplateText: new Ember.Handlebars.SafeString(
    '{{flexberry-ddau-checkbox<br>' +
    '  class=class<br>' +
    '  value=model.flag<br>' +
    '  caption=caption<br>' +
    '  readonly=readonly<br>' +
    '  change=(action \"onCheckboxChange\" \"model.flag\")<br>' +
    '}}'),

  /**
    Component settings metadata.
    @property componentSettingsMetadata
    @type Object[]
   */
  componentSettingsMetadata: Ember.computed('i18n.locale', function() {
    let componentSettingsMetadata = Ember.A();

    componentSettingsMetadata.pushObject({
      settingName: 'class',
      settingType: 'enumeration',
      settingAvailableItems: [
        'radio',
        'slider',
        'toggle'
      ],
      settingDefaultValue: '',
      bindedControllerPropertieName: 'class'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'value',
      settingType: 'boolean',
      settingDefaultValue: undefined,
      bindedControllerPropertieName: 'model.flag'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'label',
      settingType: 'string',
      settingDefaultValue: null,
      bindedControllerPropertieName: 'label'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'readonly',
      settingType: 'boolean',
      settingDefaultValue: false,
      bindedControllerPropertieName: 'readonly'
    });

    return componentSettingsMetadata;
  }),

  actions: {
    onChange(e) {
      console.log('onChange: ', e);
    }
  }
});
