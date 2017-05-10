import Ember from 'ember';
import layout from '../../templates/components/legends/base-legend';

/**
  Component's CSS-classes names.
  JSON-object containing string constants with CSS-classes names related to component's hbs-markup elements.

  @property {Object} flexberryClassNames
  @property {String} flexberryClassNames.prefix Component's CSS-class names prefix ('layer-legend').
  @property {String} flexberryClassNames.wrapper Component's wrapping <div> CSS-class name ('layer-legend').
  @property {String} flexberryClassNames.imageWrapper Legend's image wrapping <div> CSS-class name ('layer-legend-image-wrapper').
  @property {String} flexberryClassNames.image Legend's image CSS-class name ('layer-legend-image').
  @readonly
  @static

  @for BaseLegendComponent
*/
const flexberryClassNamesPrefix = 'layer-legend';
const flexberryClassNames = {
  prefix: flexberryClassNamesPrefix,
  wrapper: flexberryClassNamesPrefix,
  imageWrapper: flexberryClassNamesPrefix + '-image-wrapper',
  image: flexberryClassNamesPrefix + '-image'
};

/**
  Base component representing map layer's legend.

  @class BaseLegendComponent
  @extends <a href="http://emberjs.com/api/classes/Ember.Component.html">Ember.Component</a>
*/
export default Ember.Component.extend({
  /**
    Reference to component's template.
  */
  layout,

  /**
    eference to component's CSS-classes names.
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
    Related layer's name.

    @property layerName
    @type String
    @default null
  */
  layerName: null,

  /**
    Related layer's settings as JSON object.

    @property layerSettings
    @type Object
    @default null
  */
  layerSettings: null,

  /**
    Array of legend's for layer.
    Every legend is an object with following structure { src: ... },
    where 'src' is legend's image source (url or base64-string).

    @property _legends
    @type Object[]
    @private
    @readOnly
  */
  _legends: Ember.computed('layerSettings.legendSettings', function() {
    return Ember.A();
  })
});
