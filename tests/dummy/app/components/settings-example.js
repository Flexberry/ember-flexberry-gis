import Ember from 'ember';
import { translationMacro as t } from 'ember-i18n';

/**
  Settings example component.

  @class SettingsExampleComponent
  @extends Ember.Component
*/
export default Ember.Component.extend({
  /**
    A hash of controller properties.

    @property controllerProperties
    @type Object
    @default null
  */
  controllerProperties: null,

  /**
    Settings metadata for component used in example.

    @property componentSettingsMetadata
    @type Object
    @default null
  */
  componentSettingsMetadata: null,

  /**
    Template text for component used in example.

    @property componentTemplateText
    @type String
  */
  componentTemplateText: null,

  /**
    Caption for component settings segment.

    @property componentSettingsCaption
    @type String
    @default t('components.settings-example.component-settings-caption')
  */
  componentSettingsCaption: t('components.settings-example.component-settings-caption'),

  /**
    Placeholder for component settings segment (will be displayed if settings metadata is not defined).

    @property componentSettingsPlaceholder
    @type String
    @default t('components.settings-example.component-settings-placeholder')
  */
  componentSettingsPlaceholder: t('components.settings-example.component-settings-placeholder')
});
