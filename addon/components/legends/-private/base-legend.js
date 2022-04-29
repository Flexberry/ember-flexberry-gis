import { isBlank } from '@ember/utils';
import { Promise } from 'rsvp';
import { A } from '@ember/array';
import { computed, observer } from '@ember/object';
import Component from '@ember/component';
import layout from '../../../templates/components/legends/-private/base-legend';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's hbs-markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('layer-legend').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('layer-legend').
  @property {String} flexberryClassNames.imageWrapper Legend's image wrapping <div> CSS-class name ('layer-legend-image-wrapper').
  @property {String} flexberryClassNames.image Legend's image CSS-class name ('layer-legend-image').
  @property {String} flexberryClassNames.defaultImage Legend's image CSS-class name ('layer-legend-default-image').
  @property {String} flexberryClassNames.caption Legend's caption CSS-class name ('layer-legend-caption').
  @readonly
  @static

  @for BaseLegendComponent
*/
const flexberryClassNamesPrefix = 'layer-legend';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  imageWrapper: `${flexberryClassNamesPrefix}-image-wrapper`,
  image: `${flexberryClassNamesPrefix}-image`,
  defaultImage: `${flexberryClassNamesPrefix}-default-image`,
  caption: `${flexberryClassNamesPrefix}-caption`,
};

/**
  Base component representing map layer's legend.

  @class BaseLegendComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Component.extend({
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

    @property classNames
    @type String[]
    @default ['layer-legend']
  */
  classNames: [flexberryClassNames.wrapper],

  /**
    Flag: indicates whether to show layer name or not.

    @property showLayerName
    @type Boolean
    @default false
  */
  showLayerName: false,

  /**
    Flag: indicates whether legend was lazy loaded.

    @property lazyLoaded
    @type Boolean
    @default true
  */
  lazyLoaded: true,

  /**
    Component's right pading.

    @property rightPadding
    @type Number
    @default null
  */
  rightPadding: null,

  /**
    Component's height.

    @property height
    @type Number
    @default null
  */
  height: null,

  /**
    Array of legend's for layer.
    Every legend is an object with following structure { src: ... },
    where 'src' is legend's image source (url or base64-string).

    @property _legends
    @type Object[]
    @private
    @readOnly
  */
  _legends: computed('layer.settingsAsObject.legendSettings', function () {
    return A();
  }),

  /**
    Observes changes in legends array, and sends 'legendsLoaded' action notifying that legends are loaded.

    @method _legendsDidChange
    @private
  */
  _legendsDidChange: observer('_legends', function () {
    const legends = this.get('_legends');
    if (legends instanceof Promise) {
      legends.then((result) => {
        this.sendAction('legendsLoaded', this.get('layer.name'), result);
      });
    } else {
      this.sendAction('legendsLoaded', this.get('layer.name'), legends);
    }
  }),

  /**
    Observes changes in right padding property, and changes it's value in the DOM.

    @method _legendsDidChange
    @private
  */
  _rightPaddingDidChange: observer('rightPadding', function () {
    const rightPadding = this.get('rightPadding');
    if (!isBlank(rightPadding)) {
      this.$(`.${this.flexberryClassNames.imageWrapper}`).css('padding-right', `${rightPadding}px`);
    }
  }),

  /**
    Called after a component has been rendered, both on initial render and in subsequent rerenders.
  */
  didRender() {
    this._super(...arguments);

    const height = this.get('height');
    if (!isBlank(height)) {
      this.$(`.${this.flexberryClassNames.imageWrapper}`).css('height', `${height}px`);
    }
  },
});
