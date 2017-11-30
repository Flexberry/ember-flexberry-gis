/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import layout from '../../templates/components/map-commands/go-to';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-drag-map-tool').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('flexberry-drag-map-tool').
  @readonly
  @static

  @for GoToMapCommandComponent
*/
const flexberryClassNamesPrefix = 'flexberry-go-to-map-command';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  gotoDialog: 'flexberry-go-to-map-command-dialog'
};

/**
  Flexberry go-to map-command component.
  Component must be used in combination with {{#crossLink "FlexberryMaptoolbarComponent"}}flexberry-maptoolbar component{{/crossLink}}
  as a wrapper.

  Usage:
  controller/my-map-form.js
  ```handlebars
  availableCRS: Ember.computed(function() {
    let availableModes = Ember.A();
    availableModes.push({ crs: this.get('model.crs'), name: t('crs.current.name'), xCaption: t('crs.current.xCaption'), yCaption: t('crs.current.yCaption'), isLatlng: false });
    availableModes.push({ crs: L.CRS.EPSG4326, name: t('crs.latlng.name'), xCaption: t('crs.latlng.xCaption'), yCaption: t('crs.latlng.yCaption'), isLatlng: true });

    return availableModes;
  }),

  templates/my-map-form.hbs
  ```handlebars
      {{map-commands/go-to
        availableCRS=availableCRS
        execute=(action "onMapCommandExecute" target=mapToolbar)}}
  ```
  @class GoToMapCommandComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
let GoToMapCommandComponent = Ember.Component.extend({
    /**
      Flag: indicates whether go-to dialog has been already requested by user or not.

      @property _gotoDialogHasBeenRequested
      @type boolean
      @default false
      @private
    */
    _gotoDialogHasBeenRequested: false,

    /**
      Flag: indicates whether go-to dialog is visible or not.

      @property _gotoDialogIsVisible
      @type boolean
      @default false
      @private
    */
    _gotoDialogIsVisible: false,

    /**
      Event object from latest 'execute' action from 'go-to' map-command.

      @property _executeActionEventObject
      @type Object
      @default null
      @private
    */
    _executeActionEventObject: null,

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
      @default t('components.map-commands.go-to.caption')
    */
    caption: t('components.map-commands.go-to.caption'),

    /**
      Map command's tooltip text.
      Will be added as wrapper's element 'title' attribute.

      @property tooltip
      @default t('components.map-commands.go-to.tooltip')
    */
    tooltip: t('components.map-commands.go-to.tooltip'),

    /**
      Map command's icon CSS-class names.

      @property iconClass
      @type String
      @default 'location arrow icon''
    */
    iconClass: 'location arrow icon',

    /**
      Array of available CRS with name and X/Y captions

     availableCRS: Ember.computed(function() {
        let availableModes = Ember.A();
        availableModes.push({crs: this.get('model.crs'), name: t('crs.current.name'), xCaption: t('crs.current.xCaption'), yCaption: t('crs.current.yCaption'), isLatlng: false});
        availableModes.push({crs: L.CRS.EPSG4326, name: t('crs.latlng.name'), xCaption: t('crs.latlng.xCaption'), yCaption: t('crs.latlng.yCaption'), isLatlng: true});

        return availableModes;
      }),

      @property availableCRS
      @type Array
    */
    /**
      Available coordinate reference systems metadata.

      @property availableCRS
      @type Object[]
    */
    availableCRS: Ember.computed('i18n.locale', function () {
      let availableModes = Ember.A();
      let i18n = this.get('i18n');
      availableModes.push({
        crs: this.get('model.crs'),
        name: i18n.t('map-commands.go-to.available-crs.current.name').toString(),
        xCaption: i18n.t('map-commands.go-to.available-crs.current.xCaption').toString(),
        yCaption: i18n.t('map-commands.go-to.available-crs.current.yCaption').toString(),
        latlng: false
      });
      availableModes.push({
        crs: L.CRS.EPSG4326,
        name: i18n.t('map-commands.go-to.available-crs.latlng.name').toString(),
        xCaption: i18n.t('map-commands.go-to.available-crs.latlng.xCaption').toString(),
        yCaption: i18n.t('map-commands.go-to.available-crs.latlng.yCaption').toString(),
        isLatlng: true
      });

      return availableModes;
    }),

    localeObserver: Ember.observer('i18n.locale', function() {
      this.set('_gotoDialogHasBeenRequested', false);
    }),

    actions: {
      /**
        Handles {{#crossLink "BaseMapCommandComponent/sendingActions.execute:method"}}base map-command's 'execute' action{{/crossLink}}.

        @method actions.onMapCommandExecute
        @param {Object} e Base map-command's 'execute' action event-object.
      */
      onMapCommandExecute(e) {
        // Delay execution, but send action to initialize map-command.
        Ember.set(e, 'execute', false);
        this.sendAction('execute', e);

        // Remember event object.
        this.set('_executeActionEventObject', e);

        // Include dialog to markup.
        this.set('_gotoDialogHasBeenRequested', true);

        // Show dialog.
        this.set('_gotoDialogIsVisible', true);
      },

      /**
        Handles go-to dialog's 'approve' action.
        Invokes own {{#crossLink "ExportMapCommandComponent/sendingActions.execute:method"}}'execute' action{{/crossLink}}.

        @method actions.onGoToDialogApprove
        @param {Object} e Action's event object.
      */
      onGoToDialogApprove(e) {
        let executeActionEventObject = this.get('_executeActionEventObject');
        Ember.set(executeActionEventObject, 'execute', true);

        this.sendAction('execute', Ember.get(e, 'gotoOptions'), executeActionEventObject);
      }
    },

    /**
      Destroys DOM-related component's properties & logic.
    */
    willDestroyElement() {
      this._super(...arguments);

      // Hide dialog.
      this.set('_gotoDialogIsVisible', false);
    },

    /**
      Destroys component.
    */
    willDestroy() {
      this._super(...arguments);

      this.set('_executeActionEventObject', null);
    }

    /**
      Component's action invoking when map-command must be executed.

      @method sendingActions.execute
      @param {Object} e Action's event object from
      {{#crossLink "BaseMapCommandComponent/sendingActions.execute:method"}}base map-command's 'execute' action{{/crossLink}}.
    */
  }
);

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
GoToMapCommandComponent.reopenClass({
  flexberryClassNames
});

export default GoToMapCommandComponent;
