import Ember from 'ember';
import FlexberryDdauCheckboxActionsHandlerMixin from 'ember-flexberry-gis/mixins/flexberry-ddau-checkbox-actions-handler';

export default Ember.Controller.extend(FlexberryDdauCheckboxActionsHandlerMixin, {
  /**
    Component's wrapper CSS-classes.
    @property class
    @type String
  */
  class: '',

  /**
    Text for 'flexberry-button' 'caption' property.

    @property caption
    @type String
    @default null
  */
  caption: null,

  /**
    Flag: indicates whether 'flexberry-button' component is in 'readonly' mode or not.
    @property readonly
    @type Boolean
   */
  readonly: false,

  /**
    Template text for 'flexberry-button' component.
    @property componentTemplateText
    @type String
   */
  componentTemplateText: new Ember.Handlebars.SafeString(
    '{{flexberry-button<br>' +
    '  class=class<br>' +
    '  caption=caption<br>' +
    '  readonly=readonly<br>' +
    '  change=(action \"onButtonClick\")<br>' +
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
      settingType: 'css',
      settingDefaultValue: '',
      settingAvailableItems: [
        'circular',
        'fluid',
        'loading',
        'red',
        'green',
        'blue',
        'top attached',
        'bottom attached',
        'left attached',
        'right attached'
      ],
      bindedControllerPropertieName: 'class'
    });
    componentSettingsMetadata.pushObject({
      settingName: 'caption',
      settingType: 'string',
      settingDefaultValue: null,
      bindedControllerPropertieName: 'caption'
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
    onButtonCLick(e) {
      console.log('Button clicked. Click event-object: ', e);
    }
  }
});
