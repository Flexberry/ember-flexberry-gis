/**
  @module ember-flexberry-gis
*/

import FlexberryEditLayerDialogComponent from './edit';
import layout from '../../templates/components/layers-dialogs/edit';
import { translationMacro as t } from 'ember-i18n';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's .hbs markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('flexberry-copy-layer-dialog').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name (null, because component is tagless).
  @readonly
  @static

  @for FlexberryCopyLayerDialogComponent
*/
const flexberryClassNamesPrefix = 'flexberry-copy-layer-dialog';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: null
};

/**
  Flexberry copy layer modal dialog with [Semantic UI modal](http://semantic-ui.com/modules/modal.html) style.

  @class FlexberryCopyLayerDialogComponent
  @extends FlexberryEditLayerDialogComponent
*/
let FlexberryCopyLayerDialogComponent = FlexberryEditLayerDialogComponent.extend({
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
    Component's caption.

    @property class
    @type String
    @default t('components.layers-dialogs.copy.caption')
  */
  caption: t('components.layers-dialogs.copy.caption'),

  /**
    Dialog's 'approve' button caption.

    @property approveButtonCaption
    @type String
    @default t('components.layers-dialogs.copy.approve-button.caption')
  */
  approveButtonCaption: t('components.layers-dialogs.copy.approve-button.caption'),

  /**
    Dialog's 'deny' button caption.

    @property denyButtonCaption
    @type String
    @default t('components.layers-dialogs.copy.deny-button.caption')
  */
  denyButtonCaption: t('components.layers-dialogs.copy.deny-button.caption')
});

// Add component's CSS-class names as component's class static constants
// to make them available outside of the component instance.
FlexberryCopyLayerDialogComponent.reopenClass({
  flexberryClassNames
});

export default FlexberryCopyLayerDialogComponent;
