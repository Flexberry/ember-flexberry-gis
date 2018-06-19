import Ember from 'ember';
import layout from '../../../templates/components/layers-dialogs/tabs/prototyping-modes';
import RequiredActionsMixin from 'ember-flexberry/mixins/required-actions';
import DynamicActionsMixin from 'ember-flexberry/mixins/dynamic-actions';
import DynamicPropertiesMixin from '../../../mixins/dynamic-properties';

export default Ember.Component.extend(
  RequiredActionsMixin,
  DynamicActionsMixin,
  DynamicPropertiesMixin, {
  /**
    Reference to component's template.
  */
  layout,

  /**
    Available modes captions.

    @property _availableModesCaptions
    @type String[]
    @readonly
  */
  _availableModesCaptions: Ember.computed('availableModes', 'i18n.locale', function () {
    let availableModes = this.get('availableModes');
    let modes = Ember.A();
    if (Ember.isArray(availableModes) && availableModes.length !== 0) {
      let i18n = this.get('i18n');
      modes.pushObject(i18n.t('components.layers-dialogs.layers-prototyping-modes.new'));
      modes.pushObjects(availableModes.map((editMode) => {
        return i18n.t('components.layers-dialogs.layers-prototyping-modes.' + editMode.name);
      }));
    }

    return modes;
  }),

  /**
    Selected mode.

    @property _selectedMode
    @type Object
    @readonly
  */
  _selectedMode: Ember.computed('selectedModeCaption', function () {
    let availableModes = this.get('availableModes');
    let _availableModesCaptions = this.get('_availableModesCaptions');
    let selectedModeCaption = this.get('selectedModeCaption');

    if (!Ember.isArray(availableModes) || !Ember.isArray(_availableModesCaptions) || Ember.isBlank(selectedModeCaption)) {
      return null;
    }

    let modeIndex = _availableModesCaptions.findIndex(item => item.string === selectedModeCaption) - 1;

    return modeIndex > -1 ? availableModes.objectAt(modeIndex) : null;
  })
});
