/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import RequiredActionsMixin from '../../mixins/required-actions';
import DynamicPropertiesMixin from '../../mixins/dynamic-properties';
import DynamicActionsMixin from '../../mixins/dynamic-actions';
import DynamicProxyActionsMixin from '../../mixins/dynamic-proxy-actions';
import DynamicComponentsMixin from '../../mixins/dynamic-components';
import layout from '../../templates/components/layers-dialogs/edit-layer';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-remove-layer-dialog').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name (null, because component is tagless).
  @readonly
  @static

  @for Layers.Dialogs.EditLayerComponent
*/
const flexberryClassNamesPrefix = 'flexberry-edit-layer-dialog';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null
};

/**
  Flexberry remove layer modal dialog with [Semantic UI modal](http://semantic-ui.com/modules/modal.html) style.

  @class Layers.Dialogs.EditLayerComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses RequiredActionsMixin
  @uses DynamicPropertiesMixin
  @uses DynamicActionsMixin
  @uses DynamicProxyActionsMixin
  @uses DynamicComponentsMixin
*/
let EditLayerComponent = Ember.Component.extend(
  RequiredActionsMixin,
  DynamicPropertiesMixin,
  DynamicActionsMixin,
  DynamicProxyActionsMixin,
  DynamicComponentsMixin, {

  /**
    Array containing available layers types.

    @property _availableTypes
    @type String[]
    @default ['group', 'wms', 'tile']
    @private
  */
  _availableTypes: ['group', 'wms', 'tile'],

  /**
    Flag: indicates whether defined layer type is valid.

    @property _typeIsValid
    @type Boolean
    @private
    @readOnly
  */
  _typeIsValid: Ember.computed('type', function() {
    let type = this.get('type');

    return Ember.A(this.get('_availableTypes')).contains(type);
  }),

  /**
    Editing layer deserialized type-related settings mapped by available layer types.

    @property _settings
    @type Object
    @default null
    @private
  */
  _settings: null,

  /**
    Reference to component's template.
  */
  layout,

  /**
    Reference to component's CSS-classes names.
    Must be also a component's instance property to be available from component's .hbs template.
  */
  flexberryClassNames,

  /**
    Overridden ['tagName'](http://emberjs.com/api/classes/Ember.Component.html#property_tagName)
    is empty to disable component's wrapping <div>.

    @property tagName
    @type String
    @default ''
  */
  tagName: '',

  /**
    Component's additional CSS-class names.

    @property class
    @type String
    @default null
  */
  class: null,

  /**
    Component's caption.

    @property class
    @type String
    @default null
  */
  caption: t("components.layers-dialogs.edit-layer.caption"),

  /**
    Editing layer name.

    @property name
    @type String
    @default null
  */
  name: null,

  /**
    Editing layer type.

    @property type
    @type String
    @default null
  */
  type: null,

  /**
    Editing layer coordinate reference system (CRS).

    @property coordinateReferenceSystem
    @type String
    @default null
  */
  coordinateReferenceSystem: null,

  /**
    Editing layer serialized type-related settings.

    @property settings
    @type String
    @default null
  */
  settings: null,

  /**
    Flag: indicates whether layer type is in readonly mode.
  */
  typeIsReadonly: false,

  /**
    Flag: indicates whether dialog is visible or not.
    If true, then dialog will be shown, otherwise dialog will be closed.

    @property visible
    @type Boolean
    @default false
  */
  visible: false,

  actions: {
    onApprove() {
      let type = this.get('type');
      let name = this.get('name');
      let coordinateReferenceSystem = this.get('coordinateReferenceSystem');
      let settings = this.get(`_settings.${this.get('type')}`);
      if (!Ember.isNone(settings)) {
        settings = Object.keys(settings).length > 0 ? JSON.stringify(settings) : null;
      }

      this.sendAction('approve', {
        layerProperties: {
          type: type,
          name: name,
          coordinateReferenceSystem: coordinateReferenceSystem,
          settings: settings
        }
      });
    },

    onDeny() {
      this.sendAction('deny');
    },

    onShow() {
      this.sendAction('show');
    },

    onHide() {
      this.sendAction('hide');

      // Clean up dialog.
      this._initInnerSettings();
      this.set('type', null);
      this.set('name', null);
      this.set('coordinateReferenceSystem', null);
      this.set('settings', null);
    }
  },

  /**
    Observer changes in {{#crossLink "EditLayerComponent/settings:property"}}'settings' property{{/crossLink}}
    and performs same changes in {{#crossLink "EditLayerComponent/_settings:property"}}'_settings' property{{/crossLink}}.
  */
  _settingsDidChange: Ember.observer('settings', function() {
    let type = this.get('type');
    if (Ember.typeOf(type) !== 'string') {
      return;
    }

    Ember.assert(
      `Wrong vaue of \`type\` property: actual value is \`${type}\`, ` +
      `but allowed values are: [\`${this.get('_availableTypes').join(`\`, \``)}\`]`,
      this.get('_typeIsValid'));

    let settings = this.get('settings');
    if (Ember.typeOf(settings) === 'string') {
      this.set(`_settings.${type}`, JSON.parse(settings));
    }
  }),

  /**
    Performs clean ups for
    {{#crossLink "EditLayerComponent/_settings:property"}}'_settings' property{{/crossLink}}.

    @method _initInnerSettings
    @private
  */
  _initInnerSettings() {
    let settings = {};
    Ember.A(this.get('_availableTypes')).forEach((type) => {
      settings[type] = {};
    });

    this.set('_settings', settings);
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    this._initInnerSettings();
    this._settingsDidChange();
  }

  /**
    Component's action invoking when dialog is shown.

    @method sendingActions.show
  */

  /**
    Component's action invoking when dialog is hidden.

    @method sendingActions.hide
  */

  /**
    Component's action invoking when dialog is approved.

    @method sendingActions.approve
  */

  /**
    Component's action invoking when dialog is denied.

    @method sendingActions.deny
  */
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
EditLayerComponent.reopenClass({
  flexberryClassNames
});

export default EditLayerComponent;
