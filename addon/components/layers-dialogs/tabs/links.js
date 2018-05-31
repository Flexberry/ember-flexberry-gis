import Ember from 'ember';
import RequiredActionsMixin from 'ember-flexberry/mixins/required-actions';
import DynamicActionsMixin from 'ember-flexberry/mixins/dynamic-actions';
import DynamicPropertiesMixin from '../../../mixins/dynamic-properties';
import layout from '../../../templates/components/layers-dialogs/tabs/links';

export default Ember.Component.extend(
  RequiredActionsMixin,
  DynamicActionsMixin,
  DynamicPropertiesMixin,
  {
  /**
    Reference to component's template.
  */
  layout,

  /**
    See [EmberJS API](https://emberjs.com/api/).

    @property classNames
    @type Array
    @default ['layers-dialogs-data-tabs']
  */
  classNames: ['layers-dialogs-data-tabs'],

  /**
    Currently active tab name.

    @property _activeTab
    @type String
    @default 'links-tab'
    @private
  */
  _activeTab: 'links-tab',

  init() {
    this._super(...arguments);
    this.set('_activeTab', 'links-tab');
  },

  actions: {
    /**
      Handles clicks on tabs.

      @method actions.onTabClick
      @param {Object} e Click event object.
    */
    onTabClick(e) {
      e = Ember.$.event.fix(e);

      let $clickedTab = Ember.$(e.currentTarget);
      let clickedTabName = $clickedTab.attr('data-tab');

      this.set('_activeTab', clickedTabName);
    },

    /**
      Handles {{#crossLink "FlexberryLinksEditorComponent/sendingActions.updateLookupValue:method"}}'flexberry-links-editor' component's 'updateLookupValue' action{{/crossLink}}.

      @method actions.updateLookupValue
      @param {Object} updateData Lookup parameters to update data at model: { relationName, newRelationValue, modelToLookup }.
    */
    updateLookupValue(updateData) {
      this.sendAction('updateLookupValue', updateData);
    },

    /**
      Handles {{#crossLink "FlexberryLinksEditorComponent/sendingActions.changeVisibility:method"}}'flexberry-links-editor' component's 'changeVisibility' action{{/crossLink}}.

      @method actions.allowShowCheckboxChange
      @param {Object} e eventObject Event object from {{#crossLink "FlexberryLinksEditorComponent/sendingActions.changeVisibility:method"}}'flexberry-links-editor' component's 'changeVisibility' action{{/crossLink}}.
    */
    allowShowCheckboxChange(...args) {
      this.sendAction('allowShowCheckboxChange', ...args);
    }
  }

  /**
    Component's action invoking to update relation value at model.
    @method sendingActions.updateLookupValue
    @param {Object} updateData Lookup parameters to update data at model: { relationName, newRelationValue, modelToLookup }.
    {{#crossLink "FlexberryLinksEditorComponent/sendingActions.updateLookupValue:method"}}flexberry-links-editor 'updateLookupValue' action{{/crossLink}}.
  */

  /**
    Component's action invoking when model's 'allowShow' state changed.

    @method sendingActions.allowShowLayerLinkCheckboxChange
    @param {Object} e Event object from
    {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.change:method"}}flexberry-ddau-checkbox 'change' action{{/crossLink}}.
  */
});
