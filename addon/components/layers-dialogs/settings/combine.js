import Ember from 'ember';
import layout from '../../../templates/components/layers-dialogs/settings/combine';
import { translationMacro as t } from 'ember-i18n';

export default Ember.Component.extend({
  layout,

  /**
    Main settings caption.

    @property mainSettingsCaption
    @type String
    @default t('components.layers-dialogs.settings.combine.main-settings-caption')
  */
  mainSettingsCaption: t('components.layers-dialogs.settings.combine.main-settings-caption'),

  /**
    Caption for inner layer settings.

    @property innerSettingsCaption
    @type String
    @default t('components.layers-dialogs.settings.combine.inner-settings-caption')
  */
  innerSettingsCaption: t('components.layers-dialogs.settings.combine.inner-settings-caption'),

  /**
    Array containing available layers types.

    @property _availableTypes
    @type String[]
    @default null
    @private
  */
  _availableTypes: null,

  /**
    Hash containing type of layer.

    @property type
    @type String
    @default null
    @private
  */
  _type: null,

  /**
    Editing layer deserialized type-related settings.

    @property settings
    @type Object
    @default null
  */
  settings: null,

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    this.set('_availableTypes', Ember.getOwner(this).knownNamesForType('layer'));
  },

  /**
    Deinitializes DOM-related component's properties.
  */
  willDestroyElement() {
    this._super(...arguments);
    this.set('_type', null);
  },

  actions: {
    /**
      Handles clicks on 'Add' button.

      @method actions.addTypeSettings
    */
    addTypeSettings() {
      let type = this.get('_type');
      if (!Ember.isNone(type)) {
        let defaultSettings = Ember.getOwner(this).knownForType('layer', type).createSettings();
        let settings = this.get('settings');
        if (Ember.isNone(settings) || Ember.isNone(Ember.get(settings, 'type'))) {
          let mainSettings = Ember.$.extend(true, defaultSettings, { 'type': type });
          this.set('settings', mainSettings);
        } else {
          let innerLayerSettings = defaultSettings;
          Ember.$.extend(true, innerLayerSettings, { 'type': type });
          let innerLayers = this.get('settings.innerLayers');
          if (Ember.isNone(innerLayers)) {
            innerLayers = Ember.A();
          }

          innerLayers.push(innerLayerSettings);
          this.set('settings.innerLayers', innerLayers);
        }

        this.set('_type', null);
      }
    }
  }
});
