/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../templates/components/flexberry-links-editor';
import FlexberryLookupCompatibleComponentMixin from 'ember-flexberry/mixins/flexberry-lookup-compatible-component';
import FlexberryBaseComponent from 'ember-flexberry/components/flexberry-base-component';
import {
  translationMacro as t
} from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-links-editor').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-links-editor').
  @property {String} flexberryClassNames.visibilityCheckbox Component's visibility checkbox CSS-class name ('flexberry-visibility-checkbox').
  @property {String} flexberryClassNames.clearButton Component's clear button CSS-class name ('flexberry-clear-button').
  @readonly
  @static

  @for FlexberryLinksEditorComponent
*/
const flexberryClassNamesPrefix = 'flexberry-links-editor';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  visibilityCheckbox: flexberryClassNamesPrefix + '-visibility-checkbox',
  clearButton: flexberryClassNamesPrefix + '-clear-button'
};

/**
  Flexberry links editor component.

  @class FlexberryLinksEditorComponent
  @extends FlexberryBaseComponent
  @uses FlexberryLookupCompatibleComponentMixin
*/
let FlexberryLinksEditorComponent = FlexberryBaseComponent.extend(FlexberryLookupCompatibleComponentMixin, {

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
    Component's wrapping <div> CSS-classes names.

    Any other CSS-classes can be added through component's 'class' property.
    ```handlebars
    {{flexberry-links-editor
      class='red'
    }}
    ```

    @property classNames
    @type String[]
    @default ['flexberry-links-editor', 'ui', 'segment']
  */
  classNames: [flexberryClassNames.wrapper, 'ui', 'segment'],

  /**
    Component's caption.

    @property caption
    @type String
    @default null
  */
  caption: null,

  /**
    Component's tooltip text.
    Will be added as wrapper's element 'title' attribute.

    @property tooltip
    @default null
  */
  tooltip: null,

  /**
    Component's icon CSS-class names.

    @property iconClass
    @type String
    @default null
  */
  iconClass: null,

  /**
    Flag: indicates whether component is in readonly mode.

    @property readonly
    @type Boolean
    @default false
  */
  readonly: false,

  /**
    Flag: indicates whether to show creation button at toolbar.
    @property createNewButton
    @type Boolean
    @default true
  */
  createNewButton: true,

  /**
    Flag: indicates whether to show delete button at toolbar.
    @property deleteButton
    @type Boolean
    @default true
  */
  deleteButton: true,

  /**
    Flag: indicates whether table are striped.
    @property tableStriped
    @type Boolean
    @default true
  */
  tableStriped: true,

  /**
    Flag: indicates whether allow to resize columns (if `true`) or not (if `false`).
    If {{#crossLink 'UserSettingsService'}}{{/crossLink}} is enabled then saved widths of columns are displayed on component.
    @property allowColumnResize
    @type Boolean
    @default true
  */
  allowColumnResize: true,

  /**
    Flag: indicates whether to show asterisk icon in first column of every changed row.
    @property showAsteriskInRow
    @type Boolean
    @default true
  */
  showAsteriskInRow: true,

  /**
    Flag: indicates whether to show checkbox in first column of every row.
    @property showCheckBoxInRow
    @type Boolean
    @default true
  */
  showCheckBoxInRow: true,

  /**
    Flag: indicates whether to show delete button in first column of every row.
    @property showDeleteButtonInRow
    @type Boolean
    @default true
  */
  showDeleteButtonInRow: true,

  /**
    Flag: indicates whether to show dropdown menu with edit menu item, in last column of every row.
    For in-row menu following properties are used:
    - {{#crossLink 'FlexberryGroupeditComponent/showDeleteMenuItemInRow:property'}}{{/crossLink}},
    - {{#crossLink 'FlexberryGroupeditComponent/showEditMenuItemInRow:property'}}{{/crossLink}},
    - {{#crossLink 'FlexberryGroupeditComponent/menuInRowAdditionalItems:property'}}{{/crossLink}}.
    @property showEditMenuItemInRow
    @type Boolean
    @default false
  */
  showEditMenuItemInRow: false,

  /**
    Flag: indicates whether to show dropdown menu with delete menu item, in last column of every row.
    For in-row menu following properties are used:
    - {{#crossLink 'FlexberryGroupeditComponent/showDeleteMenuItemInRow:property'}}{{/crossLink}},
    - {{#crossLink 'FlexberryGroupeditComponent/showEditMenuItemInRow:property'}}{{/crossLink}},
    - {{#crossLink 'FlexberryGroupeditComponent/menuInRowAdditionalItems:property'}}{{/crossLink}}.
    @property showDeleteMenuItemInRow
    @type Boolean
    @default false
  */
  showDeleteMenuItemInRow: false,

  /**
    Flag indicates whether table rows are clickable (action will be fired after row click).
    @property rowClickable
    @type Boolean
    @default false
  */
  rowClickable: false,

  /**
    Flag indicates whether DELETE request should be immediately sended to server (on each deleted record) or not.
    @property immediateDelete
    @type Boolean
    @default false
  */
  immediateDelete: false,

  /**
    Used to identify groupEdit on the page by component name.
    @property groupEditComponentName
    @type String
    @readonly
  */
  groupEditComponentName: Ember.computed('elementId', function () {
    return 'parametersGroupedit' + this.get('elementId');
  }),

  /**
    Used to identify lookup on the page by component name.
    @property lookupComponentName
    @type String
    @readonly
  */
  lookupComponentName: Ember.computed('elementId', function () {
    return 'mosLookup' + this.get('elementId');
  }),

  /**
    Name of model to be used as form's record type.

    @property modelName
    @type String
    @default null
  */
  modelName: null,

  /**
    Model projection which should be used to display given content.
    Properties of objects by model projection are displayed on component.
    @property modelProjection
    @type Object
    @default null
  */
  modelProjection: null,

  /**
    Layer link's 'Map object setting' field's caption.

    @property mosCaption
    @type String
    @default t('components.flexberry-links-editor.map-object-setting-textbox.caption')
  */
  mosCaption: t('components.flexberry-links-editor.map-object-setting-textbox.caption'),

  /**
    Layer link's 'Allow show' field's caption.

    @property allowShowCaption
    @type String
    @default t('components.flexberry-links-editor.allow-show-textbox.caption')
  */
  allowShowCaption: t('components.flexberry-links-editor.allow-show-textbox.caption'),

  /**
    Text to be displayed in table body, if content is not defined or empty.
    @property groupeditPlaceholder
    @type String
    @default t('components.flexberry-groupedit.placeholder')
  */
  groupeditPlaceholder: t('components.flexberry-groupedit.placeholder'),

  /**
    Text to be displayed in table body, if content is not defined or empty.
    @property lookupPlaceholder
    @type String
    @default t('components.flexberry-groupedit.placeholder')
  */
  lookupPlaceholder: t('components.flexberry-lookup.placeholder'),

  /**
    Clear button's CSS-class.

    @property clearClass
    @type String
    @default null
  */
  clearClass: null,

  /**
    Clear button's caption.

    @property clearCaption
    @type String
    @default t('components.flexberry-links-editor.clear-button.caption')
  */
  clearCaption: t('components.flexberry-links-editor.clear-button.caption'),

  /**
    Clear button's icon CSS-class names.

    @property clearIconClass
    @type String
    @default 'remove icon'
  */
  clearIconClass: 'remove icon',

  actions: {
    /**
      Update relation value at model.
      @method actions.updateLookupValue
      @param {Object} updateData Lookup parameters to update data at model: { relationName, newRelationValue, modelToLookup }.
    */
    updateLookupValue(updateData) {
      this.sendAction('updateLookupValue', updateData);
    },

    /**
      Remove model from store.
      @method actions.remove
    */
    remove() {
      this.sendAction('remove', this.get('model'));
    },

    /**
      Handles {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.change:method"}}'flexberry-ddau-checkbox' component's 'change' action{{/crossLink}}.

      @method actions.onVisibilityCheckboxChange
      @param {Object} e eventObject Event object from {{#crossLink "FlexberryDdauCheckbox/sendingActions.change:method"}}'flexberry-ddau-checkbox' component's 'change' action{{/crossLink}}.
    */
    onVisibilityCheckboxChange(...args) {
      this.sendAction('changeVisibility', ...args);
    }
  }

  /**
    Component's action invoking to update relation value at model.
    @method sendingActions.updateLookupValue
    @param {Object} updateData Lookup parameters to update data at model: { relationName, newRelationValue, modelToLookup }.
   */

  /**
    Component's action invoking to remove model from store.
    @method sendingActions.remove
    @param {Object} model Ember Model to be removed.
   */

  /**
    Component's action invoking when model's 'allowShow' state changed.

    @method sendingActions.changeVisibility
    @param {Object} e Event object from
    {{#crossLink "FlexberryDdauCheckboxComponent/sendingActions.change:method"}}flexberry-ddau-checkbox 'change' action{{/crossLink}}.
  */
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryLinksEditorComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryLinksEditorComponent;
