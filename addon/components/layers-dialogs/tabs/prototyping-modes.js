import { isBlank } from '@ember/utils';
import { A, isArray } from '@ember/array';
import { computed } from '@ember/object';
import Component from '@ember/component';
import layout from '../../../templates/components/layers-dialogs/tabs/prototyping-modes';
import RequiredActionsMixin from 'ember-flexberry/mixins/required-actions';
import DynamicActionsMixin from 'ember-flexberry/mixins/dynamic-actions';
import DynamicPropertiesMixin from '../../../mixins/dynamic-properties';

export default Component.extend(
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
  _availableModesCaptions: computed('availableModes', 'i18n.locale', function () {
    let availableModes = this.get('availableModes');
    let modes = A();
    if (isArray(availableModes) && availableModes.length !== 0) {
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
  _selectedMode: computed('selectedModeCaption', function () {
    let availableModes = this.get('availableModes');
    let _availableModesCaptions = this.get('_availableModesCaptions');
    let selectedModeCaption = this.get('selectedModeCaption');

    if (!isArray(availableModes) || !isArray(_availableModesCaptions) || isBlank(selectedModeCaption)) {
      return null;
    }

    let modeIndex = _availableModesCaptions.findIndex(item => item.string === selectedModeCaption) - 1;

    return modeIndex > -1 ? availableModes.objectAt(modeIndex) : null;
  })
});
