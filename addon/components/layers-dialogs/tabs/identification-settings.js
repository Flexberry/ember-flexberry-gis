import Ember from 'ember';
import layout from '../../../templates/components/layers-dialogs/tabs/identification-settings';

/**
  Component for identification settings tab in layer settings.

  @class FlexberryIdentificationSettingsComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({

  /**
    Reference to component's template.
  */
  layout,

  /**
    Message locale key.

    @property label
    @type String
    @default 'components.layers-dialogs.settings.group.tab.identification-settings'
  */
  label: 'components.layers-dialogs.settings.group.tab.identification-settings',

  /**
    Style class for checkbox component.

    @property checkboxClass
    @type String
    @default 'toggle'
  */
  checkboxClass: 'toggle',

  /**
    Current object with canBeIdentified property.

    @property value
    @type Object
    @default undefined
  */
  value: undefined,

  /**
    Current checkbox value.

    @property _checkboxValue
    @type Boolean
    @default undefined
    @private
  */
  _checkboxValue: undefined,

  /**
    Modifies `value` when `_checkboxValue` changes.

    @method _checkboxDidChange
  */
  _checkboxDidChange: Ember.observer('_checkboxValue', function() {
    let obj = {
      canBeIdentified: this.get('_checkboxValue')
    };
    this.set('value', obj);
  }),

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    let value = this.get('value');
    this.set('_checkboxValue', value.canBeIdentified);
  }
});
