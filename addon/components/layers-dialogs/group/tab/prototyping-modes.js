import Ember from 'ember';
import layout from '../../../../templates/components/layers-dialogs/group/tab/prototyping-modes';
import RequiredActionsMixin from 'ember-flexberry/mixins/required-actions';
import DynamicActionsMixin from 'ember-flexberry/mixins/dynamic-actions';
import DynamicPropertiesMixin from '../../../../mixins/dynamic-properties';

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
  _availableModesCaptions: Ember.computed('_availableModes', 'i18n.locale', function () {
    let _availableModes = this.get('_availableModes');
    let modes = Ember.A();
    if (Ember.isArray(_availableModes) && _availableModes.length !== 0) {
      let i18n = this.get('i18n');
      modes.pushObject(i18n.t('components.layers-dialogs.layers-prototyping-modes.new'));
      modes.pushObjects(_availableModes.map((editMode) => {
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
  _selectedMode: Ember.computed('_selectedModeCaption', function () {
    let _availableModes = this.get('_availableModes');
    let _availableModesCaptions = this.get('_availableModesCaptions');
    let _selectedModeCaption = this.get('_selectedModeCaption');

    if (!Ember.isArray(_availableModes) || !Ember.isArray(_availableModesCaptions) || Ember.isBlank(_selectedModeCaption)) {
      return null;
    }

    let modeIndex = _availableModesCaptions.findIndex(item => item.string === _selectedModeCaption) - 1;

    return modeIndex > -1 ? _availableModes.objectAt(modeIndex) : null;
  })
});
