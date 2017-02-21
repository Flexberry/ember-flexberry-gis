/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/feature-result-item';

/**
  Component for display GeoJSON feature object details

  @class FeatureResultItemComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
 */
export default Ember.Component.extend({
  /**
    Flag: indicates where display detailed feature info
    @property _infoExpanded
    @type boolean
    @default false
   */
  _infoExpanded: false,

  /**
    Property for represent feature
    @property _displayProperty
    @type string
    @readOnly
    @private
   */
  _displayProperty: Ember.computed('displaySettings', function () {
    return this.get('displaySettings.displayProperty');
  }),

  /**
    Feature properties excluded from being displayed in info table
    @property _excludedProperties
    @type String[]
    @readOnly
    @private
   */
  _excludedProperties: Ember.computed('displaySettings', function () {
    return this.get('displaySettings.excludedProperties');
  }),

  /**
    Features localized properties to being displayed in info table.

    @property _localizedProperties
    @type Object
    @readOnly
    @private
  */
  _localizedProperties: Ember.computed('displaySettings', 'i18n.locale', function () {
    let currentLocale = this.get('i18n.locale');
    let localizedProperties = this.get(`displaySettings.localizedProperties.${currentLocale}`) || {};
    return localizedProperties;
  }),

  layout,

  /**
   Settings for display feature info
   @property displaySettings
   @type object
   @default null
   */
  displaySettings: null,

  /**
    feature for display
    @property feature
    @type GeoJSON feature object
   */
  feature: null,

  /**
    Current selected feature
    @property feature
    @type GeoJSON feature object
   */
  selectedFeature: null,

  actions: {

    /**
      Invokes {{#crossLink "FeatureResultItemComponent/sendingActions.selectFeature:method"}}'selectFeature' action{{/crossLink}}.
      @method actions.selectFeature
    */
    selectFeature() {
      this.sendAction('selectFeature', this.get('feature'));
    },

    /**
      Invokes {{#crossLink "FeatureResultItemComponent/sendingActions.panTo:method"}}'panTo' action{{/crossLink}}.
      @method actions.panTo
     */
    panTo() {
      this.sendAction('panTo', this.get('feature'));
    },

    /**
      Invokes {{#crossLink "FeatureResultItemComponent/sendingActions.zoomTo:method"}}'zoomTo' action{{/crossLink}}.
      @method actions.zoomTo
     */
    zoomTo() {
      this.sendAction('zoomTo', this.get('feature'));
    },

    /**
      Show\hide detailed feature info
      @method actions.showInfo
     */
    showInfo() {
      this.set('_infoExpanded', !this.get('_infoExpanded'));
    }
  }

  /**
    Component's action invoking for select feature
    @method sendingActions.selectFeature
    @param {GeoJSON object} feature Feature for select
   */

  /**
    Component's action invoking for feature zooming
    @method sendingActions.zoomTo
    @param {GeoJSON object} feature Feature for select
   */

  /**
    Component's action invoking for feature pan
    @method sendingActions.panTo
    @param {GeoJSON object} feature Feature for select
   */

});
