/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/map-commands/edit';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-drag-map-tool').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-drag-map-tool').
  @readonly
  @static

  @for EditMapCommandComponent
*/
const flexberryClassNamesPrefix = 'flexberry-edit-map-command';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  editdialog: 'flexberry-edit-dialog-map-command'
};

/**
  Flexberry edit map-command component.
  Component must be used in combination with {{#crossLink "FlexberryMaptoolbarComponent"}}flexberry-maptoolbar component{{/crossLink}}
  as a wrapper.

  Usage:
  templates/my-map-form.hbs
  ```handlebars
  {{#flexberry-maptoolbar}}
    {{map-commands/edit leafletMap=leafletMap}}
  {{/flexberry-maptoolbar}}
  ```

  @class EditMapCommandComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
  @uses <a href="https://github.com/ciena-blueplanet/ember-block-slots#usage">SlotsMixin</a>
*/
let EditMapCommandComponent = Ember.Component.extend({
  /**
    Flag: indicates whether edit dialog has been already requested by user or not.

    @property _editDialogHasBeenRequested
    @type boolean
    @default false
    @private
  */
  _editDialogHasBeenRequested: false,

  /**
    Flag: indicates whether edit dialog is visible or not.

    @property _editDialogIsVisible
    @type boolean
    @default false
    @private
  */
  _editDialogIsVisible: false,

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
    to disable a component's wrapping element.

    @property tagName
    @type String
    @default ''
  */
  tagName: '',

  /**
    Map command's additional CSS-class.

    @property class
    @type String
    @default null
  */
  class: null,

  /**
    Map command's caption.

    @property caption
    @type String
    @default t('components.map-commands.edit.caption')
  */
  caption: t('components.map-commands.edit.caption'),

  /**
    Map command's tooltip text.
    Will be added as wrapper's element 'title' attribute.

    @property tooltip
    @default t('components.map-commands.edit.tooltip')
  */
  tooltip: t('components.map-commands.edit.tooltip'),

  /**
    Map command's icon CSS-class names.

    @property iconClass
    @type String
    @default 'edit icon'
  */
  iconClass: 'edit icon',

  /**
    Leaflet map.

    @property leafletMap
    @type <a href="http://leafletjs.com/reference-1.0.0.html#map">L.Map</a>
    @default null
  */
  leafletMap: null,

  /**
    Map model

    @property mapModel
    @type Object
    @default null
  */
  mapModel: null,

  actions: {
    /**
      Handles base map-command's 'click' action.

      @method actions.onMapCommandButtonClick
    */
    onMapCommandButtonClick() {
      this._showEditDialog();
    },

    /**
      Handles edit dialog's 'approve' action.

      @method actions.onEditDialogApprove
      @param {Object} e Action's event object.
    */
    onEditDialogApprove(e) {
      // Set edited properties values to map model.
      let mapModel = e.mapProperties;
      let model = this.get('mapModel');

      model.set('name', mapModel.name);
      model.set('lat', mapModel.lat);
      model.set('lng', mapModel.lng);
      model.set('zoom', mapModel.zoom);
      model.set('public', mapModel.public);
      model.set('description', mapModel.description);
      model.set('keyWords', mapModel.keyWords);
      model.set('scale', mapModel.scale);
      model.set('coordinateReferenceSystem', mapModel.coordinateReferenceSystem);
      model.set('boundingBox', mapModel.boundingBox);

      let leafletMap = this.get('leafletMap');
      let mapCommandName = 'edit';
      let mapCommandProperties = null;
      let mapCommandExecutionOptions = null;

      leafletMap.flexberryMap.commands.execute(mapCommandName, mapCommandProperties, mapCommandExecutionOptions);
    },
  },

  /**
    Initializes component.
  */
  init() {
    this._super(...arguments);

    // Automatically show map edit dialog for new maps, to allow user immediately define it's properties.
    if (this.get('mapModel.isNew')) {
      Ember.run.scheduleOnce('afterRender', this, function () {
        // Include dialog to markup.
        this.set('_editDialogHasBeenRequested', true);

        // Show dialog.
        this.set('_editDialogIsVisible', true);
      });
    }
  },

  /**
    Destroys DOM-related component's properties & logic.
  */
  willDestroyElement() {
    this._super(...arguments);

    this._hideEditDialog();
  },

  /**
    Shows edit dialog.

    @method _showEditDialog
    @private
  */
  _showEditDialog() {
    // Include dialog to markup.
    this.set('_editDialogHasBeenRequested', true);

    // Show dialog.
    this.set('_editDialogIsVisible', true);
  },

  /**
    Hides edit dialog.

    @method _hideEditDialog
    @private
  */
  _hideEditDialog() {
    // Hide dialog.
    this.set('_editDialogIsVisible', false);
  },
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
EditMapCommandComponent.reopenClass({
  flexberryClassNames
});

export default EditMapCommandComponent;
