import Ember from 'ember';
import layout from '../../../templates/components/layers-dialogs/tabs/main-settings';
import {
  translationMacro as t
} from 'ember-i18n';

export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Dialog's 'type' dropdown caption.

    @property typeDropdownCaption
    @type String
    @default t('components.layers-dialogs.edit.type-dropdown.caption')
  */
  typeDropdownCaption: t('components.layers-dialogs.edit.type-dropdown.caption'),

  /**
    Dialog's 'name' textbox caption.

    @property nameTextboxCaption
    @type String
    @default t('components.layers-dialogs.edit.name-textbox.caption')
  */
  nameTextboxCaption: t('components.layers-dialogs.edit.name-textbox.caption'),

  /**
    Dialog's 'description' textbox caption.

    @property descriptionTextboxCaption
    @type String
    @default t('components.layers-dialogs.edit.description-textbox.caption')
  */
  descriptionTextboxCaption: t('components.layers-dialogs.edit.description-textbox.caption'),

  /**
    Dialog's 'keyWords' textbox caption.

    @property keyWordsTextboxCaption
    @type String
    @default t('components.layers-dialogs.edit.keywords-textbox.caption')
  */
  keyWordsTextboxCaption: t('components.layers-dialogs.edit.keywords-textbox.caption'),

  /**
    Dialog's 'scale' textbox caption.

    @property scaleTextboxCaption
    @type String
    @default t('components.layers-dialogs.edit.name-textbox.caption')
  */
  scaleTextboxCaption: t('components.layers-dialogs.edit.scale-textbox.caption'),

  /**
    Array of posible scale values.

    @property scales
    @type Array
    @default [500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000, 2500000, 5000000, 10000000]
  */
  scales: Ember.A([500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000, 500000, 1000000, 2500000, 5000000, 10000000]),

  /**
    Flag: indicates whether scale settings are available for the selected layer type.

    @property _scaleSettingsAreAvailableForType
    @type Boolean
    @private
    @readonly
  */
  _scaleSettingsAreAvailableForType: Ember.computed('_layer.type', function () {
    let className = this.get('_layer.type');

    return Ember.getOwner(this).isKnownNameForType('layer', className) && className !== 'group';
  }),

  actions: {
    /**
      Handles scale input keyDown action.

      @method actions.scaleInputKeyDown
    */
    scaleInputKeyDown(e) {
      let key = e.which;

      // Allow only numbers, backspace, arrows, etc.
      return (key === 8 || key === 9 || key === 46 || (key >= 37 && key <= 40) ||
        (key >= 48 && key <= 57) || (key >= 96 && key <= 105));
    }
  }
});
