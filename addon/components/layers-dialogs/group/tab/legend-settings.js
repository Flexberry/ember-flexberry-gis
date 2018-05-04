import Ember from 'ember';
import layout from '../../../../templates/components/layers-dialogs/group/tab/legend-settings';
import { translationMacro as t } from 'ember-i18n';

/**
 Component for legend settings tab in layer settings.
 */
export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    Caption to be displayed in checkbox

    @property canBeDisplayedCaption
    @type String
    @default t('components.layers-dialogs.settings.group.tab.legend-settings.legend-can-be-displayed')
  */
  canBeDisplayedLabel: t('components.layers-dialogs.settings.group.tab.legend-settings.legend-can-be-displayed'),

  /**
    Style class for checkbox component.

    @property checkboxClass
    @type String
    @default 'toggle'
  */
  checkboxClass: 'toggle',

  /**
    Current object with settings

    @property value
    @type Object
    @default undefined
  */
  value: undefined,

  /**
    Current checkbox value.

    @property _canBeDisplayed
    @type Boolean
    @default true
    @private
  */
  _canBeDisplayed: undefined,

  /**
    Observer changes settings for legend.

    @method _settingsForChanged
    @private
  */
  _settingsForChanged: Ember.observer(
    '_canBeDisplayed',
    '_url',
    '_version',
    '_format',
    '_layers',
    function() {

      let obj = null;

      if (this.get('_isWmsType')) {
        obj = {
          legendCanBeDisplayed: this.get('_canBeDisplayed'),
          url: this.get('_url'),
          version: this.get('_version'),
          format: this.get('_format'),
          layers: this.get('_layers')
        };
      } else {
        obj = {
          legendCanBeDisplayed: this.get('_canBeDisplayed')
        };
      }

      this.set('value', obj);
    }
  ),

  /**
    Flag: indicates whether  layer's type is wms.

    @property _isWmsType
    @type Boolean
    @default false
    @private
  */
  _isWmsType: Ember.computed('type', function () {
    let type = this.get('type');

    if (!Ember.isNone(type) && type.indexOf('wms') > -1) {
      return true;
    } else {
      return false;
    }
  }),

  /**
    Property containing url.

    @property _url
    @type String
    @default ''
    @private
  */
  _url:'',

  /**
    Property containing version.

    @property _version
    @type String
    @default ''
    @private
  */
  _version:'',

  /**
    Property containing format.

    @property _format
    @type String
    @default ''
    @private
  */
  _format:'',

  /**
    Property containing layers.

    @property _layers
    @type String
    @default ''
    @private
  */
  _layers:'',

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);
    let value = this.get('value');
    this.set('_canBeDisplayed', value.legendCanBeDisplayed);
    this.set('_url', value.url);
    this.set('_version', value.version);
    this.set('_format', value.format);
    this.set('_layers', value.layers);
  }
});
